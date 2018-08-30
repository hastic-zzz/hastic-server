from models import AnalyticUnitCache
from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional


class Detector(ABC):

    @abstractmethod
    async def train(self, dataframe: DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        pass

    @abstractmethod
    async def predict(self, dataframe: DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        pass
