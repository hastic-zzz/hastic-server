import unittest
import utils
import numpy as np
import pandas as pd

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
        data = [1,2,1,2,4,1,2,4,5,6]
        center = 4
        ws = 2
        result = [1, 2, 4, 1, 2]
        self.assertEqual(utils.get_interval(data, center, ws), result)
    
    def test_interval_wrong_ws(self):
        data = [1,2,4,1,2,4]
        center = 3
        ws = 6
        result = [1, 2, 4, 1, 2, 4]
        self.assertEqual(utils.get_interval(data, center, ws), result)
    
    
    

if __name__ == '__main__':
    unittest.main()
