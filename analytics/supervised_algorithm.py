import pickle
from tsfresh.transformers.feature_selector import FeatureSelector
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import IsolationForest
import pandas as pd

from sklearn import svm


class supervised_algorithm(object):
    frame_size = 16
    good_features = [
        #"value__agg_linear_trend__f_agg_\"max\"__chunk_len_5__attr_\"intercept\"",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_12__w_20",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_13__w_5",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_2__w_10",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_2__w_20",
        # "value__cwt_coefficients__widths_(2, 5, 10, 20)__coeff_8__w_20",
        # "value__fft_coefficient__coeff_3__attr_\"abs\"",
        "time_of_day_column_x",
        "time_of_day_column_y",
        "value__abs_energy",
        # "value__absolute_sum_of_changes",
        # "value__sum_of_reoccurring_data_points",
    ]
    clf = None
    scaler = None

    def __init__(self):
        self.features = []
        self.col_to_max, self.col_to_min, self.col_to_median = None, None, None
        self.augmented_path = None

    def fit(self, dataset, contamination=0.005):
        dataset = dataset[self.good_features]
        dataset = dataset[-100000:]

        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        # self.clf = svm.OneClassSVM(nu=contamination, kernel="rbf", gamma=0.1)
        self.clf = IsolationForest(contamination=contamination)

        self.scaler.fit(dataset)

        dataset = self.scaler.transform(dataset)
        self.clf.fit(dataset)

    async def predict(self, dataframe):
        dataset = dataframe[self.good_features]
        dataset = self.scaler.transform(dataset)
        prediction = self.clf.predict(dataset)

        # for i in range(len(dataset)):
        #     print(str(dataset[i]) + " " + str(prediction[i]))

        prediction = [x < 0.0 for x in prediction]
        return pd.Series(prediction, index=dataframe.index)

    def save(self, model_filename):
        with open(model_filename, 'wb') as file:
            pickle.dump((self.clf, self.scaler), file)

    def load(self, model_filename):
        with open(model_filename, 'rb') as file:
            self.clf, self.scaler = pickle.load(file)

    def __select_features(self, x, y):
        # feature_selector = FeatureSelector()
        feature_selector = FeatureSelector()

        feature_selector.fit(x, y)
        return feature_selector.relevant_features
