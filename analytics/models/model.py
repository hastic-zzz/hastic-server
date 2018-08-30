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
    def do_predict(self, dataframe: DataFrame):
        pass

    def predict(self, dataframe: DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        if type(cache) is AnalyticUnitCache:
            self.state = cache

        result = self.do_predict(dataframe)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return {
            'segments': result,
            'cache': self.state
        }
