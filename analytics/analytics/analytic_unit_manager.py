from typing import Dict
import pandas as pd
import numpy as np
import logging, traceback
from concurrent.futures import Executor, ThreadPoolExecutor

import detectors
from analytic_unit_worker import AnalyticUnitWorker


logger = logging.getLogger('AnalyticUnitManager')
WORKERS_EXECUTORS = 20

AnalyticUnitId = str


def get_detector_by_type(analytic_unit_type) -> detectors.Detector:
    return detectors.PatternDetector(analytic_unit_type)

def prepare_data(data: list):
    """
        Takes list
        - converts it into pd.DataFrame,
        - converts 'timestamp' column to pd.Datetime,
        - subtracts min value from dataset
    """
    data = pd.DataFrame(data, columns=['timestamp', 'value'])

    data['timestamp'] = pd.to_datetime(data['timestamp'], unit='ms')
    if not np.isnan(min(data['value'])):
        data['value'] = data['value'] - min(data['value'])

    return data


class AnalyticUnitManager:

    def __init__(self):
        self.analytic_workers: Dict[AnalyticUnitId, AnalyticUnitWorker] = dict()
        self.workers_executor = ThreadPoolExecutor(max_workers=WORKERS_EXECUTORS)

    def __ensure_worker(self, analytic_unit_id: AnalyticUnitId, analytic_unit_type) -> AnalyticUnitWorker:
        if analytic_unit_id in self.analytic_workers:
            # TODO: check that type is the same
            return self.analytic_workers[analytic_unit_id]
        detector = get_detector_by_type(analytic_unit_type)
        worker = AnalyticUnitWorker(analytic_unit_id, detector, self.workers_executor)
        self.analytic_workers[analytic_unit_id] = worker
        return worker

    async def __handle_analytic_task(self, task) -> dict:
        """
            returns payload or None
        """
        if task['type'] == 'PUSH':
            # TODO: implement PUSH message handling
            return
        analytic_unit_id: AnalyticUnitId = task['analyticUnitId']

        if task['type'] == 'CANCEL':
            if analytic_unit_id in self.analytic_workers:
                self.analytic_workers[analytic_unit_id].cancel()
            return

        payload = task['payload']
        worker = self.__ensure_worker(analytic_unit_id, payload['pattern'])
        data = prepare_data(payload['data'])
        if task['type'] == 'LEARN':
            return await worker.do_train(payload['segments'], data, payload['cache'])
        elif task['type'] == 'DETECT':
            return await worker.do_detect(data, payload['cache'])
        elif task['type'] == 'PUSH':
            return await worker.recieve_data(data)

        raise ValueError('Unknown task type "%s"' % task['type'])

    async def handle_analytic_task(self, task):
        try:
            result_payload = await self.__handle_analytic_task(task)
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
