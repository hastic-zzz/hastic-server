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
        a = [1, 2, 0, 6, 8, 5, 3]
        self.assertEqual(utils.find_confidence(a), 1.6)
    
    def test_confidence_all_nan_value(self):
        a = [np.NaN, np.NaN, np.NaN, np.NaN]
        self.assertEqual(utils.find_confidence(a), np.NaN)
    
    def test_confidence_with_nan_value(self):
        a = [np.NaN, np.NaN, 0, 8]
        self.assertEqual(utils.find_confidence(a), 1.6)
    
    def test_interval_all_normal_value(self):
        data = [1, 2, 1, 2, 4, 1, 2, 4, 5, 6]
        data = pd.Series(data)
        center = 4
        ws = 2
        result = [1, 2, 4, 1, 2]
        result = pd.Series(result)
        self.assertEqual(utils.get_interval(data, center, ws), result)
    
    def test_interval_wrong_ws(self):
        data = [1, 2, 4, 1, 2, 4]
        data = pd.Series(data)
        center = 3
        ws = 6
        result = [1, 2, 4, 1, 2, 4]
        result = pd.Series(result)
        self.assertEqual(utils.get_interval(data, center, ws), result)
    
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
        s = [2, 8, 15]
        ws = 2
        av = [1, 2, 3, 2, 1]
        result = []
        self.assertNotEqual(utils.get_convolve(s, av, data, ws), result)
    
    def test_get_convolve_with_nan(self):
        data = [1, 2, 3, 2, np.NaN, 0, 2, 3, 4, np.NaN, 2, 1, 1, 2, 3, 4, 3, np.NaN, 0]
        data = pd.Series(data)
        s = [2, 8, 15]
        ws = 2
        av = [1, 2, 3, 2, 1]
        result = utils.get_convolve(s, av, data, ws)
        for val in result:
            self.assertFalse(val)
    
    def test_get_convolve_empty_data(self):
        data = []
        s = []
        ws = 2
        av = []
        result = []
        self.assertEqual(utils.get_convolve(s, av, data, ws), result)
    

if __name__ == '__main__':
    unittest.main()
