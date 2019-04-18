from models import Model, ModelState

import utils
import utils.meta
import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from typing import Optional
import math
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde


@utils.meta.JSONClass
class JumpModelState(ModelState):
    def __init__(
        self,
        confidence: float = 0,
        jump_height: float = 0,
        jump_length: float = 0,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.confidence = confidence
        self.jump_height = jump_height
        self.jump_length = jump_length


class JumpModel(Model):

    def __init__(self):
        super()
        self.segments = []
        self.state = {
            'pattern_center': [],
            'pattern_model': [],
            'confidence': 1.5,
            'convolve_max': 230,
            'convolve_min': 230,
            'JUMP_HEIGHT': 1,
            'JUMP_LENGTH': 1,
            'WINDOW_SIZE': 0,
            'conv_del_min': 54000,
            'conv_del_max': 55000,
        }
    
    def get_model_type(self) -> (str, bool):
        model = 'jump'
        type_model = True
        return (model, type_model)
    
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        segment_center_index = utils.find_pattern_center(segment, start, 'jump')
        return segment_center_index

    def get_cache(self, cache: Optional[dict] = None) -> JumpModelState:
        return JumpModelState.from_json(cache)

    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list, learning_info: dict, id: str) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        half_window_size = self.state['WINDOW_SIZE'] // 2
        last_pattern_center = self.state.get('pattern_center', [])
        self.state['pattern_center'] = list(set(last_pattern_center + learning_info['segment_center_list']))
        self.state['pattern_model'] = utils.get_av_model(learning_info['patterns_list'])
        convolve_list = utils.get_convolve(self.state['pattern_center'], self.state['pattern_model'], data, half_window_size)
        correlation_list = utils.get_correlation(self.state['pattern_center'], self.state['pattern_model'], data, half_window_size)
        height_list = learning_info['patterns_value']

        del_conv_list = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            segment_cent_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted_jump = utils.get_interval(data, segment_cent_index, half_window_size)
            deleted_jump = utils.subtract_min_without_nan(deleted_jump)
            del_conv_jump = scipy.signal.fftconvolve(deleted_jump, self.state['pattern_model'])
            if len(del_conv_jump): del_conv_list.append(max(del_conv_jump))

        self._update_fiting_result(self.state, learning_info['confidence'], convolve_list, del_conv_list, height_list)
        self.state['JUMP_HEIGHT'] = float(min(learning_info['pattern_height'], default = 1))
        self.state['JUMP_LENGTH'] = int(max(learning_info['pattern_width'], default = 1))

    def do_detect(self, dataframe: pd.DataFrame, id: str) -> list:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        possible_jumps = utils.find_jump(data, self.state['JUMP_HEIGHT'], self.state['JUMP_LENGTH'] + 1)
        result = self.__filter_detection(possible_jumps, data)
        return [(val - 1, val + 1) for val in result]

    def __filter_detection(self, segments, data):
        delete_list = []
        variance_error = half_window_size = self.state['WINDOW_SIZE'] // 2
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = utils.best_pattern(close_patterns, data, 'max')

        if len(segments) == 0 or len(self.state.get('pattern_center', [])) == 0:
            segments = []
            return segments
        pattern_data = self.state['pattern_model']
        upper_bound = self.state['convolve_max'] * 1.2
        lower_bound = self.state['convolve_min'] * 0.8
        delete_up_bound = self.state['conv_del_max'] * 1.02
        delete_low_bound = self.state['conv_del_min'] * 0.98
        for segment in segments:
            if segment > half_window_size and segment < (len(data) - half_window_size):
                convol_data = utils.get_interval(data, segment, half_window_size)
                percent_of_nans = convol_data.isnull().sum() / len(convol_data)
                if len(convol_data) == 0 or percent_of_nans > 0.5:
                    delete_list.append(segment)
                    continue
                elif 0 < percent_of_nans <= 0.5:
                    nan_list = utils.find_nan_indexes(convol_data)
                    convol_data = utils.nan_to_zero(convol_data, nan_list)
                    pattern_data = utils.nan_to_zero(pattern_data, nan_list)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                try:
                    if max(conv) > upper_bound or max(conv) < lower_bound:
                        delete_list.append(segment)
                    elif max(conv) < delete_up_bound and max(conv) > delete_low_bound:
                        delete_list.append(segment)
                except ValueError:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return set(segments)
