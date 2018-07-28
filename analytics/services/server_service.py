import config

import zmq
import zmq.asyncio

import logging
import json
import asyncio

logger = logging.getLogger('SERVER_SERVICE')


class ServerMessage:
    def __init__(self, method: str, payload: object = None, request_id: int = None):
        self.method = method
        if payload is not None:
            self.payload = payload
        if request_id is not None:
            self.request_id = request_id


class ServerService:

    def __init__(self, on_message_handler):
        self.on_message_handler = on_message_handler

        logger.info("Binding to %s ..." % config.ZMQ_CONNECTION_STRING)
        self.context = zmq.asyncio.Context()
        self.socket = self.context.socket(zmq.PAIR)
        self.socket.bind(config.ZMQ_CONNECTION_STRING)
        self.request_next_id = 1
        self = dict()

    async def handle_loop(self):
        while True:
            received_bytes = await self.socket.recv()
            text = received_bytes.decode('utf-8')

            if text == 'ping':
                asyncio.ensure_future(self.__handle_ping())
            else:
                asyncio.ensure_future(self.__handle_message(text))

    async def send_message(self, message: ServerMessage):
        await self.socket.send_string(string)
    
    async def send_request(self, message: ServerMessage) -> object:
        if message.request_id is not None:
            raise ValueError('Message can`t have request_id before it is scheduled')
        message.request_id = self.request_next_id
        self.request_next_id = self.request_next_id + 1
        asyncio.ensure_future(self.send_message(message))
        return '{ "result": "ok" }'

    async def __handle_ping(self):
        await self.socket.send(b'pong')

    async def __handle_message(self, text: str):
        try:
            messageObject = json.loads(text)
            payload = None
            if 'payload' is in messageObject:
                payload = messageObject.payload
            message = ServerMessage(messageObject.method, payload)
            asyncio.ensure_future(self.on_message_handler(message))
        except Exception as e:
            logger.error("__handle_message Exception: '%s'" % str(e))
