from typing import Generator
import pandas as pd

def get_data_chunks(dataframe: pd.DataFrame, window_size: int, chunk_size: int) -> Generator[pd.DataFrame, None, None]:
        """
        Returns generator, that yields dataframe's chunks. Chunks intersects, length of intersection is window_size.
        Example: recieved: [0,1,2,3,4,5,6,7] returned: [[0,1,2], [2,3,4], [4,5,6], [6,7]].
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
                yield dataframe[offset : data_len].reset_index()
                break
            else:
                yield dataframe[offset: offset + chunk_size].reset_index()
                offset += min(nonintersected, left_values)
