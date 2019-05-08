import logging
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

    def __init__(self, analytic_unit_id):
        self.analytic_unit_id = analytic_unit_id
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                'confidence': payload['confidence'],
                'alpha': payload['alpha']
            }
        }

    # TODO: ModelCache -> ModelState
    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        data = dataframe['value']
        last_value = None
        if cache is not None:
            last_value = cache.get('last_value')

        smoothed_data = utils.exponential_smoothing(data, cache['alpha'], last_value)
        upper_bound = smoothed_data + cache['confidence']
        lower_bound = smoothed_data - cache['confidence']

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
    def process_data(self, data: pd.DataFrame, cache: ModelCache) -> ProcessingResult:
        smoothed = utils.exponential_smoothing(data, cache['alpha'], cache.get('lastValue'))
        result = ProcessingResult(smoothed.to_list())
        return result

    def merge_segments(self, segments: List[Segment]) -> List[Segment]:
        segments = utils.merge_intersecting_segments(segments)
        return segments
