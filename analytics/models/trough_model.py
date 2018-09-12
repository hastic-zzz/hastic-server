from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pandas as pd


class TroughModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.itroughs = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000,
            'convolve_min': 530000,
            'WINDOW_SIZE': 240,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))

                segment_data = data[segment_from_index: segment_to_index + 1]
                if len(segment_data) == 0:
                    continue
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.2 * (segment_max - segment_min))
                segment_min_index = segment_data.idxmin() 
                self.itroughs.append(segment_min_index)
                labeled_trough = data[segment_min_index - self.state['WINDOW_SIZE'] : segment_min_index + self.state['WINDOW_SIZE']]
                labeled_trough = labeled_trough - min(labeled_trough)
                auto_convolve = scipy.signal.fftconvolve(labeled_trough, labeled_trough)
                first_trough = data[self.itroughs[0] - self.state['WINDOW_SIZE']: self.itroughs[0] + self.state['WINDOW_SIZE']]
                first_trough = first_trough - min(first_trough)
                convolve_trough = scipy.signal.fftconvolve(labeled_trough, first_trough)
                convolve_list.append(max(auto_convolve))
                convolve_list.append(max(convolve_trough))

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

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        window_size = 24
        all_mins = argrelextrema(np.array(data), np.less)[0]
        
        extrema_list = []
        for i in utils.exponential_smoothing(data - self.state['confidence'], 0.02):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if data[i] < extrema_list[i]:
                segments.append(i)

        return self.__filter_prediction(segments, data)

    def __filter_prediction(self, segments: list, data: list) -> list:
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
        if len(segments) == 0 or len(self.itroughs) == 0 :
            segments = []
            return segments  
        pattern_data = data[self.itroughs[0] - self.state['WINDOW_SIZE'] : self.itroughs[0] + self.state['WINDOW_SIZE']]
        pattern_data = pattern_data - min(pattern_data)
        for segment in segments:
            if segment > self.state['WINDOW_SIZE']:
                convol_data = data[segment - self.state['WINDOW_SIZE'] : segment + self.state['WINDOW_SIZE']]
                convol_data = convol_data - min(convol_data)
                conv = scipy.signal.fftconvolve(pattern_data, convol_data)
                if max(conv) > self.state['convolve_max'] * 1.05 or max(conv) < self.state['convolve_min'] * 0.95:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        # TODO: implement filtering
        for item in delete_list:
            segments.remove(item)

        return set(segments)
