import models

import logging
import config

import pandas as pd

from detectors import Detector


logger = logging.getLogger('PATTERN_DETECTOR')


def resolve_model_by_pattern(pattern: str) -> models.Model:
    if pattern == 'PEAK':
        return models.PeaksModel()
    if pattern == 'DROP':
        return models.StepModel()
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

    async def train(self, dataframe: pd.DataFrame, segments: list, cache: dict):
        # TODO: pass only part of dataframe that has segments
        self.model.fit(dataframe, segments, cache)
        # TODO: save model after fit
        return cache

    async def predict(self, dataframe: pd.DataFrame, cache: dict):
        predicted = await self.model.predict(dataframe, cache)

        segments = [{ 'from': segment[0], 'to': segment[1] } for segment in predicted]

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_prediction_time = last_dataframe_time.value
        return {
            'cache': cache,
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }
