from models import Model, AnalyticUnitCache

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde

import utils
import numpy as np
import pandas as pd
from typing import Optional

WINDOW_SIZE = 400

class DropModel(Model):
    def __init__(self):
        super()
        self.segments = []
        self.idrops = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': WINDOW_SIZE,
            'DROP_HEIGHT': 1,
            'DROP_LENGTH': 1,
        }

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[AnalyticUnitCache]) -> AnalyticUnitCache:
        if type(cache) is AnalyticUnitCache:
            self.state = cache
        self.segments = segments

        data = dataframe['value']
        confidences = []
        convolve_list = []
        drop_height_list = []
        drop_length_list = []
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
                pdf = gaussian_kde(flat_segment.dropna())
                x = np.linspace(flat_segment.dropna().min(), flat_segment.dropna().max(), len(flat_segment.dropna()))
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
                #print(segment_min_line, segment_max_line)
                drop_height = 0.95 * (segment_max_line - segment_min_line)
                drop_height_list.append(drop_height)
                drop_length = utils.find_drop_length(segment_data, segment_min_line, segment_max_line)
                drop_length_list.append(drop_length)
                cen_ind = utils.drop_intersection(flat_segment, segment_median) #finds all interseprions with median
                drop_center = cen_ind[0]
                segment_cent_index = drop_center - 5 + segment_from_index
                self.idrops.append(segment_cent_index)
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

        if len(drop_height_list) > 0:
            self.state['DROP_HEIGHT'] = int(min(drop_height_list))
        else:
            self.state['DROP_HEIGHT'] = 1

        if len(drop_length_list) > 0:
            self.state['DROP_LENGTH'] = int(max(drop_length_list))
        else:
            self.state['DROP_LENGTH'] = 1

        return self.state

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        possible_drops = utils.find_drop(data, self.state['DROP_HEIGHT'], self.state['DROP_LENGTH'] + 1)
        filtered = self.__filter_prediction(possible_drops, data)
        return [(dataframe['timestamp'][x - 1].value, dataframe['timestamp'][x + 1].value) for x in filtered]

    def __filter_prediction(self, segments: list, data: list):
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

        if len(segments) == 0 or len(self.idrops) == 0 :
            segments = []
            return segments
        pattern_data = data[self.idrops[0] - WINDOW_SIZE : self.idrops[0] + WINDOW_SIZE]
        for segment in segments:
            if segment > WINDOW_SIZE and segment < (len(data) - WINDOW_SIZE):
                convol_data = data[segment - WINDOW_SIZE : segment + WINDOW_SIZE]
                conv = scipy.signal.fftconvolve(pattern_data, convol_data)
                if conv[WINDOW_SIZE*2] > self.state['convolve_max'] * 1.2 or conv[WINDOW_SIZE*2] < self.state['convolve_max'] * 0.8:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)
        #print(segments)
        for idrop in self.idrops:
            segments.append(idrop)

        return segments
