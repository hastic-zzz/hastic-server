import pandas as pd

class DataBucket(object):

    data: pd.DataFrame

    def receive_data(self, data: pd.DataFrame):
        if not self.saved_data:
            self.data = data

        self.data = pd.concat(self.data, data)

    def drop_data(self, count: int):
        self.data = self.data.iloc[count:]
