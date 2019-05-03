import logging as log

import pandas as pd
import numpy as np
from typing import Optional, List

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
        if len(dataframe) == 0:
            return None

        value = cache['value']
        condition = cache['condition']

        segments = []
        for index, row in dataframe.iterrows():
            current_timestamp = convert_pd_timestamp_to_ms(row['timestamp'])
            segment = { 'from': current_timestamp, 'to': current_timestamp }
            # TODO: merge segments
            if pd.isnull(row['value']):
                if condition == 'NO_DATA':
                    segment['params'] = { value: None }
                    segments.append(segment)
                continue

            current_value = row['value']
            segment['params'] = { value: row['value'] }
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

        last_entry = dataframe.iloc[-1]
        last_detection_time = convert_pd_timestamp_to_ms(last_entry['timestamp'])
        return {
            'cache': cache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        result = self.detect(data, cache)
        return result if result else None

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        return self.WINDOW_SIZE

    def get_intersections(self, segments: List[dict]) -> List[dict]:
        return segments
