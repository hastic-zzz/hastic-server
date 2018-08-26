from abc import ABC, abstractmethod
from pandas import DataFrame


class Detector(ABC):

    @abstractmethod
    async def train(self, dataframe: DataFrame, segments: list):
        pass

    @abstractmethod
    async def predict(self, dataframe: DataFrame) -> list:
        pass
