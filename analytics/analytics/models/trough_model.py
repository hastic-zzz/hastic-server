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
        self.itroughs = []
        self.model = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000,
            'convolve_min': 530000,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        return segment.idxmin()

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        confidences = []
        convolve_list = []
        correlation_list = []
        patterns_list = []
        pattern_width = []
        pattern_height = []
        pattern_timestamp = []
        for segment in labeled_segments:
            confidence = utils.find_confidence(segment.data)[0]
            confidences.append(confidence)
            segment_min_index = segment.center_index
            self.itroughs.append(segment_min_index)
            pattern_timestamp.append(segment.pattern_timestamp)
            labeled = utils.get_interval(data, segment_min_index, self.state['WINDOW_SIZE'])
            labeled = utils.subtract_min_without_nan(labeled)
            patterns_list.append(labeled)
            pattern_height.append(utils.find_confidence(labeled)[1])
            pattern_width.append(utils.find_width(labeled, False))

        self.model = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.itroughs, self.model, data, self.state['WINDOW_SIZE'])
        correlation_list = utils.get_correlation(self.itroughs, self.model, data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        delete_pattern_width = []
        delete_pattern_height = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            del_min_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted = utils.get_interval(data, del_min_index, self.state['WINDOW_SIZE'])
            deleted = utils.subtract_min_without_nan(deleted)
            del_conv = scipy.signal.fftconvolve(deleted, self.model)
            if len(del_conv): del_conv_list.append(max(del_conv))
            delete_pattern_height.append(utils.find_confidence(deleted)[1])
            delete_pattern_width.append(utils.find_width(deleted, False))

        self._update_fiting_result(self.state, confidences, convolve_list, del_conv_list)

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
        if len(segments) == 0 or len(self.itroughs) == 0 :
            segments = []
            return segments
        pattern_data = self.model
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
