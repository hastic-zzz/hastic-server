import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union, Generator
from models import ModelCache
import concurrent.futures
import asyncio

from utils import get_data_chunks


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    CHUNK_WINDOW_SIZE_FACTOR = 100

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: concurrent.futures.Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: concurrent.futures.Executor = executor
        self._training_future: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: pd.DataFrame, cache: Optional[ModelCache]
    ) -> Optional[ModelCache]:
        cfuture: concurrent.futures.Future = self._executor.submit(
            self._detector.train, data, payload, cache
        )
        self._training_future = asyncio.wrap_future(cfuture)
        try:
            new_cache: ModelCache = await asyncio.wait_for(self._training_future, timeout = config.LEARNING_TIMEOUT)
            return new_cache
        except asyncio.CancelledError:
            return None
        except asyncio.TimeoutError:
            raise Exception('Timeout ({}s) exceeded while learning'.format(config.LEARNING_TIMEOUT))

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        if cache is None:
            msg = f'{self.analytic_unit_id} detection got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)
        
        window_size = self._detector.get_window_size(cache)

        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        for chunk in get_data_chunks(data, window_size, window_size * self.CHUNK_WINDOW_SIZE_FACTOR):
            await asyncio.sleep(0)
            detected = self._detector.detect(chunk, cache)
            self.__append_detection_result(detection_result, detected)

        return detection_result

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        if cache is None:
            msg = f'{self.analytic_unit_id} consume_data got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        window_size = self._detector.get_window_size(cache)

        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        #TODO: remove code duplication with do_detect
        for chunk in get_data_chunks(data, window_size, window_size * self.CHUNK_WINDOW_SIZE_FACTOR):
            await asyncio.sleep(0)
            detected = self._detector.consume_data(chunk, cache)
            self.__append_detection_result(detection_result, detected)

        return detection_result

    def __append_detection_result(self, detection_result: dict, new_chunk: dict):
        if new_chunk is not None:
            detection_result['cache'] = new_chunk['cache']
            detection_result['lastDetectionTime'] = new_chunk['lastDetectionTime']
            detection_result['segments'].extend(new_chunk['segments'])
