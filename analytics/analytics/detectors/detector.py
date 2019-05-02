from models import ModelCache
from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union, List
from analytic_types.detectors_typing import DetectionResult, ProcessingResult


class Detector(ABC):

    @abstractmethod
    def train(self, dataframe: DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        """
            Should be thread-safe to other detectors' train method
        """
        pass

    @abstractmethod
    def detect(self, dataframe: DataFrame, cache: Optional[ModelCache]) -> dict:
        pass

    @abstractmethod
    def consume_data(self, data: DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        pass

    @abstractmethod
    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        pass

    def is_detection_intersected(self) -> bool:
        return True

    def concat_detection_results(self, detection_results: List[DetectionResult]) -> DetectionResult:
        if detection_results == []:
            return None

        united_result = detection_results[0]
        for result in detection_results[1:]:
            united_result.cache = result.cache
            united_result.last_detection_time = result.last_detection_time
            united_result.segments.extend(result.segments)
        return united_result

class ProcessingDetector(Detector):

    @abstractmethod
    def process_data(self, data, cache: Optional[ModelCache]) -> ProcessingResult:
        pass

    def concat_processing_results(self, processing_results: List[ProcessingResult]) -> ProcessingResult:
        if processing_results == []:
            return None

        united_result = ProcessingResult()
        for result in processing_results:
            united_result.data.extend(result.data)

        return united_result