from analytic_types import AnalyticUnitId, TimeSeries
from analytic_types.learning_info import LearningInfo
from models import Model, ModelState, AnalyticSegment
import utils
import utils.meta

import scipy.signal
from scipy.fftpack import fft
from typing import Optional, List, Tuple
import numpy as np
import pandas as pd


EXP_SMOOTHING_FACTOR = 0.01


@utils.meta.JSONClass
class TriangleModelState(ModelState):

    def __init__(
        self,
        confidence: float = 0,
        height_max: float = 0,
        height_min: float = 0,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.confidence = confidence
        self.height_max = height_max
        self.height_min = height_min

class TriangleModel(Model):

    def get_state(self, cache: Optional[dict] = None) -> TriangleModelState:
        return TriangleModelState.from_json(cache)

    def do_fit(
        self,
        dataframe: pd.DataFrame,
        labeled_segments: List[AnalyticSegment],
        deleted_segments: List[AnalyticSegment],
        learning_info: LearningInfo
    ) -> None:
        data = utils.cut_dataframe(dataframe)
        data = data['value']
        self.state.pattern_center = utils.remove_duplicates_and_sort(self.state.pattern_center + learning_info.segment_center_list)
        self.state.pattern_model = utils.get_av_model(learning_info.patterns_list)
        convolve_list = utils.get_convolve(self.state.pattern_center, self.state.pattern_model, data, self.state.window_size)
        correlation_list = utils.get_correlation(self.state.pattern_center, self.state.pattern_model, data, self.state.window_size)
        height_list = learning_info.patterns_value

        del_conv_list = []
        delete_pattern_width = []
        delete_pattern_height = []
        delete_pattern_timestamp = []
        for segment in deleted_segments:
            delete_pattern_timestamp.append(segment.pattern_timestamp)
            deleted = utils.get_interval(data, segment.center_index, self.state.window_size)
            deleted = utils.subtract_min_without_nan(deleted)
            del_conv = scipy.signal.fftconvolve(deleted, self.state.pattern_model)
            if len(del_conv):
                del_conv_list.append(max(del_conv))
            delete_pattern_height.append(utils.find_confidence(deleted)[1])

        self._update_fitting_result(self.state, learning_info.confidence, convolve_list, del_conv_list, height_list)

    def do_detect(self, dataframe: pd.DataFrame) -> TimeSeries:
        data = utils.cut_dataframe(dataframe)
        data = data['value']

        all_extremum_indexes = self.get_extremum_indexes(data)
        smoothed_data = self.get_smoothed_data(data, self.state.confidence, EXP_SMOOTHING_FACTOR)
        segments = self.get_possible_segments(data, smoothed_data, all_extremum_indexes)
        result = self.__filter_detection(segments, data)
        result = utils.get_borders_of_peaks(result, data, self.state.window_size, self.state.confidence)
        return result

    def __filter_detection(self, segments: List[int], data: pd.Series) -> list:
        delete_list = []
        variance_error = self.state.window_size
        close_patterns = utils.close_filtering(segments, variance_error)
        segments = self.get_best_pattern(close_patterns, data)

        if len(segments) == 0 or len(self.state.pattern_model) == 0:
            return []
        pattern_data = self.state.pattern_model
        up_height = self.state.height_max * (1 + self.HEIGHT_ERROR)
        low_height = self.state.height_min * (1 - self.HEIGHT_ERROR)
        up_conv = self.state.convolve_max * (1 + 1.5 * self.CONV_ERROR)
        low_conv = self.state.convolve_min * (1 - self.CONV_ERROR)
        up_del_conv = self.state.conv_del_max * (1 + self.DEL_CONV_ERROR)
        low_del_conv = self.state.conv_del_min * (1 - self.DEL_CONV_ERROR)
        for segment in segments:
            if segment > self.state.window_size:
                convol_data = utils.get_interval(data, segment, self.state.window_size)
                convol_data = utils.subtract_min_without_nan(convol_data)
                percent_of_nans = convol_data.isnull().sum() / len(convol_data)
                if percent_of_nans > 0.5:
                    delete_list.append(segment)
                    continue
                elif 0 < percent_of_nans <= 0.5:
                    nan_list = utils.find_nan_indexes(convol_data)
                    convol_data = utils.nan_to_zero(convol_data, nan_list)
                    pattern_data = utils.nan_to_zero(pattern_data, nan_list)
                conv = scipy.signal.fftconvolve(convol_data, pattern_data)
                pattern_height = convol_data.values.max()
                if pattern_height > up_height or pattern_height < low_height:
                    delete_list.append(segment)
                    continue
                if max(conv) > up_conv or max(conv) < low_conv:
                    delete_list.append(segment)
                    continue
                if max(conv) < up_del_conv and max(conv) > low_del_conv:
                    delete_list.append(segment)
            else:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)
        return set(segments)
