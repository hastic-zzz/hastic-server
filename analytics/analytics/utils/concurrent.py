import asyncio
import threading
import zmq
import zmq.asyncio


class AsyncZmqThread(threading.Thread):
    """ Class for wrapping zmq socket into a thread with it's own asyncio event loop

    """

    def __init__(self, zmq_context: zmq.asyncio.Context, zmq_socket_addr: str, socket_type = zmq.PAIR):
        super(AsyncZmqThread, self).__init__()
        self.zmq_socket_addr = zmq_socket_addr
        self.socket_type = socket_type
        self._zmq_context = zmq_context

        self.__asyncio_loop = None
        self.__zmq_socket = None

    async def __message_loop(self):
        while True:
            text = await self.__zmq_socket.recv_string()
            asyncio.ensure_future(self._on_message(text))

    async def _send_message(self, message: str):
        await self.__zmq_socket.send_string(message)

    async def _on_message(self, message: str):
        """Override this method to receive messages"""
        pass

    async def _run(self):
        """Override this method to do some async work.
        This method uses a separate thread.
        You can block yourself here if you don't do any await.

        Example:

        >>>
        async def _run(self):
            i = 0
            while True:
                await asyncio.sleep(1)
                i += 1
                await self._send_message(f'{self.name}: ping {i}')

        """

    def run(self):
        self.__asyncio_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.__asyncio_loop)
        self.__zmq_socket = self._zmq_context.socket(self.socket_type)
        self.__zmq_socket.connect(self.zmq_socket_addr)
        asyncio.ensure_future(self.__message_loop())
        self.__asyncio_loop.run_until_complete(self._run())

    # TODO: implement stop signal handling


class AsyncZmqActor(AsyncZmqThread):
    """Threaded and Async Actor model based on ZMQ inproc communication

    override following
    * async _run(self) -- required
    * async def _on_message(self, message: str) -- not required

    then run asyncZmqActor.start()

    Example:

    >>>
    class MyActor(AsyncZmqActor):
        def async _run(self):
            self.counter = 0
            # runs in Thread-actor
            await self._send_message('some_txt_message_to_outer_world')

        def async _on_message(self, message):
            # runs in Thread-actor
            self.counter++
    """

    def __init__(self):
        # we have a seperate zmq context, so zqm address 'inproc://xxx' doesn't matter
        super(AsyncZmqActor, self).__init__(zmq.asyncio.Context(), 'inproc://xxx')

        self.__actor_socket = self._zmq_context.socket(zmq.PAIR)
        self.__actor_socket.bind(self.zmq_socket_addr)

    async def put_message(self, message: str):
        await self.__actor_socket.send_string(message)
    
    def __aiter__(self):
        return self
    
    async def __anext__(self) -> str:
        return await self.__actor_socket.recv_string()
    
    # TODO: implement graceful stopping