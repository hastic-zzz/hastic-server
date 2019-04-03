import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union
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
        return self._detector.detect(data, cache)

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        return await self._detector.recieve_data(data, cache)
