from data_provider import DataProvider
from data_preprocessor import data_preprocessor
import pandas as pd
import logging
from urllib.parse import urlparse
import config
import os.path
import json

NANOSECONDS_IN_MS = 1000000

logger = logging.getLogger('analytic_toolset')


def anomalies_to_timestamp(anomalies):
    for anomaly in anomalies:
        anomaly['start'] = int(anomaly['start'].timestamp() * 1000)
        anomaly['finish'] = int(anomaly['finish'].timestamp() * 1000)
    return anomalies


class GeneralDetector:

    def __init__(self, anomaly_name):
        self.anomaly_name = anomaly_name
        self.load_anomaly_config()

        parsedUrl = urlparse(self.anomaly_config['panelUrl'])
        origin = parsedUrl.scheme + '://' + parsedUrl.netloc

        datasource = self.anomaly_config['datasource']
        datasource['origin'] = origin
        metric_name = self.anomaly_config['metric']['targets'][0]

        target_filename = os.path.join(config.METRICS_FOLDER, metric_name + ".json")

        dataset_filename = os.path.join(config.DATASET_FOLDER, metric_name + ".csv")
        augmented_path = os.path.join(config.DATASET_FOLDER, metric_name + "_augmented.csv")

        with open(target_filename, 'r') as file:
            target = json.load(file)

        self.data_prov = DataProvider(datasource, target, dataset_filename)
        self.preprocessor = data_preprocessor(self.data_prov, augmented_path)
        self.model = None

        self.__load_model()

    def anomalies_box(self, anomalies):
        max_time = 0
        min_time = float("inf")
        for anomaly in anomalies:
            max_time = max(max_time, anomaly['finish'])
            min_time = min(min_time, anomaly['start'])
        min_time = pd.to_datetime(min_time, unit='ms')
        max_time = pd.to_datetime(max_time, unit='ms')
        return min_time, max_time

    def learn(self, anomalies):
        logger.info("Start to learn for anomaly_name='%s'" % self.anomaly_name)

        confidence = 0.02
        dataframe = self.data_prov.get_dataframe()
        start_index, stop_index = 0, len(dataframe)
        if len(anomalies) > 0:
            confidence = 0.0
            min_time, max_time = self.anomalies_box(anomalies)
            dataframe = dataframe[dataframe['timestamp'] <= max_time]
            dataframe = dataframe[dataframe['timestamp'] >= min_time]

        train_augmented = self.preprocessor.get_augmented_data(
            dataframe.index[0],
            dataframe.index[-1],
            anomalies
        )

        self.model = self.create_algorithm()
        self.model.fit(train_augmented, confidence)
        if len(anomalies) > 0:
            last_dataframe_time = dataframe.iloc[-1]['timestamp']
            last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        else:
            last_prediction_time = 0

        self.__save_model()
        logger.info("Learning is finished for anomaly_name='%s'" % self.anomaly_name)
        return last_prediction_time

    def predict(self, last_prediction_time):
        logger.info("Start to predict for anomaly type='%s'" % self.anomaly_name)
        last_prediction_time = pd.to_datetime(last_prediction_time, unit='ms')

        start_index = self.data_prov.get_upper_bound(last_prediction_time)
        stop_index = self.data_prov.size()
        last_prediction_time = last_prediction_time.value / NANOSECONDS_IN_MS

        predicted_anomalies = []
        if start_index < stop_index:
            max_chunk_size = 50000
            predicted = pd.Series()
            for index in range(start_index, stop_index, max_chunk_size):
                chunk_start = index
                chunk_finish = min(index + max_chunk_size, stop_index)
                predict_augmented = self.preprocessor.get_augmented_data(chunk_start, chunk_finish)

                assert(len(predict_augmented) == chunk_finish - chunk_start)

                predicted_current = self.model.predict(predict_augmented)
                predicted = pd.concat([predicted, predicted_current])
            predicted_anomalies = self.preprocessor.inverse_transform_anomalies(predicted)

            last_row = self.data_prov.get_data_range(stop_index - 1, stop_index)

            last_dataframe_time = last_row.iloc[0]['timestamp']
            predicted_anomalies = anomalies_to_timestamp(predicted_anomalies)
            last_prediction_time = int(last_dataframe_time.timestamp() * 1000)

        logger.info("Predicting is finished for anomaly type='%s'" % self.anomaly_name)
        return predicted_anomalies, last_prediction_time

    def synchronize_data(self):
        self.data_prov.synchronize()
        self.preprocessor.set_data_provider(self.data_prov)
        self.preprocessor.synchronize()

    def load_anomaly_config(self):
        with open(os.path.join(config.ANALYTIC_UNITS_FOLDER, self.anomaly_name + ".json"), 'r') as config_file:
            self.anomaly_config = json.load(config_file)

    def get_anomalies(self):
        labeled_anomalies_file = os.path.join(config.ANALYTIC_UNITS_FOLDER, self.anomaly_name + "_labeled.json")
        if not os.path.exists(labeled_anomalies_file):
            return []
        with open(labeled_anomalies_file) as file:
            return json.load(file)

    def create_algorithm(self):
        from supervised_algorithm import supervised_algorithm
        return supervised_algorithm()

    def __save_model(self):
        logger.info("Save model '%s'" % self.anomaly_name)
        model_filename = os.path.join(config.MODELS_FOLDER, self.anomaly_name + ".m")
        self.model.save(model_filename)

    def __load_model(self):
        logger.info("Load model '%s'" % self.anomaly_name)
        model_filename = os.path.join(config.MODELS_FOLDER, self.anomaly_name + ".m")
        if os.path.exists(model_filename):
            self.model = self.create_algorithm()
            self.model.load(model_filename)
