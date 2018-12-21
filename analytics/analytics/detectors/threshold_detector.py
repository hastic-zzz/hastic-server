import logging

import pandas as pd
from typing import Optional

from detectors import Detector
from models import ModelCache


logger = logging.getLogger('THRESHOLD_DETECTOR')


class ThresholdDetector(Detector):

    def __init__(self):
        pass

    def train(self, dataframe: pd.DataFrame, threshold: dict, cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                'value': threshold['value'],
                'condition': threshold['condition']
            }
        }

    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        value = cache['value']
        condition = cache['condition']

        last_entry = dataframe.iloc[-1]
        last_value = last_entry['value']
        # TODO: convert from nanoseconds to millisecond in a better way: not by dividing by 10^6
        last_time = last_entry['timestamp'].value / 1000000

        segment = (last_time, last_time)
        segments = []
        if condition == '>':
            if last_value > value:
                segments.append(segment)
        elif condition == '>=':
            if last_value >= value:
                segments.append(segment)
        elif condition == '=':
            if last_value == value:
                segments.append(segment)
        elif condition == '<=':
            if last_value <= value:
                segments.append(segment)
        elif condition == '<':
            if last_value < value:
                segments.append(segment)

        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': last_time
        }

    def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        return self.detect(self.bucket.data, cache)
