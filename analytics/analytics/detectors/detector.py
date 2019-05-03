from models import ModelCache
from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union, List


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

    @abstractmethod
    def get_intersections(self, segments: List[dict]) -> List[dict]:
        pass

    def is_detection_intersected(self) -> bool:
        return True
