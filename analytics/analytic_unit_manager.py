from typing import Dict
import logging

import detectors
from analytic_unit_worker import AnalyticUnitWorker

logger = logging.getLogger('AnalyticUnitManager')

analytic_unit_id = str
analytic_workers: Dict[analytic_unit_id, AnalyticUnitWorker] = dict()

def get_detector(self, analytic_unit_type) -> detectors.Detector:
    if analytic_unit_type == 'GENERAL':
        detector = detectors.GeneralDetector()
    else:
        detector = detectors.PatternDetector(analytic_unit_type)
    return detector

def ensure_worker(analytic_unit_id, analytic_unit_type) -> AnalyticUnitWorker:
    if analytic_unit_id in analytic_workers:
        # TODO: check that type is the same
        return analytic_workers[analytic_unit_id]
    detector = get_detector(analytic_unit_type)
    worker = AnalyticUnitWorker(analytic_unit_id, detector)
    analytic_workers[analytic_unit_id] = worker
    return worker

async def handle_analytic_task(task):
    try:
        worker = ensure_worker(task['analyticUnitId'], task['type'])
        payload = task['payload']
        if type == "PREDICT":
            result_payload = await worker.do_predict(analytic_unit_id, payload)
        elif type == "LEARN":
            result_payload = await worker.do_learn(analytic_unit_id, payload)
        else:
            raise ValueError('Unknown task type "%s"' % type)

    except Exception as e:
        logger.error("handle_analytic_task exception: '%s'" % error_text)
        # TODO: move result to a class which renders to json for messaging to analytics
        result = {
            'status': "FAILED",
            'error': str(e)
        }
    return {
        'status': 'SUCCESS',
        'payload': result_payload
    }


