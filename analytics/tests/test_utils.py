from analytic_types.segment import Segment

import utils
import unittest
import numpy as np
import pandas as pd
import math
import random

RELATIVE_TOLERANCE = 1e-1

class TestUtils(unittest.TestCase):

    #example test for test's workflow purposes
    def test_segment_parsion(self):
        self.assertTrue(True)
    
    def test_confidence_all_normal_value(self):
        segment = [1, 2, 0, 6, 8, 5, 3]
        utils_result = utils.find_confidence(segment)[0]
        result = 4.0
        self.assertTrue(math.isclose(utils_result, result, rel_tol = RELATIVE_TOLERANCE))
    
    def test_confidence_all_nan_value(self):
        segment = [np.nan, np.nan, np.nan, np.nan]
        self.assertEqual(utils.find_confidence(segment)[0], 0)
    
    def test_confidence_with_nan_value(self):
        data = [np.nan, np.nan, 0, 8]
        utils_result = utils.find_confidence(data)[0]
        result = 4.0
        self.assertTrue(math.isclose(utils_result, result, rel_tol = RELATIVE_TOLERANCE))
    
    def test_interval_all_normal_value(self):
        data = [1, 2, 1, 2, 4, 1, 2, 4, 5, 6]
        data = pd.Series(data)
        center = 4
        window_size = 2
        result = [1, 2, 4, 1, 2]
        self.assertEqual(list(utils.get_interval(data, center, window_size)), result)
    
    def test_interval_wrong_ws(self):
        data = [1, 2, 4, 1, 2, 4]
        data = pd.Series(data)
        center = 3
        window_size = 6
        result = [1, 2, 4, 1, 2, 4]
        self.assertEqual(list(utils.get_interval(data, center, window_size)), result)
    
    def test_subtract_min_without_nan(self):
        segment = [1, 2, 4, 1, 2, 4]    
        segment = pd.Series(segment)
        result = [0, 1, 3, 0, 1, 3]
        utils_result = list(utils.subtract_min_without_nan(segment))
        self.assertEqual(utils_result, result)
    
    def test_subtract_min_with_nan(self):
        segment = [np.nan, 2, 4, 1, 2, 4]
        segment = pd.Series(segment)
        result = [2, 4, 1, 2, 4]
        utils_result = list(utils.subtract_min_without_nan(segment)[1:])
        self.assertEqual(utils_result, result)
    
    def test_get_convolve(self):
        data = [1, 2, 3, 2, 2, 0, 2, 3, 4, 3, 2, 1, 1, 2, 3, 4, 3, 2, 0]
        data = pd.Series(data)
        pattern_index = [2, 8, 15]
        window_size = 2
        av_model = [1, 2, 3, 2, 1]
        result = []
        self.assertNotEqual(utils.get_convolve(pattern_index, av_model, data, window_size), result)
    
    def test_get_convolve_with_nan(self):
        data = [1, 2, 3, 2, np.nan, 0, 2, 3, 4, np.nan, 2, 1, 1, 2, 3, 4, 3, np.nan, 0]
        data = pd.Series(data)
        pattern_index = [2, 8, 15]
        window_size = 2
        av_model = [1, 2, 3, 2, 1]
        result = utils.get_convolve(pattern_index, av_model, data, window_size)
        for val in result:
            self.assertFalse(np.isnan(val))
    
    def test_get_convolve_empty_data(self):
        data = []
        pattern_index = []
        window_size = 2
        window_size_zero = 0
        av_model = []
        result = []
        self.assertEqual(utils.get_convolve(pattern_index, av_model, data, window_size), result)
        self.assertEqual(utils.get_convolve(pattern_index, av_model, data, window_size_zero), result)
    
    def test_find_jump_parameters_center(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_center = [10, 11]
        self.assertIn(utils.find_pattern_center(segment, 0, 'jump'), jump_center)
    
    def test_find_jump_parameters_height(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_height = [3.5, 4]
        self.assertGreaterEqual(utils.find_parameters(segment, 0, 'jump')[0], jump_height[0])
        self.assertLessEqual(utils.find_parameters(segment, 0, 'jump')[0], jump_height[1])
    
    def test_find_jump_parameters_length(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_length = 2
        self.assertEqual(utils.find_parameters(segment, 0, 'jump')[1], jump_length)
    
    def test_find_drop_parameters_center(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_center = [14, 15, 16]
        self.assertIn(utils.find_pattern_center(segment, 0, 'drop'), drop_center)
    
    def test_find_drop_parameters_height(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_height = [3.5, 4]
        self.assertGreaterEqual(utils.find_parameters(segment, 0, 'drop')[0], drop_height[0])
        self.assertLessEqual(utils.find_parameters(segment, 0, 'drop')[0], drop_height[1])
    
    def test_find_drop_parameters_length(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_length = 2
        self.assertEqual(utils.find_parameters(segment, 0, 'drop')[1], drop_length)
    
    def test_get_av_model_empty_data(self):
        patterns_list = []
        result = []
        self.assertEqual(utils.get_av_model(patterns_list), result)

    def test_get_av_model_normal_data(self):
        patterns_list = [[1, 1, 1], [2, 2, 2],[3,3,3]]
        result = [2.0, 2.0, 2.0]
        self.assertEqual(utils.get_av_model(patterns_list), result)
    
    def test_get_distribution_density(self):
        segment = [1, 1, 1, 3, 5, 5, 5]
        segment = pd.Series(segment)
        result = (3, 5, 1)
        self.assertEqual(utils.get_distribution_density(segment), result)
    
    def test_get_distribution_density_right(self):
        data = [1.0, 5.0, 5.0, 4.0]
        data = pd.Series(data)
        median = 3.0
        max_line = 5.0
        min_line = 1.0
        utils_result = utils.get_distribution_density(data)
        self.assertTrue(math.isclose(utils_result[0], median, rel_tol = RELATIVE_TOLERANCE))
        self.assertTrue(math.isclose(utils_result[1], max_line, rel_tol = RELATIVE_TOLERANCE))
        self.assertTrue(math.isclose(utils_result[2], min_line, rel_tol = RELATIVE_TOLERANCE))
    
    def test_get_distribution_density_left(self):
        data = [1.0, 1.0, 2.0, 1.0, 5.0]
        data = pd.Series(data)
        median = 3.0
        max_line = 5.0
        min_line = 1.0
        utils_result = utils.get_distribution_density(data)
        self.assertTrue(math.isclose(utils_result[0], median, rel_tol = RELATIVE_TOLERANCE))
        self.assertTrue(math.isclose(utils_result[1], max_line, rel_tol = RELATIVE_TOLERANCE))
        self.assertTrue(math.isclose(utils_result[2], min_line, rel_tol = RELATIVE_TOLERANCE))
    
    def test_get_distribution_density_short_data(self):
        data = [1.0, 5.0]
        data = pd.Series(data)
        segment = [1.0]
        segment = pd.Series(segment)
        utils_result_data = utils.get_distribution_density(data)
        utils_result_segment = utils.get_distribution_density(segment)
        self.assertEqual(len(utils_result_data), 3)
        self.assertEqual(utils_result_segment, (0, 0, 0))

    def test_get_distribution_density_with_nans(self):
        segment = [np.NaN, 1, 1, 1, np.NaN, 3, 5, 5, 5, np.NaN]
        segment = pd.Series(segment)
        result = (3, 5, 1)
        self.assertEqual(utils.get_distribution_density(segment), result)
    
    def test_find_pattern_jump_center(self):
        data = [1.0, 1.0, 1.0, 5.0, 5.0, 5.0]
        data = pd.Series(data)
        median = 3.0
        result = 3
        self.assertEqual(result, utils.find_pattern_center(data, 0, 'jump'))
    
    def test_get_convolve_wrong_index(self):
        data = [1.0, 5.0, 2.0, 1.0, 6.0, 2.0]
        data = pd.Series(data)
        segemnts = [1, 11]
        av_model = [0.0, 4.0, 0.0]
        window_size = 1
        try:
            utils.get_convolve(segemnts, av_model, data, window_size)
        except ValueError:
            self.fail('Method get_convolve raised unexpectedly')
    
    def test_get_av_model_for_different_length(self):
        patterns_list = [[1.0, 1.0, 2.0], [4.0, 4.0], [2.0, 2.0, 2.0], [3.0, 3.0], []]
        try:
            utils.get_av_model(patterns_list)
        except ValueError:
            self.fail('Method get_convolve raised unexpectedly')
    
    def test_find_nan_indexes(self):
        data = [1, 1, 1, 0, 0, np.nan, None, []]
        data = pd.Series(data)
        result = [5, 6]
        self.assertEqual(utils.find_nan_indexes(data), result)
    
    def test_find_nan_indexes_normal_values(self):
        data = [1, 1, 1, 0, 0, 0, 1, 1]
        data = pd.Series(data)
        result = []
        self.assertEqual(utils.find_nan_indexes(data), result)
    
    def test_find_nan_indexes_empty_values(self):
        data = []
        result = []
        self.assertEqual(utils.find_nan_indexes(data), result)
    
    def test_create_correlation_data(self):
        data = [random.randint(10, 999) for _ in range(10000)]
        data = pd.Series(data)
        pattern_model = [100, 200, 500, 300, 100]
        ws = 2
        result = 6000
        corr_data = utils.get_correlation_gen(data, ws, pattern_model)
        corr_data = list(corr_data)
        self.assertGreaterEqual(len(corr_data), result)

    def test_inverse_segment(self):
        data = pd.Series([1,2,3,4,3,2,1])
        result = pd.Series([3,2,1,0,1,2,3])
        utils_result = utils.inverse_segment(data)
        for ind, val in enumerate(utils_result):
            self.assertEqual(val, result[ind])
    
    def test_get_end_of_segment_equal(self):
        data = pd.Series([5,4,3,2,1,0,0,0])
        result_list = [4, 5, 6]
        self.assertIn(utils.get_end_of_segment(data, False), result_list)
    
    def test_get_end_of_segment_greater(self):
        data = pd.Series([5,4,3,2,1,0,1,2,3])
        result_list = [4, 5, 6]
        self.assertIn(utils.get_end_of_segment(data, False), result_list)

    def test_get_borders_of_peaks(self):
        data = pd.Series([1,0,1,2,3,2,1,0,0,1,2,3,4,3,2,2,1,0,1,2,3,4,5,3,2,1,0])
        pattern_center = [4, 12, 22]
        ws = 3
        confidence = 1.5
        result = [(1, 7), (9, 15), (19, 25)]
        self.assertEqual(utils.get_borders_of_peaks(pattern_center, data, ws, confidence), result)

    def test_get_borders_of_peaks_for_trough(self):
        data = pd.Series([4,4,5,5,3,1,3,5,5,6,3,2])
        pattern_center = [5]
        ws = 5
        confidence = 3
        result = [(3, 7)]
        self.assertEqual(utils.get_borders_of_peaks(pattern_center, data, ws, confidence, inverse = True), result)

    def test_get_start_and_end_of_segments(self):
        segments = [[1, 2, 3, 4], [5, 6, 7], [8], [], [12, 12]]
        result = [[1, 4], [5, 7], [8, 8], [12, 12]]
        utils_result = utils.get_start_and_end_of_segments(segments)
        for got, expected in zip(utils_result, result):
            self.assertEqual(got, expected)

    def test_get_start_and_end_of_segments_empty(self):
        segments = []
        result = []
        utils_result = utils.get_start_and_end_of_segments(segments)
        self.assertEqual(result, utils_result)

    def test_merge_intersecting_segments(self):
        test_cases = [
            {
                'index': [Segment(10, 20), Segment(30, 40)],
                'result': [[10, 20], [30, 40]],
                'step': 0,
            },
            {
                'index': [Segment(10, 20), Segment(13, 23), Segment(15, 17), Segment(20, 40)],
                'result': [[10, 40]],
                'step': 0,
            },
            {
                'index': [],
                'result': [],
                'step': 0,
            },
            {
                'index': [Segment(10, 20)],
                'result': [[10, 20]],
                'step': 0,
            },
            {
                'index': [Segment(10, 20), Segment(13, 23), Segment(25, 30), Segment(35, 40)],
                'result': [[10, 23], [25, 30], [35, 40]],
                'step': 0,
            },
            {
                'index': [Segment(10, 50), Segment(5, 40), Segment(15, 25), Segment(6, 50)],
                'result': [[5, 50]],
                'step': 0,
            },
            {
                'index': [Segment(5, 10), Segment(10, 20), Segment(25, 50)],
                'result': [[5, 20], [25, 50]],
                'step': 0,
            },
            {
                'index': [Segment(20, 40), Segment(10, 15), Segment(50, 60)],
                'result': [[10, 15], [20, 40], [50, 60]],
                'step': 0,
            },
            {
                'index': [Segment(20, 40), Segment(10, 20), Segment(50, 60)],
                'result': [[10, 40], [50, 60]],
                'step': 0,
            },
            {
                'index': [Segment(10, 10), Segment(20, 20), Segment(30, 30)],
                'result': [[10, 30]],
                'step': 10,
            },
        ]

        for case in test_cases:
            utils_result = utils.merge_intersecting_segments(case['index'], case['step'])
            for got, expected in zip(utils_result, case['result']):
                self.assertEqual(got.from_timestamp, expected[0])
                self.assertEqual(got.to_timestamp, expected[1])

    def test_serialize(self):
        segment_list = [Segment(100,200)]
        serialize_list = utils.meta.SerializableList(segment_list)
        meta_result = utils.meta.serialize(serialize_list)
        expected_result = [{ 'from': 100, 'to': 200 }]
        self.assertEqual(meta_result, expected_result)

    def test_remove_duplicates_and_sort(self):
        a1 = [1, 3, 5]
        a2 = [8, 3, 6]
        expected_result = [1, 3, 5, 6, 8]
        utils_result = utils.remove_duplicates_and_sort(a1+a2)
        self.assertEqual(utils_result, expected_result)
        self.assertEqual([], [])

if __name__ == '__main__':
    unittest.main()
