from abc import ABC, abstractmethod
import logging
import pandas as pd
from typing import Optional, Union, List, Tuple

from analytic_types import AnalyticUnitId
from analytic_types.data_bucket import DataBucket
from detectors import Detector
from models import ModelCache

logger = logging.getLogger('ANOMALY_DETECTOR')


class AnomalyDetector(Detector):

    def __init__(self, *args, **kwargs):
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                'confidence': payload['confidence'],
                'alpha': payload['alpha']
            }
        }

    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        last_values = None
        if cache is not None:
            last_values = cache['last_values']

        #TODO detection code here

        last_detection_time = dataframe[-1]
        return {
            'cache': cache,
            'segments': [],
            'lastDetectionTime': last_detection_time
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        self.detect(data, cache)


    def __smooth_data(self, dataframe: pd.DataFrame) -> List[Tuple[int, float]]:
        #smooth data using exponential smoothing/moving average/weighted_average
        pass
    
    def __get_confidence_window(self, smooth_data: pd.Series, condfidence: float) -> Tuple[pd.Series, pd.Series]:
        #build confidence interval above and below smoothed data
        pass

    def __get_dependency_level(self, alpha: float) -> int:
        #get the number of values that will affect the next value
        for level in range(1, 100):
            if (1 - alpha) ** level < 0.1:
                break
        return level

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        if cache is None:
            raise ValueError('anomaly detector got None cache')

        #TODO: calculate value based on `alpha` value from cache
        return 1
