import models

import asyncio
import logging
import config

import pandas as pd
from typing import Optional, Generator

from detectors import Detector
from analytic_types import DataBucket
from models import ModelCache
from utils import convert_pd_timestamp_to_ms
from analytic_types import AnalyticUnitId


logger = logging.getLogger('PATTERN_DETECTOR')


def resolve_model_by_pattern(pattern: str) -> models.Model:
    if pattern == 'GENERAL':
        return models.GeneralModel()
    if pattern == 'PEAK':
        return models.PeakModel()
    if pattern == 'TROUGH':
        return models.TroughModel()
    if pattern == 'DROP':
        return models.DropModel()
    if pattern == 'JUMP':
        return models.JumpModel()
    if pattern == 'CUSTOM':
        return models.CustomModel()
    raise ValueError('Unknown pattern "%s"' % pattern)


class PatternDetector(Detector):

    MIN_BUCKET_SIZE = 150
    BUCKET_WINDOW_SIZE_FACTOR = 5
    DEFAULT_WINDOW_SIZE = 1

    def __init__(self, pattern_type: str, analytic_unit_id: AnalyticUnitId):
        self.analytic_unit_id = analytic_unit_id
        self.pattern_type = pattern_type
        self.model = resolve_model_by_pattern(self.pattern_type)
        self.bucket = DataBucket()

    def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[models.ModelCache]) -> models.ModelCache:
        # TODO: pass only part of dataframe that has segments
        new_cache = self.model.fit(dataframe, segments, self.analytic_unit_id, cache)
        if new_cache == None or len(new_cache) == 0:
            logging.warning('new_cache is empty with data: {}, segments: {}, cache: {}, analytic unit: {}'.format(dataframe, segments, cache, self.analytic_unit_id))
        return {
            'cache': new_cache
        }

    def detect(self, dataframe: pd.DataFrame, cache: Optional[models.ModelCache]) -> dict:
        logger.debug('Unit {} got {} data points for detection'.format(self.analytic_unit_id, len(dataframe)))
        # TODO: split and sleep (https://github.com/hastic/hastic-server/pull/124#discussion_r214085643)

        if cache is None or cache == {}:
            msg = f'{self.analytic_unit_id} detection got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        window_size = cache.get('WINDOW_SIZE')
        if window_size is None:
            message = '{} got cache without WINDOW_SIZE for detection'.format(self.analytic_unit_id)
            logger.error(message)
            raise ValueError(message)

        if len(dataframe) < window_size * 2:
            message = f'{self.analytic_unit_id} skip detection: data length: {len(dataframe)} less than WINDOW_SIZE: {window_size}'
            logger.error(message)
            raise ValueError(message)

        detected = self.model.detect(dataframe, self.analytic_unit_id, cache)

        segments = [{ 'from': segment[0], 'to': segment[1] } for segment in detected['segments']]
        newCache = detected['cache']
        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = convert_pd_timestamp_to_ms(last_dataframe_time)
        return {
            'cache': newCache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        logging.debug('Start consume_data for analytic unit {}'.format(self.analytic_unit_id))

        if cache is None or cache == {}:
            logging.debug(f'consume_data get invalid cache {cache} for task {self.analytic_unit_id}, skip')
            return None

        data_without_nan = data.dropna()

        if len(data_without_nan) == 0:
            return None

        self.bucket.receive_data(data_without_nan)

        window_size = cache['WINDOW_SIZE']

        bucket_len = len(self.bucket.data)
        if bucket_len < window_size * 2:
            msg = f'{self.analytic_unit_id} bucket data {bucket_len} less than two window size {window_size * 2}, skip run detection from consume_data'
            logger.debug(msg)
            return None

        res = self.detect(self.bucket.data, cache)

        bucket_size = max(window_size * self.BUCKET_WINDOW_SIZE_FACTOR, self.MIN_BUCKET_SIZE)
        if bucket_len > bucket_size:
            excess_data = bucket_len - bucket_size
            self.bucket.drop_data(excess_data)

        logging.debug('End consume_data for analytic unit: {} with res: {}'.format(self.analytic_unit_id, res))

        if res:
            return res
        else:
            return None

    def get_window_size(self, cache: Optional[ModelCache]) -> int:
        if cache is None: return self.DEFAULT_WINDOW_SIZE
        return cache.get('WINDOW_SIZE', self.DEFAULT_WINDOW_SIZE)
