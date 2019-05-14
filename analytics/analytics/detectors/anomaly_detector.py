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
logger = logging.getLogger('ANOMALY_DETECTOR')


class AnomalyDetector(ProcessingDetector):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        data = dataframe['value']
        segments = payload.get('segments')
        prepared_segments = []

        new_cache = {
            'confidence': payload['confidence'],
            'alpha': payload['alpha'],
        }

        if segments is not None:
            seasonality = payload.get('seasonality')
            assert seasonality is not None and seasonality > 0, f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            for segment in segments:
                from_time = pd.to_datetime(segment['from'], unit='ms').time()
                to_time = pd.to_datetime(segment['to'], unit='ms').time()
                dataframe.index = pd.to_datetime(dataframe.index)
                #segment_data = dataframe.between_time(from_time, to_time) 
                segment_data = dataframe[:10] # for detect debugging
                prepared_segments.append({'from': segment['from'], 'data': segment_data.value.tolist()})

            new_cache['seasonality'] = seasonality
            new_cache['segments'] = prepared_segments

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

            data_start_time = int(dataframe['timestamp'][0].timestamp() * 1000)

            for segment in segments:
                seasonality_offset = seasonality - abs(segment['from'] - data_start_time) % seasonality

                seasonality_curve = pd.concat([segment['data']] * len(dataframe) // seasonality).reset_index()
                seasonality_curve = pd.concat([segment['data'][:seasonality_offset], seasonality_curve]).reset_index()

                upper_bound.merge(seasonality_curve, how='outer', left_index=True, right_index=True)
                upper_bound = upper_bound.value_x.fillna(0) + upper_bound.value_y.fillna(0)

                lower_bound.merge(seasonality_curve, how='outer', left_index=True, right_index=True)
                lower_bound = lower_bound.value_x.fillna(0) - lower_bound.value_y.fillna(0)

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
        return level

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
        data = dataframe['value']

        segments = cache.get('segments')
        if segments is not None:

            seasonality = cache.get('seasonality')
            assert seasonality is not None and seasonality > 0, f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = dataframe['timestamp'][0]

            for segment in segments:
                seasonality_offset = abs(segment - data_start_time) % seasonality
                segment_data = segment['data']
                segment_end_index = seasonality_offset + len(segment_data)
                data = data[: seasonality_offset] + (data[seasonality_offset: segment_end_index] + segment_data) + data[segment_end_index:]

        # TODO: exponential_smoothing should return dataframe with related timestamps
        smoothed = utils.exponential_smoothing(data, cache['alpha'], cache.get('lastValue'))
        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        smoothed_dataset = list(zip(timestamps, smoothed.values.tolist()))
        result = ProcessingResult(smoothed_dataset)
        return result
