import config
import detectors
import json
import logging
import sys
import traceback
import time


logger = logging.getLogger('WORKER')


class AnalyticUnitWorker(object):
    detectors_cache = {}

    # TODO: get task as an object built from json
    async def do_task(self, task):
        try:
            type = task['type']
            analytic_unit_id = task['analyticUnitId']
            payload = task['payload']
            if type == "PREDICT":
                result = await self.do_predict(analytic_unit_id, payload)
            elif type == "LEARN":
                result = await self.do_learn(analytic_unit_id, payload)
            else:
                result = {
                    'status': "FAILED",
                    'error': "unknown type " + str(type)
                }
        except Exception as e:
            #traceback.extract_stack()
            error_text = traceback.format_exc()
            logger.error("do_task Exception: '%s'" % error_text)
            # TODO: move result to a class which renders to json for messaging to analytics
            result = {
                'task': type,
                'status': "FAILED",
                'analyticUnitId': analytic_unit_id,
                'error': str(e)
            }
        return result

    async def do_learn(self, analytic_unit_id, payload):
        pattern = payload['pattern']
        segments = payload['segments']

        model = self.get_detector(analytic_unit_id, pattern)
        model.synchronize_data()
        last_prediction_time = await model.learn(segments)
        # TODO: we should not do predict before labeling in all models, not just in drops
        
        if pattern == 'DROP' and len(segments) == 0:
            # TODO: move result to a class which renders to json for messaging to analytics
            result = {
                'status': 'SUCCESS',
                'analyticUnitId': analytic_unit_id,
                'segments': [],
                'lastPredictionTime': last_prediction_time
            }
        else:
            result = await self.do_predict(analytic_unit_id, last_prediction_time, pattern)

        result['task'] = 'LEARN'
        return result

    async def do_predict(self, analytic_unit_id, payload):
        pattern = payload['pattern']
        last_prediction_time = payload['lastPredictionTime']

        model = self.get_detector(analytic_unit_id, pattern)
        model.synchronize_data()
        segments, last_prediction_time = await model.predict(last_prediction_time)
        return {
            'task': 'PREDICT',
            'status': 'SUCCESS',
            'analyticUnitId': analytic_unit_id,
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }

    def get_detector(self, analytic_unit_id, pattern_type):
        if analytic_unit_id not in self.detectors_cache:
            if pattern_type == 'GENERAL':
                detector = detectors.GeneralDetector(analytic_unit_id)
            else:
                detector = detectors.PatternDetector(analytic_unit_id, pattern_type)
            self.detectors_cache[analytic_unit_id] = detector
        return self.detectors_cache[analytic_unit_id]
