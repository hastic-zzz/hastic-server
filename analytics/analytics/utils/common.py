import numpy as np
import pandas as pd
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
from scipy.stats import gaussian_kde
import utils

def exponential_smoothing(series, alpha):
    result = [series[0]]
    if np.isnan(result):
        result = [0]
    for n in range(1, len(series)):
        if np.isnan(series[n]):
            series[n] = 0
        result.append(alpha * series[n] + (1 - alpha) * result[n - 1])
    return result

def find_steps(array, threshold):
    """
    Finds local maxima by segmenting array based on positions at which
    the threshold value is crossed. Note that this thresholding is
    applied after the absolute value of the array is taken. Thus,
    the distinction between upward and downward steps is lost. However,
    get_step_sizes can be used to determine directionality after the
    fact.
    Parameters
    ----------
    array : numpy array
        1 dimensional array that represents time series of data points
    threshold : int / float
        Threshold value that defines a step
    Returns
    -------
    steps : list
        List of indices of the detected steps
    """
    steps        = []
    array        = np.abs(array)
    above_points = np.where(array > threshold, 1, 0)
    ap_dif       = np.diff(above_points)
    cross_ups    = np.where(ap_dif == 1)[0]
    cross_dns    = np.where(ap_dif == -1)[0]
    for upi, dni in zip(cross_ups,cross_dns):
        steps.append(np.argmax(array[upi:dni]) + upi)
    return steps

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

def intersection_segment(data, median):
    """
    Finds all intersections between flatten data and median
    """
    cen_ind = []
    for i in range(1, len(data)-1):
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

def find_jump(data, height, lenght):
    j_list = []
    for i in range(len(data)-lenght-1):
        for x in range(1, lenght):
            if(data[i+x] > data[i] + height):
                j_list.append(i)
    return(j_list)

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

def drop_intersection(segment_data, median_line):
    x = np.arange(0, len(segment_data))
    f = []
    for i in range(len(segment_data)):
        f.append(median_line)
    f = np.array(f)
    g = []
    for i in segment_data:
        g.append(i)
    g = np.array(g)
    idx = np.argwhere(np.diff(np.sign(f - g)) != 0).reshape(-1) + 0
    return idx

def find_drop(data, height, length):
    d_list = []
    for i in range(len(data)-length-1):
        for x in range(1, length):
            if(data[i+x] < data[i] - height):
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

def close_filtering(pat_list, win_size):
    if len(pat_list) == 0:
        return []
    s = [[pat_list[0]]]
    k = 0
    for i in range(1, len(pat_list)):
        if pat_list[i] - win_size <= s[k][-1]:
            s[k].append(pat_list[i])
        else:
            k += 1
            s.append([pat_list[i]])
    return s

def best_pat(pat_list, data, dir):
    new_pat_list = []
    for val in pat_list:
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
        new_pat_list.append(ind)
    return new_pat_list

def find_nan_indexes(segment):
    nan_list = np.isnan(segment)
    nan_indexes = []
    for i, val in enumerate(nan_list):
        if val:
            nan_indexes.append(i)
    return nan_indexes

def nan_to_zero(segment, nan_list):
    for val in nan_list:
        segment[val] = 0
    return segment

def find_confidence(segment: pd.Series) -> float:
    segment_min = min(segment)
    segment_max = max(segment)
    if np.isnan(segment_min):
        segment_min = 0
    if np.isnan(segment_max):
        segment_max = 0
    return 0.2 * (segment_max - segment_min)

def get_interval(data: pd.Series, center: int, window_size: int) -> pd.Series:
    left_bound = center - window_size
    right_bound = center + window_size + 1
    if left_bound < 0:
        left_bound = 0
    if right_bound > len(data) + 1:
        right_bound = len(data) + 1
    return data[left_bound: right_bound]

def subtract_min_without_nan(segment: list) -> list:
    if not np.isnan(min(segment)):
        segment = segment - min(segment)
    return segment

def get_convolve(segments: list, av_model: list, data: pd.Series, window_size: int) -> list:
    labeled_segment = []
    convolve_list = []
    for segment in segments:
        labeled_segment = utils.get_interval(data, segment, window_size)
        labeled_segment = utils.subtract_min_without_nan(labeled_segment)
        auto_convolve = scipy.signal.fftconvolve(labeled_segment, labeled_segment)
        convolve_segment = scipy.signal.fftconvolve(labeled_segment, av_model)
        convolve_list.append(max(auto_convolve))
        convolve_list.append(max(convolve_segment))
    return convolve_list


def find_jump_parameters(segment_data: pd.Series, segment_from_index: int):
    flat_segment = segment_data.rolling(window=5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    jump_height = 0.95 * (segment_max_line - segment_min_line)
    jump_length = utils.find_jump_length(segment_data, segment_min_line, segment_max_line) # finds all interseprions with median
    cen_ind = utils.intersection_segment(flat_segment.tolist(), segment_median)
    jump_center = cen_ind[0]
    segment_cent_index = jump_center - 5 + segment_from_index
    return segment_cent_index, jump_height, jump_length


def find_drop_parameters(segment_data: pd.Series, segment_from_index: int):
    flat_segment = segment_data.rolling(window=5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    drop_height = 0.95 * (segment_max_line - segment_min_line)
    drop_length = utils.find_drop_length(segment_data, segment_min_line, segment_max_line)
    cen_ind = utils.drop_intersection(flat_segment.tolist(), segment_median)
    drop_center = cen_ind[0]
    segment_cent_index = drop_center - 5 + segment_from_index
    return segment_cent_index, drop_height, drop_length


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
        segment_max_line = max_jump
        segment_min_line = min_jump
        segment_median = (max_jump - min_jump) / 2 + min_jump
    return segment_median, segment_max_line, segment_min_line
