import config
import json
import logging
import sys
import asyncio

import services
from analytic_unit_worker import AnalyticUnitWorker


root = logging.getLogger()
logger = logging.getLogger('SERVER')

worker = None
server_service = None
data_service = None

root.setLevel(logging.DEBUG)


logging_formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")

logging_handler = logging.StreamHandler(sys.stdout)
#logging_handler = logging.FileHandler(config.DATA_FOLDER + '/analytics.log')
logging_handler.setLevel(logging.DEBUG)
logging_handler.setFormatter(logging_formatter)

root.addHandler(logging_handler)


async def handle_task(text):
    try:
        task = json.loads(text)
        logger.info("Command is OK")

        await server_service.send_message(json.dumps({
            '_taskId': task['_taskId'],
            'task': task['type'],
            'analyticUnitId': task['analyticUnitId'],
            'status': "in progress"
        }))

        res = await worker.do_task(task)
        res['_taskId'] = task['_taskId']
        await server_service.send_message(json.dumps(res))

    except Exception as e:
        logger.error("Exception: '%s'" % str(e))

def init_services():
    logger.info("Starting services...")
    logger.info("Server...")
    server_service = services.ServerService(handle_task)
    logger.info("Ok")
    logger.info("Data service...")
    data_service = services.DataService(server_service)
    logger.info("Ok")

    return server_service, data_service

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    logger.info("Starting worker...")
    worker = AnalyticUnitWorker()
    logger.info("Ok")
    server_service, data_service = init_services()
    print('Analytics process is running') # we need to print to stdout and flush
    sys.stdout.flush()                    # because node.js expects it
    loop.run_until_complete(server_service.handle_loop())
