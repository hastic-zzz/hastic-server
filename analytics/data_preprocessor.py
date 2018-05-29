import os.path
import pandas as pd
import numpy as np
import math
import time

from tsfresh.transformers.feature_augmenter import FeatureAugmenter
from tsfresh.feature_extraction.settings import from_columns
from pytz import timezone


class data_preprocessor:
    # augmented = None
    frame_size = 16
    calc_features = [
        # "value__agg_linear_trend__f_agg_\"max\"__chunk_len_5__attr_\"intercept\"",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_12__w_20",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_13__w_5",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_2__w_10",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_2__w_20",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_8__w_20",
        # "value__fft_coefficient__coeff_3__attr_\"abs\"",
        "time_of_day_column_x",
        "time_of_day_column_y",
        "value__abs_energy",
        "value__absolute_sum_of_changes",
        "value__sum_of_reoccurring_data_points",
    ]
    time_features = [
        'time_of_day_column_x',
        'time_of_day_column_y'
    ]
    chunk_size = 50000

    def __init__(self, data_provider, augmented_path):
        self.data_provider = data_provider
        self.augmented_path = augmented_path
        self.last_chunk_index = 0
        self.total_size = 0
        self.__init_chunks()
        self.synchronize()

    def set_data_provider(self, data_provider):
        self.data_provider = data_provider

    def synchronize(self):
        start_frame = self.total_size
        stop_frame = self.data_provider.size()

        max_chunk_size = 30000
        for frame in range(start_frame, stop_frame, max_chunk_size):
            data = self.__get_source_frames(frame, min(stop_frame, frame + max_chunk_size))

            if len(data) == 0:
                return

            append_augmented = self.__extract_features(data, self.calc_features)
            self.__append_data(append_augmented)

    def expand_indexes(self, start_index, stop_index):
        return start_index, stop_index

    def get_augmented_data(self, start_index, stop_index, anomalies=[]):
        start_frame = start_index
        stop_frame = stop_index
        augmented = self.__get_data(start_frame, stop_frame)
        if len(anomalies) > 0:
            anomalies_indexes = self.transform_anomalies(anomalies)
            augmented = augmented.drop(anomalies_indexes)

        return augmented

    def transform_anomalies(self, anomalies):
        anomaly_index = None
        dataframe = self.data_provider.get_dataframe(None)
        for anomaly in anomalies:
            start_time = pd.to_datetime(anomaly['start'], unit='ms')
            finish_time = pd.to_datetime(anomaly['finish'], unit='ms')
            current_index = (dataframe['timestamp'] >= start_time) & (dataframe['timestamp'] <= finish_time)
            if anomaly_index is not None:
                anomaly_index = (anomaly_index | current_index)
            else:
                anomaly_index = current_index

        rows = dataframe[anomaly_index]
        indexes = np.unique(rows.index)
        return indexes

    def inverse_transform_anomalies(self, prediction):
        anomalies = []
        cur_anomaly = None
        source_dataframe = self.data_provider.get_dataframe(None)
        for i in prediction.index:
            if prediction[i]:
                start_frame_index = max(0, i - self.frame_size + 1)
                finish_frame_index = i
                start = source_dataframe['timestamp'][start_frame_index]
                finish = source_dataframe['timestamp'][finish_frame_index]
                if cur_anomaly is None:
                    if len(anomalies) > 0 and start <= anomalies[len(anomalies) - 1]['finish']:
                        cur_anomaly = anomalies[len(anomalies) - 1]
                        anomalies.pop()
                    else:
                        cur_anomaly = {'start': start, 'finish': finish}
                cur_anomaly['finish'] = finish
            elif cur_anomaly is not None:
                anomalies.append(cur_anomaly)
                cur_anomaly = None

        if cur_anomaly:
            anomalies.append(cur_anomaly)
        return anomalies

    def __get_data(self, start_index, stop_index):
        result = pd.DataFrame()
        start_chunk = start_index // self.chunk_size
        finish_chunk = stop_index // self.chunk_size
        for chunk_num in range(start_chunk, finish_chunk + 1):
            chunk = self.__load_chunk(chunk_num)
            if chunk_num == finish_chunk:
                chunk = chunk[:stop_index % self.chunk_size]
            if chunk_num == start_chunk:
                chunk = chunk[start_index % self.chunk_size:]
            result = pd.concat([result, chunk])
        return result

    def __init_chunks(self):
        chunk_index = 0
        self.last_chunk_index = 0
        while True:
            filename = self.augmented_path
            if chunk_index > 0:
                filename += "." + str(chunk_index)
            if os.path.exists(filename):
                self.last_chunk_index = chunk_index
            else:
                break
            chunk_index += 1
        self.total_size = self.last_chunk_index * self.chunk_size
        last_chunk = self.__load_chunk(self.last_chunk_index)
        self.total_size += len(last_chunk)

    def __append_data(self, dataframe):
        while len(dataframe) > 0:
            chunk = self.__load_chunk(self.last_chunk_index)
            rows_count = min(self.chunk_size - len(chunk), len(dataframe))

            rows = dataframe.iloc[0:rows_count]
            self.__save_chunk(self.last_chunk_index, rows)
            self.total_size += rows_count

            dataframe = dataframe[rows_count:]
            if len(dataframe) > 0:
                self.last_chunk_index += 1

    def __load_chunk(self, index):
        filename = self.augmented_path
        if index > 0:
            filename += "." + str(index)

        if os.path.exists(filename):
            chunk = pd.read_csv(filename)
            frame_index = np.arange(index * self.chunk_size, index * self.chunk_size + len(chunk))
            chunk = chunk.set_index(frame_index)
            return chunk
        return pd.DataFrame()

    def __save_chunk(self, index, dataframe):
        filename = self.augmented_path
        if index > 0:
            filename += "." + str(index)

        if os.path.exists(filename):
            dataframe.to_csv(filename, mode='a', index=False, header=False)
        else:
            dataframe.to_csv(filename, mode='w', index=False, header=True)

    def __get_source_frames(self, start_frame, stop_frame):
        start_index = start_frame
        stop_index = stop_frame

        # frame = self.source_dataframe[start_index:stop_index]
        # mat = frame.as_matrix()

        source_dataframe = self.data_provider.get_data_range(max(start_index - self.frame_size + 1, 0), stop_index)

        dataframe = None
        for i in range(start_index, stop_index):
            mini = max(0, i - self.frame_size + 1)
            frame = source_dataframe.loc[mini:i + 1].copy()
            frame['id'] = i
            if dataframe is None:
                dataframe = frame
            else:
                dataframe = dataframe.append(frame, ignore_index=True)

        #dataframe = self.source_dataframe[start_index:stop_index].copy()
        #dataframe['id'] = np.floor_divide(dataframe.index, self.frame_size)
        dataframe.reset_index(drop=True, inplace=True)
        return dataframe

    def __extract_features(self, data, features=None):
        start_frame = data['id'][0]
        stop_frame = data['id'][len(data)-1] + 1
        augmented = pd.DataFrame(index=np.arange(start_frame, stop_frame))

        # tsfresh features
        tsfresh_features = None
        if features is not None:
            tsfresh_features = set(features) - set(self.time_features)

        augmented = self.__extract_tfresh_features(data, augmented, tsfresh_features)

        # time features
        augmented = self.__extract_time_features(data, augmented, features)
        return augmented

    def __extract_tfresh_features(self, data, augmented, features):
        relevant_extraction_settings = None
        if features is not None:
            augmented_features = set(features)
            relevant_extraction_settings = from_columns(augmented_features)

            #impute_function = partial(impute_dataframe_range, col_to_max=self.col_to_max,
            #                          col_to_min=self.col_to_min, col_to_median=self.col_to_median)

        feature_extractor = FeatureAugmenter(
            kind_to_fc_parameters=relevant_extraction_settings,
            column_id='id',
            column_sort='timestamp')
        feature_extractor.set_timeseries_container(data)

        return feature_extractor.transform(augmented)

    def __extract_time_features(self, data, augmented, features):
        if features is None:
            features = self.time_features

        seconds = np.zeros(len(augmented))
        first_id = data['id'][0]

        for i in range(len(data)):
            id = data['id'][i] - first_id
            timeobj = data['timestamp'][i].time()
            seconds[id] = timeobj.second + 60 * (timeobj.minute + 60 * timeobj.hour)

        norm_seconds = 2 * math.pi * seconds / (24 * 3600)

        if 'time_of_day_column_x' in features:
            augmented['time_of_day_column_x'] = np.cos(norm_seconds)
        if 'time_of_day_column_y' in features:
            augmented['time_of_day_column_y'] = np.sin(norm_seconds)
        return augmented
