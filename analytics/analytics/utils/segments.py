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

def process_segments_parameters(segments, dataframe, status):
    confidences = []
    ipeaks = []
    patterns_list = []
    for segment in segments:
        if segment[status]:
            segment_from_index, segment_to_index, segment_data = parse_segment(segment, dataframe)
            percent_of_nans = segment_data.isnull().sum() / len(segment_data)
            if percent_of_nans > 0 or len(segment_data) == 0:
                continue
            segment_min = min(segment_data)
            segment_max = max(segment_data)
            confidences.append(0.2 * (segment_max - segment_min))
            segment_max_index = segment_data.idxmax()
            ipeaks.append(segment_max_index)
            labeled_peak = data[segment_max_index - self.state['WINDOW_SIZE']: segment_max_index + self.state['WINDOW_SIZE'] + 1]
            labeled_peak = labeled_peak - min(labeled_peak)
            patterns_list.append(labeled_peak)
    return confidences, ipeaks, patterns_list
