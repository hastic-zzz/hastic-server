import pandas as pd

from utils.common import timestamp_to_index

def parse_segment(segment: dict, dataframe: pd.DataFrame):
    start = timestamp_to_index(dataframe, pd.to_datetime(segment['from'], unit='ms'))
    end = timestamp_to_index(dataframe, pd.to_datetime(segment['to'], unit='ms'))
    data = dataframe['value'][start: end + 1]
    return start, end, data
