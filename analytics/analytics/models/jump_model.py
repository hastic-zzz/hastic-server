from models import Model

import utils
from utils.segments import parse_segment
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
                segment_from_index, segment_to_index, segment_data = parse_segment(segment, dataframe)
                percent_of_nans = segment_data.isnull().sum() / len(segment_data)
                if percent_of_nans > 0 or len(segment_data) == 0:
                    continue    
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window = 5).mean()
                flat_segment_dropna = flat_segment.dropna()
                min_jump = min(flat_segment_dropna)
                max_jump = max(flat_segment_dropna)
                pdf = gaussian_kde(flat_segment_dropna)
                x = np.linspace(flat_segment_dropna.min() - 1, flat_segment_dropna.max() + 1, len(flat_segment_dropna))
                y = pdf(x)
                ax_list = list(zip(x, y))
                ax_list = np.array(ax_list, np.float32)
                antipeaks_kde = argrelextrema(np.array(ax_list), np.less)[0]
                peaks_kde = argrelextrema(np.array(ax_list), np.greater)[0]
                try:
                    min_peak_index = peaks_kde[0]
                    segment_min_line = ax_list[min_peak_index, 0]
                    max_peak_index = peaks_kde[1]
                    segment_max_line = ax_list[max_peak_index, 0]
                    segment_median = ax_list[antipeaks_kde[0], 0]
                except IndexError:
                    segment_max_line = max_jump
                    segment_min_line = min_jump
                    segment_median = (max_jump - min_jump) / 2 + min_jump               
                jump_height = 0.95 * (segment_max_line - segment_min_line)
                jump_height_list.append(jump_height)
                jump_length = utils.find_jump_length(segment_data, segment_min_line, segment_max_line)
                jump_length_list.append(jump_length)
                cen_ind = utils.intersection_segment(flat_segment.tolist(), segment_median) #finds all interseprions with median
                jump_center = cen_ind[0]
                segment_cent_index = jump_center - 5 + segment_from_index
                self.ijumps.append(segment_cent_index)
                labeled_jump = data[segment_cent_index - self.state['WINDOW_SIZE'] : segment_cent_index + self.state['WINDOW_SIZE'] + 1]
                labeled_jump = labeled_jump - min(labeled_jump)
                patterns_list.append(labeled_jump)
                
        self.model_jump = utils.get_av_model(patterns_list)
        convolve_list = get_convolve(self.ijumps, self.model_jump, data, self.state['WINDOW_SIZE'])
            
        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = data[segment_from_index: segment_to_index + 1]
                if len(segment_data) == 0:
                    continue
                flat_segment = segment_data.rolling(window = 5).mean()
                flat_segment_dropna = flat_segment.dropna()
                pdf = gaussian_kde(flat_segment_dropna)
                x = np.linspace(flat_segment_dropna.min() - 1, flat_segment_dropna.max() + 1, len(flat_segment_dropna))
                y = pdf(x)
                ax_list = list(zip(x, y))
                ax_list = np.array(ax_list, np.float32)
                antipeaks_kde = argrelextrema(np.array(ax_list), np.less)[0]
                segment_median = ax_list[antipeaks_kde[0], 0]
                cen_ind = utils.intersection_segment(flat_segment.tolist(), segment_median) #finds all interseprions with median
                jump_center = cen_ind[0]
                segment_cent_index = jump_center - 5 + segment_from_index
                deleted_jump = data[segment_cent_index - self.state['WINDOW_SIZE'] : segment_cent_index + self.state['WINDOW_SIZE'] + 1]
                deleted_jump = deleted_jump - min(labeled_jump)
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
                convol_data = data[segment - self.state['WINDOW_SIZE'] : segment + self.state['WINDOW_SIZE'] + 1]
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
