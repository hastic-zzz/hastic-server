import asyncio
import threading
import zmq
import zmq.asyncio
from abc import ABC, abstractmethod


# This const defines Thread <-> Actor zmq one-to-one connection
# We create a seperate zmq context, so zqm address 'inproc://xxx' doesn't matter
# It is default address and you may want to use AsyncZmqThread another way
ZMQ_THREAD_ACTOR_ADDR = 'inproc://xxx'


# Inherience order (threading.Thread, ABC) is essential. Otherwise it's a MRO error.
class AsyncZmqThread(threading.Thread, ABC):
    """Class for wrapping zmq socket into a thread with it's own asyncio event loop

    """

    def __init__(self,
        zmq_context: zmq.asyncio.Context,
        zmq_socket_addr: str,
        zmq_socket_type = zmq.PAIR
    ):
        super(AsyncZmqThread, self).__init__()
        self._zmq_context = zmq_context # you can use it in child classes
        self.__zmq_socket_addr = zmq_socket_addr
        self.__zmq_socket_type = zmq_socket_type
        self.__asyncio_loop = None
        self.__zmq_socket = None

    async def __message_recv_loop(self):
        while True:
            text = await self.__zmq_socket.recv_string()
            asyncio.ensure_future(self._on_message_to_thread(text))

    async def _send_message_from_thread(self, message: str):
        await self.__zmq_socket.send_string(message)

    @abstractmethod
    async def _on_message_to_thread(self, message: str):
        """Override this method to receive messages"""

    @abstractmethod
    async def _run_thread(self):
        """Override this method to do some async work.
        This method uses a separate thread.

        You can block yourself here if you don't do any await.

        Example:

        ```
        async def _run_thread(self):
            i = 0
            while True:
                await asyncio.sleep(1)
                i += 1
                await self._send_message_from_thread(f'{self.name}: ping {i}')
        ```
        """

    def run(self):
        self.__asyncio_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.__asyncio_loop)
        self.__zmq_socket = self._zmq_context.socket(self.__zmq_socket_type)
        self.__zmq_socket.connect(self.__zmq_socket_addr)
        asyncio.ensure_future(self.__message_recv_loop())
        self.__asyncio_loop.run_until_complete(self._run_thread())

    # TODO: implement stop signal handling


class AsyncZmqActor(AsyncZmqThread):
    """Threaded and Async Actor model based on ZMQ inproc communication

    override following:
    ```
    async def _run_thread(self)                        
    async def _on_message_to_thread(self, message: str)
    ```

    both methods run in actor's thread

    you can call `self._send_message_from_thread('txt')`

    to receive it later in `self._recv_message_from_thread()`.

    Example:

    ```
    class MyActor(AsyncZmqActor):
        async def _run_thread(self):
            self.counter = 0
            # runs in a different thread
            await self._send_message_from_thread('some_txt_message_to_actor')

        def async _on_message_to_thread(self, message):
            # runs in Thread-actor
            self.counter++

    asyncZmqActor = MyActor()
    asyncZmqActor.start()
    ```
    """

    def __init__(self):
        super(AsyncZmqActor, self).__init__(zmq.asyncio.Context(), ZMQ_THREAD_ACTOR_ADDR)

        self.__actor_socket = self._zmq_context.socket(zmq.PAIR)
        self.__actor_socket.bind(ZMQ_THREAD_ACTOR_ADDR)

    async def _put_message_to_thread(self, message: str):
        """It "sends" `message` to thread, 
        
        but we can't await it's `AsyncZmqThread._on_message_to_thread()`

        so it's "put", not "send"
        """
        await self.__actor_socket.send_string(message)

    async def _recv_message_from_thread(self) -> str:
        """Returns next message ``'txt'`` from thread sent by

        ``AsyncZmqActor._send_message_from_thread('txt')``

        """
        return await self.__actor_socket.recv_string()

    # TODO: implement graceful stopping
