import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union
from models import ModelCache
from concurrent.futures import Executor, CancelledError, TimeoutError
import asyncio

logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: Executor = executor
        self._training_feature: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: pd.DataFrame, cache: Optional[ModelCache]
    ) -> ModelCache:
        self._training_feature = self._executor.submit(
            self._detector.train, data, payload, cache
        )
        try:
            # TODO: configurable timeout
            new_cache: ModelCache = self._training_feature.result(timeout = 120)
            return new_cache
        except CancelledError as e:
            return cache
        except TimeoutError:
            raise 'Timeout ({}s) exceeded while learning'

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        return self._detector.detect(data, cache)

    def cancel(self):
        if self._training_feature is not None:
            self._training_feature.cancel()

    async def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        return self._detector.recieve_data(data, cache)
