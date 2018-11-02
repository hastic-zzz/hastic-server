import unittest
import pandas as pd
from analytic_unit_manager import prepare_data
from models.jump_model import JumpModel

class TestDataset(unittest.TestCase):

    def test_models_with_corrupted_dataframe(self):
        data = [[1523889000000 + i, float('nan')] for i in range(10)]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'value'])
        segments = []

        model = JumpModel()

        self.assertRaisesRegex(Exception, 'dataframe is broken', model.fit(dataframe, segments, []))

    def test_data_preparation(self):
        data = [[1523889000000 + i, float('nan')] for i in range(10)]

        self.assertTrue(prepare_data(data).empty) #TODO: may be should raise exception or smthk else
        

if __name__ == '__main__':
    unittest.main()
