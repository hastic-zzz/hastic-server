from models import Model

import utils
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats.stats import pearsonr
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm

PEARSON_COEFF = 0.7

class GeneralModel(Model):

    def __init__(self):
        super()
        self.state = {
            'pattern_center': [],
            'pattern_model': [],
            'convolve_max': 240,
            'convolve_min': 200,
            'WINDOW_SIZE': 0,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        self.all_conv = []
        self.all_corr = []
    
    def get_model_type(self) -> (str, bool):
        model = 'general'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        center_ind = start + math.ceil((end - start) / 2)
        return center_ind

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list, learning_info: dict) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        last_pattern_center = self.state.get('pattern_center', [])
        self.state['pattern_center'] = list(set(last_pattern_center + learning_info['segment_center_list']))
        self.state['pattern_model'] = utils.get_av_model(learning_info['patterns_list'])
        convolve_list = utils.get_convolve(self.state['pattern_center'], self.state['pattern_model'], data, self.state['WINDOW_SIZE'])
        correlation_list = utils.get_correlation(self.state['pattern_center'], self.state['pattern_model'], data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            del_mid_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted_pat = utils.get_interval(data, del_mid_index, self.state['WINDOW_SIZE'])
            deleted_pat = utils.subtract_min_without_nan(deleted_pat)
            del_conv_pat = scipy.signal.fftconvolve(deleted_pat, self.state['pattern_model'])
            if len(del_conv_pat): del_conv_list.append(max(del_conv_pat))

        self.state['convolve_min'], self.state['convolve_max'] = utils.get_min_max(convolve_list, self.state['WINDOW_SIZE'] / 3)
        self.state['conv_del_min'], self.state['conv_del_max'] = utils.get_min_max(del_conv_list, self.state['WINDOW_SIZE'])

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        pat_data = self.state.get('pattern_model', [])
        if pat_data.count(0) == len(pat_data):
            raise ValueError('Labeled patterns must not be empty')

        self.all_conv = []
        self.all_corr = []
        window_size = self.state.get('WINDOW_SIZE', 0)
        for i in range(window_size, len(data) - window_size):
            watch_data = data[i - window_size: i + window_size + 1]
            watch_data = utils.subtract_min_without_nan(watch_data)
            conv = scipy.signal.fftconvolve(watch_data, pat_data)
            correlation = pearsonr(watch_data, pat_data)
            self.all_corr.append(correlation[0])
            self.all_conv.append(max(conv))
        all_conv_peaks = utils.peak_finder(self.all_conv, window_size * 2)
        all_corr_peaks = utils.peak_finder(self.all_corr, window_size * 2)
        filtered = self.__filter_detection(all_corr_peaks, data)
        return set(item + window_size for item in filtered)

    def __filter_detection(self, segments: list, data: list):
        if len(segments) == 0 or len(self.state.get('pattern_center', [])) == 0:
            return []
        delete_list = []
        for val in segments:
            if self.all_conv[val] < self.state['convolve_min'] * 0.8:
                delete_list.append(val)
                continue
            if self.all_corr[val] < PEARSON_COEFF:
                delete_list.append(val)
                continue
            if (self.all_conv[val] < self.state['conv_del_max'] * 1.02 and self.all_conv[val] > self.state['conv_del_min'] * 0.98):
	            delete_list.append(val)

        for item in delete_list:
            segments.remove(item)

        return set(segments)
