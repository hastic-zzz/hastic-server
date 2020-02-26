from models import Model, ModelState, AnalyticSegment
from models import StairModel

import utils
import utils.meta
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from typing import Optional, List, Tuple
import math
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde
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


class JumpModel(StairModel):
    
    def get_model_type(self) -> (str, bool):
        model = 'jump'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        segment_center_index = utils.find_pattern_center(segment, start, 'jump')
        return segment_center_index

    def find_stair(self, data: pd.Series, height: float, length: int) -> List[int]:
        '''
        Find jump indexes
        '''
        j_list = []
        for i in range(len(data)-length-1):
            for x in range(1, length):
                if(data[i + x] > data[i] + height):
                    j_list.append(i)
        return(j_list)
