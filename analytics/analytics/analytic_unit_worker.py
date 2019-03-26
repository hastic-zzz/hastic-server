import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union
from models import ModelCache
from concurrent.futures import Executor, CancelledError, TimeoutError
import asyncio

logger = logging.getLogger('AnalyticUnitWorker')

TRAIN_TIMEOUT = 120 # seconds

class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: Executor = executor
        self._training_future: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: pd.DataFrame, cache: Optional[ModelCache]
    ) -> ModelCache:
        self._training_future = self._executor.submit(
            self._detector.train, data, payload, cache
        )
        try:
            # TODO: configurable timeout
            new_cache: ModelCache = self._training_future.result(timeout = TRAIN_TIMEOUT)
            return new_cache
        except CancelledError as e:
            return cache
        except TimeoutError:
            raise Exception('Timeout ({}s) exceeded while learning'.format(TRAIN_TIMEOUT))

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        return self._detector.detect(data, cache)

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        return self._detector.recieve_data(data, cache)
