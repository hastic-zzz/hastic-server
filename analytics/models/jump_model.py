from models import Model

import utils
import numpy as np
import scipy.signal
from scipy.fftpack import fft
from scipy.signal import argrelextrema
import math


WINDOW_SIZE = 120

class JumpModel(Model):

    def __init__(self):
        super()
        self.state = {
            'confidence': 1.5,
            'convolve_max': WINDOW_SIZE,
            'self.JUMP_HEIGHT': 1, 
        }
    
    async def fit(self, dataframe, segments):
        self.segments = segments
        #self.alpha_finder()
        data = dataframe['value']
        confidences = []
        convolve_list = []
        jump_height_list = []
        for segment in segments:
            if segment['labeled']:
                segment_data = data[segment['start'] : segment['finish'] + 1]
                segment_min = min(segment_data)
                segment_max = max(segment_data)
                confidences.append(0.20 * (segment_max - segment_min))
                flat_segment = segment_data.rolling(window=4).mean() #сглаживаем сегмент
                kde_segment = flat_data.dropna().plot.kde() # distribution density
                ax_list = kde_segment.get_lines()[0].get_xydata() #take coordinates of kde
                mids = argrelextrema(np.array(ax_list), np.less)[0] 
                maxs = argrelextrema(np.array(ax_list), np.greater)[0]
                min_peak_index = maxs[0]
                max_peak_index = maxs[1]
                min_line_value = ax_list[min_peak_index, 0]
                max_line_value = ax_list[max_peak_index, 0]
                jump_heidht = max_line_value - min_line_value
                jump_height_list.append(jump_heidht)
                pat_sigm = utils.MyLogisticSigmoid(WINDOW_SIZE, 1, jump_heidht)
                for i in range(0, len(pat_sigm)):
                    pat_sigm[i] = pat_sigm[i] + min_line 
                cen_ind = utils.intersection_segment(flat_segment, mids[0]) #finds all interseprions with median
                c = [] # choose the correct one interseption by convolve
                jump_center = utils.find_jump_center(cen_ind)

                segment_cent_index = jump_center - 4 #'<- if error: jump_center + segment[start]'
                labeled_drop = data[segment_cent_index - WINDOW_SIZE : segment_cent_index + WINDOW_SIZE] #' <-error mb'
                labeled_min = min(labeled_drop) 
                #TODO: add new cut and normalize with kde_density
                for value in labeled_drop: # new cut - kde_min
                    value = value - labeled_min
                labeled_max = max(labeled_drop)
                #for value in labeled_drop: # new norm - kde_max
                #     value = value / labeled_max
                convolve = scipy.signal.fftconvolve(labeled_drop, labeled_drop)
                convolve_list.append(max(convolve)) # сворачиваем паттерн
                # TODO: add convolve with alpha sigmoid
        if len(jump_height_list) > 0:
            self.state['JUMP_HEIGHT'] = min(jump_height_list)
        else:
            self.state['JUMP_HEIGHT'] = 1

        if len(confidences) > 0:
            self.state['confidence'] = min(confidences)
        else:
            self.state['confidence'] = 1.5

        if len(convolve_list) > 0:
            self.state['convolve_max'] = max(convolve_list)
        else:
            self.state['convolve_max'] = WINDOW_SIZE # макс метрика свертки равна отступу(WINDOW_SIZE), вау!
    
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
        possible_jumps = utils.find_all_jumps(all_max_flatten_data, 50, self.state['JUMP_HEIGHT']*0.9)

        '''
        for i in utils.exponential_smoothing(data + self.state['confidence'], 0.02):
            extrema_list.append(i)

        segments = []
        for i in all_mins:
            if all_max_flatten_data[i] > extrema_list[i]:
                segments.append(i - window_size)
        '''

        return [(x - 1, x + 1) for x in self.__filter_prediction(possible_jumps, all_max_flatten_data)]

    def __filter_prediction(self, segments, all_max_flatten_data):
        delete_list = []
        variance_error = int(0.004 * len(all_max_flatten_data))
        if variance_error > 50:
            variance_error = 50
        for i in range(1, len(segments)):
            if segments[i] < segments[i - 1] + variance_error:
                delete_list.append(segments[i])
        for item in delete_list:
            segments.remove(item)

        # изменить секонд делит лист, сделать для свертки с сигмоидой
        # написать фильтрацию паттернов-джампов! посмотерть каждый сегмент
        # отнормировать, сравнить с выбранным патерном.
        delete_list = []
        pattern_data = all_max_flatten_data[segments[0] - WINDOW_SIZE : segments[0] + WINDOW_SIZE]
        p_min = min(pattern_data)
        for segment in segments:
            convol_data = all_max_flatten_data[segment - WINDOW_SIZE : segment + WINDOW_SIZE]
            c_min = min(convol_data)
            abs_min = 100
            if c_min < p_min:
                abs_min = c_min
            else:
                abs_min = p_min
            for value in convol_data: # cut
                    value = value - abs_min    
            conv = scipy.signal.fftconvolve(pattern_data, convol_data)
            if max(conv) > self.state['convolve_max'] * 1.1 or max(conv) < self.state['convolve_max'] * 0.9:
                delete_list.append(segment)
        for item in delete_list:
            segments.remove(item)

        return segments

    def alpha_finder(self, data):
        """
        поиск альфы для логистической сигмоиды
        """
        pass
