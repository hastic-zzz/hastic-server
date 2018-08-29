import config
import json
import logging
import sys
import asyncio
import traceback

import services
from analytic_unit_manager import handle_analytic_task


root = logging.getLogger()
logger = logging.getLogger('SERVER')


server_service: services.ServerService = None
data_service: services.DataService = None

root.setLevel(logging.DEBUG)


logging_formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")

logging_handler = logging.StreamHandler(sys.stdout)
#logging_handler = logging.FileHandler(config.DATA_FOLDER + '/analytics.log')
logging_handler.setLevel(logging.DEBUG)
logging_handler.setFormatter(logging_formatter)

root.addHandler(logging_handler)




async def handle_task(task: object):
    try:

        logger.info("Command is OK")

        task_result_payload = {
            '_id': task['_id'],
            'task': task['type'],
            'analyticUnitId': task['analyticUnitId'],
            'cache': task['cache'],
            'status': "IN_PROGRESS"
        }

        message = services.server_service.ServerMessage('TASK_RESULT', task_result_payload)
        await server_service.send_message(message)

        res = await handle_analytic_task(task)
        res['_id'] = task['_id']

        message = services.server_service.ServerMessage('TASK_RESULT', res)
        await server_service.send_message(message)

    except Exception as e:
        error_text = traceback.format_exc()
        logger.error("handle_task Exception: '%s'" % error_text)

async def handle_message(message: services.ServerMessage):
    payload = None
    if message.method == 'TASK':
        await handle_task(message.payload)


def init_services():
    logger.info("Starting services...")
    logger.info("Server...")
    server_service = services.ServerService(handle_message)
    logger.info("Ok")
    logger.info("Data service...")
    data_service = services.DataService(server_service)
    logger.info("Ok")

    return server_service, data_service

async def app_loop():
    await server_service.handle_loop()
    # await asyncio.gather(server_service.handle_loop(), test_file_save())


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    logger.info("Ok")
    server_service, data_service = init_services()
    print('Analytics process is running') # we need to print to stdout and flush
    sys.stdout.flush()                    # because node.js expects it

    loop.run_until_complete(app_loop())
