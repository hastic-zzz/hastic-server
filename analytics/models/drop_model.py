from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde

import utils
import numpy as np
import pandas as pd


class DropModel(Model):
    def __init__(self):
        super()
        self.segments = []
        self.idrops = []
        self.model_drop = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 200,
            'convolve_min': 200,
            'DROP_HEIGHT': 1,
            'DROP_LENGTH': 1,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
        drop_height_list = []
        drop_length_list = []
        patterns_list = []
        for segment in segments:
            if segment['labeled']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = data[segment_from_index: segment_to_index + 1]

                if len(segment_data) == 0:
                    continue
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window = 5).mean()
                pdf = gaussian_kde(flat_segment.dropna())
                max_drop = max(flat_segment.dropna())
                min_drop = min(flat_segment.dropna())
                x = np.linspace(flat_segment.dropna().min() - 1, flat_segment.dropna().max() + 1, len(flat_segment.dropna()))
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
                    segment_max_line = max_drop
                    segment_min_line = min_drop
                    segment_median = (max_drop - min_drop) / 2 + min_drop
                drop_height = 0.95 * (segment_max_line - segment_min_line)
                drop_height_list.append(drop_height)
                drop_length = utils.find_drop_length(segment_data, segment_min_line, segment_max_line)
                drop_length_list.append(drop_length)
                cen_ind = utils.drop_intersection(flat_segment.tolist(), segment_median) #finds all interseprions with median
                drop_center = cen_ind[0]
                segment_cent_index = drop_center - 5 + segment_from_index
                self.idrops.append(segment_cent_index)
                labeled_drop = data[segment_cent_index - self.state['WINDOW_SIZE']: segment_cent_index + self.state['WINDOW_SIZE'] + 1]
                labeled_drop = labeled_drop - min(labeled_drop)
                patterns_list.append(labeled_drop)

        self.model_drop = utils.get_av_model(patterns_list)
        for n in range(len(segments)):
            labeled_drop = data[self.idrops[n] - self.state['WINDOW_SIZE']: self.idrops[n] + self.state['WINDOW_SIZE'] + 1]
            labeled_drop = labeled_drop - min(labeled_drop)
            auto_convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
            convolve_drop = scipy.signal.fftconvolve(labeled_drop, self.model_drop)
            convolve_list.append(max(auto_convolve))
            convolve_list.append(max(convolve_drop))

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
                drop_center = cen_ind[0] # or -1? test
                segment_cent_index = drop_center - 5 + segment_from_index
                deleted_drop = data[segment_cent_index - self.state['WINDOW_SIZE'] : segment_cent_index + self.state['WINDOW_SIZE'] + 1]
                deleted_drop = deleted_drop - min(labeled_drop)
                del_conv_drop = scipy.signal.fftconvolve(deleted_drop, self.model_drop)
                del_conv_list.append(max(del_conv_drop))

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

        if len(drop_height_list) > 0:
            self.state['DROP_HEIGHT'] = int(min(drop_height_list))
        else:
            self.state['DROP_HEIGHT'] = 1

        if len(drop_length_list) > 0:
            self.state['DROP_LENGTH'] = int(max(drop_length_list))
        else:
            self.state['DROP_LENGTH'] = 1

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
        possible_drops = utils.find_drop(data, self.state['DROP_HEIGHT'], self.state['DROP_LENGTH'] + 1)

        return self.__filter_prediction(possible_drops, data)

    def __filter_prediction(self, segments: list, data: list):
        delete_list = []
        variance_error = int(0.004 * len(data))
        if variance_error > self.state['WINDOW_SIZE']:
            variance_error = self.state['WINDOW_SIZE']

        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        # for item in delete_list:
        #    segments.remove(item)
        delete_list = []

        if len(segments) == 0 or len(self.idrops) == 0 :
            segments = []
            return segments
        pattern_data = self.model_drop
        for segment in segments:
            if segment > self.state['WINDOW_SIZE'] and segment < (len(data) - self.state['WINDOW_SIZE']):
                convol_data = data[segment - self.state['WINDOW_SIZE'] : segment + self.state['WINDOW_SIZE'] + 1]
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                upper_bound = self.state['convolve_max'] * 1.2
                lower_bound = self.state['convolve_min'] * 0.8
                delete_up_bound = self.state['conv_del_max'] * 1.02
                delete_low_bound = self.state['conv_del_min'] * 0.98
                try:
                    if max(conv) > upper_bound or max(conv) < lower_bound:
                        delete_list.append(segment)
                    elif max(conv) < delete_up_bound and max(conv) > delete_low_bound:
                        delete_list.append(segment)
                except ValueError:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        # TODO: implement filtering
        # for item in delete_list:
        #     segments.remove(item)

        return set(segments)
