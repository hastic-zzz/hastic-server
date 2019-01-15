from models import Model

import utils
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm


class GeneralModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ipats = []
        self.model_gen = []
        self.state = {
            'convolve_max': 240,
            'convolve_min': 200,
            'WINDOW_SIZE': 240,
            'conv_del_min': 100,
            'conv_del_max': 120,
        }
        self.all_conv = []

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        convolve_list = []
        patterns_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                center_ind = segment_from_index + math.ceil((segment_to_index - segment_from_index) / 2)
                self.ipats.append(center_ind)
                segment_data = utils.get_interval(data, center_ind, self.state['WINDOW_SIZE'])
                segment_data = utils.subtract_min_without_nan(segment_data)
                patterns_list.append(segment_data)

        self.model_gen = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.ipats, self.model_gen, data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                if len(segment_data) == 0:
                    continue
                del_mid_index = segment_from_index + math.ceil((segment_to_index - segment_from_index) / 2)
                deleted_pat = utils.get_interval(data, del_mid_index, self.state['WINDOW_SIZE'])
                deleted_pat = utils.subtract_min_without_nan(segment_data)
                del_conv_pat = scipy.signal.fftconvolve(deleted_pat, self.model_gen)
                del_conv_list.append(max(del_conv_pat))

        if len(convolve_list) > 0:
            self.state['convolve_max'] = float(max(convolve_list))
        else:
            self.state['convolve_max'] = self.state['WINDOW_SIZE'] / 3

        if len(convolve_list) > 0:
            self.state['convolve_min'] = float(min(convolve_list))
        else:
            self.state['convolve_min'] = self.state['WINDOW_SIZE'] / 3

        if len(del_conv_list) > 0:
            self.state['conv_del_min'] = float(min(del_conv_list))
        else:
            self.state['conv_del_min'] = self.state['WINDOW_SIZE']

        if len(del_conv_list) > 0:
            self.state['conv_del_max'] = float(max(del_conv_list))
        else:
            self.state['conv_del_max'] = self.state['WINDOW_SIZE']

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        pat_data = self.model_gen
        y = max(pat_data)

        for i in range(self.state['WINDOW_SIZE'] * 2, len(data)):
            watch_data = data[i - self.state['WINDOW_SIZE'] * 2: i]
            watch_data = utils.subtract_min_without_nan(watch_data)
            conv = scipy.signal.fftconvolve(watch_data, pat_data)
            self.all_conv.append(max(conv))
        all_conv_peaks = utils.peak_finder(self.all_conv, self.state['WINDOW_SIZE'] * 2)

        filtered = self.__filter_detection(all_conv_peaks, data)
        return set(item + self.state['WINDOW_SIZE'] for item in filtered)

    def __filter_detection(self, segments: list, data: list):
        if len(segments) == 0 or len(self.ipats) == 0:
            return []
        delete_list = []
        for val in segments:
            if self.all_conv[val] < self.state['convolve_min'] * 0.8:
                delete_list.append(val)
            elif (self.all_conv[val] < self.state['conv_del_max'] * 1.02 and self.all_conv[val] > self.state['conv_del_min'] * 0.98):
	            delete_list.append(val)

        for item in delete_list:
            segments.remove(item)

        return set(segments)
