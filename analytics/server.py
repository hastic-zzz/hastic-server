import config
import json
import logging
import zmq
import sys

from worker import Worker

root = logging.getLogger()
root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
ch.setFormatter(formatter)
root.addHandler(ch)

logger = logging.getLogger('SERVER')
socket = None

def handlePing():
    socket.send(b'pong')

def handleTask(text):
    try:
        task = json.loads(text)
        logger.info("Command is OK")

        socket.send_string(json.dumps({
            'task': task['type'],
            'predictor_id': task['predictor_id'],
            '_taskId': task['_taskId'],
            'status': "in progress"
        }))
        
        res = w.do_task(task)
        res['_taskId'] = task['_taskId']
        socket.send_string(json.dumps(res))

    except Exception as e:
        logger.error("Exception: '%s'" % str(e))


if __name__ == "__main__":
    w = Worker()
    logger.info("Worker was started")

    logger.info("Binding to %s ..." % config.ZEROMQ_CONNECTION_STRING)
    context = zmq.Context()
    socket = context.socket(zmq.PAIR)
    socket.bind(config.ZEROMQ_CONNECTION_STRING)
    logger.info("Ok")

    while True:
        received_bytes = socket.recv()
        text = received_bytes.decode('utf-8')
        logger.info('Got message %s' % text)
        if text == 'ping':
            handlePing()
            logger.info('Sent pong')
        else:
            handleTask(text)

        
