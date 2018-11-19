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
        self.ipeaks = []
        self.model_peak = []
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
        confidences, self.ipeaks, patterns_list = utils.process_segments_parameters(segments, dataframe, 'labeled')
        self.model_peak = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.ipeaks, self.model_peak, data, self.state['WINDOW_SIZE'])
        
        ipeak_dels = utils.process_segments_parameters(segments, dataframe, 'deleted')[0]
        del_conv_list = utils.get_convolve(ipeak_dels, self.model_peak, data, self.state['WINDOW_SIZE'])

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
        all_maxs = argrelextrema(np.array(data), np.greater)[0]

        extrema_list = []
        for i in utils.exponential_smoothing(data + self.state['confidence'], EXP_SMOOTHING_FACTOR):
            extrema_list.append(i)

        segments = []
        for i in all_maxs:
            if data[i] > extrema_list[i]:
                segments.append(i)

        return self.__filter_prediction(segments, data)

    def __filter_prediction(self, segments: list, data: list) -> list:
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pat(close_patterns, data, 'max')
        
        if len(segments) == 0 or len(self.ipeaks) == 0:
            return []
        pattern_data = self.model_peak
        for segment in segments:
            if segment > self.state['WINDOW_SIZE']:
                convol_data = data[segment - self.state['WINDOW_SIZE']: segment + self.state['WINDOW_SIZE'] + 1]
                convol_data = convol_data - min(convol_data)
                percent_of_nans = convol_data.isnull().sum() / len(convol_data)
                if percent_of_nans > 0.5:
                    delete_list.append(segment)
                    continue
                elif 0 < percent_of_nans <= 0.5:
                    nan_list = utils.find_nan_indexes(convol_data)
                    convol_data = utils.nan_to_zero(convol_data, nan_list)
                    pattern_data = utils.nan_to_zero(pattern_data, nan_list)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                if max(conv) > self.state['convolve_max'] * 1.05 or max(conv) < self.state['convolve_min'] * 0.95:
                    delete_list.append(segment)
                elif max(conv) < self.state['conv_del_max'] * 1.02 and max(conv) > self.state['conv_del_min'] * 0.98:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)
        return set(segments)
