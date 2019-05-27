from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union, List

from analytic_types import ModelCache, TimeSeries
from analytic_types.detector_typing import DetectionResult, ProcessingResult
from analytic_types.segment import Segment


class Detector(ABC):

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


class ProcessingDetector(Detector):

    @abstractmethod
    def process_data(self, data: TimeSeries, cache: Optional[ModelCache]) -> ProcessingResult:
        pass

    def concat_processing_results(self, processing_results: List[ProcessingResult]) -> Optional[ProcessingResult]:
        if len(processing_results) == 0:
            return None

        united_result = ProcessingResult()
        for result in processing_results:
            united_result.data.extend(result.data)

        return united_result
