import utils

from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional

AnalyticUnitCache = dict

class Model(ABC):

    @abstractmethod
    def do_fit(self, dataframe: DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> None:
        pass

    @abstractmethod
    def do_predict(self, dataframe: DataFrame) -> list:
        pass

    def fit(self, dataframe: DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        if type(cache) is AnalyticUnitCache:
            self.state = cache

        self.segments = segments
        segment_length_list = []
        for segment in self.segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))

                segment_length = abs(segment_to_index - segment_from_index)
                segment_length_list.append(segment_length)
        self.segment_length = max(segment_length_list)
        
        self.do_fit(dataframe, segments)
        return self.state

    def predict(self, dataframe: DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        if type(cache) is AnalyticUnitCache:
            self.state = cache

        result = self.do_predict(dataframe)
        
        return {
            'segments': result,
            'cache': self.state
        }
