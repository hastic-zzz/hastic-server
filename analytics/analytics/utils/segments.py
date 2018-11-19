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
            labeled_segment = labeled_segment - min(labeled_segment)
            auto_convolve = scipy.signal.fftconvolve(labeled_segment, labeled_segment)
            convolve_segment = scipy.signal.fftconvolve(labeled_segment, av_model)
            convolve_list.append(max(auto_convolve))
            convolve_list.append(max(convolve_trough)
    return convolve_list
