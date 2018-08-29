from models import Model

import utils
import numpy as np
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm


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
    
    def fit(self, dataframe, segments):
        self.segments = segments
        data = dataframe['value']
        confidences = []
        convolve_list = []
        jump_height_list = []
        jump_length_list = []

        for segment in segments:
            if segment['labeled']:
                segment_data = data.loc[segment['from'] : segment['to'] + 1].reset_index(drop=True)
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=5).mean() 
                pdf = gaussian_kde(flat_segment.dropna())
                x = np.linspace(flat_segment.dropna().min() - 1, flat_segment.dropna().max() + 1, len(flat_segment.dropna()))
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
                jump_lenght = utils.find_jump_length(segment_data, segment_min_line, segment_max_line)
                jump_length_list.append(jump_lenght)
                cen_ind = utils.intersection_segment(flat_segment, segment_median) #finds all interseprions with median
                #cen_ind =  utils.find_ind_median(segment_median, flat_segment)
                jump_center = cen_ind[0]

                segment_cent_index = jump_center - 5 + segment['from']

                self.ijumps.append(segment_cent_index)
                labeled_drop = data[segment_cent_index - WINDOW_SIZE : segment_cent_index + WINDOW_SIZE]
                labeled_min = min(labeled_drop)
                for value in labeled_drop:
                    value = value - labeled_min
                convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
                convolve_list.append(max(convolve))  

        if len(confidences) > 0:
            self.state['confidence'] = min(confidences)
        else:
            self.state['confidence'] = 1.5

        if len(convolve_list) > 0:
            self.state['convolve_max'] = max(convolve_list)
        else:
            self.state['convolve_max'] = WINDOW_SIZE
            
        if len(jump_height_list) > 0:
            self.state['JUMP_HEIGHT'] = min(jump_height_list)
        else:
            self.state['JUMP_HEIGHT'] = 1
            
        if len(jump_length_list) > 0:
            self.state['JUMP_LENGTH'] = max(jump_length_list)
        else:
            self.state['JUMP_LENGTH'] = 1   
    
    def predict(self, dataframe):
        data = dataframe['value']

        result = self.__predict(data)
        result.sort()
        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    def __predict(self, data):
        #window_size = 24
        #all_max_flatten_data = data.rolling(window=window_size).mean()
        #all_mins = argrelextrema(np.array(all_max_flatten_data), np.less)[0]        
        possible_jumps = utils.find_jump(data, self.state['JUMP_HEIGHT'], self.state['JUMP_LENGTH'] + 1)

        return [(x - 1, x + 1) for x in self.__filter_prediction(possible_jumps, data)]

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
