from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pickle

WINDOW_SIZE = 240

class PeaksModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ipeaks = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000
        }

    async def fit(self, dataframe, segments):
        self.segments = segments
        #d_min = min(dataframe['value'])
        #for i in range(0,len(dataframe['value'])):
        #    dataframe.loc[i, 'value'] = dataframe.loc[i, 'value'] - d_min 
        data = dataframe['value']
        d_min = min(data)
        data = data - d_min       
        confidences = []
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                print(segment['start'])
                segment_data = data[segment['start'] : segment['finish'] + 1]
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.2 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=5).mean()
                flat_segment = flat_segment.dropna()
                segment_min_index = flat_segment.idxmin() #+ segment['start']
                self.ipeaks.append(segment_min_index)
                labeled_drop = data[segment_min_index - WINDOW_SIZE : segment_min_index + WINDOW_SIZE]
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
            self.state['convolve_max'] = 570000

    async def predict(self, dataframe):
        #d_min = min(dataframe['value'])
        #for i in range(0,len(dataframe['value'])):
        #    dataframe.loc[i, 'value'] = dataframe.loc[i, 'value'] - d_min 
        data = dataframe['value']
        data = dataframe['value']
        d_min = min(data)
        data = data - d_min  

        result = await self.__predict(data)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    async def __predict(self, data):
        window_size = 24
        all_max_flatten_data = data.rolling(window=window_size).mean()
        #all_max_flatten_data = all_max_flatten_data.dropna()
        all_mins = argrelextrema(np.array(all_max_flatten_data), np.less)[0]
        
        extrema_list = []
        for i in utils.exponential_smoothing(data - self.state['confidence'], 0.02):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if all_max_flatten_data[i] < extrema_list[i]:
                segments.append(i+12)
        

        return [(x - 1, x + 1) for x in self.__filter_prediction(segments, data)]

    def __filter_prediction(self, segments, all_max_flatten_data):
        delete_list = []
        variance_error = int(0.004 * len(all_max_flatten_data))
        if variance_error > 100:
            variance_error = 100
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        delete_list = []
        if len(segments) == 0 or len(self.ipeaks) == 0 :
            segments = []
            return segments
            
        pattern_data = all_max_flatten_data[self.ipeaks[0] - WINDOW_SIZE : self.ipeaks[0] + WINDOW_SIZE]
        for segment in segments:
            if segment > WINDOW_SIZE:
                convol_data = all_max_flatten_data[segment - WINDOW_SIZE : segment + WINDOW_SIZE]
                conv = scipy.signal.fftconvolve(pattern_data, convol_data)
                if max(conv) > self.state['convolve_max'] * 1.2 or max(conv) < self.state['convolve_max'] * 0.8:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return segments
