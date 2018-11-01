import unittest
import pandas as pd
from analytic_unit_manager import prepare_data

class TestDataset(unittest.TestCase):

    def test_models_with_corrupted_dataframe(self):
        data = [[1523889000000 + i, None] for i in range(10)]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'value'])
        pass

    def test_data_preparation(self):
        data = [[1523889000000 + i, None] for i in range(10)]
        self.assertRaises(Exception, prepare_data(data))
        

if __name__ == '__main__':
    unittest.main()
