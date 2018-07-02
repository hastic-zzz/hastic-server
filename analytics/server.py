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


if __name__ == "__main__":
    w = Worker()
    logger.info("Worker was started")

    logger.info("Binding to %s ..." % config.ZEROMQ_CONNECTION_STRING)
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind(config.ZEROMQ_CONNECTION_STRING)
    logger.info("Ok")

    while True:
        try:
            text = socket.recv()
            task = json.loads(text)
            logger.info("Received command '%s'" % text)

            if task['type'] == "stop":
                logger.info("Stopping...")
                break

            socket.send(json.dumps({
                'task': task['type'],
                'anomaly_id': task['anomaly_id'],
                '__task_id': task['__task_id'],
                'status': "in progress"
            }))
            
            res = w.do_task(task)
            res['__task_id'] = task['__task_id']
            socket.send(json.dumps(res))

        except Exception as e:
            logger.error("Exception: '%s'" % str(e))
