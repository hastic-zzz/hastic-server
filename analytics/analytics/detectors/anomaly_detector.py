import logging
import numpy as np
import pandas as pd
from typing import Optional, Union, List, Tuple

from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.detector_typing import DetectionResult, ProcessingResult
from analytic_types.data_bucket import DataBucket
from analytic_types.segment import Segment
from detectors import Detector, ProcessingDetector
import utils

MAX_DEPENDENCY_LEVEL = 100
MIN_DEPENDENCY_FACTOR = 0.1
BASIC_ALPHA = 0.5
logger = logging.getLogger('ANOMALY_DETECTOR')


class AnomalyDetector(ProcessingDetector):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        segments = payload.get('segments')
        prepared_segments = []

        new_cache = {
            'confidence': payload['confidence'],
            'alpha': payload['alpha']
        }

        if segments is not None:
            seasonality = payload.get('seasonality')
            assert seasonality is not None and seasonality > 0, f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            for segment in segments:
                segment_len = (int(segment['to']) - int(segment['from']))
                assert segment_len <= seasonality, f'seasonality {seasonality} must be great then segment length {segment_len}'

                from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = dataframe[from_index : to_index]
                prepared_segments.append({'from': segment['from'], 'data': segment_data.value.tolist()})

            time_step = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][1]) - utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])
            new_cache['seasonality'] = seasonality
            new_cache['segments'] = prepared_segments
            new_cache['timeStep'] = time_step

        return {
            'cache': new_cache
        }

    # TODO: ModelCache -> ModelState
    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        data = dataframe['value']
        segments = cache.get('segments')

        last_value = None
        if cache is not None:
            last_value = cache.get('last_value')

        smoothed_data = utils.exponential_smoothing(data, cache['alpha'], last_value)
        upper_bound = smoothed_data + cache['confidence']
        lower_bound = smoothed_data - cache['confidence']

        if segments is not None:

            seasonality = cache.get('seasonality')
            assert seasonality is not None and seasonality > 0, f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])
            time_step = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][1]) - utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            for segment in segments:
                seasonality_offset = (abs(segment['from'] - data_start_time) % seasonality) // time_step
                seasonality_index = seasonality // time_step
                #TODO: upper and lower bounds for segment_data
                segment_data = utils.exponential_smoothing(pd.Series(segment['data']), BASIC_ALPHA)
                upper_seasonality_curve = self.add_season_to_data(smoothed_data, segment_data, seasonality_offset, seasonality_index, True)
                lower_seasonality_curve = self.add_season_to_data(smoothed_data, segment_data, seasonality_offset, seasonality_index, False)
                assert len(smoothed_data) == len(upper_seasonality_curve), f'len smoothed {len(smoothed_data)} != len seasonality {len(seasonality_curve)}'
                upper_bound = upper_seasonality_curve + cache['confidence']
                lower_bound = lower_seasonality_curve - cache['confidence']

        anomaly_indexes = []
        for idx, val in enumerate(data.values):
            if val > upper_bound.values[idx] or val < lower_bound.values[idx]:
                anomaly_indexes.append(data.index[idx])
        # TODO: use Segment in utils
        segments = utils.close_filtering(anomaly_indexes, 1)
        segments = utils.get_start_and_end_of_segments(segments)
        segments = [Segment(
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][segment[0]]),
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][segment[1]]),
        ) for segment in segments]

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = utils.convert_pd_timestamp_to_ms(last_dataframe_time)
        # TODO: ['lastValue'] -> .last_value
        cache['lastValue'] = smoothed_data.values[-1]

        return DetectionResult(cache, segments, last_detection_time)

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[DetectionResult]:
        if cache is None:
            msg = f'consume_data got invalid cache {cache} for task {self.analytic_unit_id}'
            logging.debug(msg)
            raise ValueError(msg)

        data_without_nan = data.dropna()

        if len(data_without_nan) == 0:
            return None

        self.bucket.receive_data(data_without_nan)

        if len(self.bucket.data) >= self.get_window_size(cache):
            return self.detect(self.bucket, cache)

        return None

    def is_detection_intersected(self) -> bool:
        return False

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        '''
        get the number of values that will affect the next value
        '''

        if cache is None:
            raise ValueError('anomaly detector got None cache')

        for level in range(1, MAX_DEPENDENCY_LEVEL):
            if (1 - cache['alpha']) ** level < MIN_DEPENDENCY_FACTOR:
                break

        seasonality = 0
        if cache.get('segments') is not None and cache['seasonality'] > 0:
            seasonality = cache['seasonality'] // cache['timeStep']
        return max(level, seasonality)

    def concat_detection_results(self, detections: List[DetectionResult]) -> DetectionResult:
        result = DetectionResult()
        for detection in detections:
            result.segments.extend(detection.segments)
            result.last_detection_time = detection.last_detection_time
            result.cache = detection.cache
        result.segments = utils.merge_intersecting_segments(result.segments)
        return result

    # TODO: ModelCache -> ModelState
    def process_data(self, dataframe: pd.DataFrame, cache: ModelCache) -> ProcessingResult:
        segments = cache.get('segments')

        # TODO: exponential_smoothing should return dataframe with related timestamps
        smoothed = utils.exponential_smoothing(dataframe['value'], cache['alpha'], cache.get('lastValue'))

        if segments is not None:

            seasonality = cache.get('seasonality')
            assert seasonality is not None and seasonality > 0, f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])
            time_step = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][1]) - utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            for segment in segments:
                seasonality_offset = (abs(segment['from'] - data_start_time) % seasonality) // time_step
                seasonality_index = seasonality // time_step
                segment_data = utils.exponential_smoothing(pd.Series(segment['data']), BASIC_ALPHA)
                upper_seasonality_curve = self.add_season_to_data(smoothed, segment_data, seasonality_offset, seasonality_index, True)
                lower_seasonality_curve = self.add_season_to_data(smoothed, segment_data, seasonality_offset, seasonality_index, False)
                assert len(smoothed) == len(upper_seasonality_curve), f'len smoothed {len(smoothed)} != len seasonality {len(seasonality_curve)}'
                smoothed = upper_seasonality_curve

        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        smoothed_dataset = list(zip(timestamps, smoothed.values.tolist()))
        result = ProcessingResult(smoothed_dataset)
        return result

    def add_season_to_data(self, data: pd.Series, segment: pd.Series, offset: int, seasonality: int, addition: bool) -> pd.Series:
        #data - smoothed data to which seasonality will be added
        #if addition == True -> segment is added
        #if addition == False -> segment is subtracted
        len_smoothed_data = len(data)
        for idx, _ in enumerate(data):
            if idx - offset < 0:
                continue
            if (idx - offset) % seasonality == 0:
                if addition:
                    data = data.add(pd.Series(segment.values, index = segment.index + idx), fill_value = 0)
                else:
                    data = data.add(pd.Series(segment.values * -1, index = segment.index + idx), fill_value = 0)
        return data[:len_smoothed_data]
