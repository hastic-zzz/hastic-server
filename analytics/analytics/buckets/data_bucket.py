import pandas as pd

class DataBucket(object):

    data: pd.DataFrame

    def __init__(self):
        self.data = pd.DataFrame([], columns=['timestamp', 'value'])

    def receive_data(self, data: pd.DataFrame):
        self.data = pd.concat(self.data, data)

    def drop_data(self, count: int):
        self.data = self.data.iloc[count:]
