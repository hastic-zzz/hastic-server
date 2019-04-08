import unittest
import pandas as pd

from detectors import pattern_detector

class TestPatternDetector(unittest.TestCase):

    def test_small_dataframe(self):

        data = [[0,1], [1,2]]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'values'])
        cache = {'WINDOW_SIZE': 10}

        detector = pattern_detector.PatternDetector('GENERAL', 'test_id')
        
        with self.assertRaises(ValueError):
            detector.detect(dataframe, cache)
