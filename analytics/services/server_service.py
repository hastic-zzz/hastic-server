import config

import zmq
import zmq.asyncio

import logging
import json
import asyncio
import traceback

logger = logging.getLogger('SERVER_SERVICE')


class ServerMessage:
    def __init__(self, method: str, payload: object = None, request_id: int = None):
        self.method = method
        self.payload = payload
        self.request_id = request_id
    
    def toJSON(self):
        result = {
            'method': self.method   
        }
        if self.payload is not None:
            result['payload'] = self.payload
        if self.request_id is not None:
            result['requestId'] = self.request_id
        return result
    
    def fromJSON(json: dict):
        method = json['method']
        payload = None
        request_id = None
        if 'payload' in json:
            payload = json['payload']
        if 'requestId' in json:
            request_id = json['requestId']
        
        return ServerMessage(method, payload, request_id)

class ServerService:

    def __init__(self, on_message_handler):
        self.on_message_handler = on_message_handler

        logger.info("Binding to %s ..." % config.ZMQ_CONNECTION_STRING)
        self.context = zmq.asyncio.Context()
        self.socket = self.context.socket(zmq.PAIR)
        self.socket.bind(config.ZMQ_CONNECTION_STRING)
        self.request_next_id = 1
        self.responses = dict()

    async def handle_loop(self):
        while True:
            received_bytes = await self.socket.recv()
            text = received_bytes.decode('utf-8')

            if text == 'PING':
                asyncio.ensure_future(self.__handle_ping())
            else:
                asyncio.ensure_future(self.__handle_message(text))

    async def send_message(self, message: ServerMessage):
        await self.socket.send_string(json.dumps(message.toJSON()))
    
    async def send_request(self, message: ServerMessage) -> object:
        if message.request_id is not None:
            raise ValueError('Message can`t have request_id before it is scheduled')
        request_id = message.request_id = self.request_next_id
        self.request_next_id = self.request_next_id + 1
        asyncio.ensure_future(self.send_message(message))
        while request_id not in self.responses:
            await asyncio.sleep(1)
        response = self.responses[request_id]
        del self.responses[request_id]
        return response

    async def __handle_ping(self):
        await self.socket.send(b'PONG')

    async def __handle_message(self, text: str):
        try:
            message_object = json.loads(text)
            message = ServerMessage.fromJSON(message_object)
            
            if message.request_id is not None:
                self.responses[message_object['requestId']] = message.payload
                return

            asyncio.ensure_future(self.on_message_handler(message))
        except Exception as e:
            error_text = traceback.format_exc()
            logger.error("__handle_message Exception: '%s'" % error_text)
