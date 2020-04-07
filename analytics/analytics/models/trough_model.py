from analytic_types import TimeSeries
from models import TriangleModel, ModelType
import utils

import scipy.signal
from scipy.signal import argrelextrema
from typing import Optional, List, Tuple
import numpy as np
import pandas as pd

class TroughModel(TriangleModel):
    
    def get_model_type(self) -> ModelType:
        return ModelType.TROUGH
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmin()

    def get_best_pattern(self, close_patterns: TimeSeries, data: pd.Series) -> List[int]:
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

    def get_extremum_indexes(self, data: pd.Series) -> np.ndarray:
        return argrelextrema(data.values, np.less)[0]

    def get_smoothed_data(self, data: pd.Series, confidence: float, alpha: float) -> pd.Series:
        return utils.exponential_smoothing(data - self.state.confidence, alpha)

    def get_possible_segments(self, data: pd.Series, smoothed_data: pd.Series, trough_indexes: List[int]) -> List[int]:
        segments = []
        for idx in trough_indexes:
            if data[idx] < smoothed_data[idx]:
                segments.append(idx)
        return segments
