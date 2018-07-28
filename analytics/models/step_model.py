from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pickle


class StepModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000
        }

    async def fit(self, dataframe, segments):
        self.segments = segments
        data = dataframe['value']
        confidences = []
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_data = data[segment['start'] : segment['finish'] + 1]
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=5).mean()
                
                segment_min_index = flat_segment.idxmin() - 5
                labeled_drop = data[segment_min_index - 120 : segment_min_index + 120]
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
        data = dataframe['value']

        result = await self.__predict(data)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    async def __predict(self, data):
        window_size = 24
        all_max_flatten_data = data.rolling(window=window_size).mean()
        all_mins = argrelextrema(np.array(all_max_flatten_data), np.less)[0]
        extrema_list = []

        for i in utils.exponential_smoothing(data - self.state['confidence'], 0.03):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if all_max_flatten_data[i] < extrema_list[i]:
                segments.append(i - window_size)

        return [(x - 1, x + 1) for x in self.__filter_prediction(segments, all_max_flatten_data)]

    def __filter_prediction(self, segments, all_max_flatten_data):
        delete_list = []
        variance_error = int(0.004 * len(all_max_flatten_data))
        if variance_error > 200:
            variance_error = 200
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        delete_list = []
        pattern_data = all_max_flatten_data[segments[0] - 120 : segments[0] + 120]
        for segment in segments:
            convol_data = all_max_flatten_data[segment - 120 : segment + 120]
            conv = scipy.signal.fftconvolve(pattern_data, convol_data)
            if max(conv) > self.state['convolve_max'] * 1.1 or max(conv) < self.state['convolve_max'] * 0.9:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return segments
