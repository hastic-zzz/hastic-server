import sys
ANALYTICS_PATH = '../analytics'
TESTS_PATH = '../tests'
sys.path.extend([ANALYTICS_PATH, TESTS_PATH])

import pandas as pd
import numpy as np
import asyncio
from typing import List, Tuple

import utils
from analytic_types.segment import Segment
from analytic_unit_manager import AnalyticUnitManager

START_TIMESTAMP = 1523889000000
# TODO: get_dataset
# TODO: get_segment
PEAK_DATASETS = []
# dataset with 3 peaks
TEST_DATA = [0, 0, 3, 5, 7, 5, 3, 0, 0, 1, 0, 1, 4, 6, 8, 6, 4, 1, 0, 0, 0, 1, 0, 3, 5, 7, 5, 3, 0, 1, 1]
# TODO: more convenient way to specify labeled segments
POSITIVE_SEGMENTS = [{ 'from': 1, 'to': 7 }, { 'from': 22, 'to': 28 }]
NEGATIVE_SEGMENTS = [{ 'from': 11, 'to': 17 }]

class TesterSegment():

    def __init__(self, start: int, end: int, labeled: bool):
        self.start = start
        self.end = end
        self.labeled = labeled

    def get_segment(self):
        return {
            '_id': 'q',
            'analyticUnitId': 'q',
            'from': START_TIMESTAMP + self.start,
            'to': START_TIMESTAMP + self.end,
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

    def __init__(self, data_values: List[float], positive_segments, negative_segments, model_type: str):
        self.data_values = data_values
        self.positive_segments = positive_segments
        self.negative_segments = negative_segments
        self.model_type = model_type

    def get_segments_for_detection(self, positive_amount, negative_amount):
        positive_segments = [segment for idx, segment in enumerate(self.get_positive_segments()) if idx < positive_amount]
        negative_segments = [segment for idx, segment in enumerate(self.get_negative_segments()) if idx < negative_amount]
        return positive_segments + negative_segments

    def get_formated_segments(self, segments, positive: bool):
        return [TesterSegment(segment['from'], segment['to'], positive).get_segment() for segment in segments]

    def get_positive_segments(self):
        return self.get_formated_segments(self.positive_segments, True)

    def get_negative_segments(self):
        return self.get_formated_segments(self.negative_segments, False)

    def get_timestamp_values_list(self) -> List[Tuple[int, float]]:
        data_timestamp_list = [START_TIMESTAMP + i for i in range(len(self.data_values))]
        return list(zip(data_timestamp_list, self.data_values))

    def get_task(self, task_type: str, cache = None) -> dict:
        data = self.get_timestamp_values_list()
        start_timestamp, end_timestamp = data[0][0], data[-1][0]
        analytic_unit_type = self.model_type.upper()
        task = {
            'analyticUnitId': 'testUnitId',
            'type': task_type,
            'payload': {
                'data': data,
                'from': start_timestamp,
                'to': end_timestamp,
                'analyticUnitType': analytic_unit_type,
                'detector': 'pattern',
                'cache': cache
            },
            '_id': 'testId'
        }
        # TODO: enum for task_type
        if(task_type == 'LEARN'):
            segments = self.get_segments_for_detection(1, 0)
            task['payload']['segments'] = segments
        return task

PEAK_DATA_1 = ModelData(TEST_DATA, POSITIVE_SEGMENTS, NEGATIVE_SEGMENTS, 'peak')
PEAK_DATASETS.append(PEAK_DATA_1)

async def main(model_type: str) -> None:
    table_metric = []
    if model_type == 'peak':
        for data in PEAK_DATASETS:
            manager = AnalyticUnitManager()
            learning_task = data.get_task('LEARN')
            learning_result = await manager.handle_analytic_task(learning_task)
            detect_task = data.get_task('DETECT', learning_result['payload']['cache'])
            detect_result = await manager.handle_analytic_task(detect_task)
            peak_metric = Metric(data.get_positive_segments(), detect_result['payload'])
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
    loop = asyncio.get_event_loop()
    if model_type in correct_name:
        result = loop.run_until_complete(main(model_type))
        print(result)
    else:
        print('Enter one of models name: {}'.format(correct_name))


