import utils

from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional

AnalyticUnitCache = dict

class Model(ABC):

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        pass

    @abstractmethod
    def do_predict(self, dataframe: DataFrame) -> list:
        pass

    def predict(self, dataframe: DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        if type(cache) is AnalyticUnitCache:
            self.state = cache

        result = self.do_predict(dataframe)

        return {
            'segments': result,
            'cache': self.state
        }
