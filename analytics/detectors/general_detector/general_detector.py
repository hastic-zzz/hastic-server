from detectors.general_detector.supervised_algorithm import SupervisedAlgorithm
import utils
from grafana_data_provider import GrafanaDataProvider
from data_preprocessor import data_preprocessor
import pandas as pd
import logging
from urllib.parse import urlparse
import config
import os.path
import json


NANOSECONDS_IN_MS = 1000000

logger = logging.getLogger('analytic_toolset')


class GeneralDetector:

    def __init__(self, anomaly_name, data):
        self.anomaly_name = anomaly_name
        self.model = None
        self.__load_model()

    async def learn(self, segments):
        logger.info("Start to learn for anomaly_name='%s'" % self.anomaly_name)

        confidence = 0.02
        dataframe = self.data_prov.get_dataframe()
        start_index, stop_index = 0, len(dataframe)
        if len(segments) > 0:
            confidence = 0.0
            min_time, max_time = utils.segments_box(segments)
            dataframe = dataframe[dataframe['timestamp'] <= max_time]
            dataframe = dataframe[dataframe['timestamp'] >= min_time]

        train_augmented = self.preprocessor.get_augmented_data(
            dataframe.index[0],
            dataframe.index[-1],
            segments
        )

        self.model = self.create_algorithm()
        await self.model.fit(train_augmented, confidence)
        if len(segments) > 0:
            last_dataframe_time = dataframe.iloc[-1]['timestamp']
            last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        else:
            last_prediction_time = 0

        self.__save_model()
        logger.info("Learning is finished for anomaly_name='%s'" % self.anomaly_name)
        return last_prediction_time

    async def predict(self, last_prediction_time):
        logger.info("Start to predict for anomaly type='%s'" % self.anomaly_name)
        last_prediction_time = pd.to_datetime(last_prediction_time, unit='ms')

        start_index = self.data_prov.get_upper_bound(last_prediction_time)
        stop_index = self.data_prov.size()
        last_prediction_time = int(last_prediction_time.value / NANOSECONDS_IN_MS)

        predicted_anomalies = []
        if start_index < stop_index:
            max_chunk_size = 50000
            predicted = pd.Series()
            for index in range(start_index, stop_index, max_chunk_size):
                chunk_start = index
                chunk_finish = min(index + max_chunk_size, stop_index)
                predict_augmented = self.preprocessor.get_augmented_data(chunk_start, chunk_finish)

                assert(len(predict_augmented) == chunk_finish - chunk_start)

                predicted_current = await self.model.predict(predict_augmented)
                predicted = pd.concat([predicted, predicted_current])
            predicted_anomalies = self.preprocessor.inverse_transform_anomalies(predicted)

            last_row = self.data_prov.get_data_range(stop_index - 1, stop_index)

            last_dataframe_time = last_row.iloc[0]['timestamp']
            predicted_anomalies = utils.anomalies_to_timestamp(predicted_anomalies)
            last_prediction_time = int(last_dataframe_time.timestamp() * 1000)

        logger.info("Predicting is finished for anomaly type='%s'" % self.anomaly_name)
        return predicted_anomalies, last_prediction_time

    def synchronize_data(self):
        self.data_prov.synchronize()
        self.preprocessor.set_data_provider(self.data_prov)
        self.preprocessor.synchronize()

    def create_algorithm(self):
        return SupervisedAlgorithm()

    def __save_model(self):
        # TODO: use data_service to save anything

    def __load_model(self):
        # TODO: use data_service to save anything
