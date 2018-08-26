from abc import ABC, abstractmethod
from pandas import DataFrame


class Detector(ABC):

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list):
        pass

    @abstractmethod
    def predict(self, dataframe: DataFrame) -> list:
        pass
