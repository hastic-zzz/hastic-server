import utils

from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional


class Model(ABC):

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list, cache: Optional[dict]) -> dict:
        pass

    @abstractmethod
    def do_predict(self, dataframe: DataFrame):
        pass

    def predict(self, dataframe: DataFrame, cache: Optional[dict]) -> dict:
        if type(cache) is dict:
            self.state = cache

        result = self.do_predict(dataframe)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return {
            'segments': result,
            'cache': self.state
        }
