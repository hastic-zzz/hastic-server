from models import Model, ModelState, AnalyticSegment

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from typing import Optional, List, Tuple
import utils
import utils.meta
import numpy as np
import pandas as pd
from analytic_types import AnalyticUnitId

SMOOTHING_COEFF = 2400
EXP_SMOOTHING_FACTOR = 0.01


@utils.meta.JSONClass
class PeakModelState(ModelState):

    def __init__(
        self,
        confidence: float = 0,
        height_max: float = 0,
        height_min: float = 0,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.confidence = confidence
        self.height_max = height_max
        self.height_min = height_min


class PeakModel(Model):

    def get_model_type(self) -> (str, bool):
        model = 'peak'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmax()

    def get_state(self, cache: Optional[dict] = None) -> PeakModelState:
        return PeakModelState.from_json(cache)

    def get_best_pattern(self, close_patterns: List[Tuple[int, int]], data: pd.Series) -> list:
        pattern_list = []
        for val in close_patterns:
            max_val = data[val[0]]
            ind = val[0]
            for i in val:
                if data[i] > max_val:
                    max_val = data[i]
                    ind = i
            pattern_list.append(ind)
        return pattern_list

    def get_get_extremum_indexes(self, data: pd.Series) -> list:
        return argrelextrema(data.values, np.greater)[0]
