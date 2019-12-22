import config

import zmq
import zmq.asyncio

import logging
import json
import asyncio
import traceback

import utils.concurrent
import utils.meta

from typing import Optional

logger = logging.getLogger('SERVER_SERVICE')


PARSE_MESSAGE_OR_SAVE_LOOP_INTERRUPTED = False
SERVER_SOCKET_RECV_LOOP_INTERRUPTED = False


@utils.meta.JSONClass
class ServerMessage:
    def __init__(self, method: str, payload: object = None, request_id: int = None):
        self.method = method
        self.payload = payload
        self.request_id = request_id


class ServerService(utils.concurrent.AsyncZmqActor):

    def __init__(self):
        super(ServerService, self).__init__()
        self.__aiter_inited = False
        self.__request_next_id = 1
        self.__responses = dict()
        self.start()

    async def send_message_to_server(self, message: ServerMessage):
        # Following message will be sent to actor's self._on_message()
        # We do it cuz we created self.__server_socket in self._run() method,
        # which runs in the actor's thread, not the thread we created ServerService

        # in theory, we can try to use zmq.proxy:
        # zmq.proxy(self.__actor_socket, self.__server_socket)
        # and do here something like:
        # self.__actor_socket.send_string(json.dumps(message.to_json()))
        await self._put_message_to_thread(json.dumps(message.to_json()))

    async def send_request_to_server(self, message: ServerMessage) -> object:
        if message.request_id is not None:
            raise ValueError('Message can`t have request_id before it is scheduled')
        request_id = message.request_id = self.__request_next_id
        self.request_next_id = self.__request_next_id + 1
        asyncio.ensure_future(self.send_message_to_server(message))
        # you should await self.__responses[request_id] which should be a task, 
        # which you resolve somewhere else
        while request_id not in self.__responses:
            await asyncio.sleep(1)
        response = self.__responses[request_id]
        del self.__responses[request_id]
        return response

    def __aiter__(self):
        if self.__aiter_inited:
            raise RuntimeError('Can`t iterate twice')
        __aiter_inited = True
        return self

    async def __anext__(self) -> ServerMessage:
        while not PARSE_MESSAGE_OR_SAVE_LOOP_INTERRUPTED:
            thread_message = await self._recv_message_from_thread()
            server_message = self.__parse_message_or_save(thread_message)
            if server_message is None:
                continue
            else:
                return server_message

    async def _run_thread(self):
        logger.info("Binding to %s ..." % config.HASTIC_SERVER_CONNECTION_STRING)
        self.__server_socket = self._zmq_context.socket(zmq.PAIR)
        self.__server_socket.bind(config.HASTIC_SERVER_CONNECTION_STRING)
        await self.__server_socket_recv_loop()

    async def _on_message_to_thread(self, message: str):
        await self.__server_socket.send_string(message)

    async def __server_socket_recv_loop(self):
        while not SERVER_SOCKET_RECV_LOOP_INTERRUPTED:
            received_string = await self.__server_socket.recv_string()
            if received_string == 'PING':
                asyncio.ensure_future(self.__handle_ping())
            else:
                asyncio.ensure_future(self._send_message_from_thread(received_string))

    async def __handle_ping(self):
        await self.__server_socket.send_string('PONG')

    def __parse_message_or_save(self, text: str) -> Optional[ServerMessage]:
        try:
            message_object = json.loads(text)
            message = ServerMessage.from_json(message_object)
            if message.request_id is not None:
                self.__responses[message_object['requestId']] = message.payload
                return None
            return message
        except Exception:
            error_text = traceback.format_exc()
            logger.error("__handle_message Exception: '%s'" % error_text)
