from abc import ABC, abstractmethod
import logging
import pandas as pd
from typing import Optional, Union, List, Tuple

from analytic_types import AnalyticUnitId
from analytic_types.data_bucket import DataBucket
from detectors import Detector
from models import ModelCache
import utils

MAX_DEPENDEPCY_LEVEL = 100
MIN_DEPENDECY_FACTOR = 0.1
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
        data = dataframe['value']
        last_values = None
        if cache is not None:
            last_values = cache['last_values']

        #TODO detection code here
        smoth_data = utils.exponential_smoothing(data, cache['alpha'])
        upper_bound = smoth_data + cache['confidence']
        lower_bound = smoth_data - cache['confidence']

        anomaly_indexes = []
        for idx, val in enumerate(data.values):
            if val > upper_bound.values[idx] or val < lower_bound.values[idx]:
                anomaly_indexes.append(data.index[idx])
        segments = utils.close_filtering(anomaly_indexes, 1)
        last_detection_time = dataframe[-1]
        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        self.detect(data, cache)


    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        '''
        get the number of values that will affect the next value
        '''

        if cache is None:
            raise ValueError('anomaly detector got None cache')
        
        for level in range(1, MAX_DEPENDEPCY_LEVEL):
            if (1 - cache['alpha']) ** level < MIN_DEPENDECY_FACTOR:
                break
        return level
