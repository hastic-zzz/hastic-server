#!/usr/bin/env python
import csv
import os
from worker import worker


def enqueue_task():
    tasks_file = "tasks.csv"
    tasks = []
    with open(tasks_file) as csvfile:
        rdr = csv.reader(csvfile, delimiter=',')
        tasks = list(rdr)
    if len(tasks) == 0:
        return None
    res = tasks[0][0]
    tasks = tasks[1:]
    with open(tasks_file, "w+") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(tasks)
    return res


def set_lock(value):
    lock_file = "learn.lock"
    exists = os.path.exists(lock_file)
    if exists == value:
        return False

    if value:
        open(lock_file, "w+")
    else:
        os.remove(lock_file)
    return True


if __name__ == "__main__":
    if not set_lock(True):
        print("learn locked")
        exit(0)

    w = worker()
    while True:
        task = enqueue_task()
        if task is None:
            break

        w.start()
        w.add_task({"type": "learn", "anomaly_name": task})
        w.add_task({"type": "predict", "anomaly_name": task})
        w.stop()

    set_lock(False)