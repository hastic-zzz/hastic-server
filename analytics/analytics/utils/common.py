import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde
from typing import Union
import utils

SHIFT_FACTOR = 0.05
CONFIDENCE_FACTOR = 0.2

def exponential_smoothing(series, alpha):
    result = [series[0]]
    if np.isnan(result):
        result = [0]
    for n in range(1, len(series)):
        if np.isnan(series[n]):
            series[n] = 0
        result.append(alpha * series[n] + (1 - alpha) * result[n - 1])
    return result

def anomalies_to_timestamp(anomalies):
    for anomaly in anomalies:
        anomaly['from'] = int(anomaly['from'].timestamp() * 1000)
        anomaly['to'] = int(anomaly['to'].timestamp() * 1000)
    return anomalies

def segments_box(segments):
    max_time = 0
    min_time = float("inf")
    for segment in segments:
        min_time = min(min_time, segment['from'])
        max_time = max(max_time, segment['to'])
    min_time = pd.to_datetime(min_time, unit='ms')
    max_time = pd.to_datetime(max_time, unit='ms')
    return min_time, max_time

<<<<<<< HEAD
def find_intersections(data: pd.Series, median: float) -> list:
    """
        Finds all intersections between drop pattern data and median
    """
    cen_ind = []
    for i in range(1, len(data) - 1):
        if data[i - 1] < median and data[i + 1] > median:
            cen_ind.append(i)
    del_ind = []
    for i in range(1, len(cen_ind)):
        if cen_ind[i] == cen_ind[i - 1] + 1:
            del_ind.append(i - 1)

    return [x for (idx, x) in enumerate(cen_ind) if idx not in del_ind]

def logistic_sigmoid_distribution(self, x1, x2, alpha, height):
    return map(lambda x: logistic_sigmoid(x, alpha, height), range(x1, x2))

def logistic_sigmoid(x, alpha, height):
    return height / (1 + math.exp(-x * alpha))

def MyLogisticSigmoid(interval, alpha, heigh):
    distribution = []
    for i in range(-interval, interval):
        F = height / (1 + math.exp(-i * alpha))
        distribution.append(F)
    return distribution

def find_one_jump(data, x, size, height, err):
    l = []
    for i in range(x + 1, x + size):
        if (data[i] > data[x] and data[x + size] > data[x] + height):
            l.append(data[i])
    if len(l) > size * err:
        return x
    else:
        return 0

def find_all_jumps(data, size, height):
    possible_jump_list = []
    for i in range(len(data - size)):
        x = find_one_jump(data, i, size, height, 0.9)
        if x > 0:
            possible_jump_list.append(x)
    return possible_jump_list

def find_jump_center(cen_ind):
    jump_center = cen_ind[0]
    for i in range(len(cen_ind)):
        x = cen_ind[i]
        cx = scipy.signal.fftconvolve(pat_sigm, flat_data[x - WINDOW_SIZE : x + WINDOW_SIZE])
        c.append(cx[2 * WINDOW_SIZE])
        if i > 0 and cx > c[i - 1]:
            jump_center = x
    return jump_center

def find_ind_median(median, segment_data):
    x = np.arange(0, len(segment_data))
    f = []
    for i in range(len(segment_data)):
        f.append(median)
    f = np.array(f)
    g = []
    for i in segment_data:
        g.append(i)
    g = np.array(g)
    idx = np.argwhere(np.diff(np.sign(f - g)) != 0).reshape(-1) + 0
    return idx

def find_jump_length(segment_data, min_line, max_line):
    x = np.arange(0, len(segment_data))
    f = []
    l = []
    for i in range(len(segment_data)):
        f.append(min_line)
        l.append(max_line)
    f = np.array(f)
    l = np.array(l)
    g = []
    for i in segment_data:
        g.append(i)
    g = np.array(g)
    idx = np.argwhere(np.diff(np.sign(f - g)) != 0).reshape(-1) + 0
    idl = np.argwhere(np.diff(np.sign(l - g)) != 0).reshape(-1) + 0
    if (idl[0] - idx[-1] + 1) > 0:
        return idl[0] - idx[-1] + 1
    else:
        print("retard alert!")
        return 0
=======
def find_pattern(data: pd.Series, height: float, lenght: int, pattern_type: str) -> list:
    pattern_list = []
    right_bound = len(data) - length - 1
    for i in range(right_bound):
        for x in range(1, lenght):
            if pat_type == 'jump':
                if(data[i + x] > data[i] + height):
                    pattern_list.append(i)
            eilf pat_type == 'drop':
                if(data[i + x] < data[i] - height):
                    pattern_list.append(i)
    return pattern_list
>>>>>>> 3875966013029642b12c58fdfe60f50d24e20da2

def find_jump(data, height, lenght):
    j_list = []
    for i in range(len(data)-lenght-1):
        for x in range(1, lenght):
            if(data[i + x] > data[i] + height):
                j_list.append(i)
    return(j_list)

<<<<<<< HEAD
def find_drop_length(segment_data, min_line, max_line):
    x = np.arange(0, len(segment_data))
    f = []
    l = []
    for i in range(len(segment_data)):
        f.append(min_line)
        l.append(max_line)
    f = np.array(f)
    l = np.array(l)
    g = []
    for i in segment_data:
        g.append(i)
    g = np.array(g)
    idx = np.argwhere(np.diff(np.sign(f - g)) != 0).reshape(-1) + 0 #min_line
    idl = np.argwhere(np.diff(np.sign(l - g)) != 0).reshape(-1) + 0 #max_line
    if (idx[0] - idl[-1] + 1) > 0:
        return idx[0] - idl[-1] + 1
    else:
        print("retard alert!")
        return 0

def find_drop_intersections(segment_data: pd.Series, median_line: float) -> list:
    """
        Finds all intersections between flatten data and median
    """
    cen_ind = []
    for i in range(1, len(segment_data)-1):
        if segment_data[i - 1] > median_line and segment_data[i + 1] < median_line:
            cen_ind.append(i)
    #   Delete close values except the last one
    del_ind = []
    for i in range(1, len(cen_ind)):
        if cen_ind[i] == cen_ind[i - 1] + 1:
            del_ind.append(i - 1)

    return [x for (idx, x) in enumerate(cen_ind) if idx not in del_ind]

=======
>>>>>>> 3875966013029642b12c58fdfe60f50d24e20da2
def find_drop(data, height, length):
    d_list = []
    for i in range(len(data)-length-1):
        for x in range(1, length):
            if(data[i + x] < data[i] - height):
                d_list.append(i)
    return(d_list)

def timestamp_to_index(dataframe, timestamp):
    data = dataframe['timestamp']

    for i in range(len(data)):
        if data[i] >= timestamp:
            return i

def peak_finder(data, size):
    all_max = []
    for i in range(size, len(data) - size):
        if data[i] == max(data[i - size: i + size]) and data[i] > data[i + 1]:
            all_max.append(i)
    return all_max

def ar_mean(numbers):
    return float(sum(numbers)) / max(len(numbers), 1)

def get_av_model(patterns_list):
    if len(patterns_list) == 0:
        return []

    x = len(patterns_list[0])
    if len(patterns_list) > 1 and len(patterns_list[1]) != x:
        raise NameError(
            'All elements of patterns_list should have same length')

    model_pat = []
    for i in range(x):
        av_val = []
        for j in patterns_list:
            av_val.append(j.values[i])
        model_pat.append(ar_mean(av_val))
    return model_pat

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
    return new_patternt_list

def find_nan_indexes(segment: pd.Series) -> list:
    nan_list = np.isnan(segment)
    nan_indexes = []
    for i, val in enumerate(nan_list):
        if val:
            nan_indexes.append(i)
    return nan_indexes

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

def find_confidence(segment: pd.Series) -> float:
    segment = utils.check_nan_values(segment)
    segment_min = min(segment)
    segment_max = max(segment)
    return CONFIDENCE_FACTOR * (segment_max - segment_min)

def get_interval(data: pd.Series, center: int, window_size: int) -> pd.Series:
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
        convolve_list.append(max(auto_convolve))
        convolve_list.append(max(convolve_segment))
    return convolve_list

<<<<<<< HEAD
def find_jump_parameters(segment_data: pd.Series, segment_from_index: int):
    flat_segment = segment_data.rolling(window=5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    jump_height = (1 - SHIFT_FACTOR) * (segment_max_line - segment_min_line)
    jump_length = utils.find_jump_length(segment_data, segment_min_line, segment_max_line) # finds all interseprions with median
    cen_ind = utils.find_intersections(segment_data.tolist(), segment_median)
    jump_center = cen_ind[0]
    segment_cent_index = jump_center + segment_from_index
    return segment_cent_index, jump_height, jump_length

def find_drop_parameters(segment_data: pd.Series, segment_from_index: int):
    flat_segment = segment_data.rolling(window=5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    drop_height = (1 - SHIFT_FACTOR) * (segment_max_line - segment_min_line)
    drop_length = utils.find_drop_length(segment_data, segment_min_line, segment_max_line)
    cen_ind = utils.find_drop_intersections(segment_data.tolist(), segment_median)
    drop_center = cen_ind[0]
    segment_cent_index = drop_center + segment_from_index
    return segment_cent_index, drop_height, drop_length

=======
>>>>>>> 3875966013029642b12c58fdfe60f50d24e20da2
def get_distribution_density(segment: pd.Series) -> float:
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
    flat_segment = segment_data.rolling(window=5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    height = 0.95 * (segment_max_line - segment_min_line)
    length = utils.find_length(segment_data, segment_min_line, segment_max_line, pat_type)
    cen_ind = utils.pat_intersection(segment_data.tolist(), segment_median, pat_type)
    pat_center = cen_ind[0]
    segment_cent_index = pat_center + segment_from_index
    return segment_cent_index, height, length

def find_length(segment_data: pd.Series, segment_min_line: float, segment_max_line: float, pat_type: str) -> int:
    x_abscissa = np.arange(0, len(segment_data))
    segment_max = max(segment)
    segment_min = min(segment)
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
    if len(idl) > 0 and len(idx) > 0:
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
        for i in range(1, len(data) - 1):
            if data[i - 1] < median and data[i + 1] > median:
                center_index.append(i)
    elif pattern_type == 'drop':
        for i in range(1, len(data) - 1):
            if data[i - 1] > median and data[i + 1] < median:
                center_index.append(i)
    delete_index = []
    for i in range(1, len(center_index)):
        if center_index[i] == center_index[i - 1] + 1:
            delete_index.append(i - 1)

    return [x for (idx, x) in enumerate(center_index) if idx not in delete_index]

    
