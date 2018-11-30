import unittest
import utils
import numpy as np
import pandas as pd
import scipy.signal
import math

class TestUtils(unittest.TestCase):

    #example test for test's workflow purposes
    def test_segment_parsion(self):
        self.assertTrue(True)
    
    def test_confidence_all_normal_value(self):
        segment = [1, 2, 0, 6, 8, 5, 3]
        self.assertEqual(utils.find_confidence(segment), 1.6)
    
    def test_confidence_all_nan_value(self):
        segment = [np.NaN, np.NaN, np.NaN, np.NaN]
        self.assertEqual(utils.find_confidence(segment), np.NaN)
    
    def test_confidence_with_nan_value(self):
        data = [np.NaN, np.NaN, 0, 8]
        self.assertEqual(utils.find_confidence(data), 1.6)
    
    def test_interval_all_normal_value(self):
        data = [1, 2, 1, 2, 4, 1, 2, 4, 5, 6]
        data = pd.Series(data)
        center = 4
        window_size = 2
        result = [1, 2, 4, 1, 2]
        result = pd.Series(result)
        self.assertEqual(utils.get_interval(data, center, window_size), result)
    
    def test_interval_wrong_ws(self):
        data = [1, 2, 4, 1, 2, 4]
        data = pd.Series(data)
        center = 3
        window_size = 6
        result = [1, 2, 4, 1, 2, 4]
        result = pd.Series(result)
        self.assertEqual(utils.get_interval(data, center, window_size), result)
    
    def test_subtract_min_without_nan(self):
        segment = [1, 2, 4, 1, 2, 4]    
        segment = pd.Series(segment)
        result = [0, 1, 3, 0, 1, 3]
        result = pd.Series(result)
        self.assertEqual(utils.subtract_min_without_nan(segment), result)
    
    def test_subtract_min_with_nan(self):
        segment = [np.NaN, 2, 4, 1, 2, 4]
        segment = pd.Series(segment)
        result = [np.NaN, 2, 4, 1, 2, 4]
        result = pd.Series(result)
        self.assertEqual(utils.subtract_min_without_nan(segment), result)
    
    def test_get_convolve(self):
        data = [1, 2, 3, 2, 2, 0, 2, 3, 4, 3, 2, 1, 1, 2, 3, 4, 3, 2, 0]
        data = pd.Series(data)
        pattern_index = [2, 8, 15]
        window_size = 2
        av_model = [1, 2, 3, 2, 1]
        result = []
        self.assertNotEqual(utils.get_convolve(pattern_index, av_model, data, window_size), result)
    
    def test_get_convolve_with_nan(self):
        data = [1, 2, 3, 2, np.NaN, 0, 2, 3, 4, np.NaN, 2, 1, 1, 2, 3, 4, 3, np.NaN, 0]
        data = pd.Series(data)
        pattern_index = [2, 8, 15]
        window_size = 2
        av_model = [1, 2, 3, 2, 1]
        result = utils.get_convolve(pattern_index, av_model, data, window_size)
        for val in result:
            self.assertFalse(val)
    
    def test_get_convolve_empty_data(self):
        data = []
        pattern_index = []
        window_size = 2
        av_model = []
        result = []
        self.assertEqual(utils.get_convolve(pattern_index, av_model, data, window_size), result)
    
    def test_get_distribution_density(self):
        segment = [1, 1, 1, 3, 5, 5, 5]
        segment = pd.Series(segment)
        result = (3, 5, 1)
        self.assertEqual(utils.get_distribution_density(segment), result)
    
    def test_find_jump_parameters_center(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_center = [10, 11]
        self.assertIn(utils.find_jump_parameters(segment, 0)[0], jump_center)
    
    def test_find_jump_parameters_height(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_height = [3.5, 4]
        self.GreaterEqual(utils.find_jump_parameters(segment, 0)[1], jump_height[0])
        self.LessEqual(utils.find_jump_parameters(segment, 0)[1], jump_height[1])
    
    def test_find_jump_parameters_length(self):
        segment = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        segment = pd.Series(segment)
        jump_length = 2
        self.assertEqual(utils.find_jump_parameters(segment, 0)[2], jump_length)
    
    def test_find_drop_parameters_center(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_center = [14, 15]
        self.assertIn(utils.find_drop_parameters(segment, 0)[0], drop_center)
    
    def test_find_drop_parameters_height(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_height = [3.5, 4]
        self.GreaterEqual(utils.find_drop_parameters(segment, 0)[1], drop_height[0])
        self.LessEqual(utils.find_drop_parameters(segment, 0)[1], drop_height[1])
    
    def test_find_drop_parameters_length(self):
        segment = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        segment = pd.Series(segment)
        drop_length = 2
        self.assertEqual(utils.find_drop_parameters(segment, 0)[2], drop_length)

if __name__ == '__main__':
    unittest.main()
