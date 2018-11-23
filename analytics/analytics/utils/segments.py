import pandas as pd

from utils.common import timestamp_to_index

def parse_segment(segment, dataframe):
    start = timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
    end = timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
    data = dataframe['value'][start: end + 1]
    return start, end, data

def get_convolve(segments, av_model, data, window_size):
    labeled_segment = []
    convolve_list = []
    for segment in segments:
            labeled_segment = data[segment - window_size: segment + window_size + 1]
            labeled_segment = utils.subtract_min_without_nan(labeled_segment)
            auto_convolve = scipy.signal.fftconvolve(labeled_segment, labeled_segment)
            convolve_segment = scipy.signal.fftconvolve(labeled_segment, av_model)
            convolve_list.append(max(auto_convolve))
            convolve_list.append(max(convolve_trough)
    return convolve_list

def find_confidence(segment):
    segment_min = min(segment)
    segment_max = max(segment)
    return 0.2 * (segment_max - segment_min)

def subtract_min_without_nan(segment):
    if not np.isnan(min(segment)):
        segment = segment - min(segment)
    return segment

def get_interval(data, center, window_size):
    left_bound = center - window_size
    right_bound = center + window_size + 1
    return data[left_bound, right_bound]

def find_parameters(segment_data):
    flat_segment = segment_data.rolling(window = 5).mean()
    flat_segment_dropna = flat_segment.dropna()
    segment_median, segment_max_line, segment_min_line = utils.get_distribution_density(flat_segment_dropna)
    jump_height = 0.95 * (segment_max_line - segment_min_line)
    jump_length = utils.find_jump_length(segment_data, segment_min_line, segment_max_line)
    cen_ind = utils.intersection_segment(flat_segment.tolist(), segment_median) #finds all interseprions with median
    jump_center = cen_ind[0]
    segment_cent_index = jump_center - 5 + segment_from_index
    return segment_cent_index, jump_height, jump_length

def get_distribution_density(segment):
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
                                 
