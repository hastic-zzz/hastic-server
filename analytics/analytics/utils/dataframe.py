from itertools import chain
import pandas as pd
from typing import Generator

def prepare_data(data: list) -> pd.DataFrame:
    """
        Takes list
        - converts it into pd.DataFrame,
        - converts 'timestamp' column to pd.Datetime,
        - subtracts min value from the dataset
    """
    data = pd.DataFrame(data, columns=['timestamp', 'value'])
    data['timestamp'] = pd.to_datetime(data['timestamp'], unit='ms')
    data.fillna(value = np.nan, inplace = True)
    return data

def intersected_chunks(dataframe: list, window_size: int, chunk_size: int) -> Generator[pd.DataFrame, None, None]:
        """
        Returns generator that splits dataframe on intersected segments.
        Intersection makes it able to detect pattern that present in dataframe on the border between chunks.
        window_size - length of intersection. 
        chunk_size - length of chunk
        """

        data_len = len(dataframe)

        if data_len <= chunk_size:
            yield dataframe
            return

        nonintersected = chunk_size - 2 * window_size

        offset = 0
        while True:
            left_values = data_len - offset
            if left_values == 0:
                break
            if left_values <= chunk_size:
                yield dataframe[offset : data_len]
                break
            else:
                yield dataframe[offset: offset + chunk_size]
                offset += min(nonintersected, left_values)

def chunks(dataframe: pd.DataFrame, chunk_size: int) -> Generator[pd.DataFrame, None, None]:
    chunks_iterables = [iter(dataframe)] * chunk_size
    full_chunks = zip(*chunks_iterables)
    partial_chunk_len = len(dataframe) % chunk_size
    if partial_chunk_len != 0:
        return chain(full_chunks, (tuple(dataframe[-partial_chunk_len:]),))
    return full_chunks
