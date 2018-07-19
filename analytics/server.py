import config
import json
import logging
import zmq
import zmq.asyncio
import sys
import asyncio

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


async def server_handle_loop():
    while True:
        received_bytes = await socket.recv()
        text = received_bytes.decode('utf-8')

        if text == 'ping':
            asyncio.ensure_future(handle_ping())
        else:
            asyncio.ensure_future(handle_task(text))

async def server_send_message(string):
    await socket.send_string(string)

async def handle_ping():
    await socket.send(b'pong')

async def handle_task(text):
    try:
        task = json.loads(text)
        logger.info("Command is OK")

        await server_send_message(json.dumps({
            '_taskId': task['_taskId'],
            'task': task['type'],
            'analyticUnitId': task['analyticUnitId'],
            'status': "in progress"
        }))

        res = await worker.do_task(task)
        res['_taskId'] = task['_taskId']
        await server_send_message(json.dumps(res))

    except Exception as e:
        logger.error("Exception: '%s'" % str(e))

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    worker = AnalyticUnitWorker()
    logger.info("Worker was started")

    logger.info("Binding to %s ..." % config.ZEROMQ_CONNECTION_STRING)
    context = zmq.asyncio.Context()
    socket = context.socket(zmq.PAIR)
    socket.bind(config.ZEROMQ_CONNECTION_STRING)
    logger.info("Ok")
    loop.run_until_complete(server_handle_loop())
