import unittest
from utils import get_data_chunks
import pandas as pd


class TestUtils(unittest.TestCase):

    def test_chunks_generator(self):
        window_size = 1
        chunk_window_size_factor = 3

        cases = [
            (list(range(7)), [[0,1,2], [2,3,4], [4,5,6]]),
            ([], [[]]),
            (list(range(1)), [[0]]),
            (list(range(3)), [[0,1,2]]),
            (list(range(8)), [[0,1,2], [2,3,4], [4,5,6], [6,7]]),
            (list(range(6)), [[0,1,2], [2,3,4], [4,5]])
        ]

        for data, expected_chunks in cases:
            data = [(x,x) for x in data]
            data = pd.DataFrame(data, columns=['timestamp', 'value'])

            df_expected_chunks = []
            for chunk in expected_chunks:
                chunk = [(x,x) for x in chunk]
                df_expected_chunks.append(chunk)
            df_expected_chunks = [pd.DataFrame(chunk, columns=['timestamp', 'value']) for chunk in df_expected_chunks]
            chunks = tuple(get_data_chunks(data, window_size, window_size * chunk_window_size_factor))
            df_expected_chunks = [df.reset_index() for df in df_expected_chunks]

            zipped = zip(chunks, df_expected_chunks)
            map(lambda a,b: self.assertTrue(a.equals(b)), zipped)



if __name__ == '__main__':
    unittest.main()
