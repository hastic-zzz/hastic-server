from abc import ABC, abstractmethod
from pandas import DataFrame


class Model(ABC):

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list, cache: dict) -> dict:
        pass

    @abstractmethod
    def predict(self, dataframe: DataFrame, cache: dict) -> dict:
        pass
