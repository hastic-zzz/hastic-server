import pandas as pd
import numpy as np
import scipy.signal
from scipy.fftpack import fft, fftshift
from scipy.signal import argrelextrema
import datetime
from datetime import datetime
import time
import sys
ANALYTICS_PATH = '../analytics'
sys.path.append(ANALYTICS_PATH)
import utils
import models

#getFrame
#getSegment

class Segment():

    def __init__(self, start, end, ltype):
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
        self.model_result = model_result

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

    def __init__(self, frame, positive_segments, negative_segments):
        self.frame = frame
        self.positive_segments = positive_segments
        self.negative_segments = negative_segments

    def getFrame(self):
        return self.frame

    def getSegments(self):
        return self.positive_segments, self.negative_segments

def main(model_type: str) -> None:
    peak_datasets = [] # add all datasets and segments for peak model
    table_metric = []
    for data in peak_datasets:
        data = data.getFrame()
        positive_segments = data.getSegments()[0]
        negative_segments = data.getSegments()[1]
        positive_segments = Segment(positive_segments[0], positive_segments[1], True)
        negative_segments = Segment(negative_segments[0], negative_segments[1], False)
        segments = [positive_segments, negative_segments]
        model = models.PeakModel()
        cache = model.fit(data, segments, 'test', {})
        detect_result = model.detect(data, 'test', cache)
        peak_metric = Metric(data.getSegment(), detect_result)
        table_metric.append(peak_metric.getAmount(), peak_metric.getAccuracy())


if __name__ == "__main__":
    model_type = str(sys.argv[1]).lower()
    correct_name = ['peak', 'trough', 'jump', 'drop', 'general', 'gen']
    if model_type in correct_name:
        main(model_type)
    else:
        print('Enter one of models name: {}'.format(correct_name))



