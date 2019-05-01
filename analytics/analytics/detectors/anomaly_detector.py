import logging
import pandas as pd
from typing import Optional, Union, List, Tuple

from analytic_types.data_bucket import DataBucket
from detectors import Detector
from models import ModelCache
import utils
from analytic_types import AnalyticUnitId

logger = logging.getLogger('ANOMALY_DETECTOR')


class AnomalyDetector(Detector):

    def __init__(self, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id
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
        alpha = cache['alpha']
        confidence = cache['confidence']

        last_value = None
        if cache is not None:
            last_value = cache.get('lastValue')

        smooth_data = utils.exponential_smoothing(data, alpha, last_value)
        upper_bound = utils.exponential_smoothing(data + confidence, alpha, last_value)
        lower_bound = utils.exponential_smoothing(data - confidence, alpha, last_value)

        segments = []
        for idx, val in enumerate(data.values):
            if val > upper_bound[idx] or val < lower_bound[idx]:
                segments.append(idx)

        last_detection_time = dataframe['timestamp'][-1]
        cache['lastValue'] = smooth_data[-1]

        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        if cache is None:
            msg = f'consume_data get invalid cache {cache} for task {self.analytic_unit_id}'
            logging.debug(msg)
            raise ValueError(msg)

        data_without_nan = data.dropna()

        if len(data_without_nan) == 0:
            return None

        self.bucket.receive_data(data_without_nan)

        if len(self.bucket.data) >= self.get_window_size(cache):
            self.detect(self.bucket, cache)


    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        if cache is None:
            raise ValueError('anomaly detector got None cache')

        for level in range(1, 100):
            if (1 - cache['alpha']) ** level < 0.1:
                break

        return level


    def is_detection_intersected(self) -> bool:
        return False
