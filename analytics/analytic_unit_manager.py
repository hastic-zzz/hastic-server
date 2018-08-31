from typing import Dict
import pandas as pd
import logging, traceback

import detectors
from analytic_unit_worker import AnalyticUnitWorker

logger = logging.getLogger('AnalyticUnitManager')

AnalyticUnitId = str
analytic_workers: Dict[AnalyticUnitId, AnalyticUnitWorker] = dict()


def get_detector_by_type(analytic_unit_type) -> detectors.Detector:
    return detectors.PatternDetector(analytic_unit_type)

def ensure_worker(analytic_unit_id, analytic_unit_type) -> AnalyticUnitWorker:
    if analytic_unit_id in analytic_workers:
        # TODO: check that type is the same
        return analytic_workers[analytic_unit_id]
    detector = get_detector_by_type(analytic_unit_type)
    worker = AnalyticUnitWorker(analytic_unit_id, detector)
    analytic_workers[analytic_unit_id] = worker
    return worker

async def handle_analytic_task(task):
    try:
        payload = task['payload']

        worker = ensure_worker(task['analyticUnitId'], payload['pattern'])

        data = prepare_data(payload['data'])
        result_payload = {}
        if task['type'] == 'LEARN':
            result_payload = await worker.do_learn(payload['segments'], data, payload['cache'])
        elif task['type'] == 'PREDICT':
            result_payload = await worker.do_predict(data, payload['cache'])
        else:
            raise ValueError('Unknown task type "%s"' % task['type'])
        return {
            'status': 'SUCCESS',
            'payload': result_payload
        }

    except Exception as e:
        error_text = traceback.format_exc()
        logger.error("handle_analytic_task exception: '%s'" % error_text)
        # TODO: move result to a class which renders to json for messaging to analytics
        return {
            'status': 'FAILED',
            'error': str(e)
        }

def prepare_data(data: list):
    """
        Takes list
        - converts it into pd.DataFrame,
        - converts 'timestamp' column to pd.Datetime,
        - subtracts min value from dataset
    """
    data = pd.DataFrame(data, columns=['timestamp', 'value'])

    data['timestamp'] = pd.to_datetime(data['timestamp'])
    data['value'] = data['value'] - min(data['value'])

    return data
