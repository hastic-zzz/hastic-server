from enum import Enum
import logging
import numpy as np
import pandas as pd
import math
from typing import Optional, Union, List, Tuple, Generator
import operator

from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.detector import DetectionResult, ProcessingResult, Bound
from analytic_types.data_bucket import DataBucket
from analytic_types.segment import Segment, AnomalyDetectorSegment
from analytic_types.cache import AnomalyCache
from detectors import Detector, ProcessingDetector
import utils

MAX_DEPENDENCY_LEVEL = 100
MIN_DEPENDENCY_FACTOR = 0.1
BASIC_ALPHA = 0.5
logger = logging.getLogger('ANOMALY_DETECTOR')


class AnomalyDetector(ProcessingDetector):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        super().__init__(analytic_unit_id)
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        cache = AnomalyCache.from_json(payload)
        cache.time_step = utils.find_interval(dataframe)
        segments = cache.segments

        if len(segments) > 0:
            seasonality = cache.seasonality
            prepared_segments = []

            for segment in segments:
                segment_len = (int(segment.to_timestamp) - int(segment.from_timestamp))
                assert segment_len <= seasonality, \
                    f'seasonality {seasonality} must be greater than segment length {segment_len}'

                from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment.from_timestamp, unit='ms'))
                to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment.to_timestamp, unit='ms'))
                segment_data = dataframe[from_index : to_index]
                prepared_segments.append(
                    AnomalyDetectorSegment(
                        segment.from_timestamp,
                        segment.to_timestamp,
                        segment_data.value.tolist()
                    )
                )
            cache.set_segments(prepared_segments)

        return {
            'cache': cache.to_json()
        }

    # TODO: ModelCache -> DetectorState
    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        if cache == None:
            raise f'Analytic unit {self.analytic_unit_id} got empty cache'
        data = dataframe['value']

        cache = AnomalyCache.from_json(cache)
        segments = cache.segments
        enabled_bounds = cache.get_enabled_bounds()

        smoothed_data = utils.exponential_smoothing(data, cache.alpha)

        lower_bound = smoothed_data - cache.confidence
        upper_bound = smoothed_data + cache.confidence

        if len(segments) > 0:
            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            for segment in segments:
                seasonality_index = cache.seasonality // cache.time_step
                seasonality_offset = self.get_seasonality_offset(
                    segment.from_timestamp,
                    cache.seasonality,
                    data_start_time,
                    cache.time_step
                )
                segment_data = pd.Series(segment.data)

                lower_bound = self.add_season_to_data(lower_bound, segment_data, seasonality_offset, seasonality_index, Bound.LOWER)
                upper_bound = self.add_season_to_data(upper_bound, segment_data, seasonality_offset, seasonality_index, Bound.UPPER)

        detected_segments = list(self.detections_generator(dataframe, upper_bound, lower_bound, enabled_bounds))

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = utils.convert_pd_timestamp_to_ms(last_dataframe_time)

        return DetectionResult(cache.to_json(), detected_segments, last_detection_time)

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
        cache = AnomalyCache.from_json(cache)

        for level in range(1, MAX_DEPENDENCY_LEVEL):
            if (1 - cache.alpha) ** level < MIN_DEPENDENCY_FACTOR:
                break

        seasonality = 0
        if len(cache.segments) > 0:
            seasonality = cache.seasonality // cache.time_step
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
        cache = AnomalyCache.from_json(cache)
        segments = cache.segments
        enabled_bounds =  cache.get_enabled_bounds()

        # TODO: exponential_smoothing should return dataframe with related timestamps
        smoothed_data = utils.exponential_smoothing(dataframe['value'], cache.alpha)

        lower_bound = smoothed_data - cache.confidence
        upper_bound = smoothed_data + cache.confidence

        if len(segments) > 0:
            data_start_time = utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][0])

            for segment in segments:
                seasonality_index = cache.seasonality // cache.time_step
                # TODO: move it to utils and add tests
                seasonality_offset = self.get_seasonality_offset(
                    segment.from_timestamp,
                    cache.seasonality,
                    data_start_time,
                    cache.time_step
                )
                segment_data = pd.Series(segment.data)

                lower_bound = self.add_season_to_data(lower_bound, segment_data, seasonality_offset, seasonality_index, Bound.LOWER)
                upper_bound = self.add_season_to_data(upper_bound, segment_data, seasonality_offset, seasonality_index, Bound.UPPER)

                # TODO: support multiple segments

        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        lower_bound_timeseries = list(zip(timestamps, lower_bound.values.tolist()))
        upper_bound_timeseries = list(zip(timestamps, upper_bound.values.tolist()))

        if enabled_bounds == Bound.ALL:
            return ProcessingResult(lower_bound_timeseries, upper_bound_timeseries)
        elif enabled_bounds == Bound.UPPER:
            return ProcessingResult(upper_bound = upper_bound_timeseries)
        elif enabled_bounds == Bound.LOWER:
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
                    upper_segment_bound = self.get_segment_bound(segment, Bound.UPPER)
                    data = data.add(pd.Series(upper_segment_bound.values, index = segment.index + idx), fill_value = 0)
                elif bound_type == Bound.LOWER:
                    lower_segment_bound = self.get_segment_bound(segment, Bound.LOWER)
                    data = data.add(pd.Series(lower_segment_bound.values * -1, index = segment.index + idx), fill_value = 0)
                else:
                    raise ValueError(f'unknown bound type: {bound_type.value}')

        return data[:len_smoothed_data]

    def get_segment_bound(self, segment: pd.Series, bound: Bound) -> pd.Series:
        '''
        segment is divided by the median to determine its top or bottom part
        the part is smoothed and raised above the segment or put down below the segment
        '''
        if len(segment) < 2:
            return segment
        comparison_operator = operator.gt if bound == Bound.UPPER else operator.le
        segment = segment - segment.min()
        segment_median = segment.median()
        part = [val if comparison_operator(val, segment_median) else segment_median for val in segment.values]
        part = pd.Series(part, index = segment.index)
        smoothed_part = utils.exponential_smoothing(part, BASIC_ALPHA)
        difference = [abs(x - y) for x, y in zip(part, smoothed_part)]
        max_diff = max(difference)
        bound = [val + max_diff for val in smoothed_part.values]
        bound = pd.Series(bound, index = segment.index)
        return bound

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
        enabled_bounds: Bound
    ) -> Generator[Segment, None, Segment]:
        in_segment = False
        segment_start = 0
        bound: Bound = None
        for idx, val in enumerate(dataframe['value'].values):
            if val > upper_bound.values[idx]:
                if enabled_bounds == Bound.UPPER or enabled_bounds == Bound.ALL:
                    if not in_segment:
                        in_segment = True
                        segment_start = dataframe['timestamp'][idx]
                        bound = Bound.UPPER
                    continue

            if val < lower_bound.values[idx]:
                if enabled_bounds == Bound.LOWER or enabled_bounds == Bound.ALL:
                    if not in_segment:
                        in_segment = True
                        segment_start = dataframe['timestamp'][idx]
                        bound = Bound.LOWER
                    continue

            if in_segment:
                segment_end = dataframe['timestamp'][idx - 1]
                yield Segment(
                    utils.convert_pd_timestamp_to_ms(segment_start),
                    utils.convert_pd_timestamp_to_ms(segment_end),
                    message=f'{val} out of {str(bound.value)} bound'
                )
                in_segment = False
        else:
            if in_segment:
                segment_end = dataframe['timestamp'][idx]
                return Segment(
                    utils.convert_pd_timestamp_to_ms(segment_start),
                    utils.convert_pd_timestamp_to_ms(segment_end),
                    message=f'{val} out of {str(bound.value)} bound'
                )
