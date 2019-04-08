import unittest
from utils import intersected_chunks, chunks
import pandas as pd


class TestUtils(unittest.TestCase):

    def test_chunks_generator(self):
        window_size = 1
        chunk_size = 4

        cases = [
            (list(range(8)), [[0,1,2,3], [2,3,4,5], [4,5,6,7]]),
            ([], [[]]),
            (list(range(1)), [[0]]),
            (list(range(4)), [[0,1,2,3]]),
            (list(range(9)), [[0,1,2,3], [2,3,4,5], [4,5,6,7], [6,7,8]])
        ]

        for tested, expected in cases:
            tested_chunks = intersected_chunks(tested, window_size, chunk_size)
            self.assertSequenceEqual(tuple(tested_chunks), expected)


    def test_non_intersected_chunks(self):
        chunk_size = 4

        cases = [
            (tuple(range(12)), ((0,1,2,3), (4,5,6,7), (8,9,10,11))),
            (tuple(range(9)), ((0,1,2,3), (4,5,6,7), (8,))),
            (tuple(range(10)), ((0,1,2,3), (4,5,6,7), (8,9))),
            (tuple(range(11)), ((0,1,2,3), (4,5,6,7), (8,9,10))),
            ((), tuple()),
            (tuple(range(1)), ((0,),)),
            (tuple(range(4)), ((0,1,2,3),))
        ]

        for tested, expected in cases:
            tested_chunks = chunks(tested, chunk_size)
            self.assertSequenceEqual(tuple(tested_chunks), expected)

if __name__ == '__main__':
    unittest.main()
