from typing import Generator
import pandas as pd

def get_data_chunks(dataframe: pd.DataFrame, window_size: int, chunk_size: int) -> Generator[pd.DataFrame, None, None]:
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
                yield dataframe[offset : data_len].reset_index()
                break
            else:
                yield dataframe[offset: offset + chunk_size].reset_index()
                offset += min(nonintersected, left_values)
