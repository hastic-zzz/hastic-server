from detectors.step_detector import StepDetector
from detectors.peaks_detector import PeaksDetector

from data_provider import DataProvider

import logging
from urllib.parse import urlparse
import os.path
import json
import config

import pandas as pd


logger = logging.getLogger('analytic_toolset')


def segments_box(segments):
    max_time = 0
    min_time = float("inf")
    for segment in segments:
        min_time = min(min_time, segment['start'])
        max_time = max(max_time, segment['finish'])
    min_time = pd.to_datetime(min_time, unit='ms')
    max_time = pd.to_datetime(max_time, unit='ms')
    return min_time, max_time


class PatternDetectionModel:

    def __init__(self, analytic_unit_id, pattern_type):
        self.analytic_unit_id = analytic_unit_id
        self.pattern_type = pattern_type

        self.__load_anomaly_config()

        parsedUrl = urlparse(self.anomaly_config['panelUrl'])
        origin = parsedUrl.scheme + '://' + parsedUrl.netloc

        datasource = self.anomaly_config['datasource']
        metric_name = self.anomaly_config['metric']['targets'][0]

        target_filename = os.path.join(config.METRICS_FOLDER, metric_name + ".json")
        datasource['origin'] = origin
        dataset_filename = os.path.join(config.DATASET_FOLDER, metric_name + ".csv")

        with open(target_filename, 'r') as file:
            target = json.load(file)

        self.data_prov = DataProvider(datasource, target, dataset_filename)

        self.model = None
        self.__load_model(pattern_type)

    async def learn(self, segments):
        self.model = self.__create_model(self.pattern_type)
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

        predicted_indexes = await self.model.predict(dataframe)
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

        last_dataframe_time = dataframe.iloc[- 1]['timestamp']
        last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        return segments, last_prediction_time
        # return predicted_anomalies, last_prediction_time

    def synchronize_data(self):
        self.data_prov.synchronize()

    def __create_model(self, pattern):
        if pattern == "peak":
            return PeaksDetector()
        if pattern == "jump" or pattern == "drop":
            return StepDetector(pattern)
        raise ValueError('Unknown pattern "%s"' % pattern)

    def __load_anomaly_config(self):
        with open(os.path.join(config.ANALYTIC_UNITS_FOLDER, self.analytic_unit_id + ".json"), 'r') as config_file:
            self.anomaly_config = json.load(config_file)

    def __save_model(self):
        logger.info("Save model '%s'" % self.analytic_unit_id)
        model_filename = os.path.join(config.MODELS_FOLDER, self.analytic_unit_id + ".m")
        self.model.save(model_filename)

    def __load_model(self, pattern):
        logger.info("Load model '%s'" % self.analytic_unit_id)
        model_filename = os.path.join(config.MODELS_FOLDER, self.pattern_type + ".m")
        if os.path.exists(model_filename):
            self.model = self.__create_model(pattern)
            self.model.load(model_filename)
