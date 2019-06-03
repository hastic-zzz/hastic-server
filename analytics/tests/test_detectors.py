import unittest
import pandas as pd

from detectors import pattern_detector, threshold_detector, anomaly_detector

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


class TestAnomalyDetector(unittest.TestCase):

    def test_dataframe(self):
        data_val = [0, 1, 2, 1, 2, 10, 1, 2, 1]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data = data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        cache =  {
            'confidence': 2,
            'alpha': 0.1,
            'timeStep': 1
        }
        detector = anomaly_detector.AnomalyDetector('test_id')
        detect_result = detector.detect(dataframe, cache)
        result = [{ 'from': 1523889000005.0, 'to': 1523889000005.0 }]
        self.assertEqual(result, detect_result.to_json()['segments'])
