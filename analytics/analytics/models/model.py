import utils

from abc import ABC, abstractmethod
from attrdict import AttrDict
from typing import Optional, List, Tuple
import pandas as pd
import math
import logging
from analytic_types import AnalyticUnitId

import utils.meta

class Segment(AttrDict):

    def __init__(self, dataframe: pd.DataFrame, segment_map: dict, center_finder = None):
        self.update(segment_map)
        self.start = utils.timestamp_to_index(dataframe, pd.to_datetime(self['from'], unit='ms'))
        self.end = utils.timestamp_to_index(dataframe, pd.to_datetime(self['to'], unit='ms'))
        self.length = abs(self.end - self.start)
        self.__percent_of_nans = 0

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


@utils.meta.JSONClass
class ModelState():

    def __init__(
        self,
        pattern_center: List[int] = [],
        pattern_model: List[float] = [],
        convolve_max: float = 0,
        convolve_min: float = 0,
        window_size: int = 0,
        conv_del_min: float = 0,
        conv_del_max: float = 0
    ):
        self.pattern_center = pattern_center
        self.pattern_model = pattern_model
        self.convolve_max = convolve_max
        self.convolve_min = convolve_min
        self.window_size = window_size
        self.conv_del_min = conv_del_min
        self.conv_del_max = conv_del_max


class Model(ABC):

    HEIGHT_ERROR = 0.1
    CONV_ERROR = 0.2
    DEL_CONV_ERROR = 0.02

    @abstractmethod
    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: List[dict], deleted_segments: List[dict], learning_info: dict) -> None:
        pass

    @abstractmethod
    def do_detect(self, dataframe: pd.DataFrame) -> List[Tuple[int, int]]:
        pass

    @abstractmethod
    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        pass

    @abstractmethod
    def get_model_type(self) -> (str, bool):
        pass

    @abstractmethod
    def get_state(self, cache: Optional[dict] = None) -> ModelState:
        pass

    def fit(self, dataframe: pd.DataFrame, segments: List[dict], id: AnalyticUnitId) -> ModelState:
        logging.debug('Start method fit for analytic unit {}'.format(id))
        data = dataframe['value']
        max_length = 0
        labeled = []
        deleted = []
        for segment_map in segments:
            if segment_map['labeled'] or segment_map['deleted']:
                segment = Segment(dataframe, segment_map, self.find_segment_center)
                if segment.percent_of_nans > 0.1 or len(segment.data) == 0:
                    logging.debug(f'segment {segment.start}-{segment.end} skip because of invalid data')
                    continue
                if segment.percent_of_nans > 0:
                    segment.convert_nan_to_zero()
                max_length = max(segment.length, max_length)
                if segment.labeled: labeled.append(segment)
                if segment.deleted: deleted.append(segment)

        assert len(labeled) > 0, f'labeled list empty, skip fitting for {id}'

        if self.state.window_size == 0:
            self.state.window_size = math.ceil(max_length / 2) if max_length else 0
        model, model_type = self.get_model_type()
        learning_info = self.get_parameters_from_segments(dataframe, labeled, deleted, model, model_type)
        self.do_fit(dataframe, labeled, deleted, learning_info)
        logging.debug('fit complete successful with self.state: {} for analytic unit: {}'.format(self.state, id))
        return self.state

    def detect(self, dataframe: pd.DataFrame, id: AnalyticUnitId) -> dict:
        logging.debug('Start method detect for analytic unit {}'.format(id))
        result = self.do_detect(dataframe)
        segments = [(
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][x[0]]),
            utils.convert_pd_timestamp_to_ms(dataframe['timestamp'][x[1]]),
        ) for x in result]
        if not self.state:
            logging.warning('Return empty self.state after detect')
        logging.debug('Method detect complete successful for analytic unit {}'.format(id))
        return {
            'segments': segments,
            'cache': self.state,
        }

    def _update_fiting_result(self, state: ModelState, confidences: list, convolve_list: list, del_conv_list: list, height_list: Optional[list] = None) -> None:
        state.confidence = float(min(confidences, default = 1.5))
        state.convolve_min, state.convolve_max = utils.get_min_max(convolve_list, state.window_size)
        state.conv_del_min, state.conv_del_max = utils.get_min_max(del_conv_list, 0)
        if height_list is not None:
            state.height_min, state.height_max = utils.get_min_max(height_list, 0)

    def get_parameters_from_segments(self, dataframe: pd.DataFrame, labeled: List[dict], deleted: List[dict], model: str, model_type: bool) -> dict:
        logging.debug('Start parsing segments')
        learning_info = {
            'confidence': [],
            'patterns_list': [],
            'pattern_width': [],
            'pattern_height': [],
            'pattern_timestamp': [],
            'segment_center_list': [],
            'patterns_value': [],
        }
        data = dataframe['value']
        for segment in labeled:
            confidence = utils.find_confidence(segment.data)[0]
            learning_info['confidence'].append(confidence)
            segment_center = segment.center_index
            learning_info['segment_center_list'].append(segment_center)
            learning_info['pattern_timestamp'].append(segment.pattern_timestamp)
            aligned_segment = utils.get_interval(data, segment_center, self.state.window_size)
            aligned_segment = utils.subtract_min_without_nan(aligned_segment)
            if len(aligned_segment) == 0:
                logging.warning('cant add segment to learning because segment is empty where segments center is: {}, window_size: {}, and len_data: {}'.format(
                    segment_center, self.state.window_size, len(data)))
                continue
            learning_info['patterns_list'].append(aligned_segment)
            if model == 'peak' or model == 'trough':
                learning_info['pattern_height'].append(utils.find_confidence(aligned_segment)[1])
                learning_info['patterns_value'].append(aligned_segment.values.max())
            if model == 'jump' or model == 'drop':
                pattern_height, pattern_length = utils.find_parameters(segment.data, segment.start, model)
                learning_info['pattern_height'].append(pattern_height)
                learning_info['pattern_width'].append(pattern_length)
                learning_info['patterns_value'].append(aligned_segment.values[self.state.window_size])
        logging.debug('Parsing segments ended correctly with learning_info: {}'.format(learning_info))
        return learning_info

