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
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        segment_center_index = utils.find_pattern_center(segment, start, 'drop')
        return segment_center_index

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        confidences = []
        convolve_list = []
        correlation_list = []
        drop_height_list = []
        drop_length_list = []
        patterns_list = []
        pattern_timestamp = []
        for segment in labeled_segments:
            confidence = utils.find_confidence(segment.data)[0]
            confidences.append(confidence)
            segment_cent_index = segment.center_index
            drop_height, drop_length = utils.find_parameters(segment.data, segment.start, 'drop')
            drop_height_list.append(drop_height)
            drop_length_list.append(drop_length)
            self.idrops.append(segment_cent_index)
            pattern_timestamp.append(segment.pattern_timestamp)
            labeled_drop = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
            labeled_drop = utils.subtract_min_without_nan(labeled_drop)
            patterns_list.append(labeled_drop)

        self.model_drop = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.idrops, self.model_drop, data, self.state['WINDOW_SIZE'])
        correlation_list = utils.get_correlation(self.idrops, self.model_drop, data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            segment_cent_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted_drop = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
            deleted_drop = utils.subtract_min_without_nan(deleted_drop)
            del_conv_drop = scipy.signal.fftconvolve(deleted_drop, self.model_drop)
            if len(del_conv_drop): del_conv_list.append(max(del_conv_drop))

        self._update_fiting_result(self.state, confidences, convolve_list, del_conv_list)
        self.state['DROP_HEIGHT'] = int(min(drop_height_list, default = 1))
        self.state['DROP_LENGTH'] = int(max(drop_length_list, default = 1))

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        possible_drops = utils.find_drop(data, self.state['DROP_HEIGHT'], self.state['DROP_LENGTH'] + 1)

        return self.__filter_detection(possible_drops, data)

    def __filter_detection(self, segments: list, data: list):
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pattern(close_patterns, data, 'min')
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
