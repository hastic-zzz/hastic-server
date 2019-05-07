from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union, List

from analytic_types import ModelCache
from analytic_types.detector_typing import DetectionResult


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

    def merge_segments(self, segments: List[dict]) -> List[dict]:
        return segments
