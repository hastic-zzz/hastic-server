from models import OutlyingModel, OutlyingModelState

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from typing import Optional, List, Tuple
import utils
import utils.meta
import numpy as np
import pandas as pd
from analytic_types import AnalyticUnitId

class TroughModel(OutlyingModel):
    
    def get_model_type(self) -> (str, bool):
        model = 'trough'
        type_model = False
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmin()

    def get_best_pattern(self, close_patterns: List[Tuple[int, int]], data: pd.Series) -> list:
        pattern_list = []
        for val in close_patterns:
            min_val = data[val[0]]
            ind = val[0]
            for i in val:
                if data[i] < min_val:
                    min_val = data[i]
                    ind = i
            pattern_list.append(ind)
        return pattern_list

    def get_extremum_indexes(self, data: pd.Series) -> list:
        return argrelextrema(data.values, np.less)[0]
