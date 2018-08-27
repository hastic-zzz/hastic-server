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

    async def train(self, dataframe: pd.DataFrame, segments: list):
        # TODO: pass only part of dataframe that has segments
        self.model.fit(dataframe, segments)
        # TODO: save model after fit
        return 0

    async def predict(self, data):

        start_index = self.data_prov.get_upper_bound(last_prediction_time)
        start_index = max(0, start_index - window_size)
        dataframe = self.data_prov.get_data_range(start_index)

        predicted_indexes = self.model.predict(dataframe)
        predicted_indexes = [(x, y) for (x, y) in predicted_indexes if x >= start_index and y >= start_index]

        predicted_times = self.data_prov.inverse_transform_indexes(predicted_indexes)
        segments = []
        for time_value in predicted_times:
            ts1 = int(time_value[0].timestamp() * 1000)
            ts2 = int(time_value[1].timestamp() * 1000)
            segments.append({
                'start': min(ts1, ts2),
                'finish': max(ts1, ts2)
            })

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        return segments, last_prediction_time
