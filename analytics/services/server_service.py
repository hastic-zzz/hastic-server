import config

import zmq
import zmq.asyncio
import logging

import asyncio

logger = logging.getLogger('SERVER_SERVICE')


class ServerService:

    def __init__(self, on_message_handler):
        self.on_message_handler = on_message_handler

        logger.info("Binding to %s ..." % config.ZEROMQ_CONNECTION_STRING)
        self.context = zmq.asyncio.Context()
        self.socket = self.context.socket(zmq.PAIR)
        self.socket.bind(config.ZEROMQ_CONNECTION_STRING)

    async def handle_loop(self):
        while True:
            received_bytes = await self.socket.recv()
            text = received_bytes.decode('utf-8')

            if text == 'ping':
                asyncio.ensure_future(self.__handle_ping())
            else:
                asyncio.ensure_future(self.__handle_message(text))

    async def send_message(self, string):
        await self.socket.send_string(string)

    async def __handle_ping(self):
        await self.socket.send(b'pong')

    async def __handle_message(self, text):
        try:
            asyncio.ensure_future(self.on_message_handler(text))
        except Exception as e:
            logger.error("Exception: '%s'" % str(e))
