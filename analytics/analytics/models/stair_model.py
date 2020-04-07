from models import Model, ModelState, AnalyticSegment, ModelType

from analytic_types import TimeSeries
from analytic_types.learning_info import LearningInfo

from scipy.fftpack import fft
from typing import Optional, List
from enum import Enum
import scipy.signal
import utils
import utils.meta
import pandas as pd
import numpy as np
import operator

POSITIVE_SEGMENT_MEASUREMENT_ERROR = 0.2
NEGATIVE_SEGMENT_MEASUREMENT_ERROR = 0.02

@utils.meta.JSONClass
class StairModelState(ModelState):

    def __init__(
        self,
        confidence: float = 0,
        stair_height: float = 0,
        stair_length: float = 0,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.confidence = confidence
        self.stair_height = stair_height
        self.stair_length = stair_length


class StairModel(Model):

    def get_state(self, cache: Optional[dict] = None) -> StairModelState:
        return StairModelState.from_json(cache)

    def get_stair_indexes(self, data: pd.Series, height: float, length: int) -> List[int]:
        """Get list of start stair segment indexes.

        Keyword arguments:
        data -- data, that contains stair (jump or drop) segments
        length -- maximum count of values in the stair
        height -- the difference between stair max_line and min_line(see utils.find_parameters)
        """
        indexes = []
        for i in range(len(data) - length - 1):
            is_stair = self.is_stair_in_segment(data.values[i:i + length + 1], height)
            if is_stair == True:
                indexes.append(i)
        return indexes

    def is_stair_in_segment(self, segment: np.ndarray, height: float) -> bool:
        if len(segment) < 2:
            return False
        comparison_operator = operator.ge
        if self.get_model_type() == ModelType.DROP:
            comparison_operator = operator.le
            height = -height
        return comparison_operator(max(segment[1:]), segment[0] + height)

    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        data = dataframe['value']
        segment = data[start: end]
        segment_center_index = utils.find_pattern_center(segment, start, self.get_model_type().value)
        return segment_center_index

    def do_fit(
        self,
        dataframe: pd.DataFrame,
        labeled_segments: List[AnalyticSegment],
        deleted_segments: List[AnalyticSegment],
        learning_info: LearningInfo
    ) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        window_size = self.state.window_size
        last_pattern_center = self.state.pattern_center
        self.state.pattern_center = utils.remove_duplicates_and_sort(last_pattern_center + learning_info.segment_center_list)
        self.state.pattern_model = utils.get_av_model(learning_info.patterns_list)
        convolve_list = utils.get_convolve(self.state.pattern_center, self.state.pattern_model, data, window_size)
        correlation_list = utils.get_correlation(self.state.pattern_center, self.state.pattern_model, data, window_size)
        height_list = learning_info.patterns_value

        del_conv_list = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            segment_cent_index = segment.center_index
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted_stair = utils.get_interval(data, segment_cent_index, window_size)
            deleted_stair = utils.subtract_min_without_nan(deleted_stair)
            del_conv_stair = scipy.signal.fftconvolve(deleted_stair, self.state.pattern_model)
            if len(del_conv_stair) > 0:
                del_conv_list.append(max(del_conv_stair))

        self._update_fitting_result(self.state, learning_info.confidence, convolve_list, del_conv_list)
        self.state.stair_height = int(min(learning_info.pattern_height, default = 1))
        self.state.stair_length = int(max(learning_info.pattern_width, default = 1))

    def do_detect(self, dataframe: pd.DataFrame) -> TimeSeries:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        possible_stairs = self.get_stair_indexes(data, self.state.stair_height, self.state.stair_length + 1)
        result = self.__filter_detection(possible_stairs, data)
        return [(val - 1, val + 1) for val in result]

    def __filter_detection(self, segments_indexes: List[int], data: list):
        delete_list = []
        variance_error = self.state.window_size
        close_segments = utils.close_filtering(segments_indexes, variance_error)
        segments_indexes = utils.best_pattern(close_segments, data, self.get_extremum_type().value)
        if len(segments_indexes) == 0 or len(self.state.pattern_center) == 0:
            return []
        pattern_data = self.state.pattern_model
        for segment_index in segments_indexes:
            if segment_index <= self.state.window_size or segment_index >= (len(data) - self.state.window_size):
                delete_list.append(segment_index)
                continue
            convol_data = utils.get_interval(data, segment_index, self.state.window_size)
            percent_of_nans = convol_data.isnull().sum() / len(convol_data)
            if len(convol_data) == 0 or percent_of_nans > 0.5:
                delete_list.append(segment_index)
                continue
            elif 0 < percent_of_nans <= 0.5:
                nan_list = utils.find_nan_indexes(convol_data)
                convol_data = utils.nan_to_zero(convol_data, nan_list)
                pattern_data = utils.nan_to_zero(pattern_data, nan_list)
            conv = scipy.signal.fftconvolve(convol_data, pattern_data)
            if len(conv) == 0:
                delete_list.append(segment_index)
                continue
            upper_bound = self.state.convolve_max * (1 + POSITIVE_SEGMENT_MEASUREMENT_ERROR)
            lower_bound = self.state.convolve_min * (1 - POSITIVE_SEGMENT_MEASUREMENT_ERROR)
            delete_up_bound = self.state.conv_del_max * (1 + NEGATIVE_SEGMENT_MEASUREMENT_ERROR)
            delete_low_bound = self.state.conv_del_min * (1 - NEGATIVE_SEGMENT_MEASUREMENT_ERROR)
            max_conv = max(conv)
            if max_conv > upper_bound or max_conv < lower_bound:
                delete_list.append(segment_index)
            elif max_conv < delete_up_bound and max_conv > delete_low_bound:
                delete_list.append(segment_index)

        for item in delete_list:
            segments_indexes.remove(item)
        segments_indexes = utils.remove_duplicates_and_sort(segments_indexes)
        return segments_indexes
