from models import Model

import utils
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
import math
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde


class JumpModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ijumps = []
        self.model_jump = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 230,
            'convolve_min': 230,
            'JUMP_HEIGHT': 1,
            'JUMP_LENGTH': 1,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
        jump_height_list = []
        jump_length_list = []
        patterns_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue    
                confidence = utils.find_confidence(segment_data)
                segment_cent_index, jump_height, jump_length = utils.find_parameters(segment_data)
                jump_height_list.append(jump_height)
                jump_length_list.append(jump_length)
                self.ijumps.append(segment_cent_index)
                labeled_jump = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
                labeled_jump = utils.subtract_min_without_nan(labeled_jump)
                patterns_list.append(labeled_jump)
                
        self.model_jump = utils.get_av_model(patterns_list)
        convolve_list = utils.get_convolve(self.ijumps, self.model_jump, data, self.state['WINDOW_SIZE'])
            
        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index, segment_to_index, segment_data = utils.parse_segment(segment, dataframe)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue
                segment_cent_index = utils.find_parameters(segment_data)[0]
                deleted_jump = utils.get_interval(data, segment_cent_index, self.state['WINDOW_SIZE'])
                deleted_jump = utils.subtract_min_without_nan(deleted_jump)
                del_conv_jump = scipy.signal.fftconvolve(deleted_jump, self.model_jump)
                del_conv_list.append(max(del_conv_jump)) 

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

        if len(jump_height_list) > 0:
            self.state['JUMP_HEIGHT'] = float(min(jump_height_list))
        else:
            self.state['JUMP_HEIGHT'] = 1

        if len(jump_length_list) > 0:
            self.state['JUMP_LENGTH'] = int(max(jump_length_list))
        else:
            self.state['JUMP_LENGTH'] = 1
            
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
        possible_jumps = utils.find_jump(data, self.state['JUMP_HEIGHT'], self.state['JUMP_LENGTH'] + 1)

        return self.__filter_prediction(possible_jumps, data)

    def __filter_prediction(self, segments, data):
        delete_list = []
        variance_error = self.state['WINDOW_SIZE']
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pat(close_patterns, data, 'max')
            
        if len(segments) == 0 or len(self.ijumps) == 0 :
            segments = []
            return segments
        pattern_data = self.model_jump
        upper_bound = self.state['convolve_max'] * 1.2
        lower_bound = self.state['convolve_min'] * 0.8
        delete_up_bound = self.state['conv_del_max'] * 1.02
        delete_low_bound = self.state['conv_del_min'] * 0.98
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
