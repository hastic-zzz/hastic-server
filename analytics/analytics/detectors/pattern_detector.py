import models

import logging
import config

import pandas as pd
from typing import Optional

from detectors import Detector
from buckets import DataBucket
from models import ModelCache
from utils import convert_pd_timestamp_to_ms


logger = logging.getLogger('PATTERN_DETECTOR')


def resolve_model_by_pattern(pattern: str) -> models.Model:
    if pattern == 'GENERAL':
        return models.GeneralModel()
    if pattern == 'PEAK':
        return models.PeakModel()
    if pattern == 'TROUGH':
        return models.TroughModel()
    if pattern == 'DROP':
        return models.DropModel()
    if pattern == 'JUMP':
        return models.JumpModel()
    if pattern == 'CUSTOM':
        return models.CustomModel()
    raise ValueError('Unknown pattern "%s"' % pattern)

AnalyticUnitId = str
class PatternDetector(Detector):

    def __init__(self, pattern_type: str, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id
        self.pattern_type = pattern_type
        self.model = resolve_model_by_pattern(self.pattern_type)
        self.min_bucket_size = 150
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[models.ModelCache]) -> models.ModelCache:
        # TODO: pass only part of dataframe that has segments
        new_cache = self.model.fit(dataframe, segments, cache)
        return {
            'cache': new_cache
        }

    def detect(self, dataframe: pd.DataFrame, cache: Optional[models.ModelCache]) -> dict:
        logger.debug('Unit {} got {} data points for detection'.format(self.analytic_unit_id, len(dataframe)))
        # TODO: split and sleep (https://github.com/hastic/hastic-server/pull/124#discussion_r214085643)
        detected = self.model.detect(dataframe, cache)

        segments = [{ 'from': segment[0], 'to': segment[1] } for segment in detected['segments']]
        newCache = detected['cache']

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = convert_pd_timestamp_to_ms(last_dataframe_time)
        return {
            'cache': newCache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        data_without_nan = data.dropna()

        if len(data_without_nan) == 0:
            return None

        self.bucket.receive_data(data_without_nan)
        if not cache: cache = {}
        bucket_size = max(cache.get('WINDOW_SIZE', 0) * 3, self.min_bucket_size)

        res = self.detect(self.bucket.data, cache)

        if len(self.bucket.data) > bucket_size:
            excess_data = len(self.bucket.data) - bucket_size
            self.bucket.drop_data(excess_data)
        
        if res:
            return res
        else:
            return None
