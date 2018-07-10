import detectors.step_detect

from scipy import signal
import numpy as np



class PeaksDetector:
    def __init__(self):
        pass

    def fit(self, dataset, contamination=0.005):
        pass

    def predict(self, dataframe):
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

        result = step_detect.find_steps(data, 0.1)
        return [(dataframe.index[x], dataframe.index[x + window_size]) for x in result]

    def save(self, model_filename):
        pass
        # with open(model_filename, 'wb') as file:
        #     pickle.dump((self.clf, self.scaler), file)

    def load(self, model_filename):
        pass
        # with open(model_filename, 'rb') as file:
        #     self.clf, self.scaler = pickle.load(file)
