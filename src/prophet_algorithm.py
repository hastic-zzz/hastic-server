from fbprophet import Prophet
import pandas as pd


class prophet_algorithm(object):
    def __init__(self):
        self.model = None
        self.dataset = None

    def fit(self, data, anomalies):
        pass

    def predict(self, data):
        data = data.reset_index()
        data = data.rename(columns={'timestamp': 'ds', 'value': 'y'})
        self.dataset = data

        self.model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=True)
        self.model.fit(self.dataset)

        future = self.model.make_future_dataframe(freq='H', periods=0, include_history=True)
        forecast = self.model.predict(future)
        cmp_df = forecast.set_index('ds')[['yhat', 'yhat_lower', 'yhat_upper']].join(self.dataset.set_index('ds'))
        cmp_df['e'] = [ max(row.y - row.yhat_upper, row.yhat_lower - row.y, 0) for index, row in cmp_df.iterrows() ]
        return self.__calc_anomalies(cmp_df)

    def __calc_anomalies(self, dataset):
        anomalies = []
        cur_anomaly = None
        for i in range(len(dataset)):
            if dataset['e'][i] > 17:
                if cur_anomaly is None:
                    cur_anomaly = {'start': dataset.index[i], 'finish': dataset.index[i], 'weight': 0}
                cur_anomaly['finish'] = dataset.index[i]
                cur_anomaly['weight'] += dataset['e'][i]
            elif cur_anomaly is not None:
                anomalies.append(cur_anomaly)
                cur_anomaly = None
        return anomalies


if __name__ == "__main__":
    dataset = pd.read_csv('art_daily_flatmiddle.csv', index_col=['timestamp'], parse_dates=['timestamp'])
    algo = prophet_algorithm(dataset)
    res = algo.fit()
    print(res)