import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde
from scipy.stats.stats import pearsonr
import math
from typing import Union
import utils
import logging
import time

SHIFT_FACTOR = 0.05
CONFIDENCE_FACTOR = 0.2
SMOOTHING_FACTOR = 5

def exponential_smoothing(series, alpha):
    result = [series[0]]
    if np.isnan(result):
        result = [0]
    for n in range(1, len(series)):
        if np.isnan(series[n]):
            series[n] = 0
        result.append(alpha * series[n] + (1 - alpha) * result[n - 1])
    return result

def segments_box(segments):
    max_time = 0
    min_time = float("inf")
    for segment in segments:
        min_time = min(min_time, segment['from'])
        max_time = max(max_time, segment['to'])
    min_time = pd.to_datetime(min_time, unit='ms')
    max_time = pd.to_datetime(max_time, unit='ms')
    return min_time, max_time

def find_pattern(data: pd.Series, height: float, length: int, pattern_type: str) -> list:
    pattern_list = []
    right_bound = len(data) - length - 1
    for i in range(right_bound):
        for x in range(1, length):
            if pattern_type == 'jump':
                if(data[i + x] > data[i] + height):
                    pattern_list.append(i)
            elif pattern_type == 'drop':
                if(data[i + x] < data[i] - height):
                    pattern_list.append(i)
    return pattern_list

def find_jump(data, height, lenght):
    j_list = []
    for i in range(len(data)-lenght-1):
        for x in range(1, lenght):
            if(data[i + x] > data[i] + height):
                j_list.append(i)
    return(j_list)

def find_drop(data, height, length):
    d_list = []
    for i in range(len(data)-length-1):
        for x in range(1, length):
            if(data[i + x] < data[i] - height):
                d_list.append(i)
    return(d_list)

def timestamp_to_index(dataframe, timestamp):
    data = dataframe['timestamp']
    idx, = np.where(data >= timestamp)
    if len(idx) > 0:
        time_ind = int(idx[0])
    else:
        raise ValueError('Dataframe has no appropriate timestamp {}'.format(timestamp))
    return time_ind

def peak_finder(data, size):
    all_max = []
    for i in range(size, len(data) - size):
        if data[i] == max(data[i - size: i + size]) and data[i] > data[i + 1]:
            all_max.append(i)
    return all_max

def ar_mean(numbers):
    return float(sum(numbers)) / max(len(numbers), 1)

def get_av_model(patterns_list):
    if not patterns_list:  return []
    patterns_list = get_same_length(patterns_list)
    value_list = list(map(list, zip(*patterns_list)))
    return list(map(ar_mean, value_list))

def get_same_length(patterns_list):
    for index in range(len(patterns_list)):
        if type(patterns_list[index]) == pd.Series:
            patterns_list[index] = patterns_list[index].tolist()
    patterns_list = list(filter(None, patterns_list))
    max_length = max(map(len, patterns_list))
    for pat in patterns_list:
        if len(pat) < max_length:
            length_difference = max_length - len(pat)
            added_values = list(0 for _ in range(length_difference))
            pat.extend(added_values)
    return patterns_list

def close_filtering(pattern_list, win_size):
    if len(pattern_list) == 0:
        return []
    s = [[pattern_list[0]]]
    k = 0
    for i in range(1, len(pattern_list)):
        if pattern_list[i] - win_size <= s[k][-1]:
            s[k].append(pattern_list[i])
        else:
            k += 1
            s.append([pattern_list[i]])
    return s

def best_pattern(pattern_list: list, data: pd.Series, dir: str) -> list:
    new_pattern_list = []
    for val in pattern_list:
        max_val = data[val[0]]
        min_val = data[val[0]]
        ind = val[0]
        for i in val:
            if dir == 'max':
                if data[i] > max_val:
                    max_val = data[i]
                    ind = i
            else:
                if data[i] < min_val:
                    min_val = data[i]
                    ind = i
        new_pattern_list.append(ind)
    return new_pattern_list

def find_nan_indexes(segment: pd.Series) -> list:
    nan_list = pd.isnull(segment)
    nan_list = np.array(nan_list)
    nan_indexes = np.where(nan_list == True)[0]
    return list(nan_indexes)

def check_nan_values(segment: Union[pd.Series, list]) -> Union[pd.Series, list]:
    nan_list = utils.find_nan_indexes(segment)
    if len(nan_list) > 0:
        segment = utils.nan_to_zero(segment, nan_list)
    return segment

def nan_to_zero(segment: Union[pd.Series, list], nan_list: list) -> Union[pd.Series, list]:
    if type(segment) == pd.Series:
        for val in nan_list:
            segment.values[val] = 0
    else:
        for val in nan_list:
            segment[val] = 0
    return segment

def find_confidence(segment: pd.Series) -> (float, float):
    segment = utils.check_nan_values(segment)
    segment_min = min(segment)
    segment_max = max(segment)
    height = segment_max - segment_min
    if height:
        return (CONFIDENCE_FACTOR * height, height)
    else:
        return (0, 0)

def find_width(pattern: pd.Series, selector) -> int:
    pattern = pattern.values
    center = utils.find_extremum_index(pattern, selector)
    pattern_left = pattern[:center]
    pattern_right = pattern[center:]
    left_extremum_index = utils.find_last_extremum(pattern_left, selector)
    right_extremum_index = utils.find_extremum_index(pattern_right, not selector)
    left_width = center - left_extremum_index
    right_width = right_extremum_index + 1
    return right_width + left_width

def find_last_extremum(segment: np.ndarray, selector: bool) -> int:
    segment = segment[::-1]
    first_extremum_ind = find_extremum_index(segment, not selector)
    last_extremum_ind = len(segment) - first_extremum_ind - 1
    return last_extremum_ind

def find_extremum_index(segment: np.ndarray, selector: bool) -> int:
    if selector:
        return segment.argmax()
    else:
        return segment.argmin()

def get_interval(data: pd.Series, center: int, window_size: int) -> pd.Series:
    if center >= len(data):
        logging.warning('Pattern center {} is out of data with len {}'.format(center, len(data)))
        return []
    left_bound = center - window_size
    right_bound = center + window_size + 1
    if left_bound < 0:
        left_bound = 0
    if right_bound > len(data):
        right_bound = len(data)
    return data[left_bound: right_bound]

def subtract_min_without_nan(segment: pd.Series) -> pd.Series:
    if len(segment) == 0:
        return []
    nan_list = utils.find_nan_indexes(segment)
    if len(nan_list) > 0:
        return segment
    else:
        segment = segment - min(segment)        
    return segment

def get_convolve(segments: list, av_model: list, data: pd.Series, window_size: int) -> list:
    labeled_segment = []
    convolve_list = []
    for segment in segments:
        labeled_segment = utils.get_interval(data, segment, window_size)
        labeled_segment = utils.subtract_min_without_nan(labeled_segment)
        labeled_segment = utils.check_nan_values(labeled_segment)
        auto_convolve = scipy.signal.fftconvolve(labeled_segment, labeled_segment)
        convolve_segment = scipy.signal.fftconvolve(labeled_segment, av_model)
        if len(auto_convolve) > 0:
            convolve_list.append(max(auto_convolve))
        if len(convolve_segment) > 0:
            convolve_list.append(max(convolve_segment))
    return convolve_list

def create_correlation_data(data: pd.Series, window_size: int, pattern_model: list) -> list:
    all_corr = []
    stop_time = 120
    point_1 = time.time()
    for i in range(window_size, len(data) - window_size):
        watch_data = data[i - window_size: i + window_size + 1]
        correlation = pearsonr(watch_data, pattern_model)
        if len(correlation) > 0:
            all_corr.append(correlation[0])
        point_2 = time.time()
        if point_2 - point_1 > stop_time:
            logging.warning('Method stoped before the ending with len corr model: {} and len data: {}'.format(len(all_corr),len(data)))
            break
    return all_corr

def get_correlation(segments: list, av_model: list, data: pd.Series, window_size: int) -> list:
    labeled_segment = []
    correlation_list = []
    p_value_list = []
    for segment in segments:
        labeled_segment = utils.get_interval(data, segment, window_size)
        labeled_segment = utils.subtract_min_without_nan(labeled_segment)
        labeled_segment = utils.check_nan_values(labeled_segment)
        if len(labeled_segment) == 0 or len(labeled_segment) != len(av_model):
            continue
        correlation = pearsonr(labeled_segment, av_model)
        if len(correlation) > 1:
            correlation_list.append(correlation[0])
            p_value_list.append(correlation[1])
    return correlation_list

def get_distribution_density(segment: pd.Series) -> float:
    if len(segment) < 2 or len(segment.nonzero()[0]) == 0:
        return (0, 0, 0)
    min_jump = min(segment)
    max_jump = max(segment)
    pdf = gaussian_kde(segment)
    x = np.linspace(segment.min() - 1, segment.max() + 1, len(segment))
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
        segment_max_line = max_jump * (1 - SHIFT_FACTOR)
        segment_min_line = min_jump * (1 - SHIFT_FACTOR)
        segment_median = (max_jump - min_jump) / 2 + min_jump
    return segment_median, segment_max_line, segment_min_line

def find_parameters(segment_data: pd.Series, segment_from_index: int, pat_type: str) -> [int, float, int]:
    segment = segment_data
    if len(segment_data) > SMOOTHING_FACTOR * 3:
        flat_segment = segment_data.rolling(window = SMOOTHING_FACTOR).mean()
        segment = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(segment)
    height = 0.95 * (segment_max_line - segment_min_line)
    length = utils.find_length(segment_data, segment_min_line, segment_max_line, pat_type)
    return height, length

def find_pattern_center(segment_data: pd.Series, segment_from_index: int, pattern_type: str):
    segment_median = utils.get_distribution_density(segment_data)[0]
    cen_ind = utils.pattern_intersection(segment_data.tolist(), segment_median, pattern_type)
    if len(cen_ind) > 0:
        pat_center = cen_ind[0]
        segment_cent_index = pat_center + segment_from_index
    else: 
        segment_cent_index = math.ceil((len(segment_data)) / 2)
    return segment_cent_index

def find_length(segment_data: pd.Series, segment_min_line: float, segment_max_line: float, pat_type: str) -> int:
    x_abscissa = np.arange(0, len(segment_data))
    segment_max = max(segment_data)
    segment_min = min(segment_data)
    if segment_min_line <= segment_min:
        segment_min_line = segment_min * 1.05
    if segment_max_line >= segment_max:
        segment_max_line = segment_max * 0.95
    min_line = []
    max_line = []
    for i in range(len(segment_data)):
        min_line.append(segment_min_line)
        max_line.append(segment_max_line)
    min_line = np.array(min_line)
    max_line = np.array(max_line)
    segment_array = np.array(segment_data.tolist())
    idmin = np.argwhere(np.diff(np.sign(min_line - segment_array)) != 0).reshape(-1)
    idmax = np.argwhere(np.diff(np.sign(max_line - segment_array)) != 0).reshape(-1)
    if len(idmin) > 0 and len(idmax) > 0:
        if pat_type == 'jump':
            result_length = idmax[0] - idmin[-1] + 1
        elif pat_type == 'drop':
            result_length = idmin[0] - idmax[-1] + 1
        return result_length if result_length > 0 else 0
    else:
        return 0

def pattern_intersection(segment_data: list, median: float, pattern_type: str) -> list:
    center_index = []
    if pattern_type == 'jump':
        for i in range(1, len(segment_data) - 1):
            if segment_data[i - 1] < median and segment_data[i + 1] > median:
                center_index.append(i)
    elif pattern_type == 'drop':
        for i in range(1, len(segment_data) - 1):
            if segment_data[i - 1] > median and segment_data[i + 1] < median:
                center_index.append(i)
    delete_index = []
    for i in range(1, len(center_index)):
        if center_index[i] == center_index[i - 1] + 1:
            delete_index.append(i - 1)

    return [x for (idx, x) in enumerate(center_index) if idx not in delete_index]

def cut_dataframe(data: pd.DataFrame) -> pd.DataFrame:
    data_min = data['value'].min()
    if not np.isnan(data_min) and data_min > 0:
        data['value'] = data['value'] - data_min
    return data

def get_min_max(array, default):
    return float(min(array, default=default)), float(max(array, default=default))

