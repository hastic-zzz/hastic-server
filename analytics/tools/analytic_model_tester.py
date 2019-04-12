import pandas as pd
import numpy as np
import sys
ANALYTICS_PATH = '../analytics'
sys.path.append(ANALYTICS_PATH)
import utils
import models
TESTS_PATH = '../tests'
sys.path.append(TESTS_PATH)
import test_dataset
from test_dataset import create_dataframe

#getFrame
#getSegment
PEAK_DATASETS = []
TEST_DATA = create_dataframe([0, 3, 5, 7, 5, 3, 0, 0, 1, 0, 1, 4, 6, 8, 6, 4, 1, 0, 0, 0, 1, 0, 3, 5, 7, 5, 3, 0, 1, 1])
POSITIVE_SEGMENTS = [(1523889000000, 1523889000006), (1523889000021, 1523889000027)]
NEGATIVE_SEGMENTS = [(1523889000009, 1523889000017)]

class Segment():

    def __init__(self, start: int, end: int, ltype: bool):
        self.start = start
        #1523889000000 + start * 1000
        self.end = end
        #1523889000000 + end * 1000
        self.ltype = ltype

    def getSegment(self):
        return {'_id': 'q', 'analyticUnitId': 'q',
                'from': self.start,
                'to': self.end,
                'labeled': self.ltype,
                'deleted': not self.ltype}

class Metric():

    def __init__(self, true_result, model_result):
        self.true_result = true_result
        self.model_result = model_result['segments']

    def getAmount(self):
        return len(self.model_result) / len(self.true_result)

    def getAccuracy(self):
        correct_segment = 0
        invalid_segment = 0
        for segment in self.model_result:
            current_cs = correct_segment
            for pattern in self.true_result:
                if pattern[0] <= segment[0] and pattern[1] >= segment[1]:
                    correct_segment += 1
                    break
            if correct_segment == current_cs:
                invalid_segment += 1
        non_detected = len(self.true_result) - correct_segment
        return (correct_segment, invalid_segment, non_detected)

class DataForModels():

    def __init__(self, frame: pd.DataFrame, positive_segments, negative_segments, model_type: str):
        self.frame = frame
        self.positive_segments = positive_segments
        self.negative_segments = negative_segments
        self.model_type = model_type

    def getFrame(self) -> pd.DataFrame:
        return self.frame

    def getSegmentsForDetection(self, positive_amount, negative_amount):
        segments = []
        for idx, bounds in enumerate(self.positive_segments):
            if idx >= positive_amount:
                break
            segments.append(Segment(bounds[0], bounds[1], True).getSegment())

        for idx, bounds in enumerate(self.negative_segments):
            if idx >= negative_amount:
                break
            segments.append(Segment(bounds[0], bounds[1], False).getSegment())

        return segments
    
    def getAllCorrectSegments(self):

        return self.positive_segments

PEAK_DATA_1 = DataForModels(TEST_DATA, POSITIVE_SEGMENTS, NEGATIVE_SEGMENTS, 'peak')
PEAK_DATASETS.append(PEAK_DATA_1)

def main(model_type: str) -> None:
    table_metric = []
    if model_type == 'peak':
        for data in PEAK_DATASETS:
            dataset = data.getFrame()
            segments = data.getSegmentsForDetection(1, 0)
            model = models.PeakModel()
            cache = model.fit(dataset, segments, 'test', {})
            detect_result = model.detect(dataset, 'test', cache)
            peak_metric = Metric(data.getAllCorrectSegments(), detect_result)
            table_metric.append((peak_metric.getAmount(), peak_metric.getAccuracy()))
    return table_metric

if __name__ == "__main__":
    correct_name = ['peak', 'trough', 'jump', 'drop', 'general', 'gen']
    if len(sys.argv) < 2:
        print('Enter one of models name: {}'.format(correct_name))
        sys.exit(1)
    model_type = str(sys.argv[1]).lower()
    if model_type in correct_name:
        print(main(model_type))
    else:
        print('Enter one of models name: {}'.format(correct_name))



