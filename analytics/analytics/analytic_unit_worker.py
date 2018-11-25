import config
import detectors
import logging
import pandas as pd
from typing import Optional
from models import AnalyticUnitCache
from concurrent.futures import Executor
import asyncio

logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: Executor):
        self.analytic_unit_id = analytic_unit_id
        self.detector = detector
        self.executor: Executor = executor

    async def do_learn(
        self, segments: list, data: pd.DataFrame, cache: Optional[AnalyticUnitCache]
    ) -> AnalyticUnitCache:
        new_cache: AnalyticUnitCache = await asyncio.get_event_loop().run_in_executor(
            self.executor, self.detector.train, data, segments, cache
        )
        return new_cache

    async def do_predict(self, data: pd.DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        return self.detector.predict(data, cache)
