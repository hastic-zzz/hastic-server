import models

import asyncio
import logging
import config

import pandas as pd
from typing import Optional, Generator

from detectors import Detector
from buckets import DataBucket
from models import ModelCache
from utils import convert_pd_timestamp_to_ms


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

AnalyticUnitId = str
class PatternDetector(Detector):

    MIN_BUCKET_SIZE = 150

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

    async def detect(self, dataframe: pd.DataFrame, cache: Optional[models.ModelCache]) -> dict:
        logger.debug('Unit {} got {} data points for detection'.format(self.analytic_unit_id, len(dataframe)))
        # TODO: split and sleep (https://github.com/hastic/hastic-server/pull/124#discussion_r214085643)

        if not cache:
            msg = f'{self.analytic_unit_id} detection got invalid cache {cache}, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        window_size = cache.get('WINDOW_SIZE')

        if not window_size:
            msg = f'{self.analytic_unit_id} detection got invalid window size {window_size}'

        chunks = self.__get_data_chunks(dataframe, window_size)

        segments = []
        segment_parser = lambda segment: { 'from': segment[0], 'to': segment[1] }
        for chunk in chunks:
            await asyncio.sleep(0)
            detected = self.model.detect(dataframe, self.analytic_unit_id, cache)
            for detected_segment in detected['segments']:
                detected_segment = segment_parser(detected_segment)
                if detected_segment not in segments:
                    segments.append(detected_segment)

        newCache = detected['cache']

        last_dataframe_time = dataframe.iloc[-1]['timestamp']
        last_detection_time = convert_pd_timestamp_to_ms(last_dataframe_time)
        return {
            'cache': newCache,
            'segments': segments,
            'lastDetectionTime': last_detection_time
        }

    def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        logging.debug('Start recieve_data for analytic unit {}'.format(self.analytic_unit_id))
        data_without_nan = data.dropna()

        if len(data_without_nan) == 0:
            return None

        self.bucket.receive_data(data_without_nan)
        if cache == None:
            logging.debug('Recieve_data cache is None for task {}'.format(self.analytic_unit_id))
            cache = {}
        bucket_size = max(cache.get('WINDOW_SIZE', 0) * 3, self.MIN_BUCKET_SIZE)

        res = self.detect(self.bucket.data, cache)

        if len(self.bucket.data) > bucket_size:
            excess_data = len(self.bucket.data) - bucket_size
            self.bucket.drop_data(excess_data)
        logging.debug('End recieve_data for analytic unit: {} with res: {}'.format(self.analytic_unit_id, res))
        if res:
            return res
        else:
            return None

    def __get_data_chunks(self, dataframe: pd.DataFrame, window_size: int) -> Generator[pd.DataFrame, None, None]:
        """
        Return generator, that yields dataframe's chunks. Chunks have 3 WINDOW_SIZE length and 2 WINDOW_SIZE step.
        Example: recieved dataframe: [0, 1, 2, 3, 4, 5], returned chunks [0, 1, 2], [2, 3, 4], [4, 5].
        """
        chunk_size = window_size * 100
        intersection = window_size

        data_len = len(dataframe)

        if data_len < chunk_size:
            return (chunk for chunk in (dataframe,))

        def slices():
            nonintersected = chunk_size - intersection
            mod = data_len % nonintersected
            chunks_number = data_len // nonintersected

            offset = 0
            for i in range(chunks_number):
                yield slice(offset, offset + nonintersected + 1)
                offset += nonintersected

            yield slice(offset, offset + mod)

        return (dataframe[chunk_slice] for chunk_slice in slices())
