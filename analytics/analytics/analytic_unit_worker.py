import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union, Generator
from models import ModelCache
import concurrent.futures
import asyncio

from utils import intersected_chunks, chunks, prepare_data


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    CHUNK_WINDOW_SIZE_FACTOR = 100
    CHUNK_INTERSECTION_FACTOR = 2

    assert CHUNK_WINDOW_SIZE_FACTOR > CHUNK_INTERSECTION_FACTOR, \
        'CHUNK_INTERSECTION_FACTOR should be less than CHUNK_WINDOW_SIZE_FACTOR'

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: concurrent.futures.Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: concurrent.futures.Executor = executor
        self._training_future: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: list, cache: Optional[ModelCache]
    ) -> Optional[ModelCache]:

        dataframe = prepare_data(data)

        cfuture: concurrent.futures.Future = self._executor.submit(
            self._detector.train, dataframe, payload, cache
        )
        self._training_future = asyncio.wrap_future(cfuture)
        try:
            new_cache: ModelCache = await asyncio.wait_for(self._training_future, timeout = config.LEARNING_TIMEOUT)
            return new_cache
        except asyncio.CancelledError:
            return None
        except asyncio.TimeoutError:
            raise Exception('Timeout ({}s) exceeded while learning'.format(config.LEARNING_TIMEOUT))

    async def do_detect(self, data: list, cache: Optional[ModelCache]) -> dict:
        if cache is None:
            msg = f'{self.analytic_unit_id} detection got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        window_size = self._detector.get_window_size(cache)
        chunk_size = window_size * self.CHUNK_WINDOW_SIZE_FACTOR
        chunk_intersection = window_size * 2

        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        for chunk in intersected_chunks(data, chunk_intersection, chunk_size):
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected = self._detector.detect(chunk_dataframe, cache)
            self.__append_detection_result(detection_result, detected)

        return detection_result

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def consume_data(self, data: list, cache: Optional[ModelCache]):
        if cache is None:
            msg = f'{self.analytic_unit_id} consume_data got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        window_size = self._detector.get_window_size(cache)

        #TODO: make class DetectionResult
        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        for chunk in chunks(data, window_size * self.CHUNK_WINDOW_SIZE_FACTOR):
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected = self._detector.consume_data(chunk_dataframe, cache)
            self.__append_detection_result(detection_result, detected)

        return detection_result

    def __append_detection_result(self, detection_result: dict, new_chunk: dict):
        if new_chunk is not None:
            detection_result['cache'] = new_chunk['cache']
            detection_result['lastDetectionTime'] = new_chunk['lastDetectionTime']
            detection_result['segments'].extend(new_chunk['segments'])
