from models import Model, AnalyticUnitCache

import utils
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm
from typing import Optional


WINDOW_SIZE = 400

class JumpModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ijumps = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': WINDOW_SIZE,
            'JUMP_HEIGHT': 1,
            'JUMP_LENGTH': 1,
        }

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        if type(cache) is AnalyticUnitCache:
            self.state = cache
        self.segments = segments

        data = dataframe['value']
        confidences = []
        convolve_list = []
        jump_height_list = []
        jump_length_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from']))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to']))

                segment_data = data[segment_from_index: segment_to_index + 1]
                if len(segment_data) == 0:
                    continue
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=5).mean()
                flat_segment_dropna = flat_segment.dropna()
                pdf = gaussian_kde(flat_segment_dropna)
                x = np.linspace(flat_segment_dropna.min() - 1, flat_segment_dropna.max() + 1, len(flat_segment_dropna))
                y = pdf(x)
                ax_list = []
                for i in range(len(x)):
                    ax_list.append([x[i], y[i]])
                ax_list = np.array(ax_list, np.float32)
                antipeaks_kde = argrelextrema(np.array(ax_list), np.less)[0]
                peaks_kde = argrelextrema(np.array(ax_list), np.greater)[0]
                min_peak_index = peaks_kde[0]
                max_peak_index = peaks_kde[1]
                segment_median = ax_list[antipeaks_kde[0], 0]
                segment_min_line = ax_list[min_peak_index, 0]
                segment_max_line = ax_list[max_peak_index, 0]
                jump_height = 0.9 * (segment_max_line - segment_min_line)
                jump_height_list.append(jump_height)
                jump_length = utils.find_jump_length(segment_data, segment_min_line, segment_max_line)
                jump_length_list.append(jump_length)
                cen_ind = utils.intersection_segment(flat_segment, segment_median) #finds all interseprions with median
                #cen_ind =  utils.find_ind_median(segment_median, flat_segment)
                jump_center = cen_ind[0]
                segment_cent_index = jump_center - 5 + segment_from_index
                self.ijumps.append(segment_cent_index)
                labeled_drop = data[segment_cent_index - WINDOW_SIZE : segment_cent_index + WINDOW_SIZE]
                labeled_min = min(labeled_drop)
                for value in labeled_drop:
                    value = value - labeled_min
                convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
                convolve_list.append(max(convolve))

        if len(confidences) > 0:
            self.state['confidence'] = float(min(confidences))
        else:
            self.state['confidence'] = 1.5

        if len(convolve_list) > 0:
            self.state['convolve_max'] = float(max(convolve_list))
        else:
            self.state['convolve_max'] = WINDOW_SIZE

        if len(jump_height_list) > 0:
            self.state['JUMP_HEIGHT'] = int(min(jump_height_list))
        else:
            self.state['JUMP_HEIGHT'] = 1

        if len(jump_length_list) > 0:
            self.state['JUMP_LENGTH'] = int(max(jump_length_list))
        else:
            self.state['JUMP_LENGTH'] = 1  

        return self.state

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        possible_jumps = utils.find_jump(data, self.state['JUMP_HEIGHT'], self.state['JUMP_LENGTH'] + 1)
        filtered = self.__filter_prediction(possible_jumps, data)

        return [(dataframe['timestamp'][x - 1].value, dataframe['timestamp'][x + 1].value) for x in filtered]

    def __filter_prediction(self, segments, data):
        delete_list = []
        variance_error = int(0.004 * len(data))
        if variance_error > 50:
            variance_error = 50
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)
        delete_list = []
        if len(segments) == 0 or len(self.ijumps) == 0 :
            segments = []
            return segments

        pattern_data = data[self.ijumps[0] - WINDOW_SIZE : self.ijumps[0] + WINDOW_SIZE]
        for segment in segments:
            if segment > WINDOW_SIZE and segment < (len(data) - WINDOW_SIZE):
                convol_data = data[segment - WINDOW_SIZE : segment + WINDOW_SIZE]

                conv = scipy.signal.fftconvolve(pattern_data, convol_data)
                if max(conv) > self.state['convolve_max'] * 1.2 or max(conv) < self.state['convolve_max'] * 0.8:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        for ijump in self.ijumps:
            segments.append(ijump)

        return segments
