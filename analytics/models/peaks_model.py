from models import Model

import utils
from scipy import signal
import numpy as np
import pandas as pd


class PeaksModel(Model):

    def __init__(self):
        super()

    def fit(self, dataframe: pd.DataFrame, segments: list, cache: dict) -> dict:
        pass

    def predict(self, dataframe: pd.DataFrame, cache: dict) -> dict:
        array = dataframe['value'].as_matrix()
        window_size = 20
        # window = np.ones(101)
        # mean_filtered = signal.fftconvolve(
        #     np.concatenate([np.zeros(window_size), array, np.zeros(window_size)]),
        #     window,
        #     mode='valid'
        # )
        # filtered = np.divide(array, mean_filtered / 101)

        window = signal.general_gaussian(2 * window_size + 1, p=0.5, sig=5)
        #print(window)
        filtered = signal.fftconvolve(array, window, mode='valid')

        # filtered = np.concatenate([
        #     np.zeros(window_size),
        #     filtered,
        #     np.zeros(window_size)
        # ])
        filtered = filtered / np.sum(window)
        array = array[window_size:-window_size]
        filtered = np.subtract(array, filtered)

        # filtered = np.convolve(array, step, mode='valid')
        # print(len(array))
        # print(len(filtered))

        # step = np.hstack((np.ones(window_size), 0, -1*np.ones(window_size)))
        #
        # conv = np.convolve(array, step, mode='valid')
        #
        # conv = np.concatenate([
        #     np.zeros(window_size),
        #     conv,
        #     np.zeros(window_size)])

        #data = step_detect.t_scan(array, window=window_size)
        data = filtered
        data /= data.max()

        result = utils.find_steps(data, 0.1)
        return [(dataframe.index[x], dataframe.index[x + window_size]) for x in result]
