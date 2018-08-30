from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional


class Model(ABC):

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list, cache: Optional[dict]) -> dict:
        pass

    @abstractmethod
    def predict(self, dataframe: DataFrame, cache: Optional[dict]) -> dict:
        pass
