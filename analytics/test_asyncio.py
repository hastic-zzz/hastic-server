import asyncio
import datetime

import zmq
import zmq.asyncio



FROM_TIME = datetime.datetime.now()

print(FROM_TIME)

# 0:00:00.433937 0:00:00.449319
# 0:00:04.897289 0:00:05.153654

# 
# 0:00:44.853960



async def calculate(name):
    for i in range(100000):
        #await asyncio.sleep(0)
        if i % 100 == 0:
            print('its ok %s - %d' % (name, i))
            

async def main(loop):
    tasks = [];
    await asyncio.gather(*tasks)


async def main(loop):
    tasks = [calculate('one'), calculate('two')]
    await asyncio.gather(*tasks)
    print('finish')
    print(datetime.datetime.now() - FROM_TIME)
    #await calculate('one')



ctx = zmq.asyncio.Context()

def recv_and_process():
    sock = ctx.socket(zmq.PAIR)
    sock.bind(url)
    msg = await sock.recv()
    print(msg)
    #reply = await async_process(msg)
    await sock.send_multipart(reply)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
