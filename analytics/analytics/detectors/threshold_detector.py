import logging as log

import pandas as pd
from typing import Optional

from detectors import Detector
from models import ModelCache
from time import time


logger = log.getLogger('THRESHOLD_DETECTOR')


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

        dataframe_without_nans = dataframe.dropna()
        if len(dataframe_without_nans) == 0:
            return dict()
        last_entry = dataframe_without_nans.iloc[-1]
        last_value = last_entry['value']

        now = int(time()) * 1000
        segment = ({ 'from': now, 'to': now })
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
            'lastDetectionTime': now
        }

    def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        result = self.detect(data, cache)
        return result if result else None
