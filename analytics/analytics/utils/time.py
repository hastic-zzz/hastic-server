import pandas as pd
from typing import List

def convert_sec_to_ms(sec) -> int:
    return int(sec) * 1000

def convert_pd_timestamp_to_ms(timestamp: pd.Timestamp) -> int:
    # TODO: convert from nanoseconds to millisecond in a better way: not by dividing by 10^6
    return int(timestamp.value) // 1000000

def convert_series_to_timestamp_list(series: pd.Series) -> List[int]:
    timestamps = map(lambda value: convert_pd_timestamp_to_ms(value), series)
    return list(timestamps)
