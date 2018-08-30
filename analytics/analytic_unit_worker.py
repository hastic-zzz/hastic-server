import config
import detectors
import logging
import pandas as pd
from typing import Optional


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector):
        self.analytic_unit_id = analytic_unit_id
        self.detector = detector

    async def do_learn(self, segments: list, data: pd.DataFrame, cache: Optional[dict]) -> dict:
        return await self.detector.train(data, segments, cache)

    async def do_predict(self, data: pd.DataFrame, cache: Optional[dict]) -> dict:
        return await self.detector.predict(data, cache)
