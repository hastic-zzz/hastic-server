from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pandas as pd


class StepModel(Model):
    def __init__(self):
        super()
        self.segments = []
        self.idrops = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000
        }

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: dict) -> dict:
        self.segments = segments
        #dataframe = dataframe.iloc[::-1]
        d_min = min(dataframe['value'])
        for i in range(0,len(dataframe['value'])):
            dataframe.loc[i, 'value'] = dataframe.loc[i, 'value'] - d_min 
        data = dataframe['value']       
        confidences = []
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from']))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to']))

                segment_data = data[segment_from_index : segment_to_index + 1]
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append( 0.4*(segment_max - segment_min))
                flat_segment = segment_data #.rolling(window=5).mean()
                segment_min_index = flat_segment.idxmin() - 5
                self.idrops.append(segment_min_index)
                labeled_drop = data[segment_min_index - 240 : segment_min_index + 240]
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

    async def predict(self, dataframe: pd.DataFrame, cache: dict) -> dict:
        #dataframe = dataframe.iloc[::-1]
        d_min = min(dataframe['value'])
        for i in range(0,len(dataframe['value'])):
            dataframe.loc[i, 'value'] = dataframe.loc[i, 'value'] - d_min

        data = dataframe['value']

        result = self.__predict(data)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    def __predict(self, data):
        window_size = 24
        all_max_flatten_data = data.rolling(window=window_size).mean()
        new_flat_data = []
        for val in all_max_flatten_data:
            new_flat_data.append(val)
            
        all_mins = argrelextrema(np.array(all_max_flatten_data), np.less)[0]
        
        extrema_list = []
        for i in utils.exponential_smoothing(data - self.state['confidence'], 0.01):
            extrema_list.append(i)
        #extrema_list = extrema_list[::-1]

        segments = []
        for i in all_mins:
            if new_flat_data[i] < extrema_list[i]:
                segments.append(i) #-window_size
        

        return [(x - 1, x + 1) for x in self.__filter_prediction(segments, new_flat_data)]

    def __filter_prediction(self, segments, new_flat_data):
        delete_list = []
        variance_error = int(0.004 * len(new_flat_data))
        if variance_error > 100:
            variance_error = 100
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        delete_list = []
        print(self.idrops[0])
        pattern_data = new_flat_data[self.idrops[0] - 240 : self.idrops[0] + 240]
        print(self.state['convolve_max'])
        for segment in segments:
            if segment > 240:
                convol_data = new_flat_data[segment - 240 : segment + 240]
                conv = scipy.signal.fftconvolve(pattern_data, convol_data)
                if conv[480] > self.state['convolve_max'] * 1.2 or conv[480] < self.state['convolve_max'] * 0.9:
                    delete_list.append(segment)
                    print(segment, conv[480], 0)
                else:
                    print(segment, conv[480], 1)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return segments
