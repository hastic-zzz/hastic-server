import utils

from abc import ABC, abstractmethod
from typing import Optional
import pandas as pd
import math

ModelCache = dict


class Model(ABC):

    @abstractmethod
    def do_fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[ModelCache]) -> None:
        pass

    @abstractmethod
    def do_detect(self, dataframe: pd.DataFrame) -> list:
        pass

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[ModelCache]) -> ModelCache:
        if type(cache) is ModelCache:
            self.state = cache

        self.segments = segments
        segment_length_list = []
        for segment in self.segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))

                segment_length = abs(segment_to_index - segment_from_index)
                segment_length_list.append(segment_length)
        self.state['WINDOW_SIZE'] = math.ceil(max(segment_length_list) / 2)
        self.do_fit(dataframe, segments)
        return self.state

    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        if type(cache) is ModelCache:
            self.state = cache

        result = self.do_detect(dataframe)
        # TODO: convert from ns to ms more proper way (not dividing by 10^6)
        segments = [(
            dataframe['timestamp'][x - 1].value / 1000000,
            dataframe['timestamp'][x + 1].value / 1000000
        ) for x in result]

        return {
            'segments': segments,
            'cache': self.state
        }
