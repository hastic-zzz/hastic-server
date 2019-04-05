from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pandas as pd

SMOOTHING_COEFF = 2400
EXP_SMOOTHING_FACTOR = 0.01

class PeakModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.state = {
            'pattern_center': [],
            'pattern_model': [],
            'confidence': 1.5,
            'convolve_max': 0,
            'convolve_min': 0,
            'WINDOW_SIZE': 0,
            'conv_del_min': 0,
            'conv_del_max': 0,
            'height_max': 0,
            'height_min': 0,
        }
    
    def get_model_type(self) -> (str, bool):
        model = 'peak'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmax()

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list, learning_info: dict, id: str) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        window_size = self.state['WINDOW_SIZE']
        last_pattern_center = self.state.get('pattern_center', [])
        self.state['pattern_center'] = list(set(last_pattern_center + learning_info['segment_center_list']))
        self.state['pattern_model'] = utils.get_av_model(learning_info['patterns_list'])
        convolve_list = utils.get_convolve(self.state['pattern_center'], self.state['pattern_model'], data, window_size)
        correlation_list = utils.get_correlation(self.state['pattern_center'], self.state['pattern_model'], data, window_size)
        height_list = learning_info['patterns_value']

        del_conv_list = []
        delete_pattern_width = []
        delete_pattern_height = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            del_max_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted = utils.get_interval(data, del_max_index, window_size)
            deleted = utils.subtract_min_without_nan(deleted)
            del_conv = scipy.signal.fftconvolve(deleted, self.state['pattern_model'])
            if len(del_conv): del_conv_list.append(max(del_conv))
            delete_pattern_height.append(utils.find_confidence(deleted)[1])
            delete_pattern_width.append(utils.find_width(deleted, True))

        self._update_fiting_result(self.state, learning_info['confidence'], convolve_list, del_conv_list, height_list)

    def do_detect(self, dataframe: pd.DataFrame, id: str):
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        window_size = int(len(data)/SMOOTHING_COEFF) #test ws on flat data
        all_maxs = argrelextrema(np.array(data), np.greater)[0]

        extrema_list = []
        for i in utils.exponential_smoothing(data + self.state['confidence'], EXP_SMOOTHING_FACTOR):
            extrema_list.append(i)

        segments = []
        for i in all_maxs:
            if data[i] > extrema_list[i]:
                segments.append(i)
        result = self.__filter_detection(segments, data)
        result = utils.get_borders_of_peaks(result, data, self.state.get('WINDOW_SIZE'), self.state.get('confidence'))
        return result

    def __filter_detection(self, segments: list, data: list) -> list:
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pattern(close_patterns, data, 'max')

        if len(segments) == 0 or len(self.state.get('pattern_model', [])) == 0:
            return []
        pattern_data = self.state['pattern_model']
        up_height = self.state['height_max'] * (1 + self.HEIGHT_ERROR)
        low_height = self.state['height_min'] * (1 - self.HEIGHT_ERROR)
        up_conv = self.state['convolve_max'] * (1 + 1.5 * self.CONV_ERROR)
        low_conv = self.state['convolve_min'] * (1 - self.CONV_ERROR)
        up_del_conv = self.state['conv_del_max'] * (1 + self.DEL_CONV_ERROR)
        low_del_conv = self.state['conv_del_min'] * (1 - self.DEL_CONV_ERROR)
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
                pattern_height = convol_data.values[self.state['WINDOW_SIZE']]
                if pattern_height > up_height or pattern_height < low_height:
                    delete_list.append(segment)
                    continue
                if max(conv) > up_conv or max(conv) < low_conv:
                    delete_list.append(segment)
                    continue
                if max(conv) < up_del_conv and max(conv) > low_del_conv:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)
        return set(segments)
