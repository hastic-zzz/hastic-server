from models import AnalyticUnitCache
from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional


class Detector(ABC):

    @abstractmethod
    def train(self, dataframe: DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        """
            Should be thread-safe to other detectors' train method
        """
        pass

    @abstractmethod
    def detect(self, dataframe: DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        pass

    @abstractmethod
    def recieve_data(self, data: DataFrame, cache: Optional[AnalyticUnitCache]) -> Optional[dict]:
        pass
