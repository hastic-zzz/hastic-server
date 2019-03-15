import zmq
import zmq.asyncio
import asyncio

context = zmq.asyncio.Context()
socket = context.socket(zmq.PAIR)
socket.connect('tcp://0.0.0.0:8002')

async def handle_loop():
    while True:
        received_bytes = await socket.recv()
        text = received_bytes.decode('utf-8')

        print(text)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    socket.send(b'PING')
    loop.run_until_complete(handle_loop())
