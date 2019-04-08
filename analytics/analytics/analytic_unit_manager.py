from typing import Dict
import pandas as pd
import numpy as np
import logging as log
import traceback
from concurrent.futures import Executor, ThreadPoolExecutor

import detectors
from analytic_unit_worker import AnalyticUnitWorker
from models import ModelCache


logger = log.getLogger('AnalyticUnitManager')

AnalyticUnitId = str


def get_detector_by_type(
    detector_type: str, analytic_unit_type: str, analytic_unit_id: AnalyticUnitId
) -> detectors.Detector:
    if detector_type == 'pattern':
        return detectors.PatternDetector(analytic_unit_type, analytic_unit_id)
    elif detector_type == 'threshold':
        return detectors.ThresholdDetector()

    raise ValueError('Unknown detector type "%s"' % detector_type)


class AnalyticUnitManager:

    def __init__(self):
        self.analytic_workers: Dict[AnalyticUnitId, AnalyticUnitWorker] = dict()
        self.workers_executor = ThreadPoolExecutor()

    def __ensure_worker(
        self,
        analytic_unit_id: AnalyticUnitId,
        detector_type: str,
        analytic_unit_type: str
    ) -> AnalyticUnitWorker:
        if analytic_unit_id in self.analytic_workers:
            # TODO: check that type is the same
            return self.analytic_workers[analytic_unit_id]
        detector = get_detector_by_type(detector_type, analytic_unit_type, analytic_unit_id)
        worker = AnalyticUnitWorker(analytic_unit_id, detector, self.workers_executor)
        self.analytic_workers[analytic_unit_id] = worker
        return worker

    async def __handle_analytic_task(self, task) -> dict:
        """
            returns payload or None
        """
        analytic_unit_id: AnalyticUnitId = task['analyticUnitId']
        log.debug('Analytics get task with type: {} for unit: {}'.format(task['type'], analytic_unit_id))
        if task['type'] == 'CANCEL':
            if analytic_unit_id in self.analytic_workers:
                self.analytic_workers[analytic_unit_id].cancel()
            return

        payload = task['payload']
        worker = self.__ensure_worker(analytic_unit_id, payload['detector'], payload['analyticUnitType'])
        data = prepare_data(payload['data'])
        if task['type'] == 'PUSH':
            # TODO: do it a better way
            res = await worker.consume_data(data, payload['cache'])
            if res:
                res.update({ 'analyticUnitId': analytic_unit_id })
            return res
        elif task['type'] == 'LEARN':
            if 'segments' in payload:
                return await worker.do_train(payload['segments'], data, payload['cache'])
            elif 'threshold' in payload:
                return await worker.do_train(payload['threshold'], data, payload['cache'])
            else:
                raise ValueError('No segments or threshold in LEARN payload')
        elif task['type'] == 'DETECT':
            return await worker.do_detect(data, payload['cache'])

        raise ValueError('Unknown task type "%s"' % task['type'])

    async def handle_analytic_task(self, task):
        try:
            log.debug('Start handle_analytic_task with analytic unit: {}'.format(task['analyticUnitId']))
            result_payload = await self.__handle_analytic_task(task)
            result_message =  {
                'status': 'SUCCESS',
                'payload': result_payload
            }
            log.debug('End correctly handle_analytic_task with anatytic unit: {}'.format(task['analyticUnitId']))
            return result_message
        except Exception as e:
            error_text = traceback.format_exc()
            logger.error("handle_analytic_task Exception: '%s'" % error_text)
            # TODO: move result to a class which renders to json for messaging to analytics
            return {
                'status': 'FAILED',
                'error': repr(e)
            }
