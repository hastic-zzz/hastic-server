from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pandas as pd

SMOOTHING_COEFF = 2400
EXP_SMOOTHING_FACTOR = 0.01

class TroughModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.state = {
            'itroughs': [],
            'model_trough': [],
            'confidence': 1.5,
            'convolve_max': 570000,
            'convolve_min': 530000,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }
    
    def get_model_type(self) -> (str, bool):
        model = 'trough'
        type_model = False
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmin()

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list, learning_info: dict) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        window_size = self.state['WINDOW_SIZE']
        self.state['itroughs'] = list(set(self.state.get('itroughs', []) + learning_info['segment_center_list']))
        self.state['model_trough'] = utils.get_av_model(learning_info['patterns_list'])
        convolve_list = utils.get_convolve(self.state['itroughs'], self.state['model_trough'], data, window_size)
        correlation_list = utils.get_correlation(self.state['itroughs'], self.state['model_trough'], data, window_size)

        del_conv_list = []
        delete_pattern_width = []
        delete_pattern_height = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            del_min_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted = utils.get_interval(data, del_min_index, window_size)
            deleted = utils.subtract_min_without_nan(deleted)
            del_conv = scipy.signal.fftconvolve(deleted, self.state['model_trough'])
            if len(del_conv): del_conv_list.append(max(del_conv))
            delete_pattern_height.append(utils.find_confidence(deleted)[1])
            delete_pattern_width.append(utils.find_width(deleted, False))

        self._update_fiting_result(self.state, learning_info['confidence'], convolve_list, del_conv_list)

    def do_detect(self, dataframe: pd.DataFrame):
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        window_size = int(len(data)/SMOOTHING_COEFF) #test ws on flat data
        all_mins = argrelextrema(np.array(data), np.less)[0]

        extrema_list = []
        for i in utils.exponential_smoothing(data - self.state['confidence'], EXP_SMOOTHING_FACTOR):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if data[i] < extrema_list[i]:
                segments.append(i)

        return self.__filter_detection(segments, data)

    def __filter_detection(self, segments: list, data: list) -> list:
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pattern(close_patterns, data, 'min')
        if len(segments) == 0 or len(self.state['itroughs']) == 0 :
            segments = []
            return segments
        pattern_data = self.state['model_trough']
        for segment in segments:
            if segment > self.state['WINDOW_SIZE']:
                convol_data = utils.get_interval(data, segment, self.state['WINDOW_SIZE'])
                convol_data = utils.subtract_min_without_nan(convol_data)
                percent_of_nans = convol_data.isnull().sum() / len(convol_data)
                if percent_of_nans > 0.5:
                    delete_list.append(segment)
                    continue
                elif 0 < percent_of_nans <= 0.5:
                    nan_list = utils.find_nan_indexes(convol_data)
                    convol_data = utils.nan_to_zero(convol_data, nan_list)
                    pattern_data = utils.nan_to_zero(pattern_data, nan_list)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                if max(conv) > self.state['convolve_max'] * 1.1 or max(conv) < self.state['convolve_min'] * 0.9:
                    delete_list.append(segment)
                elif max(conv) < self.state['conv_del_max'] * 1.02 and max(conv) > self.state['conv_del_min'] * 0.98:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return set(segments)
