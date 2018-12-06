import models

import logging
import config

import pandas as pd
from typing import Optional

from detectors import Detector
from buckets import DataBucket


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


class PatternDetector(Detector):

    def __init__(self, pattern_type):
        self.pattern_type = pattern_type
        self.model = resolve_model_by_pattern(self.pattern_type)
        window_size = 100
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[models.AnalyticUnitCache]) -> models.AnalyticUnitCache:
        # TODO: pass only part of dataframe that has segments
        new_cache = self.model.fit(dataframe, segments, cache)
        return {
            'cache': new_cache
        }

    def detect(self, dataframe: pd.DataFrame, cache: Optional[models.AnalyticUnitCache]) -> dict:
        # TODO: split and sleep (https://github.com/hastic/hastic-server/pull/124#discussion_r214085643)
        detected = self.model.detect(dataframe, cache)

        segments = [{ 'from': segment[0], 'to': segment[1] } for segment in detected['segments']]
        newCache = detected['cache']

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = last_dataframe_time.value
        return {
            'cache': newCache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def recieve_data(self, data: pd.DataFrame) -> Optional[dict]:
        self.bucket.receive_data(data)

        if len(self.bucket.data) >= self.window_size:
            res = self.detect(self.bucket.data)
            #drop unused data
            return res
        
        return None
