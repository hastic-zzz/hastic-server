from models import ModelCache
from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union
from analytic_types import AnalyticUnitId
from detectors import Detector



class AnomalyDetector(Detector):

    def __init__(self):
        self.amount = 10
        pass

    def train(self, dataframe: pd.DataFrame, condfidence: float, cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                '': ,
                '': ,
            }
        }

    def smooth_data(self, dataframe: pd.DataFrame) -> List[List[int, float]]:
        #smooth data using exponential smoothing/moving average/weighted_average
        pass
    
    def get_confidence_window(self, smooth_data: pd.Series, condfidence: float) -> List[pd.Series, pd.Series]:
        #build confidence interval above and below smoothed data
        pass
    
    def find_anomaly(self, data, conf):
        pass

    def get_dependency_level(self, alpha: float) -> int:
        # 
        for level in range(100):
            if (1 - alpha) ** level < 0.01:
                break
        return level

    
    def detect(self, data: pd.DataFrame, confidence_interval: List[pd.Series, pd.Series]) -> 

