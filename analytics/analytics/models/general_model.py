from models import Model, ModelState
from typing import Union, List, Generator
import utils
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats.stats import pearsonr
import math
from scipy.stats import gaussian_kde
from scipy.stats import norm
import logging
from analytic_types import AnalyticUnitId


PEARSON_FACTOR = 0.7

class GeneralModel(Model):

    def __init__(self):
        super()
        self.state = {
            'pattern_center': [],
            'pattern_model': [],
            'convolve_max': 240,
            'convolve_min': 200,
            'WINDOW_SIZE': 0,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
    
    def get_model_type(self) -> (str, bool):
        model = 'general'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        center_ind = start + math.ceil((end - start) / 2)
        return center_ind

    def get_cache(self, cache):
        return ModelState.from_json(cache)

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list, learning_info: dict, id: AnalyticUnitId) -> None:
        logging.debug('Start method do_fit for analytic unit: {}'.format(id))
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        last_pattern_center = self.state.get('pattern_center', [])
        self.state['pattern_center'] = list(set(last_pattern_center + learning_info['segment_center_list']))
        self.state['pattern_model'] = utils.get_av_model(learning_info['patterns_list'])
        convolve_list = utils.get_convolve(self.state['pattern_center'], self.state['pattern_model'], data, self.state['WINDOW_SIZE'])
        correlation_list = utils.get_correlation(self.state['pattern_center'], self.state['pattern_model'], data, self.state['WINDOW_SIZE'])

        del_conv_list = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            del_mid_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted_pat = utils.get_interval(data, del_mid_index, self.state['WINDOW_SIZE'])
            deleted_pat = utils.subtract_min_without_nan(deleted_pat)
            del_conv_pat = scipy.signal.fftconvolve(deleted_pat, self.state['pattern_model'])
            if len(del_conv_pat): del_conv_list.append(max(del_conv_pat))

        self.state['convolve_min'], self.state['convolve_max'] = utils.get_min_max(convolve_list, self.state['WINDOW_SIZE'] / 3)
        self.state['conv_del_min'], self.state['conv_del_max'] = utils.get_min_max(del_conv_list, self.state['WINDOW_SIZE'])
        logging.debug('Method do_fit completed correctly for analytic unit: {}'.format(id))

    def do_detect(self, dataframe: pd.DataFrame, id: AnalyticUnitId) -> List[int]:
        logging.debug('Start method do_detect for analytic unit: {}'.format(id))
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        pat_data = self.state.get('pattern_model', [])
        if pat_data.count(0) == len(pat_data):
            raise ValueError('Labeled patterns must not be empty')

        window_size = self.state.get('WINDOW_SIZE', 0)
        all_corr = utils.get_correlation_gen(data, window_size, pat_data)
        all_corr_peaks = utils.find_peaks(all_corr, window_size * 2)
        filtered = self.__filter_detection(all_corr_peaks, data)
        filtered = list(filtered)
        logging.debug('Method do_detect completed correctly for analytic unit: {}'.format(id))
        return [(item, item + window_size * 2) for item in filtered]

    def __filter_detection(self, segments:  Generator[int, None, None], data: pd.Series) -> Generator[int, None, None]:
        if not self.state.get('pattern_center'):
            return []
        window_size = self.state.get('WINDOW_SIZE', 0)
        pattern_model = self.state.get('pattern_model', [])
        for ind, val in segments:
            watch_data = data[ind - window_size: ind + window_size + 1]
            watch_data = utils.subtract_min_without_nan(watch_data)
            convolve_segment = scipy.signal.fftconvolve(watch_data, pattern_model)
            if len(convolve_segment) > 0:
                watch_conv = max(convolve_segment)
            else:
                continue
            if watch_conv < self.state['convolve_min'] * 0.8 or val < PEARSON_FACTOR:
                continue
            if watch_conv < self.state['conv_del_max'] * 1.02 and watch_conv > self.state['conv_del_min'] * 0.98:
                continue
            yield ind
