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


WINDOW_SIZE = 350


class GeneralModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ipats = []
        self.state = {
            'convolve_max': WINDOW_SIZE,
        }
        self.all_conv = []

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        if type(cache) is AnalyticUnitCache:
            self.state = cache
        self.segments = segments

        data = dataframe['value']
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))

                segment_data = data[segment_from_index: segment_to_index + 1]
                if len(segment_data) == 0:
                    continue
                self.ipats.append(segment_from_index + int((segment_to_index - segment_from_index) / 2))
                segment_min = min(segment_data)
                segment_data = segment_data - segment_min
                segment_max = max(segment_data)
                segment_data = segment_data / segment_max

                convolve = scipy.signal.fftconvolve(segment_data, segment_data)
                convolve_list.append(max(convolve))

        if len(convolve_list) > 0:
            self.state['convolve_max'] = float(max(convolve_list))
        else:
            self.state['convolve_max'] = WINDOW_SIZE / 3

        return self.state

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        pat_data = data[self.ipats[0] - WINDOW_SIZE: self.ipats[0] + WINDOW_SIZE]
        x = min(pat_data)
        pat_data = pat_data - x
        y = max(pat_data)
        pat_data = pat_data / y

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
            self.all_conv.append(max(conv))
        all_conv_peaks = utils.peak_finder(self.all_conv, WINDOW_SIZE * 2)

        filtered = self.__filter_prediction(all_conv_peaks, data)
        return [(dataframe['timestamp'][x - 1].value, dataframe['timestamp'][x + 1].value) for x in filtered]

    def __filter_prediction(self, segments: list, data: list):
        if len(segments) == 0 or len(self.ipats) == 0:
            segments = []
            return segments
        delete_list = []

        for val in segments:
            if self.all_conv[val] < self.state['convolve_max'] * 0.8:
                delete_list.append(val)

        for item in delete_list:
            segments.remove(item)

        return segments
