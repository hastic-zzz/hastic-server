from typing import Generator
import pandas as pd

def get_data_chunks(dataframe: pd.DataFrame, window_size: int, chunk_size: int) -> Generator[pd.DataFrame, None, None]:
        """
        Return generator, that yields dataframe's chunks. Chunks split dataframe on intersected segments.
        """

        data_len = len(dataframe)

        if data_len < chunk_size:
            yield dataframe
            return

        nonintersected = chunk_size - window_size

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
