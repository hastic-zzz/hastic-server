from abc import ABC, abstractmethod
from pandas import DataFrame
from typing import Optional, Union

from analytic_types import AnalyticUnitId
from analytic_types.data_bucket import DataBucket
from detectors import Detector
from models import ModelCache

logger = logging.getLogger('ANOMALY_DETECTOR')

class AnomalyDetector(Detector):

    def __init__(self, *args, **kwargs):
        self.bucket = DataBucket()

    def train(self, dataframe: DataFrame, payload: Union[list, dict], cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                'coinfedence': payload['coinfedence'],
                'coinfedence': payload['alpha']
            }
        }

    def detect(self, dataframe: DataFrame, cache: Optional[ModelCache]) -> dict:
        last_values = None
        if cache is not None:
            last_values = cache['last_values']

        #TODO detection code here

        last_detection_time = dataframe[-1]
        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': now
        }

    def consume_data(self, data: DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:

        self.detect(data, cache)

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        if cache is None:
            raise ValueError('anomaly detector got None cache')

        #TODO: calculate value based on `alpha` value from cache
        return 1
