import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union, Generator
from models import ModelCache
import concurrent.futures
import asyncio


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

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
        
        #TODO choose chunk size for thresholds without window size
        window_size = cache.get('WINDOW_SIZE', 1)
        chunks = self.__get_data_chunks(data, window_size)

        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        for chunk in chunks:
            await asyncio.sleep(0)
            detected = self._detector.detect(data, cache)
            if detected is not None:
                detection_result['cache'] = detected['cache']
                detection_result['lastDetectionTime'] = detected['lastDetectionTime']
                detection_result['segments'].extend(detected['segments'])

        return detection_result

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        if cache is None:
            msg = f'{self.analytic_unit_id} detection got invalid cache, skip detection'
            logger.error(msg)
            raise ValueError(msg)

        #TODO choose chunk size for thresholds without window size
        window_size = cache.get('WINDOW_SIZE', 1)
        chunks = self.__get_data_chunks(data, window_size)

        detection_result = {
          'cache': None,
          'segments': [],
          'lastDetectionTime': None
        }

        for chunk in chunks:
            await asyncio.sleep(0)
            detected = self._detector.recieve_data(data, cache)
            if detected is not None:
                detection_result['cache'] = detected['cache']
                detection_result['lastDetectionTime'] = detected['lastDetectionTime']
                detection_result['segments'].extend(detected['segments'])

        return detection_result

    def __get_data_chunks(self, dataframe: pd.DataFrame, window_size: int) -> Generator[pd.DataFrame, None, None]:
        """
        TODO: fix description
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
