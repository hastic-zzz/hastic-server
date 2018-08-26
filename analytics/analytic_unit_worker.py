import config
import detectors
import json
import logging
import sys
import traceback
import time



logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def get_detector(self, analytic_unit_id, pattern_type):
        if analytic_unit_id not in self.detectors_cache:
            if pattern_type == 'GENERAL':
                detector = detectors.GeneralDetector(analytic_unit_id)
            else:
                detector = detectors.PatternDetector(analytic_unit_id, pattern_type)
            self.detectors_cache[analytic_unit_id] = detector
        return self.detectors_cache[analytic_unit_id]

    def __init__(self, detector: detectors.Detector):
        pass

    async def do_task(self, task):
        try:
            type = task['type']
            analytic_unit_id = task['analyticUnitId']
            payload = task['payload']
            if type == "PREDICT":
                result_payload = await self.do_predict(analytic_unit_id, payload)
            elif type == "LEARN":
                result_payload = await self.do_learn(analytic_unit_id, payload)
            else:
                raise ValueError('Unknown task type %s' % type) 

        except Exception as e:
            #traceback.extract_stack()
            error_text = traceback.format_exc()
            logger.error("do_task Exception: '%s'" % error_text)
            # TODO: move result to a class which renders to json for messaging to analytics
            result = {
                'status': "FAILED",
                'error': str(e)
            }
        return {
            'status': 'SUCCESS',
            'payload': result_payload
        }

    async def do_learn(self, analytic_unit_id, payload) -> None:
        pattern = payload['pattern']
        segments = payload['segments']
        data = payload['data'] # [time, value][]

        detector = self.get_detector(analytic_unit_id, pattern)
        await detector.learn(segments)

    async def do_predict(self, analytic_unit_id, payload):
        pattern = payload['pattern']
        data = payload['data'] # [time, value][]

        detector = self.get_detector(analytic_unit_id, pattern)
        segments, last_prediction_time = await detector.predict(data)
        return {
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }
