from typing import Generator
import pandas as pd

def get_data_chunks(dataframe: pd.DataFrame, window_size: int, chunk_window_size_factor: int) -> Generator[pd.DataFrame, None, pd.DataFrame]:
        """
        TODO: fix description
        Return generator, that yields dataframe's chunks. Chunks have 100 WINDOW_SIZE length and 99 WINDOW_SIZE step.
        """
        chunk_size = window_size * chunk_window_size_factor
        intersection = window_size

        data_len = len(dataframe)

        if data_len < chunk_size:
            yield dataframe
            return

        nonintersected = chunk_size - intersection

        offset = 0
        while True:
            left_values = data_len - offset
            if left_values == 0:
                break
            if left_values <= chunk_size:
                yield dataframe[offset:]
                break
            else:
                yield dataframe[offset: offset + chunk_size]
                offset += min(nonintersected, left_values)
