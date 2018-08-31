from models import Model

import utils
import numpy as np
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm


WINDOW_SIZE = 350

class GeneralModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ipats = []
        self.state = {
            'convolve_max': WINDOW_SIZE,
        }
    
    async def fit(self, dataframe, segments):
        self.segments = segments
        data = dataframe['value']
        data = data - min(data)
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_data = data[segment['start'] : segment['finish'] + 1].reset_index(drop=True)
                self.ipats.append(segment['start'] + int((segment['start'] + segment['finish']) / 2))
                segment_min = min(segment_data)
                segment_data = segment_data - segment_min
                segment_max = max(segment_data)
                segment_data = segment_data / segment_max
                for value in labeled_drop:
                    value = value - labeled_min
                convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
                convolve_list.append(max(convolve))  

        if len(convolve_list) > 0:
            self.state['convolve_max'] = max(convolve_list)
        else:
            self.state['convolve_max'] = WINDOW_SIZE / 3  
    
    async def predict(self, dataframe):
        data = dataframe['value']
        data = data - min(data)

        result = self.__predict(data)
        result.sort()
        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    def __predict(self, data):
        
        pat_data = data[self.ipats[0] - WINDOW_SIZE: self.ipats[0] + WINDOW_SIZE]
        x = min(pat_data)
        pat_data = pat_data - x 
        y = max(pat_data)
        pat_data = pat_data / y
        all_conv = []
        for i in range(WINDOW_SIZE * 2, len(data)):
            watch_data = data[i - WINDOW_SIZE * 2: i]
            w = min(watch_data)
            watch_data = watch_data - w
            r = max(watch_data)
            if r < y:
                watch_data = watch_data / y
            else:
                watch_data = watch_data / r
            conv = scipy.signal.fftconvolve(pat_data, watch_data)
            max_conv.append(max(conv))
        all_conv_peaks = utils.peak_finder(all_conv, WINDOW_SIZE * 2)

        return [(x - 1, x + 1) for x in self.__filter_prediction(all_conv_peaks, data)]

    def __filter_prediction(self, segments, data):
        
        if len(segments) == 0 or len(self.ijumps) == 0 :
            segments = []
            return segments
        delete_list = []

        for val in segments:
            if all_conv[val] < max(pat_conv) * 0.8:
                delete_list.append(val)
        
        for item in delete_list:
            segments.remove(item)

        return segments