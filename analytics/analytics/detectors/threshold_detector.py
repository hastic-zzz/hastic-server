import logging as log

import pandas as pd
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
        if cache == None:
            raise 'Threshold detector error: cannot detect before learning'
        value = cache['value']
        condition = cache['condition']

        now = convert_sec_to_ms(time())
        segments = []

        dataframe_without_nans = dataframe.dropna()
        if len(dataframe_without_nans) == 0:
            if condition == 'NO_DATA':
                segments.append({ 'from': now, 'to': now , 'params': { value: 'NO_DATA' } })
            else:
                return None
        else:
            last_entry = dataframe_without_nans.iloc[-1]
            last_time = convert_pd_timestamp_to_ms(last_entry['timestamp'])
            last_value = float(last_entry['value'])
            segment = { 'from': last_time, 'to': last_time, 'params': { value: last_value } }

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

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        return self.WINDOW_SIZE
