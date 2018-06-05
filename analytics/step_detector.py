import numpy as np
import pickle


def find_segments(array, threshold):
    segments     = []
    above_points = np.where(array > threshold, 1, 0)
    ap_dif       = np.diff(above_points)
    cross_ups    = np.where(ap_dif == 1)[0]
    cross_dns    = np.where(ap_dif == -1)[0]
    for upi, dni in zip(cross_ups,cross_dns):
        segments.append((upi, dni))
    return segments


def is_intersect(target_segment, segments):
    for segment in segments:
        start = max(segment['start'], target_segment[0])
        finish = min(segment['finish'], target_segment[1])
        if start <= finish:
            return True
    return False


def calc_intersections(segments, finded_segments):
    intersections = 0
    labeled = 0
    for segment in segments:
        if not segment['labeled']:
            continue

        labeled += 1
        intersect = False
        for finded_segment in finded_segments:
            start = max(segment['start'], finded_segment[0])
            finish = min(segment['finish'], finded_segment[1])
            if start <= finish:
                intersect = True
                break
        if intersect:
            intersections += 1
    return intersections, labeled


def cost_function(segments, finded_segments):
    intersections, labeled = calc_intersections(segments, finded_segments)
    return intersections == labeled


def compress_segments(segments):
    result = []
    for segment in segments:
        if len(result) == 0 or result[len(result) - 1][1] < segment[0]:
            result.append(segment)
        else:
            result[len(result) - 1] = (result[len(result) - 1][0], segment[1])
    return result


class StepDetector:
    def __init__(self, pattern):
        self.pattern = pattern
        self.mean = None
        self.window_size = None
        self.corr_max = None
        self.threshold = None
        self.segments = []

    def fit(self, dataframe, segments, contamination=0.01):
        array = dataframe['value'].as_matrix()
        self.mean = array.mean()
        self.segments = segments

        norm_data = (array - self.mean)

        self.__optimize(norm_data, segments, contamination)

        # print(self.threshold)

        # import matplotlib.pyplot as plt
        # fig, ax = plt.subplots(figsize=[18, 16])
        # ax = fig.add_subplot(2, 1, 1)
        # ax.plot(array)
        # ax = fig.add_subplot(2, 1, 2, sharex=ax)
        # ax.plot(corr_res)
        # plt.show()

        # #print(R.size)
        # # Nw = 20
        # # result = R[Nw,Nw:-1]
        # # result[0] = 0
        # #ax.plot(result)
        # #print(len(data))
        # #print(len(R))
        #
        # print(self.window_size)
        # print(self.threshold)

    def predict(self, dataframe):
        array = dataframe['value'].as_matrix()

        norm_data = (array - self.mean)

        step_size = self.window_size // 2
        pattern = np.concatenate([[-1] * step_size, [1] * step_size])
        corr_res = np.correlate(norm_data, pattern, mode='valid') / self.window_size
        corr_res = np.concatenate((np.zeros(step_size), corr_res, np.zeros(step_size)))

        corr_res /= self.corr_max

        result = self.__predict(corr_res, self.threshold)

        # import matplotlib.pyplot as plt
        # fig, ax = plt.subplots(figsize=[18, 16])
        # ax = fig.add_subplot(2, 1, 1)
        # ax.plot(array[:70000])
        # ax = fig.add_subplot(2, 1, 2, sharex=ax)
        # ax.plot(corr_res[:70000])
        # plt.show()

        result.sort()
        result = compress_segments(result)

        if len(self.segments) > 0:
            result = [segment for segment in result if not is_intersect(segment, self.segments)]
        return result

    def __optimize(self, data, segments, contamination):
        window_size = 10
        mincost = None
        while window_size < 100:
            # print(window_size)
            cost = self.__optimize_threshold(data, window_size, segments, contamination)
            if mincost is None or cost < mincost:
                mincost = cost
                self.window_size = window_size
            window_size = int(window_size * 1.2)
        self.__optimize_threshold(data, self.window_size, segments, contamination)

    def __optimize_threshold(self, data, window_size, segments, contamination):
        step_size = window_size // 2
        pattern = np.concatenate([[-1] * step_size, [1] * step_size])
        corr_res = np.correlate(data, pattern, mode='same') / window_size
        corr_res = np.concatenate((np.zeros(step_size), corr_res, np.zeros(step_size)))
        self.corr_max = corr_res.max()
        corr_res /= self.corr_max
        N = 20
        lower = 0.
        upper = 1.
        cost = 0
        for i in range(0, N):
            self.threshold = 0.5 * (lower + upper)
            result = self.__predict(corr_res, self.threshold)

            if len(segments) > 0:
                intersections, labeled = calc_intersections(segments, result)
                good = intersections == labeled
                cost = len(result)
            else:
                total_sum = 0
                for segment in result:
                    total_sum += (segment[1] - segment[0])
                good = total_sum > len(data) * contamination
                cost = -self.threshold

            if good:
                lower = self.threshold
            else:
                upper = self.threshold

        return cost

    def __predict(self, data, threshold):
        segments = find_segments(data, threshold)
        segments += find_segments(data * -1, threshold)
        #segments -= 1
        return [(x - 1, y - 1) for (x, y) in segments]

    def save(self, model_filename):
        with open(model_filename, 'wb') as file:
            pickle.dump((self.mean, self.window_size, self.corr_max, self.threshold), file)

    def load(self, model_filename):
        try:
            with open(model_filename, 'rb') as file:
                self.mean, self.window_size, self.corr_max, self.threshold = pickle.load(file)
        except:
            pass
