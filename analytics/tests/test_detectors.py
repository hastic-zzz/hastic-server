import unittest
import pandas as pd

from detectors import pattern_detector, threshold_detector, anomaly_detector
from analytic_types.detector import DetectionResult, ProcessingResult, Bound
from analytic_types.segment import Segment
from tests.test_dataset import create_dataframe, create_list_of_timestamps
from utils import convert_pd_timestamp_to_ms

class TestPatternDetector(unittest.TestCase):

    def test_small_dataframe(self):

        data = [[0,1], [1,2]]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'values'])
        cache = { 'windowSize': 10 }

        detector = pattern_detector.PatternDetector('GENERAL', 'test_id')
        with self.assertRaises(ValueError):
            detector.detect(dataframe, cache)

    def test_only_negative_segments(self):
        data_val = [0, 1, 2, 1, 2, 10, 1, 2, 1]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data = data)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000025, 'labeled': False, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]
        cache = {}
        detector = pattern_detector.PatternDetector('PEAK', 'test_id')
        excepted_error_message = 'test_id has no positive labeled segments. Pattern detector needs at least 1 positive labeled segment'

        try:
            detector.train(dataframe, segments, cache)
        except ValueError as e:
            self.assertEqual(str(e), excepted_error_message)

    def test_positive_and_negative_segments(self):
        data_val = [1.0, 1.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 1.0, 1.0, 5.0, 7.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000004, 'to': 1523889000006, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000001, 'to': 1523889000003, 'labeled': False, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]
        cache = {}
        detector = pattern_detector.PatternDetector('PEAK', 'test_id')
        try:
            detector.train(dataframe, segments, cache)
        except Exception as e:
            self.fail('detector.train fail with error {}'.format(e))

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
            'enableBounds': 'ALL',
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
            'enableBounds': 'ALL',
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
            'enableBounds': 'ALL',
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
            'enableBounds': 'ALL',
            'timeStep': 1,
            'seasonality': 5,
            'segments': [{ 'from': 1523889000001, 'to': 1523889000002,'data': [1] }]
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

    def test_get_seasonality_offset(self):
        detector = anomaly_detector.AnomalyDetector('test_id')
        from_timestamp = 1573700973027
        seasonality = 3600000
        data_start_time = 1573698780000
        time_step = 30000
        detected_offset = detector.get_seasonality_offset(from_timestamp, seasonality, data_start_time, time_step)
        expected_offset = 74
        self.assertEqual(detected_offset, expected_offset)

    def test_segment_generator(self):
        detector = anomaly_detector.AnomalyDetector('test_id')
        data = [1, 1, 5, 1, -4, 5, 5, 5, -3, 1]
        timestamps = create_list_of_timestamps(len(data))
        dataframe = create_dataframe(data)
        upper_bound = pd.Series([2, 2, 2, 2, 2, 2, 2, 2, 2, 2])
        lower_bound = pd.Series([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        segments = list(detector.detections_generator(dataframe, upper_bound, lower_bound, enabled_bounds=Bound.ALL))

        segments_borders = list(map(lambda s: [s.from_timestamp, s.to_timestamp], segments))
        self.assertEqual(segments_borders, [[timestamps[2], timestamps[2]], [timestamps[4], timestamps[8]]])

    def test_consume_data(self):
        cache =  {
            'confidence': 2,
            'alpha': 0.1,
            'enableBounds': 'ALL',
            'timeStep': 1
        }
        detector = anomaly_detector.AnomalyDetector('test_id')

        detect_result: DetectionResult = None
        for val in range(22):
            value = 1 if val != 10 else 5
            dataframe = pd.DataFrame({'value': [value], 'timestamp': [1523889000000 + val]})
            dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
            detect_result = detector.consume_data(dataframe, cache)

        detected_segments = list(map(lambda s: {'from': s.from_timestamp, 'to': s.to_timestamp}, detect_result.segments))
        result = [{ 'from': 1523889000010, 'to': 1523889000010 }]
        self.assertEqual(result, detected_segments)

    def test_get_segment_bound(self):
        detector = anomaly_detector.AnomalyDetector('test_id')
        peak_segment = pd.Series([1,2,3,4,3,2,1])
        trough_segment = pd.Series([4,3,2,1,2,3,4])
        expected_peak_segment_results = {
            'max_value': 3,
            'min_value': 1.5
        }
        expected_trough_segment_results = {
            'max_value': 3.5,
            'min_value': 2.75
        }
        peak_detector_result_upper = detector.get_segment_bound(peak_segment, Bound.UPPER)
        peak_detector_result_lower = detector.get_segment_bound(peak_segment, Bound.LOWER)
        trough_detector_result_upper = detector.get_segment_bound(trough_segment, Bound.UPPER)
        trough_detector_result_lower = detector.get_segment_bound(trough_segment, Bound.LOWER)

        self.assertGreaterEqual(
            max(peak_detector_result_upper),
            expected_peak_segment_results['max_value']
        )
        self.assertLessEqual(
            max(peak_detector_result_lower),
            expected_peak_segment_results['min_value']
        )
        self.assertGreaterEqual(
            max(trough_detector_result_upper),
            expected_trough_segment_results['max_value']
        )
        self.assertLessEqual(
            max(trough_detector_result_lower),
            expected_trough_segment_results['min_value']
        )

    def test_get_segment_bound_corner_cases(self):
        detector = anomaly_detector.AnomalyDetector('test_id')
        empty_segment = pd.Series([])
        same_values_segment = pd.Series([2,2,2,2,2,2])
        empty_detector_result_upper = detector.get_segment_bound(empty_segment, Bound.UPPER)
        empty_detector_result_lower = detector.get_segment_bound(empty_segment, Bound.LOWER)
        same_values_detector_result_upper = detector.get_segment_bound(same_values_segment, Bound.UPPER)
        same_values_detector_result_lower = detector.get_segment_bound(same_values_segment, Bound.LOWER)

        self.assertEqual(len(empty_detector_result_upper), 0)
        self.assertEqual(len(empty_detector_result_lower), 0)
        self.assertEqual(min(same_values_detector_result_upper), 0)
        self.assertEqual(max(same_values_detector_result_upper), 0)
        self.assertEqual(min(same_values_detector_result_lower), 0)
        self.assertEqual(max(same_values_detector_result_lower), 0)

if __name__ == '__main__':
    unittest.main()
