import utils

from abc import ABC, abstractmethod
from attrdict import AttrDict
from typing import Optional
import pandas as pd
import math

ModelCache = dict

class Segment(AttrDict):

    __percent_of_nans = 0

    def __init__(self, dataframe: pd.DataFrame, segment_map: dict, center_finder = None):
        self.update(segment_map)
        self.start = utils.timestamp_to_index(dataframe, pd.to_datetime(self['from'], unit='ms'))
        self.end = utils.timestamp_to_index(dataframe, pd.to_datetime(self['to'], unit='ms'))
        self.length = abs(self.end - self.start)

        if callable(center_finder):
            self.center_index = center_finder(dataframe, self.start, self.end)
            self.pattern_timestamp = dataframe['timestamp'][self.center_index]
        else:
            self.center_index = self.start + math.ceil(self.length / 2)
            self.pattern_timestamp = dataframe['timestamp'][self.center_index]
        
        assert len(dataframe['value']) >= self.end + 1, \
            'segment {}-{} out of dataframe length={}'.format(self.start, self.end+1, len(dataframe['value']))

        self.data = dataframe['value'][self.start: self.end + 1]

    @property
    def percent_of_nans(self):
        if not self.__percent_of_nans:
            self.__percent_of_nans = self.data.isnull().sum() / len(self.data)
        return self.__percent_of_nans

    def convert_nan_to_zero(self):
        nan_list = utils.find_nan_indexes(self.data)
        self.data = utils.nan_to_zero(self.data, nan_list)

class Model(ABC):

    @abstractmethod
    def do_fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[ModelCache], learning_info: dict) -> None:
        pass

    @abstractmethod
    def do_detect(self, dataframe: pd.DataFrame) -> list:
        pass

    @abstractmethod
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        pass

    @abstractmethod
    def get_model_type(self) -> (str, bool):
        pass

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[ModelCache]) -> ModelCache:
        data = dataframe['value']
        if type(cache) is ModelCache and cache:
            self.state = cache
        max_length = 0
        labeled = []
        deleted = []
        for segment_map in segments:
            if segment_map['labeled'] or segment_map['deleted']:
                segment = Segment(dataframe, segment_map, self.find_segment_center)
                if segment.percent_of_nans > 0.1 or len(segment.data) == 0:
                    continue
                if segment.percent_of_nans > 0:
                    segment.convert_nan_to_zero()
                max_length = max(segment.length, max_length)
                if segment.labeled: labeled.append(segment)
                if segment.deleted: deleted.append(segment)
        if self.state.get('WINDOW_SIZE') == 240:            
            self.state['WINDOW_SIZE'] = math.ceil(max_length / 2) if max_length else 0
        model, model_type = self.get_model_type()
        learning_info = self.get_parameters_from_segments(dataframe, labeled, deleted, model, model_type)
        if len(self.state.get('pattern_center', [])) > 0 and len(self.state.get('pattern_model', [])) > 0:
            for center in self.state['pattern_center']:
                aligned_segment = utils.get_interval(data, center, self.state['WINDOW_SIZE'])
                aligned_segment = utils.subtract_min_without_nan(aligned_segment)
                learning_info['patterns_list'].append(aligned_segment)
        self.do_fit(dataframe, labeled, deleted, learning_info)
        return self.state

    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        if type(cache) is ModelCache:
            self.state = cache

        result = self.do_detect(dataframe)
        segments = [(
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][x - 1]),
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][x + 1])
        ) for x in result]

        return {
            'segments': segments,
            'cache': self.state
        }

    def _update_fiting_result(self, state: dict, confidences: list, convolve_list: list, del_conv_list: list) -> None:
        if type(state) is dict:
            state['confidence'] = float(min(confidences, default = 1.5))
            state['convolve_min'], state['convolve_max'] = utils.get_min_max(convolve_list, state['WINDOW_SIZE'])
            state['conv_del_min'], state['conv_del_max'] = utils.get_min_max(del_conv_list, state['WINDOW_SIZE'])
        else:
            raise ValueError('got non-dict as state for update fiting result: {}'.format(state))
    
    def get_parameters_from_segments(self, dataframe: pd.DataFrame, labeled: list, deleted: list, model: str, model_type: bool) -> dict:
        learning_info = {
            'confidence': [],
            'patterns_list': [],
            'pattern_width': [],
            'pattern_height': [],
            'pattern_timestamp': [],
            'segment_center_list': [],
        }
        data = dataframe['value']
        for segment in labeled:
            confidence = utils.find_confidence(segment.data)[0]
            learning_info['confidence'].append(confidence)
            segment_center = segment.center_index
            learning_info['segment_center_list'].append(segment_center)
            learning_info['pattern_timestamp'].append(segment.pattern_timestamp)
            aligned_segment = utils.get_interval(data, segment_center, self.state['WINDOW_SIZE'])
            aligned_segment = utils.subtract_min_without_nan(aligned_segment)
            learning_info['patterns_list'].append(aligned_segment)
            if model == 'peak' or model == 'trough':
                learning_info['pattern_height'].append(utils.find_confidence(aligned_segment)[1])
                learning_info['pattern_width'].append(utils.find_width(aligned_segment, model_type))
            if model == 'jump' or model == 'drop':
                pattern_height, pattern_length = utils.find_parameters(segment.data, segment.start, model)
                learning_info['pattern_height'].append(pattern_height)
                learning_info['pattern_width'].append(pattern_length)
        return learning_info
        
