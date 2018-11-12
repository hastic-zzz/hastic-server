import unittest
import pandas as pd
from analytic_unit_manager import prepare_data
import models

class TestDataset(unittest.TestCase):

    def test_models_with_corrupted_dataframe(self):
        data = [[1523889000000 + i, float('nan')] for i in range(10)]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'value'])
        segments = []

        model_instances = [
            models.JumpModel(),
            models.DropModel(),
            models.GeneralModel(),
            models.PeakModel(),
            models.TroughModel()
        ]
        try:
            for model in model_instances:
                model_name = model.__class__.__name__
                model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_data_preparation(self):
        data = [[1523889000000 + i, float('nan')] for i in range(10)]

        self.assertTrue(prepare_data(data).empty) # TODO: raise exception

if __name__ == '__main__':
    unittest.main()
