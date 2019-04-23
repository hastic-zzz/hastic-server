import pandas as pd


class DataBucket:

    def __init__(self):
        self.data = pd.DataFrame([], columns=['timestamp', 'value'])

    def receive_data(self, data: pd.DataFrame):
        self.data = self.data.append(data, ignore_index=True)

    def drop_data(self, count: int):
        if count > 0:
            self.data = self.data.iloc[count:]
