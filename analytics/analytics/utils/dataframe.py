from itertools import chain
import pandas as pd
import numpy as np
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

def get_intersected_chunks(data: list, intersection: int, chunk_size: int) -> Generator[list, None, None]:
        """
        Returns generator that splits dataframe on intersected segments.
        Intersection makes it able to detect pattern that present in dataframe on the border between chunks.
        intersection - length of intersection.
        chunk_size - length of chunk
        """
        assert chunk_size > 0, 'chunk size must be great than zero'
        assert intersection > 0, 'intersection length must be great than zero'

        data_len = len(data)

        if data_len <= chunk_size:
            yield data
            return

        nonintersected = chunk_size - intersection

        offset = 0
        while True:
            left_values = data_len - offset
            if left_values == 0:
                break
            if left_values <= chunk_size:
                yield data[offset : data_len]
                break
            else:
                yield data[offset: offset + chunk_size]
                offset += min(nonintersected, left_values)

def get_chunks(data: list, chunk_size: int) -> Generator[list, None, None]:
    """
    Returns generator that splits dataframe on non-intersected segments.
    chunk_size - length of chunk
    """
    assert chunk_size > 0, 'chunk size must be great than zero'

    chunks_iterables = [iter(data)] * chunk_size
    result_chunks = zip(*chunks_iterables)
    partial_chunk_len = len(data) % chunk_size

    if partial_chunk_len != 0:
        result_chunks = chain(result_chunks, [data[-partial_chunk_len:]])

    for chunk in result_chunks:
        yield list(chunk)
