import unittest
import pandas as pd

from detectors import pattern_detector, threshold_detector, anomaly_detector
from analytic_types.detector_typing import DetectionResult, ProcessingResult

class TestPatternDetector(unittest.TestCase):

    def test_small_dataframe(self):

        data = [[0,1], [1,2]]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'values'])
        cache = { 'windowSize': 10 }

        detector = pattern_detector.PatternDetector('GENERAL', 'test_id')
        with self.assertRaises(ValueError):
            detector.detect(dataframe, cache)


class TestThresholdDetector(unittest.TestCase):

    def test_invalid_cache(self):

        detector = threshold_detector.ThresholdDetector('test_id')

        with self.assertRaises(ValueError):
            detector.detect([], None)

        with self.assertRaises(ValueError):
            detector.detect([], {})


class TestAnomalyDetector(unittest.TestCase):

    def test_detect(self):
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

        detect_result: DetectionResult = detector.detect(dataframe, cache)
        detected_segments = list(map(lambda s: {'from': s.from_timestamp, 'to': s.to_timestamp}, detect_result.segments))
        result = [{ 'from': 1523889000005.0, 'to': 1523889000005.0 }]
        self.assertEqual(result, detected_segments)

        cache =  {
            'confidence': 2,
            'alpha': 0.1,
            'timeStep': 1,
            'seasonality': 4,
            'segments': [{ 'from': 1523889000001, 'to': 1523889000002, 'data': [10] }]
        }
        detect_result: DetectionResult = detector.detect(dataframe, cache)
        detected_segments = list(map(lambda s: {'from': s.from_timestamp, 'to': s.to_timestamp}, detect_result.segments))
        result = []
        self.assertEqual(result, detected_segments)

    def test_process_data(self):
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
        detect_result: ProcessingResult = detector.process_data(dataframe, cache)
        expected_result = {
            'lowerBound': [
                (1523889000000, -2.0),
                (1523889000001, -1.9),
                (1523889000002, -1.71),
                (1523889000003, -1.6389999999999998),
                (1523889000004, -1.4750999999999999),
                (1523889000005, -0.5275899999999998),
                (1523889000006, -0.5748309999999996),
                (1523889000007, -0.5173478999999996),
                (1523889000008, -0.5656131099999995)
            ],
            'upperBound': [
                (1523889000000, 2.0),
                (1523889000001, 2.1),
                (1523889000002, 2.29),
                (1523889000003, 2.361),
                (1523889000004, 2.5249),
                (1523889000005, 3.47241),
                (1523889000006, 3.4251690000000004),
                (1523889000007, 3.4826521),
                (1523889000008, 3.4343868900000007)
            ]}
        self.assertEqual(detect_result.to_json(), expected_result)

        cache =  {
            'confidence': 2,
            'alpha': 0.1,
            'timeStep': 1,
            'seasonality': 5,
            'segments': [{ 'from': 1523889000001, 'to': 1523889000002, 'data': [1] }]
        }
        detect_result: ProcessingResult = detector.process_data(dataframe, cache)
        expected_result = {
            'lowerBound': [
                (1523889000000, -2.0),
                (1523889000001, -2.9),
                (1523889000002, -1.71),
                (1523889000003, -1.6389999999999998),
                (1523889000004, -1.4750999999999999),
                (1523889000005, -0.5275899999999998),
                (1523889000006, -1.5748309999999996),
                (1523889000007, -0.5173478999999996),
                (1523889000008, -0.5656131099999995)
            ],
            'upperBound': [
                (1523889000000, 2.0),
                (1523889000001, 3.1),
                (1523889000002, 2.29),
                (1523889000003, 2.361),
                (1523889000004, 2.5249),
                (1523889000005, 3.47241),
                (1523889000006, 4.425169),
                (1523889000007, 3.4826521),
                (1523889000008, 3.4343868900000007)
            ]}
        self.assertEqual(detect_result.to_json(), expected_result)
