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
        self.model_trough = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000,
            'convolve_min': 530000,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
        patterns_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                confidence = utils.find_confidence(segment_data)
                confidences.append(confidence)
                segment_min_index = segment_data.idxmin()
                self.itroughs.append(segment_min_index)
                labeled_trough = utils.get_interval(data, segment_min_index, self.state['WINDOW_SIZE'])
                labeled_trough = utils.subtract_min_without_nan(labeled_trough)
                patterns_list.append(labeled_trough)
        self.model_trough = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.itroughs, self.model_trough, data, self.state['WINDOW_SIZE'])
        
        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                del_min_index = segment_data.idxmin()
                deleted_trough = utils.get_interval(data, del_min_index, self.state['WINDOW_SIZE'])
                deleted_trough = utils.subtract_min_without_nan(deleted_trough)
                del_conv_trough = scipy.signal.fftconvolve(deleted_trough, self.model_trough)
                del_conv_list.append(max(del_conv_trough))

        if len(confidences) > 0:
            self.state['confidence'] = float(min(confidences))
        else:
            self.state['confidence'] = 1.5

        if len(convolve_list) > 0:
            self.state['convolve_max'] = float(max(convolve_list))
        else:
            self.state['convolve_max'] = self.state['WINDOW_SIZE']
        
        if len(convolve_list) > 0:
            self.state['convolve_min'] = float(min(convolve_list))
        else:
            self.state['convolve_min'] = self.state['WINDOW_SIZE']
        
        if len(del_conv_list) > 0:
            self.state['conv_del_min'] = float(min(del_conv_list))
        else:
            self.state['conv_del_min'] = self.state['WINDOW_SIZE']
            
        if len(del_conv_list) > 0:
            self.state['conv_del_max'] = float(max(del_conv_list))
        else:
            self.state['conv_del_max'] = self.state['WINDOW_SIZE']

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        window_size = int(len(data)/SMOOTHING_COEFF) #test ws on flat data
        all_mins = argrelextrema(np.array(data), np.less)[0]
        
        extrema_list = []
        for i in utils.exponential_smoothing(data - self.state['confidence'], EXP_SMOOTHING_FACTOR):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if data[i] < extrema_list[i]:
                segments.append(i)

        return self.__filter_prediction(segments, data)

    def __filter_prediction(self, segments: list, data: list) -> list:
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pat(close_patterns, data, 'min')
        if len(segments) == 0 or len(self.itroughs) == 0 :
            segments = []
            return segments  
        pattern_data = self.model_trough
        upper_bound = self.state['convolve_max'] * 1.1
        lower_bound = self.state['convolve_min'] * 0.9
        delete_up_bound = self.state['conv_del_max'] * 1.02
        delete_low_bound = self.state['conv_del_min'] * 0.98
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
                if max(conv) > upper_bound or max(conv) < lower_bound:
                    delete_list.append(segment)
                elif max(conv) < delete_up_bound and max(conv) > delete_low_bound:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return set(segments)
