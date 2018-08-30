import models

import logging
import config

import pandas as pd
from typing import Optional

from detectors import Detector


logger = logging.getLogger('PATTERN_DETECTOR')


def resolve_model_by_pattern(pattern: str) -> models.Model:
    if pattern == 'PEAK':
        return models.PeakModel()
    if pattern == 'REVERSE_PEAK':
        return models.ReversePeakModel()
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

    async def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[dict]):
        # TODO: pass only part of dataframe that has segments
        new_cache = self.model.fit(dataframe, segments, cache)
        return {
            'cache': new_cache
        }

    async def predict(self, dataframe: pd.DataFrame, cache: Optional[dict]):
        # TODO: split and sleep (https://github.com/hastic/hastic-server/pull/124#discussion_r214085643)
        predicted = self.model.predict(dataframe, cache)

        segments = [{ 'from': segment[0], 'to': segment[1] } for segment in predicted['segments']]
        newCache = predicted['cache']

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_prediction_time = last_dataframe_time.value
        return {
            'cache': newCache,
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }
