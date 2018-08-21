import models
import utils

from grafana_data_provider import GrafanaDataProvider

import logging
from urllib.parse import urlparse
import os.path
import json
import config

import pandas as pd


logger = logging.getLogger('analytic_toolset')



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


class PatternDetector:

    def __init__(self, analytic_unit_id, pattern_type):
        self.analytic_unit_id = analytic_unit_id
        self.pattern_type = pattern_type

        self.model = None
        self.__load_model(pattern_type)

    async def learn(self, segments):
        self.model = resolve_model_by_pattern(self.pattern_type)
        window_size = 200

        dataframe = self.data_prov.get_dataframe()

        segments = self.data_prov.transform_anomalies(segments)
        # TODO: pass only part of dataframe that has segments
        self.model.fit(dataframe, segments)
        self.__save_model()
        return 0

    async def predict(self, last_prediction_time):
        if self.model is None:
            return [], last_prediction_time

        window_size = 100
        last_prediction_time = pd.to_datetime(last_prediction_time, unit='ms')

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
        # return predicted_anomalies, last_prediction_time

    def synchronize_data(self):
        self.data_prov.synchronize()

    def __save_model(self):
        # TODO: use data_service to save anything

    def __load_model(self, pattern):
        # TODO: use data_service to save anything
