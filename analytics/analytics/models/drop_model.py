from models import Model, ModelState, AnalyticSegment, StairModel

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde
from typing import Optional, List, Tuple
import utils
import utils.meta
import numpy as np
import pandas as pd
from analytic_types import AnalyticUnitId, TimeSeries
from analytic_types.learning_info import LearningInfo

@utils.meta.JSONClass
class StairModelState(ModelState):

    def __init__(
        self,
        confidence: float = 0,
        stair_height: float = 0,
        stair_length: float = 0,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.confidence = confidence
        self.stair_height = stair_height
        self.stair_length = stair_length


class DropModel(StairModel):

    def get_model_type(self) -> (str, bool):
        model = 'drop'
        type_model = False
        return (model, type_model)

    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        segment_center_index = utils.find_pattern_center(segment, start, 'drop')
        return segment_center_index

    # def get_stair_indexes(self, data: pd.Series, height: float, length: int) -> List[int]:
    #     '''
    #     data: data, that contains drop segments,
    #     length: the number of indexes to be contained in the drop segment,
    #     height: the difference between drop max_line and min_line(see utils.find_parameters),
    #     return: list of start drop segment indexes
    #     '''
    #     #TODO: refactor and move method to stair_model
    #     indexes = []
    #     for i in range(len(data) - length - 1):
    #         for x in range(1, length):
    #             if(data[i + x] < data[i] - height):
    #                 indexes.append(i)
    #     return indexes
