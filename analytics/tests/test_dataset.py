import unittest
import pandas as pd
import numpy as np 
from utils import prepare_data
import models
import random
import scipy.signal
from typing import List

from analytic_types.segment import Segment

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

        for model in model_instances:
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            with self.assertRaises(AssertionError):
                model.fit(dataframe, segments, 'test')
    
    def test_peak_antisegments(self):
        data_val = [1.0, 1.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 1.0, 1.0, 5.0, 7.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.PeakModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
        
    def test_jump_antisegments(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000016, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': True}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_trough_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 7.0, 4.0, 7.0, 9.0, 9.0, 9.0, 5.0, 1.0, 5.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.TroughModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_drop_antisegments(self):
        data_val = [9.0, 9.0, 9.0, 9.0, 9.0, 5.0, 5.0, 5.0, 5.0, 9.0, 9.0, 9.0, 9.0, 1.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000016, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': False, 'deleted': True}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_general_antisegments(self):
        data_val = [1.0, 2.0, 1.0, 2.0, 5.0, 6.0, 3.0, 2.0, 1.0, 1.0, 8.0, 9.0, 8.0, 1.0, 2.0, 3.0, 2.0, 1.0, 1.0, 2.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000003, 'to': 1523889000005, 'labeled': False, 'deleted': True}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.GeneralModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_jump_empty_segment(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000025, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.JumpModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(None)
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_drop_empty_segment(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000025, 'labeled': True, 'deleted': False},
                    {'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000002, 'to': 1523889000008, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.DropModel()
            model.state = model.get_state(None)
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_value_error_dataset_input_should_have_multiple_elements(self):
        data_val = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 5.0, 4.0, 5.0, 5.0, 6.0, 5.0, 1.0, 2.0, 3.0, 4.0, 5.0,3.0,3.0,2.0,7.0,8.0,9.0,8.0,7.0,6.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000007, 'to': 1523889000011, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.JumpModel()
            model.state = model.get_state(None)
            model_name = model.__class__.__name__
            model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_prepare_data_for_nonetype(self):
        data = [[1523889000000, None], [1523889000001, None], [1523889000002, None]]
        try:
            data = prepare_data(data)
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))  
    
    def test_prepare_data_for_nan(self):
        data = [[1523889000000, np.nan], [1523889000001, np.nan], [1523889000002, np.nan]]
        try:
            data = prepare_data(data)
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))
    
    def test_prepare_data_output_fon_nan(self):
        data_nan = [[1523889000000, np.nan], [1523889000001, np.nan], [1523889000002, np.nan]]
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
        segments = [Segment.from_json(segment) for segment in segments]

        model_instances = [
            models.GeneralModel(),
            models.PeakModel(),
        ]
        try:
            for model in model_instances:
                model_name = model.__class__.__name__
                model.state = model.get_state(None)
                model.fit(dataframe, segments, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly'.format(model_name))

    def test_general_for_two_labeling(self):
        data_val = [1.0, 2.0, 5.0, 2.0, 1.0, 1.0, 3.0, 6.0, 4.0, 2.0, 1.0, 0, 0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000001, 'to': 1523889000003, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]
    
        model = models.GeneralModel()
        model.state = model.get_state(None)
        model.fit(dataframe, segments,'test')
        result = len(data_val) + 1
        for _ in range(2):
            model.do_detect(dataframe)
            max_pattern_index = max(model.do_detect(dataframe))
            self.assertLessEqual(max_pattern_index[0], result)

    
    def test_peak_model_for_cache(self):
        cache = {
            'patternCenter': [1, 6],
            'patternModel': [1, 4, 0],
            'confidence': 2,
            'convolveMax': 8,
            'convolveMin': 7,
            'windowSize': 1,
            'convDelMin': 0,
            'convDelMax': 0,
            'heightMax': 4,
            'heightMin': 4,
        }
        data_val = [2.0, 5.0, 1.0, 1.0, 1.0, 2.0, 5.0, 1.0, 1.0, 2.0, 3.0, 7.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        model = models.PeakModel()
        model.state = model.get_state(cache)
        result = model.fit(dataframe, segments, 'test')
        self.assertEqual(len(result.pattern_center), 3)

    def test_trough_model_for_cache(self):
        cache = {
            'patternCenter': [2, 6],
            'patternModel': [5, 0.5, 4],
            'confidence': 2,
            'convolveMax': 8,
            'convolveMin': 7,
            'window_size': 1,
            'convDelMin': 0,
            'convDelMax': 0,
        }
        data_val = [5.0, 5.0, 1.0, 4.0, 5.0, 5.0, 0.0, 4.0, 5.0, 5.0, 6.0, 1.0, 5.0, 5.0, 5.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000010, 'to': 1523889000012, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        model = models.TroughModel()
        model.state = model.get_state(cache)
        result = model.fit(dataframe, segments, 'test')
        self.assertEqual(len(result.pattern_center), 3)

    def test_jump_model_for_cache(self):
        cache = {
            'patternCenter': [2, 6],
            'patternModel': [5, 0.5, 4],
            'confidence': 2,
            'convolveMax': 8,
            'convolveMin': 7,
            'window_size': 1,
            'convDelMin': 0,
            'convDelMax': 0,
        }
        data_val = [1.0, 1.0, 1.0, 4.0, 4.0, 0.0, 0.0, 5.0, 5.0, 0.0, 0.0, 4.0, 4.0, 4.0, 4.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 152388900009, 'to': 1523889000013, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        model = models.JumpModel()
        model.state = model.get_state(cache)
        result = model.fit(dataframe, segments, 'test')
        self.assertEqual(len(result.pattern_center), 3)

    def test_models_for_pattern_model_cache(self):
        cache = {
            'patternCenter': [4, 12],
            'patternModel': [],
            'confidence': 2,
            'convolveMax': 8,
            'convolveMin': 7,
            'window_size': 2,
            'convDelMin': 0,
            'convDelMax': 0,
        }
        data_val = [5.0, 5.0, 5.0, 5.0, 1.0, 1.0, 1.0, 1.0, 9.0, 9.0, 9.0, 9.0, 0, 0, 0, 0, 0, 0, 6.0, 6.0, 6.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        dataframe = create_dataframe(data_val)
        segments = [{'_id': 'Esl7uetLhx4lCqHa', 'analyticUnitId': 'opnICRJwOmwBELK8', 'from': 1523889000019, 'to': 1523889000024, 'labeled': True, 'deleted': False}]
        segments = [Segment.from_json(segment) for segment in segments]

        try:
            model = models.DropModel()
            model_name = model.__class__.__name__
            model.state = model.get_state(cache)
            model.fit(dataframe, segments, 'test')
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
            'patternCenter': [5, 50],
            'patternModel': [],
            'windowSize': 2,
            'convolveMin': 0,
            'convolveMax': 0,
            'convDelMin': 0,
            'convDelMax': 0,
        }
        max_ws = 20
        iteration = 1
        for ws in range(1, max_ws):
            for _ in range(iteration):
                pattern_model = create_random_model(ws)
                convolve = scipy.signal.fftconvolve(pattern_model, pattern_model)
                cache['windowSize'] = ws
                cache['patternModel'] = pattern_model
                cache['convolveMin'] = max(convolve)
                cache['convolveMax'] = max(convolve)
                try:
                    model = models.GeneralModel()
                    model.state = model.get_state(cache)
                    model_name = model.__class__.__name__
                    model.detect(data, 'test')
                except ValueError:
                    self.fail('Model {} raised unexpectedly with av_model {} and window size {}'.format(model_name, pattern_model, ws))
    
    def test_random_dataset_for_random_model(self):
        data = create_random_model(random.randint(1, 100))
        data = create_dataframe(data)
        model_instances = [
            models.PeakModel(),
            models.TroughModel()
        ]
        cache = {
            'patternCenter': [5, 50],
            'patternModel': [],
            'windowSize': 2,
            'convolveMin': 0,
            'convolveMax': 0,
            'confidence': 0,
            'heightMax': 0,
            'heightMin': 0,
            'convDelMin': 0,
            'convDelMax': 0,
        }
        ws = random.randint(1, int(len(data['value']/2)))
        pattern_model = create_random_model(ws)
        convolve = scipy.signal.fftconvolve(pattern_model, pattern_model)
        confidence = 0.2 * (data['value'].max() - data['value'].min())
        cache['windowSize'] = ws
        cache['patternModel'] = pattern_model
        cache['convolveMin'] = max(convolve)
        cache['convolveMax'] = max(convolve)
        cache['confidence'] = confidence
        cache['heightMax'] = data['value'].max()
        cache['heightMin'] = confidence
        try:
            for model in model_instances:
                model_name = model.__class__.__name__
                model.state = model.get_state(cache)
                model.detect(data, 'test')
        except ValueError:
            self.fail('Model {} raised unexpectedly with dataset {} and cache {}'.format(model_name, data['value'], cache))

if __name__ == '__main__':
    unittest.main()

def create_dataframe(data_val: list) -> pd.DataFrame:    
    data_ind = create_list_of_timestamps(len(data_val))
    data = {'timestamp': data_ind, 'value': data_val}
    dataframe = pd.DataFrame(data)
    dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], unit='ms')
    return dataframe

def create_list_of_timestamps(length: int) -> List[int]:
    return [1523889000000 + i for i in range(length)]

def create_random_model(window_size: int) -> list:
    return [random.randint(0, 100) for _ in range(window_size * 2 + 1)]
