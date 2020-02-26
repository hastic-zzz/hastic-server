from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union, List

from analytic_types import ModelCache, TimeSeries, AnalyticUnitId
from analytic_types.detector import DetectionResult, ProcessingResult
from analytic_types.segment import Segment


class Detector(ABC):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id

    @abstractmethod
    def train(self, dataframe: DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        """
            Should be thread-safe to other detectors' train method
        """
        pass

    @abstractmethod
    def detect(self, dataframe: DataFrame, cache: Optional[ModelCache]) -> DetectionResult:
        pass

    @abstractmethod
    def consume_data(self, data: DataFrame, cache: Optional[ModelCache]) -> Optional[DetectionResult]:
        pass

    @abstractmethod
    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        pass

    def is_detection_intersected(self) -> bool:
        return True

    def concat_detection_results(self, detections: List[DetectionResult]) -> DetectionResult:
        result = DetectionResult()
        for detection in detections:
            result.segments.extend(detection.segments)
            result.last_detection_time = detection.last_detection_time
            result.cache = detection.cache
        return result

    def get_value_from_cache(self, cache: ModelCache, key: str, required = False):
        value = cache.get(key)
        if value == None and required:
            raise ValueError(f'Missing required "{key}" field in cache for analytic unit {self.analytic_unit_id}')
        return value


class ProcessingDetector(Detector):

    @abstractmethod
    def process_data(self, data: TimeSeries, cache: Optional[ModelCache]) -> ProcessingResult:
        '''
        Data processing to receive additional time series that represents detector's settings
        '''
        pass

    def concat_processing_results(self, processing_results: List[ProcessingResult]) -> Optional[ProcessingResult]:
        '''
        Concatenate sequential ProcessingResults that received via
        splitting dataset to chunks in analytic worker
        '''

        if len(processing_results) == 0:
            return None

        united_result = ProcessingResult()
        for result in processing_results:
            if result.lower_bound is not None:
                if united_result.lower_bound is None: united_result.lower_bound = []
                united_result.lower_bound.extend(result.lower_bound)

            if result.upper_bound is not None:
                if united_result.upper_bound is None: united_result.upper_bound = []
                united_result.upper_bound.extend(result.upper_bound)

        return united_result
