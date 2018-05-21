from worker import worker

if __name__ == "__main__":
    w = worker()
    w.do_task({"type": "learn", "anomaly_name": "cpu_utilization_supervised", "segments": []})