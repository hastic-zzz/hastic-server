from models import Model

import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema

import utils
import numpy as np
import pandas as pd

SMOOTHING_COEFF = 2400
EXP_SMOOTHING_FACTOR = 0.01

class PeakModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.ipeaks = []
        self.model_peak = []
        self.state = {
            'confidence': 1.5,
            'convolve_max': 570000,
            'convolve_min': 530000,
            'WINDOW_SIZE': 240,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }

    def do_fit(self, dataframe: pd.DataFrame, segments: list) -> None:
        data = dataframe['value']
        confidences = []
        convolve_list = []
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
                confidences.append(0.2 * (segment_max - segment_min))
                segment_max_index = segment_data.idxmax()
                self.ipeaks.append(segment_max_index)
                labeled_peak = data[segment_max_index - self.state['WINDOW_SIZE']: segment_max_index + self.state['WINDOW_SIZE'] + 1]
                labeled_peak = labeled_peak - min(labeled_peak)
                patterns_list.append(labeled_peak)
        
        self.model_peak = utils.get_av_model(patterns_list)
        for n in range(len(segments)): #labeled segments
            labeled_peak = data[self.ipeaks[n] - self.state['WINDOW_SIZE']: self.ipeaks[n] + self.state['WINDOW_SIZE'] + 1]
            labeled_peak = labeled_peak - min(labeled_peak)
            auto_convolve = scipy.signal.fftconvolve(labeled_peak, labeled_peak)
            convolve_peak = scipy.signal.fftconvolve(labeled_peak, self.model_peak)
            convolve_list.append(max(auto_convolve))
            convolve_list.append(max(convolve_peak))
        
        del_conv_list = []
        for segment in segments:
            if segment['deleted']:
                segment_from_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
                segment_to_index = utils.timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
                segment_data = data[segment_from_index: segment_to_index + 1]
                if len(segment_data) == 0:
                    continue
                del_max_index = segment_data.idxmax()
                deleted_peak = data[del_max_index - self.state['WINDOW_SIZE']: del_max_index + self.state['WINDOW_SIZE'] + 1]
                deleted_peak = deleted_peak - min(deleted_peak)
                del_conv_peak = scipy.signal.fftconvolve(deleted_peak, self.model_peak)
                del_conv_list.append(max(del_conv_peak))                

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
            
        if len(del_conv_list) > 0:
            self.state['conv_del_min'] = float(min(del_conv_list))
        else:
            self.state['conv_del_min'] = self.state['WINDOW_SIZE']
            
        if len(del_conv_list) > 0:
            self.state['conv_del_max'] = float(max(del_conv_list))
        else:
            self.state['conv_del_max'] = self.state['WINDOW_SIZE']

    def do_predict(self, dataframe: pd.DataFrame):
        data = dataframe['value']
        window_size = int(len(data)/SMOOTHING_COEFF) #test ws on flat data
        all_maxs = argrelextrema(np.array(data), np.greater)[0]

        extrema_list = []
        for i in utils.exponential_smoothing(data + self.state['confidence'], EXP_SMOOTHING_FACTOR):
            extrema_list.append(i)

        segments = []
        for i in all_maxs:
            if data[i] > extrema_list[i]:
                segments.append(i)

        return self.__filter_prediction(segments, data)

    def __filter_prediction(self, segments: list, data: list) -> list:
        delete_list = []
        variance_error = int(0.004 * len(data))
        if variance_error > self.state['WINDOW_SIZE']:
            variance_error = self.state['WINDOW_SIZE']
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        delete_list = []
        if len(segments) == 0 or len(self.ipeaks) == 0:
            return []
        pattern_data = self.model_peak
        print("common convole: min {1}, max {0}".format(self.state['convolve_max'] * 1.05, self.state['convolve_min'] * 0.95))
        print("delete convolve: min {1}, max {0}".format(self.state['conv_del_max'] * 1.02, self.state['conv_del_min'] * 0.98))
        for segment in segments:
            if segment > self.state['WINDOW_SIZE']:
                convol_data = data[segment - self.state['WINDOW_SIZE']: segment + self.state['WINDOW_SIZE'] + 1]
                convol_data = convol_data - min(convol_data)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                print("max conv: {0}, index: {1}".format(max(conv), segment))
                if max(conv) > self.state['convolve_max'] * 1.05 or max(conv) < self.state['convolve_min'] * 0.95:
                    delete_list.append(segment)
                elif max(conv) < self.state['conv_del_max'] * 1.02 and max(conv) > self.state['conv_del_min'] * 0.98:
                    print("this must be deleted: {0}, index: {1}".format(max(conv), segment))
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        # TODO: implement filtering
        for item in delete_list:
            segments.remove(item)
        
        return set(segments)
