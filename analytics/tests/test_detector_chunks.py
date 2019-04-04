import unittest
from detectors.pattern_detector import PatternDetector

def rlist(start, stop):
        return [x for x in range(start, stop + 1)]
class TestUtils(unittest.TestCase):

    def test_chunks_generator(self):
        window_size = 1

        cases = [
            ([], [[]]),
            (rlist(0, 300), [rlist(0,99),rlist(99,198),rlist(198,297),rlist(297,300)])
        ]

        for data, expected_chunks in cases:
            chunks = tuple(PatternDetector._PatternDetector__get_data_chunks(None, data, window_size))
            self.assertSequenceEqual(chunks, expected_chunks)


if __name__ == '__main__':
    unittest.main()
