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

async def send_detect():
    f = open('push', 'rb')
    data = f.read()
    await socket.send(data)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    socket.send(b'PING')
    detects = [send_detect() for i in range(100)]
    detects_group = asyncio.gather(*detects)
    handle_group = asyncio.gather(handle_loop())
    common_group = asyncio.gather(handle_group, detects_group)
    loop.run_until_complete(common_group)
