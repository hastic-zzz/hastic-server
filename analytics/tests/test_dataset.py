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
    
    def test_antisegments(self):
        data = [[1523889000000 + i, float(1.0)] for i in range(20)]
        dataframe = pd.DataFrame(data, columns=['timestamp', 'value'])
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000001, 'to': 1523889000004, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000009, 'to': 1523889000012, 'labeled': False, 'deleted': True}]

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

if __name__ == '__main__':
    unittest.main()
