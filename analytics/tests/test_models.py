import unittest
import pandas as pd
import numpy as np 
import models

class TestModel(unittest.TestCase):

    def test_stair_model_get_indexes(self):
        drop_model = models.DropModel()
        jump_model = models.JumpModel()
        drop_data = pd.Series([4,4,4,1,1,1,5,5,2,2,2])
        jump_data = pd.Series([1,1,1,4,4,4,2,2,5,5,5])
        height = 2
        length = 2
        expected_result = [2,7]
        drop_model_result = drop_model.get_stair_indexes(drop_data, height, length)
        jump_model_result = jump_model.get_stair_indexes(jump_data, height, length)
        self.assertEqual(drop_model_result, expected_result)
        self.assertEqual(jump_model_result, expected_result)

    def test_stair_model_get_indexes_corner_cases(self):
        drop_model = models.DropModel()
        jump_model = models.JumpModel()
        empty_data = pd.Series([])
        nan_data = pd.Series([np.nan, np.nan, np.nan, np.nan])
        height, length = 2, 2
        length_zero, height_zero = 0, 0
        expected_result = []
        drop_empty_data_result = drop_model.get_stair_indexes(empty_data, height, length)
        drop_nan_data_result = drop_model.get_stair_indexes(nan_data, height_zero, length_zero)
        jump_empty_data_result = jump_model.get_stair_indexes(empty_data, height, length)
        jump_nan_data_result = jump_model.get_stair_indexes(nan_data, height_zero, length_zero)
        self.assertEqual(drop_empty_data_result, expected_result)
        self.assertEqual(drop_nan_data_result, expected_result)
        self.assertEqual(jump_empty_data_result, expected_result)
        self.assertEqual(jump_nan_data_result, expected_result)
