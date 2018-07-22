import utils
import numpy as np
import pickle
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math


class JumpDetector:

    def __init__(self):
        self.segments = []
        self.confidence = 1.5
        self.convolve_max = 120
    
    async def fit(self, dataframe, segments):
        #self.alpha_finder()
        data = dataframe['value']
        confidences = []
        convolve_list = []
        for segment in segments:
            if segment['labeled']:
                segment_data = data[segment['start'] : segment['finish'] + 1]
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=4).mean() #сглаживаем сегмент
                kde_segment = flat_data.dropna().plot.kde() # distribution density
                ax = flat_data.dropna().plot.kde()
                ax_list = ax.get_lines()[0].get_xydata()
                mids = argrelextrema(np.array(ax_list), np.less)[0]
                maxs = argrelextrema(np.array(ax_list), np.greater)[0]
                min_peak = maxs[0]
                max_peak = maxs[1]
                min_line = ax_list[min_peak, 0]
                max_line = ax_list[max_peak, 0]
                sigm_heidht = max_line - min_line
                pat_sigm = utils.logistic_sigmoid(-120, 120, 1, sigm_heidht)
                for i in range(0, len(pat_sigm)):
                    pat_sigm[i] = pat_sigm[i] + min_line 
                cen_ind = utils.intersection_segment(flat_segment, mids[0])
                c = []
                for i in range(len(cen_ind)):
                    x = cen_ind[i]
                    cx = scipy.signal.fftconvolve(pat_sigm, flat_data[x-120:x+120])
                    c.append(cx[240])
                
                # в идеале нужно посмотреть гистограмму сегмента и выбрать среднее значение,
                # далее от него брать + -120 
                segment_summ = 0
                for val in flat_segment:
                    segment_summ += val
                segment_mid = segment_summ /  len(flat_segment) #посчитать нормально среднее значение/медиану
                for ind in range(1, len(flat_segment) - 1):
                    if flat_segment[ind + 1] > segment_mid and flat_segment[ind - 1] < segment_mid:
                        flat_mid_index = ind   # найти пересечение средней и графика, получить его индекс
                segment_mid_index = flat_mid_index - 5
                labeled_drop = data[segment_mid_index - 120 : segment_mid_index + 120]
                labeled_min = min(labeled_drop) 
                for value in labeled_drop: # обрезаем
                    value = value - labeled_min
                labeled_max = max(labeled_drop)
                for value in labeled_drop: # нормируем
                    value = value / labeled_max
                convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
                convolve_list.append(max(convolve)) # сворачиваем паттерн
                # плюс надо впихнуть сюда логистическую сигмоиду и поиск альфы

        if len(confidences) > 0:
            self.confidence = min(confidences)
        else:
            self.confidence = 1.5

        if len(convolve_list) > 0:
            self.convolve_max = max(convolve_list)
        else:
            self.convolve_max = 120 # макс метрика свертки равна отступу(120), вау!
    
    async def predict(self, dataframe):
        data = dataframe['value']

        result = await self.__predict(data)
        result.sort()

        if len(self.segments) > 0:
            result = [segment for segment in result if not utils.is_intersect(segment, self.segments)]
        return result

    async def __predict(self, data):
        window_size = 24
        all_max_flatten_data = data.rolling(window=window_size).mean()
        all_mins = argrelextrema(np.array(all_max_flatten_data), np.less)[0]
        extrema_list = []
        # добавить все пересечения экспоненты со сглаженным графиком
        
        for i in utils.exponential_smoothing(data + self.confidence, 0.02):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if all_max_flatten_data[i] > extrema_list[i]:
                segments.append(i - window_size)

        return [(x - 1, x + 1) for x in self.__filter_prediction(segments, all_max_flatten_data)]

    def __filter_prediction(self, segments, all_max_flatten_data):
        delete_list = []
        variance_error = int(0.004 * len(all_max_flatten_data))
        if variance_error > 200:
            variance_error = 200
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        # изменить секонд делит лист, сделать для свертки с сигмоидой
        delete_list = []
        pattern_data = all_max_flatten_data[segments[0] - 120 : segments[0] + 120]
        for segment in segments:
            convol_data = all_max_flatten_data[segment - 120 : segment + 120]
            conv = scipy.signal.fftconvolve(pattern_data, convol_data)
            if max(conv) > self.convolve_max * 1.1 or max(conv) < self.convolve_max * 0.9:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return segments

    def save(self, model_filename):
        with open(model_filename, 'wb') as file:
            pickle.dump((self.confidence, self.convolve_max), file)

    def load(self, model_filename):
        try:
            with open(model_filename, 'rb') as file:
                (self.confidence, self.convolve_max) = pickle.load(file)
        except:
            pass

    def alpha_finder(self, data):
        """
        поиск альфы для логистической сигмоиды
        """
        pass
