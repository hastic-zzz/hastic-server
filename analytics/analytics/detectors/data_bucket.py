import pandas as pd

class DataBucket(object):

    saved_data: pd.DataFrame

    def receive_data(self, data: pd.DataFrame):
        if not self.saved_data:
            self.saved_data = data

        self.saved_data = pd.concat(self.saved_data, data)

    def drop_data(self, count: int):
        self.saved_data.iloc[count:]
