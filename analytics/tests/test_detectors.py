import unittest
import pandas as pd

from detectors import pattern_detector, threshold_detector

class TestPatternDetector(unittest.TestCase):

    def test_small_dataframe(self):

        data = [[0,1], [1,2]]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'values'])
        cache = {'windowSize': 10}

        detector = pattern_detector.PatternDetector('GENERAL', 'test_id')
        
        with self.assertRaises(ValueError):
            detector.detect(dataframe, cache)


class TestThresholdDetector(unittest.TestCase):

    def test_invalid_cache(self):

        detector = threshold_detector.ThresholdDetector()
        
        with self.assertRaises(ValueError):
            detector.detect([], None)

        with self.assertRaises(ValueError):
            detector.detect([], {})
