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
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = data[segment_from_index: segment_to_index + 1]
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.2 * (segment_max - segment_min))
                segment_min_index = segment_data.idxmin() 
                self.itroughs.append(segment_min_index)
                labeled_trough = data[segment_min_index - self.state['WINDOW_SIZE'] : segment_min_index + self.state['WINDOW_SIZE'] + 1]
                labeled_trough = labeled_trough - min(labeled_trough)
                patterns_list.append(labeled_trough)
                
        self.model_trough = utils.get_av_model(patterns_list)
        convolve_list = get_convolve(self.itroughs, self.model_trough, data, self.state['WINDOW_SIZE'])
            
        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = data[segment_from_index: segment_to_index + 1]
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                del_min_index = segment_data.idxmin()
                deleted_trough = data[del_min_index - self.state['WINDOW_SIZE']: del_min_index + self.state['WINDOW_SIZE'] + 1]
                deleted_trough = deleted_trough - min(deleted_trough)
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
        for segment in segments:
            if segment > self.state['WINDOW_SIZE']:
                convol_data = data[segment - self.state['WINDOW_SIZE'] : segment + self.state['WINDOW_SIZE'] + 1]
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
                if max(conv) > self.state['convolve_max'] * 1.1 or max(conv) < self.state['convolve_min'] * 0.9:
                    delete_list.append(segment)
                elif max(conv) < self.state['conv_del_max'] * 1.02 and max(conv) > self.state['conv_del_min'] * 0.98:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return set(segments)
