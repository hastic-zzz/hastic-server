import unittest
from detectors.pattern_detector import PatternDetector

class TestUtils(unittest.TestCase):

    def test_chunks_generator(self):
        window_size = 1

        cases = [
            ([x for x in range(7)], [[0,1,2], [2,3,4], [4,5,6]]),
            ([], [[]]),
            ([x for x in range(1)], [[0]]),
            ([x for x in range(3)], [[0,1,2]]),
            ([x for x in range(8)], [[0,1,2], [2,3,4], [4,5,6], [6,7]]),
            ([x for x in range(6)], [[0,1,2], [2,3,4], [4,5]])
        ]

        for data, expected_chunks in cases:
            chunks = tuple(PatternDetector._PatternDetector__get_data_chunks(None, data, window_size))
            self.assertSequenceEqual(chunks, expected_chunks)

    def test_detector(self):
        pass

if __name__ == '__main__':
    unittest.main()
