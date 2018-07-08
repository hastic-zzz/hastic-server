import config
from anomaly_model import AnomalyModel
from pattern_detection_model import PatternDetectionModel
import queue
import threading
import json
import logging
import sys
import traceback
import time


logger = logging.getLogger('WORKER')


class Worker(object):
    models_cache = {}
    thread = None
    queue = queue.Queue()

    def start(self):
        self.thread = threading.Thread(target=self.run)
        self.thread.start()

    def stop(self):
        if self.thread:
            self.queue.put(None)
            self.thread.join()

    def run(self):
        while True:
            task = self.queue.get()
            if task['type'] == "stop":
                break
            self.do_task(task)
            self.queue.task_done()

    def add_task(self, task):
        self.queue.put(task)

    # TODO: get task as an object built from json
    def do_task(self, task):
        try:
            type = task['type']
            analytic_unit_id = task['analyticUnitId']
            if type == "predict":
                last_prediction_time = task['lastPredictionTime']
                pattern = task['pattern']
                result = self.do_predict(analytic_unit_id, last_prediction_time, pattern)
            elif type == "learn":
                segments = task['segments']
                pattern = task['pattern']
                result = self.do_learn(analytic_unit_id, segments, pattern)
            else:
                result = {
                    'status': "failed",
                    'error': "unknown type " + str(type)
                }
        except Exception as e:
            #traceback.extract_stack()
            error_text = traceback.format_exc()
            logger.error("Exception: '%s'" % error_text)
            # TODO: move result to a class which renders to json for messaging to analytics
            result = {
                'task': type,
                'status': "failed",
                'analyticUnitId': analytic_unit_id,
                'error': str(e)
            }
        return result

    def do_learn(self, analytic_unit_id, segments, pattern):
        model = self.get_model(analytic_unit_id, pattern)
        model.synchronize_data()
        last_prediction_time = model.learn(segments)
        # TODO: we should not do predict before labeling in all models, not just in drops
        
        if pattern == 'drops' and len(segments) == 0:
            # TODO: move result to a class which renders to json for messaging to analytics
            result = {
                'status': 'success',
                'analyticUnitId': analytic_unit_id,
                'segments': [],
                'lastPredictionTime': last_prediction_time
            }
        else:
            result = self.do_predict(analytic_unit_id, last_prediction_time, pattern)
            
        result['task'] = 'learn'
        return result

    def do_predict(self, analytic_unit_id, last_prediction_time, pattern):
        model = self.get_model(analytic_unit_id, pattern)
        model.synchronize_data()
        segments, last_prediction_time = model.predict(last_prediction_time)
        return {
            'task': "predict",
            'status': "success",
            'analyticUnitId': analytic_unit_id,
            'segments': segments,
            'lastPredictionTime': last_prediction_time
        }

    def get_model(self, analytic_unit_id, pattern):
        if analytic_unit_id not in self.models_cache:
            if pattern.find('general') != -1:
                model = AnomalyModel(analytic_unit_id)
            else:
                model = PatternDetectionModel(analytic_unit_id, pattern)
            self.models_cache[analytic_unit_id] = model
        return self.models_cache[analytic_unit_id]


