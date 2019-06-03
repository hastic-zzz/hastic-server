import logging
import numpy as np
import pandas as pd
import math
from typing import Optional, Union, List, Tuple

from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.detector_typing import DetectionResult, AnomalyProcessingResult
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
        time_step = utils.find_interval(dataframe)

        new_cache = {
            'confidence': payload['confidence'],
            'alpha': payload['alpha'],
            'timeStep': time_step
        }

        if segments is not None:
            seasonality = payload.get('seasonality')
            assert seasonality is not None and seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            for segment in segments:
                segment_len = (int(segment['to']) - int(segment['from']))
                assert segment_len <= seasonality, \
                    f'seasonality {seasonality} must be great then segment length {segment_len}'

                from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = dataframe[from_index : to_index]
                prepared_segments.append({'from': segment['from'], 'data': segment_data.value.tolist()})

            new_cache['seasonality'] = seasonality
            new_cache['segments'] = prepared_segments

        return {
            'cache': new_cache
        }

    # TODO: ModelCache -> ModelState
    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        data = dataframe['value']
        time_step = cache['timeStep']
        segments = cache.get('segments')

        smoothed_data = utils.exponential_smoothing(data, cache['alpha'])
 
        # TODO: use class for cache to avoid using string literals
        upper_bound = smoothed_data + cache['confidence']
        lower_bound = smoothed_data - cache['confidence']

        if segments is not None:

            seasonality = cache.get('seasonality')
            assert seasonality is not None and seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])
            data_second_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][1])

            for segment in segments:
                seasonality_index = seasonality // time_step
                season_count = math.ceil(abs(segment['from'] - data_start_time) / seasonality)
                start_seasonal_segment = segment['from'] + seasonality * season_count
                seasonality_offset = (abs(start_seasonal_segment - data_start_time) % seasonality) // time_step
                #TODO: upper and lower bounds for segment_data
                segment_data = pd.Series(segment['data'])
                upper_bound = self.add_season_to_data(
                    upper_bound, segment_data, seasonality_offset, seasonality_index, True
                )
                lower_bound = self.add_season_to_data(
                    lower_bound, segment_data, seasonality_offset, seasonality_index, False
                )
                assert len(smoothed_data) == len(upper_bound) == len(lower_bound), \
                    f'len smoothed {len(smoothed_data)} != len seasonality {len(upper_bound)}'

                # TODO: use class for cache to avoid using string literals

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
            return self.detect(self.bucket.data, cache)

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
        time_step = detections[0].cache['timeStep']
        for detection in detections:
            result.segments.extend(detection.segments)
            result.last_detection_time = detection.last_detection_time
            result.cache = detection.cache
        result.segments = utils.merge_intersecting_segments(result.segments, time_step)
        return result

    # TODO: ModelCache -> ModelState (don't use string literals)
    def process_data(self, dataframe: pd.DataFrame, cache: ModelCache) -> AnomalyProcessingResult:
        segments = cache.get('segments')

        # TODO: exponential_smoothing should return dataframe with related timestamps
        smoothed = utils.exponential_smoothing(dataframe['value'], cache['alpha'])
        upper_bound = smoothed + cache['confidence']
        lower_bound = smoothed - cache['confidence']

        # TODO: remove duplication with detect()

        if segments is not None:
            seasonality = cache.get('seasonality')
            assert seasonality is not None and seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])
            time_step = cache['timeStep']

            for segment in segments:
                seasonality_index = seasonality // time_step
                # TODO: move it to utils and add tests
                season_count = math.ceil(abs(segment['from'] - data_start_time) / seasonality)
                start_seasonal_segment = segment['from'] + seasonality * season_count
                seasonality_offset = (abs(start_seasonal_segment - data_start_time) % seasonality) // time_step
                segment_data = pd.Series(segment['data'])
                upper_bound = self.add_season_to_data(
                    upper_bound, segment_data, seasonality_offset, seasonality_index, True
                )
                lower_bound = self.add_season_to_data(
                    lower_bound, segment_data, seasonality_offset, seasonality_index, False
                )
                assert len(smoothed) == len(upper_bound) == len(lower_bound), \
                    f'len smoothed {len(smoothed)} != len seasonality {len(upper_bound)}'

                # TODO: support multiple segments

        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        lower_bound_timeseries = list(zip(timestamps, lower_bound.values.tolist()))
        upper_bound_timeseries = list(zip(timestamps, upper_bound.values.tolist()))
        result = AnomalyProcessingResult(lower_bound_timeseries, upper_bound_timeseries)
        return result

    def add_season_to_data(self, data: pd.Series, segment: pd.Series, offset: int, seasonality: int, addition: bool) -> pd.Series:
        #data - smoothed data to which seasonality will be added
        #if addition == True -> segment is added
        #if addition == False -> segment is subtracted
        len_smoothed_data = len(data)
        for idx, _ in enumerate(data):
            if idx - offset < 0:
                #TODO: add seasonality for non empty parts
                continue
            if (idx - offset) % seasonality == 0:
                if addition:
                    upper_segment_bound = self.get_bounds_for_segment(segment)[0]
                    data = data.add(pd.Series(upper_segment_bound.values, index = segment.index + idx), fill_value = 0)
                else:
                    lower_segment_bound = self.get_bounds_for_segment(segment)[1]
                    data = data.add(pd.Series(lower_segment_bound.values * -1, index = segment.index + idx), fill_value = 0)
        return data[:len_smoothed_data]

    def concat_processing_results(self, processing_results: List[AnomalyProcessingResult]) -> Optional[AnomalyProcessingResult]:
        if len(processing_results) == 0:
            return None

        united_result = AnomalyProcessingResult()
        for result in processing_results:
            united_result.lower_bound.extend(result.lower_bound)
            united_result.upper_bound.extend(result.upper_bound)

        return united_result

    def get_bounds_for_segment(self, segment: pd.Series) -> Tuple[pd.Series, pd.Series]:
        '''
        segment is divided by the median to determine its top and bottom parts
        parts are smoothed and raised so the segment is between them
        '''
        if len(segment) < 2:
            return segment, segment
        segment = segment - segment.min()
        segment_median = segment.median()
        top_part = []
        bottom_part = []
        for val in segment.values:
            if val > segment_median:
                top_part.append(val)
                bottom_part.append(segment_median)
            else:
                bottom_part.append(val)
                top_part.append(segment_median)
        top_part = pd.Series(top_part, index = segment.index)
        bottom_part = pd.Series(bottom_part, index = segment.index)
        smoothed_top_part = utils.exponential_smoothing(top_part, BASIC_ALPHA)
        smoothed_bottom_part = utils.exponential_smoothing(bottom_part, BASIC_ALPHA)
        top_difference = []
        bottom_difference = []
        for idx, val in enumerate(top_part):
            top_difference.append(abs(val - smoothed_top_part[idx]))
            bottom_difference.append(abs(bottom_part[idx] - smoothed_bottom_part[idx]))
        max_diff_top = max(top_difference)
        max_diff_bot = max(bottom_difference)
        upper_bound = []
        lower_bound = []
        for val in smoothed_top_part.values:
            upper_bound.append(val + max_diff_top)
        for val in smoothed_bottom_part.values:
            lower_bound.append(val + max_diff_bot)
        upper_bound = pd.Series(upper_bound, index = segment.index)
        lower_bound = pd.Series(lower_bound, index = segment.index)
        return upper_bound, lower_bound
