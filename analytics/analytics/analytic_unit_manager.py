from typing import Dict
import logging as log
import traceback
from concurrent.futures import Executor, ThreadPoolExecutor

from analytic_unit_worker import AnalyticUnitWorker
from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.segment import Segment
import detectors


logger = log.getLogger('AnalyticUnitManager')


def get_detector_by_type(
    detector_type: str, analytic_unit_type: str, analytic_unit_id: AnalyticUnitId
) -> detectors.Detector:
    if detector_type == 'pattern':
        return detectors.PatternDetector(analytic_unit_type, analytic_unit_id)
    elif detector_type == 'threshold':
        return detectors.ThresholdDetector(analytic_unit_id)
    elif detector_type == 'anomaly':
        return detectors.AnomalyDetector(analytic_unit_id)

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

    async def __handle_analytic_task(self, task: object) -> dict:
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
        data = payload.get('data')
        if task['type'] == 'PUSH':
            # TODO: do it a better way
            res = await worker.consume_data(data, payload['cache'])
            if res:
                res.update({ 'analyticUnitId': analytic_unit_id })
            return res
        elif task['type'] == 'LEARN':
            if 'segments' in payload:
                segments = payload['segments']
                segments = [Segment.from_json(segment) for segment in segments]
                return await worker.do_train(segments, data, payload['cache'])
            elif 'threshold' in payload:
                return await worker.do_train(payload['threshold'], data, payload['cache'])
            elif 'anomaly' in payload:
                return await worker.do_train(payload['anomaly'], data, payload['cache'])
            else:
                raise ValueError('No segments or threshold in LEARN payload')
        elif task['type'] == 'DETECT':
            return await worker.do_detect(data, payload['cache'])
        elif task['type'] == 'PROCESS':
            return await worker.process_data(data, payload['cache'])

        raise ValueError('Unknown task type "%s"' % task['type'])

    async def handle_analytic_task(self, task: object):
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
