#!/usr/bin/env python3

import sys
import os


import config
import json
import logging
import asyncio
import traceback

import services
from analytic_unit_manager import AnalyticUnitManager


server_service: services.ServerService = None
data_service: services.DataService = None
analytic_unit_manager: AnalyticUnitManager = None

logger = logging.getLogger('SERVER')


async def handle_task(task: object):
    try:
        task_type = task['type']
        logger.info("Got {} task with id {}, analyticUnitId {}".format(task_type, task['_id'], task['analyticUnitId']))

        task_result_payload = {
            '_id': task['_id'],
            'task': task_type,
            'analyticUnitId': task['analyticUnitId'],
            'status': "IN_PROGRESS"
        }

        if not task_type == 'PUSH':
            message = services.server_service.ServerMessage('TASK_RESULT', task_result_payload)
            await server_service.send_message_to_server(message)

        res = await analytic_unit_manager.handle_analytic_task(task)
        res['_id'] = task['_id']

        if not task_type == 'PUSH':
            message = services.server_service.ServerMessage('TASK_RESULT', res)
            await server_service.send_message_to_server(message)

    except Exception as e:
        error_text = traceback.format_exc()
        logger.error("handle_task Exception: '%s'" % error_text)

async def handle_data(task: object):
    res = await analytic_unit_manager.handle_analytic_task(task)

    if res['status'] == 'SUCCESS' and res['payload'] is not None:
        res['_id'] = task['_id']
        message = services.server_service.ServerMessage('PUSH_DETECT', res)
        await server_service.send_message_to_server(message)

async def handle_message(message: services.ServerMessage):
    if message.method == 'TASK':
        await handle_task(message.payload)
    if message.method == 'DATA':
        await handle_data(message.payload)

def init_services():
    global server_service
    global data_service
    global analytic_unit_manager

    logger.info("Starting services...")
    logger.info("Server...")
    server_service = services.ServerService()
    logger.info("Ok")
    logger.info("Data service...")
    data_service = services.DataService(server_service)
    logger.info("Ok")
    logger.info("Analytic unit manager...")
    analytic_unit_manager = AnalyticUnitManager()
    logger.info("Ok")

async def app_loop():
    async for message in server_service:
        asyncio.ensure_future(handle_message(message))


def run_server():
    loop = asyncio.get_event_loop()
    #loop.set_debug(True)
    logger.info("Ok")
    init_services()
    print('Analytics process is running') # we need to print to stdout and flush
    sys.stdout.flush()                    # because node.js expects it

    loop.run_until_complete(app_loop())
