from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde

import utils
import numpy as np
import pandas as pd


class DropModel(Model):
    def __init__(self):
        super()
        self.segments = []
        self.idrops = []
        self.model_drop = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 200,
            'convolve_min': 200,
            'DROP_HEIGHT': 1,
            'DROP_LENGTH': 1,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
        drop_height_list = []
        drop_length_list = []
        patterns_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                confidence = utils.find_confidence(segment_data)
                confidences.append(confidence)
                segment_cent_index, drop_height, drop_length = utils.find_drop_parameters(segment_data, segment_from_index)
                drop_height_list.append(drop_height)
                drop_length_list.append(drop_length)
                self.idrops.append(segment_cent_index)
                labeled_drop = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
                labeled_drop = utils.subtract_min_without_nan(labeled_drop)
                patterns_list.append(labeled_drop)

        self.model_drop = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.idrops, self.model_drop, data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                if len(segment_data) == 0:
                    continue
                segment_cent_index = utils.find_drop_parameters(segment_data, segment_from_index)[0]
                deleted_drop = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
                deleted_drop = utils.subtract_min_without_nan(deleted_drop)
                del_conv_drop = scipy.signal.fftconvolve(deleted_drop, self.model_drop)
                del_conv_list.append(max(del_conv_drop))

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

        if len(drop_height_list) > 0:
            self.state['DROP_HEIGHT'] = int(min(drop_height_list))
        else:
            self.state['DROP_HEIGHT'] = 1

        if len(drop_length_list) > 0:
            self.state['DROP_LENGTH'] = int(max(drop_length_list))
        else:
            self.state['DROP_LENGTH'] = 1

        if len(del_conv_list) > 0:
            self.state['conv_del_min'] = float(min(del_conv_list))
        else:
            self.state['conv_del_min'] = self.state['WINDOW_SIZE']

        if len(del_conv_list) > 0:
            self.state['conv_del_max'] = float(max(del_conv_list))
        else:
            self.state['conv_del_max'] = self.state['WINDOW_SIZE']

    def do_predict(self, dataframe: pd.DataFrame) -> list:
        data = dataframe['value']
        possible_drops = utils.find_drop(data, self.state['DROP_HEIGHT'], self.state['DROP_LENGTH'] + 1)

        return self.__filter_prediction(possible_drops, data)

    def __filter_prediction(self, segments: list, data: list):
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pat(close_patterns, data, 'min')
        if len(segments) == 0 or len(self.idrops) == 0 :
            segments = []
            return segments
        pattern_data = self.model_drop
        for segment in segments:
            if segment > self.state['WINDOW_SIZE'] and segment < (len(data) - self.state['WINDOW_SIZE']):
                convol_data = utils.get_interval(data, segment, self.state['WINDOW_SIZE'])
                percent_of_nans = convol_data.isnull().sum() / len(convol_data)
                if percent_of_nans > 0.5:
                    delete_list.append(segment)
                    continue
                elif 0 < percent_of_nans <= 0.5:
                    nan_list = utils.find_nan_indexes(convol_data)
                    convol_data = utils.nan_to_zero(convol_data, nan_list)
                    pattern_data = utils.nan_to_zero(pattern_data, nan_list)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                upper_bound = self.state['convolve_max'] * 1.2
                lower_bound = self.state['convolve_min'] * 0.8
                delete_up_bound = self.state['conv_del_max'] * 1.02
                delete_low_bound = self.state['conv_del_min'] * 0.98
                try:
                    if max(conv) > upper_bound or max(conv) < lower_bound:
                        delete_list.append(segment)
                    elif max(conv) < delete_up_bound and max(conv) > delete_low_bound:
                        delete_list.append(segment)
                except ValueError:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)

        for item in delete_list:
            segments.remove(item)
        return set(segments)
