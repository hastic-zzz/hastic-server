# Hastic-server-analytics

Python service which gets tasks from [hastic-server-node](https://github.com/hastic/hastic-server/tree/master/server) like

* trains statistical models
* detect patterns in time series data

## Arhitecture

The service uses [asyncio](https://docs.python.org/3/library/asyncio.html), 
[concurrency](https://docs.python.org/3.6/library/concurrent.futures.html#module-concurrent.futures) and 
[pyzmq](https://pyzmq.readthedocs.io/en/latest/). 
