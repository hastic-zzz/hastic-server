import unittest
import pandas as pd
import numpy as np 
from utils import prepare_data
import models
import random
import scipy.signal

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
                model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_peak_antisegments(self):
        data_val = [1.0, 1.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 1.0, 1.0, 5.0, 7.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.PeakModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
        
    def test_jump_antisegments(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000016, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': True}]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_trough_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 7.0, 4.0, 7.0, 9.0, 9.0, 9.0, 5.0, 1.0, 5.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.TroughModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_drop_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 9.0, 5.0, 5.0, 5.0, 5.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000016, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': True}]

        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_general_antisegments(self):
        data_val = [1.0, 2.0, 1.0, 2.0, 5.0, 6.0, 3.0, 2.0, 1.0, 1.0, 8.0, 9.0, 8.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 2.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]

        try:
            model = models.GeneralModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_jump_empty_segment(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000025, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': True, 'deleted': False}]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_drop_empty_segment(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000025, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': True, 'deleted': False}]

        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_value_error_dataset_input_should_have_multiple_elements(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 4.0, 5.0, 5.0, 6.0, 5.0, 1.0, 2.0, 3.0, 4.0, 5.0,3.0,3.0,2.0,7.0,8.0,9.0,8.0,7.0,6.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000007, 'to': 1523889000011, 'labeled': True, 'deleted': False}]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_prepare_data_for_nonetype(self):
        data = [[1523889000000, None], [1523889000001, None], [1523889000002, None]]
        try:
            data = prepare_data(data)
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))  
    
    def test_prepare_data_for_nan(self):
        data = [[1523889000000, np.NaN], [1523889000001, np.NaN], [1523889000002, np.NaN]]
        try:
            data = prepare_data(data)
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_prepare_data_output_fon_nan(self):
        data_nan = [[1523889000000, np.NaN], [1523889000001, np.NaN], [1523889000002, np.NaN]]
        data_none = [[1523889000000, None], [1523889000001, None], [1523889000002, None]]
        return_data_nan = prepare_data(data_nan)
        return_data_none = prepare_data(data_none)
        for item in return_data_nan.value:
            self.assertTrue(np.isnan(item))
        for item in return_data_none.value:
            self.assertTrue(np.isnan(item))
    
    def test_three_value_segment(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 2.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 2.0, 3.0, 4.0, 5.0, 4.0, 2.0, 1.0, 3.0, 4.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000004, 'to': 1523889000006, 'labeled': True, 'deleted': False}]

        model_instances = [
            models.GeneralModel(),
            models.PeakModel(),
        ]
        try:
            for model in model_instances:
                model_name = model.__class__.__name__
                model.fit(dataframe, segments, 'test', dict())
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_general_for_two_labeling(self):
        data_val = [1.0, 2.0, 5.0, 2.0, 1.0, 1.0, 3.0, 6.0, 4.0, 2.0, 1.0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000001, 'to': 1523889000003, 'labeled': True, 'deleted': False}]
        model = models.GeneralModel()
        model.fit(dataframe, segments,'test', dict())
        result = len(data_val) + 1
        for _ in range(2):
            model.do_detect(dataframe,'test')
            max_pattern_index = max(model.do_detect(dataframe, 'test'))
            self.assertLessEqual(max_pattern_index[0], result)

    
    def test_peak_model_for_cache(self):
        cache = {
            'pattern_center': [1, 6],
            'model_peak': [1, 4, 0],
            'confidence': 2,
            'convolve_max': 8,
            'convolve_min': 7,
            'WINDOW_SIZE': 1,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        data_val = [2.0, 5.0, 1.0, 1.0, 1.0, 2.0, 5.0, 1.0, 1.0, 2.0, 3.0, 7.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False}]
        model = models.PeakModel()
        result = model.fit(dataframe, segments, 'test', cache)
        self.assertEqual(len(result['pattern_center']), 3)

    def test_trough_model_for_cache(self):
        cache = {
            'pattern_center': [2, 6],
            'pattern_model': [5, 0.5, 4],
            'confidence': 2,
            'convolve_max': 8,
            'convolve_min': 7,
            'WINDOW_SIZE': 1,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        data_val = [5.0, 5.0, 1.0, 4.0, 5.0, 5.0, 0.0, 4.0, 5.0, 5.0, 6.0, 1.0, 5.0, 5.0, 5.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False}]
        model = models.TroughModel()
        result = model.fit(dataframe, segments, 'test', cache)
        self.assertEqual(len(result['pattern_center']), 3)

    def test_jump_model_for_cache(self):
        cache = {
            'pattern_center': [2, 6],
            'pattern_model': [5, 0.5, 4],
            'confidence': 2,
            'convolve_max': 8,
            'convolve_min': 7,
            'WINDOW_SIZE': 1,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        data_val = [1.0, 1.0, 1.0, 4.0, 4.0, 0.0, 0.0, 5.0, 5.0, 0.0, 0.0, 4.0, 4.0, 4.0, 4.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 152388900009, 'to': 1523889000013, 'labeled': True, 'deleted': False}]
        model = models.JumpModel()
        result = model.fit(dataframe, segments, 'test', cache)
        self.assertEqual(len(result['pattern_center']), 3)

    def test_models_for_pattern_model_cache(self):
        cache = {
            'pattern_center': [4, 12],
            'pattern_model': [],
            'confidence': 2,
            'convolve_max': 8,
            'convolve_min': 7,
            'WINDOW_SIZE': 2,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        data_val = [5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 6.0, 6.0, 6.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000024, 'labeled': True, 'deleted': False}]
        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test', cache)
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_problem_data_for_random_model(self):
        problem_data = [2.0, 3.0, 3.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 3.0, 3.0,
                        3.0, 3.0, 3.0, 5.0, 5.0, 5.0, 5.0, 2.0, 2.0, 2.0, 2.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0,
                        3.0, 3.0, 2.0, 2.0, 2.0, 2.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.0, 2.0, 2.0, 6.0, 7.0, 8.0, 8.0, 4.0, 2.0, 2.0, 3.0, 3.0, 3.0, 4.0,
                        4.0, 4.0, 4.0, 3.0, 3.0, 3.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 3.0,
                        4.0, 4.0, 4.0, 4.0, 4.0, 6.0, 5.0, 4.0, 4.0, 3.0, 3.0, 3.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 2.0, 3.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0,
                        2.0, 8.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0]
        data = create_dataframe(problem_data)
        cache = {
            'pattern_center': [5, 50],
            'pattern_model': [],
            'WINDOW_SIZE': 2,
            'convolve_min': 0,
            'convolve_max': 0,
        }
        max_ws = 20
        iteration = 1
        for ws in range(1, max_ws):
            for _ in range(iteration):
                pattern_model = create_random_model(ws)
                convolve = scipy.signal.fftconvolve(pattern_model, pattern_model)
                cache['WINDOW_SIZE'] = ws
                cache['pattern_model'] = pattern_model
                cache['convolve_min'] = max(convolve)
                cache['convolve_max'] = max(convolve)
                try:
                    model = models.GeneralModel()
                    model_name = model.__class__.__name__
                    model.detect(data, 'test', cache)
                except ValueError:
                    self.fail('Model {} raised unexpectedly with av_model {} and window size {}'.format(model_name, pattern_model, ws))
    
    def test_random_dataset_for_random_model(self):
        data = create_random_model(random.randint(1, 100))
        data = create_dataframe(data)
        model_instances = [
            models.GeneralModel(),
            models.PeakModel(),
            models.TroughModel()
        ]
        cache = {
            'pattern_center': [5, 50],
            'pattern_model': [],
            'WINDOW_SIZE': 2,
            'convolve_min': 0,
            'convolve_max': 0,
            'confidence': 0,
            'height_max': 0,
            'height_min': 0,
            'conv_del_min': 0,
            'conv_del_max': 0,
        }
        ws = random.randint(1, int(len(data['value']/2)))
        pattern_model = create_random_model(ws)
        convolve = scipy.signal.fftconvolve(pattern_model, pattern_model)
        confidence = 0.2 * (data['value'].max() - data['value'].min())
        cache['WINDOW_SIZE'] = ws
        cache['pattern_model'] = pattern_model
        cache['convolve_min'] = max(convolve)
        cache['convolve_max'] = max(convolve)
        cache['confidence'] = confidence
        cache['height_max'] = data['value'].max()
        cache['height_min'] = confidence
        try:
            for model in model_instances:
                model_name = model.__class__.__name__
                model.detect(data, 'test', cache)
        except ValueError:
            self.fail('Model {} raised unexpectedly with dataset {} and cache {}'.format(model_name, data['value'], cache))

if __name__ == '__main__':
    unittest.main()

def create_dataframe(data_val: list) -> pd.DataFrame:    
    data_ind = [1523889000000 + i for i in range(len(data_val))]
    data = {'timestamp': data_ind, 'value': data_val}
    dataframe = pd.DataFrame(data)
    dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
    return dataframe

def create_random_model(window_size: int) -> list:
    return [random.randint(0, 100) for _ in range(window_size * 2 + 1)]
