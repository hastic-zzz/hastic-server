import argparse
import csv
import time
import datetime
import pandas as pd
import matplotlib.pyplot as plt

from influxdb import InfluxDBClient
from sklearn import svm
import numpy as np
import math
import pickle


host = "209.205.120.226"
port = 8086
datasetFile = "/tmp/dataset.csv"
anomaliesFile = "anomalies.csv"
predictedAnomaliesFile = "predicted_anomalies.csv"
modelFilename = 'finalized_model.sav'


def readAnomalies():
    anomalies = []

    with open(anomaliesFile) as csvfile:
        rdr = csv.reader(csvfile, delimiter=',')
        for row in rdr:
            anomaly = (int(row[0]), int(row[1]))
            anomalies.append(anomaly)

    return anomalies


"""Instantiate a connection to the InfluxDB."""
user = ''
password = ''
dbname = 'accelerometer'
query = 'select k0, k1, k2 from vals limit 10000;'


client = InfluxDBClient(host, port, user, password, dbname)

def predict(host=host, port=port):

    result = client.query(query)
    df = pd.DataFrame(result['vals'], columns=['time', 'k0', 'k1', 'k2'])

    basedAnomalies = readAnomalies()

    df2 = df.rolling(200, win_type='triang').sum()
    df2['time'] = pd.to_datetime(df2['time'])
    df2 = df2[np.isfinite(df2['k0'])]

    print(len(df2))


    anomalies = []
    last_anomaly = (-1, -1)
    with open(modelFilename, 'rb') as fid:
        clf = pickle.load(fid)
        prediction = clf.predict(df2[['k0', 'k1', 'k2']])
        print(len(prediction))
        #print(prediction)
        for i in range(len(prediction)):
            if prediction[i] > 0.:
                t = df2['time'][i + 199].timestamp()
                t = ((t + 0 * 3600) * 1000)
                if t < basedAnomalies[len(basedAnomalies) - 1][1]:
                    continue
                if t < last_anomaly[1] + 1000:
                    last_anomaly = (last_anomaly[0], t)
                else:
                    if last_anomaly[1] != -1:
                        anomalies.append(last_anomaly)
                    last_anomaly = (t, t)

    with open(predictedAnomaliesFile, "w") as file:
        for anomaly in anomalies:
            file.write(str(int(anomaly[0])) + "," + str(int(anomaly[1])) + "\n")

predict()

