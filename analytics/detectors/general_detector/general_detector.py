from detectors.general_detector.supervised_algorithm import SupervisedAlgorithm
from detectors import Detector
import utils

import pandas as pd
import logging
import config
import json
from typing import Optional


NANOSECONDS_IN_MS = 1000000

logger = logging.getLogger('GENERAL_DETECTOR')


class GeneralDetector(Detector):

    def __init__(self):
        self.model = None

    async def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[dict]):

        confidence = 0.02
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

        self.model = SupervisedAlgorithm()
        await self.model.fit(train_augmented, confidence)
        if len(segments) > 0:
            last_dataframe_time = dataframe.iloc[-1]['timestamp']
            last_prediction_time = int(last_dataframe_time.timestamp() * 1000)
        else:
            last_prediction_time = 0

        logger.info("Learning is finished for anomaly_name='%s'" % self.anomaly_name)
        return last_prediction_time

    async def predict(self, dataframe: pd.DataFrame, cache: Optional[dict]):
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
