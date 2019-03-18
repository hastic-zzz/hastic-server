import zmq
import zmq.asyncio
import asyncio
import json
from uuid import uuid4

context = zmq.asyncio.Context()
socket = context.socket(zmq.PAIR)
socket.connect('tcp://0.0.0.0:8002')

def create_message():
    message = {
      "method": "DATA",
      "payload": {
        "_id": uuid4().hex,
        "analyticUnitId": uuid4().hex,
        "type": "PUSH",
        "payload": {
          "data": [
            [
              1552652025000,
              12.499999999999998
            ],
            [
              1552652040000,
              12.500000000000002
            ],
            [
              1552652055000,
              12.499999999999996
            ],
            [
              1552652070000,
              12.500000000000002
            ],
            [
              1552652085000,
              12.499999999999998
            ],
            [
              1552652100000,
              12.5
            ],
            [
              1552652115000,
              12.83261113785909
            ]
          ],
          "from": 1552652025001,
          "to": 1552652125541,
          "analyticUnitType": "GENERAL",
          "detector": "pattern",
          "cache": {
            "pattern_center": [
              693
            ],
            "pattern_model": [
              1.7763568394002505e-15,
              5.329070518200751e-15,
              1.7763568394002505e-15,
              1.7763568394002505e-15,
              1.7763568394002505e-15,
              3.552713678800501e-15,
              1.7763568394002505e-15,
              3.552713678800501e-15,
              3.552713678800501e-15,
              1.7763568394002505e-15,
              1.7763568394002505e-15,
              0,
              1.7763568394002505e-15,
              1.7763568394002505e-15,
              0
            ],
            "convolve_max": 7.573064690121713e-29,
            "convolve_min": 7.573064690121713e-29,
            "WINDOW_SIZE": 7,
            "conv_del_min": 7,
            "conv_del_max": 7
          }
        }
      }
    }

    return json.dumps(message)

async def handle_loop():
    while True:
        received_bytes = await socket.recv()
        text = received_bytes.decode('utf-8')

        print(text)

async def send_detect():
    data = create_message().encode('utf-8')
    await socket.send(data)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    socket.send(b'PING')
    detects = [send_detect() for i in range(100)]
    detects_group = asyncio.gather(*detects)
    handle_group = asyncio.gather(handle_loop())
    common_group = asyncio.gather(handle_group, detects_group)
    loop.run_until_complete(common_group)
