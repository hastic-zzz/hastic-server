from enum import Enum
import logging
import numpy as np
import pandas as pd
import math
from typing import Optional, Union, List, Tuple, Generator

from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.detector_typing import DetectionResult, ProcessingResult
from analytic_types.data_bucket import DataBucket
from analytic_types.segment import Segment, AnomalyDetectorSegment
from detectors import Detector, ProcessingDetector
import utils

MAX_DEPENDENCY_LEVEL = 100
MIN_DEPENDENCY_FACTOR = 0.1
BASIC_ALPHA = 0.5
logger = logging.getLogger('ANOMALY_DETECTOR')

class Bound(Enum):
    ALL = 'ALL'
    UPPER = 'UPPER'
    LOWER = 'LOWER'

class AnomalyDetector(ProcessingDetector):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        super().__init__(analytic_unit_id)
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        segments = payload.get('segments')
        enable_bounds = Bound(payload.get('enableBounds') or 'ALL')
        prepared_segments = []
        time_step = utils.find_interval(dataframe)

        new_cache = {
            'confidence': payload['confidence'],
            'alpha': payload['alpha'],
            'timeStep': time_step,
            'enableBounds': enable_bounds.value
        }

        if segments is not None:
            seasonality = payload.get('seasonality')
            assert seasonality is not None and seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'
            parsed_segments = map(Segment.from_json, segments)

            for segment in parsed_segments:
                segment_len = (int(segment.to_timestamp) - int(segment.from_timestamp))
                assert segment_len <= seasonality, \
                    f'seasonality {seasonality} must be greater than segment length {segment_len}'

                from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment.from_timestamp, unit='ms'))
                to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment.to_timestamp, unit='ms'))
                segment_data = dataframe[from_index : to_index]
                prepared_segments.append({
                    'from': segment.from_timestamp,
                    'to': segment.to_timestamp,
                    'data': segment_data.value.tolist()
                })

            new_cache['seasonality'] = seasonality
            new_cache['segments'] = prepared_segments

        return {
            'cache': new_cache
        }

    # TODO: ModelCache -> DetectorState
    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        if cache == None:
            raise f'Analytic unit {self.analytic_unit_id} got empty cache'
        data = dataframe['value']

        # TODO: use class for cache to avoid using string literals
        alpha = self.get_value_from_cache(cache, 'alpha', required = True)
        confidence = self.get_value_from_cache(cache, 'confidence', required = True)
        segments = self.get_value_from_cache(cache, 'segments')
        enable_bounds = Bound(self.get_value_from_cache(cache, 'enableBounds') or 'ALL')

        smoothed_data = utils.exponential_smoothing(data, alpha)

        lower_bound = smoothed_data - confidence
        upper_bound = smoothed_data + confidence

        if segments is not None:
            parsed_segments = map(AnomalyDetectorSegment.from_json, segments)

            time_step = self.get_value_from_cache(cache, 'timeStep', required = True)
            seasonality = self.get_value_from_cache(cache, 'seasonality', required = True)
            assert seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            for segment in parsed_segments:
                seasonality_index = seasonality // time_step
                seasonality_offset = self.get_seasonality_offset(segment.from_timestamp, seasonality, data_start_time, time_step)
                segment_data = pd.Series(segment.data)

                lower_bound = self.add_season_to_data(lower_bound, segment_data, seasonality_offset, seasonality_index, Bound.LOWER)
                upper_bound = self.add_season_to_data(upper_bound, segment_data, seasonality_offset, seasonality_index, Bound.UPPER)

        detected_segments = list(self.detections_generator(dataframe, upper_bound, lower_bound, enable_bounds))

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = utils.convert_pd_timestamp_to_ms(last_dataframe_time)

        return DetectionResult(cache, detected_segments, last_detection_time)

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

    # TODO: remove duplication with detect()
    def process_data(self, dataframe: pd.DataFrame, cache: ModelCache) -> ProcessingResult:
        segments = self.get_value_from_cache(cache, 'segments')
        alpha = self.get_value_from_cache(cache, 'alpha', required = True)
        confidence = self.get_value_from_cache(cache, 'confidence', required = True)
        enable_bounds = Bound(self.get_value_from_cache(cache, 'enableBounds') or 'ALL')

        # TODO: exponential_smoothing should return dataframe with related timestamps
        smoothed_data = utils.exponential_smoothing(dataframe['value'], alpha)

        lower_bound = smoothed_data - confidence
        upper_bound = smoothed_data + confidence

        if segments is not None:
            segments: List[AnomalyDetectorSegment] = map(AnomalyDetectorSegment.from_json, segments)
            seasonality = self.get_value_from_cache(cache, 'seasonality', required = True)
            assert seasonality > 0, \
                f'{self.analytic_unit_id} got invalid seasonality {seasonality}'

            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            time_step = self.get_value_from_cache(cache, 'timeStep', required = True)

            for segment in segments:
                seasonality_index = seasonality // time_step
                # TODO: move it to utils and add tests
                seasonality_offset = self.get_seasonality_offset(segment.from_timestamp, seasonality, data_start_time, time_step)
                segment_data = pd.Series(segment.data)

                lower_bound = self.add_season_to_data(lower_bound, segment_data, seasonality_offset, seasonality_index, Bound.LOWER)
                upper_bound = self.add_season_to_data(upper_bound, segment_data, seasonality_offset, seasonality_index, Bound.UPPER)

                # TODO: support multiple segments

        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        lower_bound_timeseries = list(zip(timestamps, lower_bound.values.tolist()))
        upper_bound_timeseries = list(zip(timestamps, upper_bound.values.tolist()))

        if enable_bounds == Bound.ALL:
            return ProcessingResult(lower_bound_timeseries, upper_bound_timeseries)
        elif enable_bounds == Bound.UPPER:
            return ProcessingResult(upper_bound = upper_bound_timeseries)
        elif enable_bounds == Bound.LOWER:
            return ProcessingResult(lower_bound = lower_bound_timeseries)

    def add_season_to_data(self, data: pd.Series, segment: pd.Series, offset: int, seasonality: int, bound_type: Bound) -> pd.Series:
        #data - smoothed data to which seasonality will be added
        #if addition == True -> segment is added
        #if addition == False -> segment is subtracted
        len_smoothed_data = len(data)
        for idx, _ in enumerate(data):
            if idx - offset < 0:
                #TODO: add seasonality for non empty parts
                continue
            if (idx - offset) % seasonality == 0:
                if bound_type == Bound.UPPER:
                    upper_segment_bound = self.get_bounds_for_segment(segment)[0]
                    data = data.add(pd.Series(upper_segment_bound.values, index = segment.index + idx), fill_value = 0)
                elif bound_type == Bound.LOWER:
                    lower_segment_bound = self.get_bounds_for_segment(segment)[1]
                    data = data.add(pd.Series(lower_segment_bound.values * -1, index = segment.index + idx), fill_value = 0)
                else:
                    raise ValueError(f'unknown bound type: {bound_type.value}')

        return data[:len_smoothed_data]

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

    def get_seasonality_offset(self, from_timestamp: int, seasonality: int, data_start_time: int, time_step: int) -> int:
        season_count = math.ceil(abs(from_timestamp - data_start_time) / seasonality)
        start_seasonal_segment = from_timestamp + seasonality * season_count
        seasonality_time_offset = abs(start_seasonal_segment - data_start_time) % seasonality
        seasonality_offset = math.ceil(seasonality_time_offset / time_step)
        return seasonality_offset

    def detections_generator(
        self,
        dataframe: pd.DataFrame,
        upper_bound: pd.DataFrame,
        lower_bound: pd.DataFrame,
        enable_bounds: Bound
    ) -> Generator[Segment, None, Segment]:
        in_segment = False
        segment_start = 0
        bound: Bound = None
        for idx, val in enumerate(dataframe['value'].values):
            if val > upper_bound.values[idx]:
                if enable_bounds == Bound.UPPER or enable_bounds == Bound.ALL:
                    if not in_segment:
                        in_segment = True
                        segment_start = dataframe['timestamp'][idx]
                        bound = self.setBoundType(Bound.UPPER, bound)
                    continue

            if val < lower_bound.values[idx]:
                if enable_bounds == Bound.LOWER or enable_bounds == Bound.ALL:
                    if not in_segment:
                        in_segment = True
                        segment_start = dataframe['timestamp'][idx]
                        bound = self.setBoundType(Bound.LOWER, bound)
                    continue

            if in_segment:
                segment_end = dataframe['timestamp'][idx - 1]
                yield Segment(
                    utils.convert_pd_timestamp_to_ms(segment_start),
                    utils.convert_pd_timestamp_to_ms(segment_end),
                    message=f'{val} out of {str(bound.value)} bound'
                )
                in_segment = False
                bound = None
        else:
            if in_segment:
                segment_end = dataframe['timestamp'][idx]
                return Segment(
                    utils.convert_pd_timestamp_to_ms(segment_start),
                    utils.convert_pd_timestamp_to_ms(segment_end),
                    message=f'{val} out of {str(bound.value)} bound'
                )

    def setBoundType(self, currentBound: Bound, oldBound: Optional[Bound]) -> Bound:
        if oldBound == None or currentBound == oldBound:
            return currentBound
        else:
            return Bound.ALL
