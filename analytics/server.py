import config
import json
import logging
import sys
import asyncio
import services.server_service

from analytic_unit_worker import AnalyticUnitWorker


root = logging.getLogger()
logger = logging.getLogger('SERVER')

worker = None
server_service = None


root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
ch.setFormatter(formatter)
root.addHandler(ch)



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

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    logger.info("Starting worker...")
    worker = AnalyticUnitWorker()
    logger.info("Ok")
    logger.info("Starting server...")
    server_service = services.server_service.ServerService(handle_task)
    logger.info("Ok")
    loop.run_until_complete(server_service.handle_loop())
