from data_provider import DataProvider
import logging
import os.path
import json
import pandas as pd

datasource_folder = "datasources/"
dataset_folder = "datasets/"
anomalies_folder = "anomalies/"
models_folder = "models/"
metrics_folder = "metrics/"
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

    def __init__(self, pattern_name, preset=None):
        self.pattern_name = pattern_name
        self.preset = preset

        self.__load_anomaly_config()
        datasource = self.anomaly_config['metric']['datasource']
        metric_name = self.anomaly_config['metric']['targets'][0]

        dbconfig_filename = os.path.join(datasource_folder, datasource + ".json")
        target_filename = os.path.join(metrics_folder, metric_name + ".json")

        dataset_filename = os.path.join(dataset_folder, metric_name + ".csv")

        with open(dbconfig_filename, 'r') as config_file:
            dbconfig = json.load(config_file)

        with open(target_filename, 'r') as file:
            target = json.load(file)

        self.data_prov = DataProvider(dbconfig, target, dataset_filename)

        self.model = None
        self.__load_model(preset)

    def learn(self, segments):
        self.model = self.__create_model(self.preset)
        window_size = 200

        dataframe = self.data_prov.get_dataframe()
        start_index, stop_index = 0, len(dataframe)
        if len(segments) > 0:
            min_time, max_time = segments_box(segments)
            start_index = dataframe[dataframe['timestamp'] >= min_time].index[0]
            stop_index = dataframe[dataframe['timestamp'] > max_time].index[0]
            start_index = max(start_index - window_size, 0)
            stop_index = min(stop_index + window_size, len(dataframe))

        dataframe = dataframe[start_index:stop_index]

        segments = self.data_prov.transform_anomalies(segments)
        self.model.fit(dataframe, segments)
        self.__save_model()
        return 0
        # return last_prediction_time

    def predict(self, last_prediction_time):
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
                'start': ts1,
                'finish': ts2
            })

        last_dataframe_time = dataframe.iloc[- 1]['timestamp']
        last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        return segments, last_prediction_time
        # return predicted_anomalies, last_prediction_time

    def synchronize_data(self):
        self.data_prov.synchronize()

    def __create_model(self, preset):
        if preset == "peaks":
            from peaks_detector import PeaksDetector
            return PeaksDetector()
        if preset == "steps" or preset == "cliffs":
            from step_detector import StepDetector
            return StepDetector(preset)

    def __load_anomaly_config(self):
        with open(os.path.join(anomalies_folder, self.pattern_name + ".json"), 'r') as config_file:
            self.anomaly_config = json.load(config_file)

    def __save_model(self):
        logger.info("Save model '%s'" % self.pattern_name)
        model_filename = os.path.join(models_folder, self.pattern_name + ".m")
        self.model.save(model_filename)

    def __load_model(self, preset):
        logger.info("Load model '%s'" % self.pattern_name)
        model_filename = os.path.join(models_folder, self.pattern_name + ".m")
        if os.path.exists(model_filename):
            self.model = self.__create_model(preset)
            self.model.load(model_filename)