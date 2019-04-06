import config

import zmq
import zmq.asyncio

import logging
import json
import asyncio
import traceback

import utils.concurrent

from typing import Optional

logger = logging.getLogger('SERVER_SERVICE')


class ServerMessage:
    def __init__(self, method: str, payload: object = None, request_id: int = None):
        self.method = method
        self.payload = payload
        self.request_id = request_id

    def toJSON(self) -> dict:
        result = {
            'method': self.method
        }
        if self.payload is not None:
            result['payload'] = self.payload
        if self.request_id is not None:
            result['requestId'] = self.request_id
        return result

    @staticmethod
    def fromJSON(json: dict):
        method = json['method']
        payload = None
        request_id = None
        if 'payload' in json:
            payload = json['payload']
        if 'requestId' in json:
            request_id = json['requestId']
        return ServerMessage(method, payload, request_id)

class ServerService(utils.concurrent.AsyncZmqActor):

    async def send_message_to_server(self, message: ServerMessage):
        # Following message will be sent to actor's self._on_message()
        # We do it cuz we created self.__server_socket in self._run() method,
        # which runs in the actor's thread, not the thread we created ServerService

        # in theory, we can try to use zmq.proxy: 
        # zmq.proxy(self.__actor_socket, self.__server_socket)
        # and do here something like:
        # self.__actor_socket.send_string(json.dumps(message.toJSON()))
        await self.put_message(json.dumps(message.toJSON()))

    async def send_request_to_server(self, message: ServerMessage) -> object:
        if message.request_id is not None:
            raise ValueError('Message can`t have request_id before it is scheduled')
        request_id = message.request_id = self.__request_next_id
        self.request_next_id = self.__request_next_id + 1
        asyncio.ensure_future(self.send_message_to_server(message))
        while request_id not in self.__responses:
            await asyncio.sleep(1)
        response = self.__responses[request_id]
        del self.__responses[request_id]
        return response

    async def _run(self):
        logger.info("Binding to %s ..." % config.ZMQ_CONNECTION_STRING)
        self.__server_socket = self._zmq_context.socket(zmq.PAIR)
        self.__server_socket.bind(config.ZMQ_CONNECTION_STRING)
        self.__request_next_id = 1
        self.__responses = dict()
        self.__aiter_inited = False
        self.__server_socket_recv_loop()
    
    async def _on_message(self, message: str):
        await self.__server_socket.send_string(message)

    def __aiter__(self):
        if self.__aiter_inited:
            raise RuntimeError('Can`t iterate twice')
        __aiter_inited = True
        return self

    async def __anext__(self) -> ServerMessage:
        while True:
            text = await self.socket.recv_string()

            if text == 'PING':
                asyncio.ensure_future(self.__handle_ping())
            else:
                message = self.__parse_message_or_save(text)
                if message is None:
                    continue
                else:
                    return message

    async def __anext__(self) -> ServerMessage:
        while True:
            received_bytes = await self.socket.recv()
            text = received_bytes.decode('utf-8')

            if text == 'PING':
                asyncio.ensure_future(self.__handle_ping())
            else:
                message = self.__parse_message_or_save(text)
                if message is None:
                    continue
                else:
                    self.send_message()

    async def __handle_ping(self):
        await self.__server_socket.send(b'PONG')

    def __parse_message_or_save(self, text: str) -> Optional[ServerMessage]:
        try:
            message_object = json.loads(text)
            message = ServerMessage.fromJSON(message_object)
            if message.request_id is not None:
                self.__responses[message_object['requestId']] = message.payload
                return None
            return message
        except Exception:
            error_text = traceback.format_exc()
            logger.error("__handle_message Exception: '%s'" % error_text)
