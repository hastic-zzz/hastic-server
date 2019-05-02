import logging as log

import pandas as pd
import numpy as np
from typing import Optional

from detectors import Detector
from models import ModelCache
from time import time
from utils import convert_sec_to_ms, convert_pd_timestamp_to_ms


logger = log.getLogger('THRESHOLD_DETECTOR')


class ThresholdDetector(Detector):

    WINDOW_SIZE = 3

    def __init__(self):
        pass

    def train(self, dataframe: pd.DataFrame, threshold: dict, cache: Optional[ModelCache]) -> ModelCache:
        return {
            'cache': {
                'value': threshold['value'],
                'condition': threshold['condition']
            }
        }

    def detect(self, dataframe: pd.DataFrame, cache: ModelCache) -> dict:
        if cache is None or cache == {}:
            raise ValueError('Threshold detector error: cannot detect before learning')
        value = cache['value']
        condition = cache['condition']

        segments = []
        for index, row in dataframe.iterrows():
            current_timestamp = convert_pd_timestamp_to_ms(row['timestamp'])
            # TODO: merge segments
            segment = { 'from': current_timestamp, 'to': current_timestamp , 'params': { value: row['value'] } }
            if pd.isnull(row['value']):
                if condition == 'NO_DATA':
                    segments.append(segment)
                continue

            current_value = float(row['value'])
            if condition == '>':
                if current_value > value:
                    segments.append(segment)
            elif condition == '>=':
                if current_value >= value:
                    segments.append(segment)
            elif condition == '=':
                if current_value == value:
                    segments.append(segment)
            elif condition == '<=':
                if current_value <= value:
                    segments.append(segment)
            elif condition == '<':
                if current_value < value:
                    segments.append(segment)

        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': convert_pd_timestamp_to_ms(dataframe.iloc[-1]['timestamp'])
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        result = self.detect(data, cache)
        return result if result else None

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        return self.WINDOW_SIZE
