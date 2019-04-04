import unittest
<<<<<<< HEAD
from utils import get_data_chunks
=======
from detectors.pattern_detector import PatternDetector
>>>>>>> a1957005dfd8368818992c1af069f0a143b8f19c

def rlist(start, stop):
        return [x for x in range(start, stop + 1)]
class TestUtils(unittest.TestCase):

    def test_chunks_generator(self):
        window_size = 1
        chunk_window_size_factor = 3

        cases = [
            ([x for x in range(7)], [[0,1,2], [2,3,4], [4,5,6]]),
            ([], [[]]),
            ([x for x in range(1)], [[0]]),
            ([x for x in range(3)], [[0,1,2]]),
            ([x for x in range(8)], [[0,1,2], [2,3,4], [4,5,6], [6,7]]),
            ([x for x in range(6)], [[0,1,2], [2,3,4], [4,5]])
        ]

        for data, expected_chunks in cases:
            chunks = tuple(get_data_chunks(data, window_size, chunk_window_size_factor))
            self.assertSequenceEqual(chunks, expected_chunks)


if __name__ == '__main__':
    unittest.main()
