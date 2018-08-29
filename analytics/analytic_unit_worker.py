import config
import detectors
import logging
import pandas as pd


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector):
        self.analytic_unit_id = analytic_unit_id
        self.detector = detector

    async def do_learn(self, segments: list, data: pd.DataFrame) -> None:
        await self.detector.train(data, segments)

    async def do_predict(self, data: pd.DataFrame):
        segments, last_prediction_time = await self.detector.predict(data)
        return {
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }
