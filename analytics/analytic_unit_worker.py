import config
import detectors
import json
import logging
import sys
import traceback
import time


logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector):
        self.analytic_unit_id = analytic_unit_id
        self.detector = detector

    async def do_learn(self, analytic_unit_id, payload) -> None:
        pattern = payload['pattern']
        segments = payload['segments']
        data = payload['data'] # [time, value][]
        await self.detector.train(data, segments)

    async def do_predict(self, analytic_unit_id, payload):
        pattern = payload['pattern']
        data = payload['data'] # [time, value][]

        detector = self.get_detector(analytic_unit_id, pattern)
        segments, last_prediction_time = await detector.predict(data)
        return {
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }
