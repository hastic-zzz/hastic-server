import logging as log

import operator
import pandas as pd
import numpy as np
from typing import Optional, List

from analytic_types import ModelCache
from analytic_types.detector_typing import DetectionResult, ThresholdProcessingResult
from analytic_types.segment import Segment
from detectors import ProcessingDetector
from time import time
import utils


logger = log.getLogger('THRESHOLD_DETECTOR')


class ThresholdDetector(ProcessingDetector):

    WINDOW_SIZE = 3

    def __init__(self):
        pass

    def train(self, dataframe: pd.DataFrame, threshold: dict, cache: Optional[ModelCache]) -> ModelCache:
        time_step = utils.find_interval(dataframe)
        return {
            'cache': {
                'value': threshold['value'],
                'condition': threshold['condition'],
                'timeStep': time_step
            }
        }

    def detect(self, dataframe: pd.DataFrame, cache: ModelCache) -> DetectionResult:
        if cache is None or cache == {}:
            raise ValueError('Threshold detector error: cannot detect before learning')
        if len(dataframe) == 0:
            return None

        value = cache['value']
        condition = cache['condition']

        segments = []
        for index, row in dataframe.iterrows():
            current_value = row['value']
            current_timestamp = utils.convert_pd_timestamp_to_ms(row['timestamp'])
            segment = Segment(current_timestamp, current_timestamp)
            # TODO: merge segments
            if pd.isnull(current_value):
                if condition == 'NO_DATA':
                    segment.message = 'NO_DATA detected'
                    segments.append(segment)
                continue

            comparators = {
                '>': operator.gt,
                '<': operator.lt,
                '=': operator.eq,
                '>=': operator.ge,
                '<=': operator.le
            }

            assert condition in comparators.keys(), f'condition {condition} not allowed'

            if comparators[condition](current_value, value):
                segment.message = f"{current_value} {condition} threshold's value {value}"
                segments.append(segment)

        last_entry = dataframe.iloc[-1]
        last_detection_time = utils.convert_pd_timestamp_to_ms(last_entry['timestamp'])
        return DetectionResult(cache, segments, last_detection_time)


    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[DetectionResult]:
        result = self.detect(data, cache)
        return result if result else None

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        return self.WINDOW_SIZE

    def concat_detection_results(self, detections: List[DetectionResult]) -> DetectionResult:
        result = DetectionResult()
        time_step = detections[0].cache['timeStep']
        for detection in detections:
            result.segments.extend(detection.segments)
            result.last_detection_time = detection.last_detection_time
            result.cache = detection.cache
        result.segments = utils.merge_intersecting_segments(result.segments, time_step)
        return result

    def process_data(self, dataframe: pd.DataFrame, cache: ModelCache) -> ThresholdProcessingResult:
        data = dataframe['value']
        value = cache['value']
        data.values[:]  = value
        timestamps = utils.convert_series_to_timestamp_list(dataframe.timestamp)
        result_series = list(zip(timestamps, data.values.tolist()))
        return ThresholdProcessingResult(result_series)

    def concat_processing_results(self, processing_results: List[ThresholdProcessingResult]) -> Optional[ThresholdProcessingResult]:
        if len(processing_results) == 0:
            return None

        united_result = ThresholdProcessingResult([])
        for result in processing_results:
            united_result.threshold.extend(result.threshold)

        return united_result
