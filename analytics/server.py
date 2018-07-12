import config
import json
import logging
import zmq
import sys

from analytic_unit_worker import AnalyticUnitWorker


root = logging.getLogger()
logger = logging.getLogger('SERVER')
socket = None
worker = None


root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
ch.setFormatter(formatter)
root.addHandler(ch)


def handle_ping():
    socket.send(b'pong')

def handle_task(text):
    try:
        task = json.loads(text)
        logger.info("Command is OK")

        socket.send_string(json.dumps({
            '_taskId': task['_taskId'],
            'task': task['type'],
            'analyticUnitId': task['analyticUnitId'],
            'status': "in progress"
        }))
        
        res = worker.do_task(task)
        res['_taskId'] = task['_taskId']
        socket.send_string(json.dumps(res))

    except Exception as e:
        logger.error("Exception: '%s'" % str(e))


if __name__ == "__main__":
    worker = AnalyticUnitWorker()
    logger.info("Worker was started")

    logger.info("Binding to %s ..." % config.ZEROMQ_CONNECTION_STRING)
    context = zmq.Context()
    socket = context.socket(zmq.PAIR)
    socket.bind(config.ZEROMQ_CONNECTION_STRING)
    logger.info("Ok")

    while True:
        received_bytes = socket.recv()
        text = received_bytes.decode('utf-8')
        if text == 'ping':
            handle_ping()
        else:
            handle_task(text)

        
