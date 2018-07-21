from scipy import signal
import numpy as np


def find_steps(array, threshold):
    """
    Finds local maxima by segmenting array based on positions at which
    the threshold value is crossed. Note that this thresholding is
    applied after the absolute value of the array is taken. Thus,
    the distinction between upward and downward steps is lost. However,
    get_step_sizes can be used to determine directionality after the
    fact.
    Parameters
    ----------
    array : numpy array
        1 dimensional array that represents time series of data points
    threshold : int / float
        Threshold value that defines a step
    Returns
    -------
    steps : list
        List of indices of the detected steps
    """
    steps        = []
    array        = np.abs(array)
    above_points = np.where(array > threshold, 1, 0)
    ap_dif       = np.diff(above_points)
    cross_ups    = np.where(ap_dif == 1)[0]
    cross_dns    = np.where(ap_dif == -1)[0]
    for upi, dni in zip(cross_ups,cross_dns):
        steps.append(np.argmax(array[upi:dni]) + upi)
    return steps


class PeaksDetector:
    def __init__(self):
        pass

    async def fit(self, dataset, contamination=0.005):
        pass

    async def predict(self, dataframe):
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

        result = find_steps(data, 0.1)
        return [(dataframe.index[x], dataframe.index[x + window_size]) for x in result]

    def save(self, model_filename):
        pass
        # with open(model_filename, 'wb') as file:
        #     pickle.dump((self.clf, self.scaler), file)

    def load(self, model_filename):
        pass
        # with open(model_filename, 'rb') as file:
        #     self.clf, self.scaler = pickle.load(file)
