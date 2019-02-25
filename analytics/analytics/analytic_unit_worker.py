import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union
from models import ModelCache
from concurrent.futures import Executor, CancelledError
import asyncio

logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: Executor = executor
        self._training_feature: asyncio.Future = None
        self._detection_feature: asyncio.Future = None
        self._recieve_feature: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: pd.DataFrame, cache: Optional[ModelCache]
    ) -> ModelCache:
        self._training_feature = asyncio.get_event_loop().run_in_executor(
            self._executor, self._detector.train, data, payload, cache
        )
        try:
            new_cache: ModelCache = await self._training_feature
            return new_cache
        except CancelledError as e:
            return cache

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        self._detection_feature = asyncio.get_event_loop().run_in_executor(
            self._executor, self._detector.detect, data, cache
        )
        try:
            detect_results = await self._detection_feature
            return detect_results
        except CancelledError as e:
            return {}


    def cancel(self):
        if self._training_feature is not None:
            self._training_feature.cancel()
        if self._detection_feature is not None:
            self._detection_feature.cancel()
        if self._recieve_feature is not None:
            self._recieve_feature.cancel()

    async def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]):
        self._recieve_feature = asyncio.get_event_loop().run_in_executor(
            self._executor, self._detector.recieve_data, data, cache
        )
        try:
            detect_results = await self._recieve_feature
            return detect_results
        except CancelledError as e:
            return None
