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


logger = logging.getLogger('analytic_toolset')


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

    def do_task(self, task):
        try:
            type = task['type']
            anomaly_id = task['anomaly_id']
            if type == "predict":
                last_prediction_time = task['last_prediction_time']
                pattern = task['pattern']
                result = self.do_predict(anomaly_id, last_prediction_time, pattern)
            elif type == "learn":
                segments = task['segments']
                pattern = task['pattern']
                result = self.do_learn(anomaly_id, segments, pattern)
            else:
                result = {
                    'status': "failed",
                    'error': "unknown type " + str(type)
                }
        except Exception as e:
            #traceback.extract_stack()
            error_text = traceback.format_exc()
            logger.error("Exception: '%s'" % error_text)
            result = {
                'task': type,
                'status': "failed",
                'anomaly_id': anomaly_id,
                'error': str(e)
            }
        return result

    def do_learn(self, anomaly_id, segments, pattern):
        model = self.get_model(anomaly_id, pattern)
        model.synchronize_data()
        last_prediction_time = model.learn(segments)
        # TODO: we should not do predict before labeling in all models, not just in drops
        if pattern == 'drops' and len(segments) == 0:
            result = {
                'status': 'success',
                'anomaly_id': anomaly_id,
                'segments': [],
                'last_prediction_time': last_prediction_time
            }
        else:
            result = self.do_predict(anomaly_id, last_prediction_time, pattern)
            
        result['task'] = 'learn'
        return result

    def do_predict(self, anomaly_id, last_prediction_time, pattern):
        model = self.get_model(anomaly_id, pattern)
        model.synchronize_data()
        segments, last_prediction_time = model.predict(last_prediction_time)
        return {
            'task': "predict",
            'status': "success",
            'anomaly_id': anomaly_id,
            'segments': segments,
            'last_prediction_time': last_prediction_time
        }

    def get_model(self, anomaly_id, pattern):
        if anomaly_id not in self.models_cache:
            if pattern.find('general') != -1:
                model = AnomalyModel(anomaly_id)
            else:
                model = PatternDetectionModel(anomaly_id, pattern)
            self.models_cache[anomaly_id] = model
        return self.models_cache[anomaly_id]


