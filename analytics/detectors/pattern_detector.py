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

    async def train(self, dataframe: pd.DataFrame, segments: list, cache: dict)):
        # TODO: pass only part of dataframe that has segments
        self.model.fit(dataframe, segments)
        # TODO: save model after fit
        return cache

    async def predict(self, dataframe: pd.DataFrame, cache: dict)):
        predicted_indexes = await self.model.predict(dataframe)

        segments = []
        # for time_value in predicted_times:
        #     ts1 = int(time_value[0].timestamp() * 1000)
        #     ts2 = int(time_value[1].timestamp() * 1000)
        #     segments.append({
        #         'start': min(ts1, ts2),
        #         'finish': max(ts1, ts2)
        #     })

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        return {
            'cache': cache,
            'segments': segments,
            'last_prediction_time': last_prediction_time
        }
