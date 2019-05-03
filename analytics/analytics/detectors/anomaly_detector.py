import logging
import pandas as pd
from typing import Optional, Union, List, Tuple

from analytic_types import AnalyticUnitId
from analytic_types.data_bucket import DataBucket
from detectors import Detector
from models import ModelCache
import utils
from analytic_types import AnalyticUnitId

MAX_DEPENDENCY_LEVEL = 100
MIN_DEPENDENCY_FACTOR = 0.1
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
            last_values = cache.get('last_values')

        smothed_data = utils.exponential_smoothing(data, cache['alpha'])
        upper_bound = smothed_data + cache['confidence']
        lower_bound = smothed_data - cache['confidence']

        anomaly_indexes = []
        for idx, val in enumerate(data.values):
            if val > upper_bound.values[idx] or val < lower_bound.values[idx]:
                anomaly_indexes.append(data.index[idx])
        segments = utils.close_filtering(anomaly_indexes, 1)
        segments = utils.get_start_and_end_of_segments(segments)
        segments = [(
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][segment[0]]),
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][segment[1]]),
        ) for segment in segments]
        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = utils.convert_pd_timestamp_to_ms(last_dataframe_time)
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
        
        for level in range(1, MAX_DEPENDENCY_LEVEL):
            if (1 - cache['alpha']) ** level < MIN_DEPENDENCY_FACTOR:
                break
        return level

    def get_intersections(self, segments: List[dict]) -> List[dict]:
        segments = [[segment['from'], segment['to']] for segment in segments]
        segments = utils.merge_intersecting_intervals(segments)
        segments = [{'from': segment[0], 'to': segment[1]} for segment in segments]
        return segments

    def is_detection_intersected(self) -> bool:
        return False
