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
    
    def test_peak_antisegments(self):
        data_val = [1.0, 1.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 1.0, 1.0, 5.0, 7.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.PeakModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
        
    def test_jump_antisegments(self):
        data_val = [1.0, 1.0, 2.0, 2.0, 2.0, 5.0, 5.0, 5.0, 5.0, 2.0, 2.0, 2.0, 2.0, 9.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000011, 'to': 1523889000015, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000007, 'labeled': False, 'deleted': True}]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_trough_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 7.0, 4.0, 7.0, 9.0, 9.0, 9.0, 5.0, 1.0, 5.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.TroughModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_drop_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 9.0, 5.0, 5.0, 5.0, 5.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000016, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': True}]

        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_general_antisegments(self):
        data_val = [1.0, 2.0, 1.0, 2.0, 5.0, 6.0, 3.0, 2.0, 1.0, 1.0, 8.0, 9.0, 8.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 2.0]
        data_ind = [1523889000000 + i for i in range(len(data_val))]
        data = {'timestamp': data_ind, 'value': data_val}
        dataframe = pd.DataFrame(data)
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.GeneralModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

if __name__ == '__main__':
    unittest.main()
