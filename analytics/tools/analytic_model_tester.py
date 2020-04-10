import sys
ANALYTICS_PATH = '../analytics'
TESTS_PATH = '../tests'
sys.path.extend([ANALYTICS_PATH, TESTS_PATH])

import pandas as pd
import numpy as np
import utils
import test_dataset
from analytic_types.segment import Segment
from detectors import pattern_detector, threshold_detector, anomaly_detector

# TODO: get_dataset
# TODO: get_segment
PEAK_DATASETS = []
# dataset with 3 peaks
TEST_DATA = test_dataset.create_dataframe([0, 0, 3, 5, 7, 5, 3, 0, 0, 1, 0, 1, 4, 6, 8, 6, 4, 1, 0, 0, 0, 1, 0, 3, 5, 7, 5, 3, 0, 1, 1])
# TODO: more convenient way to specify labeled segments
POSITIVE_SEGMENTS = [{'from': 1523889000001, 'to': 1523889000007}, {'from': 1523889000022, 'to': 1523889000028}]
NEGATIVE_SEGMENTS = [{'from': 1523889000011, 'to': 1523889000017}]

class TesterSegment():

    def __init__(self, start: int, end: int, labeled: bool):
        self.start = start
        self.end = end
        self.labeled = labeled

    def get_segment(self):
        return {
            '_id': 'q',
            'analyticUnitId': 'q',
            'from': self.start,
            'to': self.end,
            'labeled': self.labeled,
            'deleted': not self.labeled
        }

class Metric():

    def __init__(self, expected_result, detector_result):
        self.expected_result = expected_result
        self.detector_result = detector_result['segments']

    def get_amount(self):
        return len(self.detector_result) / len(self.expected_result)

    def get_accuracy(self):
        correct_segment = 0
        invalid_segment = 0
        for segment in self.detector_result:
            current_cs = correct_segment
            for pattern in self.expected_result:
                if pattern['from'] <= segment['from'] and pattern['to'] >= segment['to']:
                    correct_segment += 1
                    break
            if correct_segment == current_cs:
                invalid_segment += 1
        non_detected = len(self.expected_result) - correct_segment
        return (correct_segment, invalid_segment, non_detected)

class ModelData():

    def __init__(self, frame: pd.DataFrame, positive_segments, negative_segments, model_type: str):
        self.frame = frame
        self.positive_segments = positive_segments
        self.negative_segments = negative_segments
        self.model_type = model_type

    def get_segments_for_detection(self, positive_amount, negative_amount):
        segments = []
        for idx, bounds in enumerate(self.positive_segments):
            if idx >= positive_amount:
                break
            segments.append(TesterSegment(bounds['from'], bounds['to'], True).get_segment())

        for idx, bounds in enumerate(self.negative_segments):
            if idx >= negative_amount:
                break
            segments.append(TesterSegment(bounds['from'], bounds['to'], False).get_segment())

        return segments

    def get_all_correct_segments(self):
        return self.positive_segments

PEAK_DATA_1 = ModelData(TEST_DATA, POSITIVE_SEGMENTS, NEGATIVE_SEGMENTS, 'peak')
PEAK_DATASETS.append(PEAK_DATA_1)

def main(model_type: str) -> None:
    table_metric = []
    if model_type == 'peak':
        for data in PEAK_DATASETS:
            dataset = data.frame
            segments = data.get_segments_for_detection(1, 0)
            segments = [Segment.from_json(segment) for segment in segments]
            detector = pattern_detector.PatternDetector('PEAK', 'test_id')
            training_result = detector.train(dataset, segments, {})
            cache = training_result['cache']
            detect_result = detector.detect(dataset, cache)
            detect_result = detect_result.to_json()
            peak_metric = Metric(data.get_all_correct_segments(), detect_result)
            table_metric.append((peak_metric.get_amount(), peak_metric.get_accuracy()))
    return table_metric

if __name__ == '__main__':
    '''
        This tool applies the model on datasets and verifies that the detection result corresponds to the correct values.
        sys.argv[1] expects one of the models name -> see correct_name
    '''
    # TODO: use enum
    correct_name = ['peak', 'trough', 'jump', 'drop', 'general']
    if len(sys.argv) < 2:
        print('Enter one of models name: {}'.format(correct_name))
        sys.exit(1)
    model_type = str(sys.argv[1]).lower()
    if model_type in correct_name:
        print(main(model_type))
    else:
        print('Enter one of models name: {}'.format(correct_name))


