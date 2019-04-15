from models import PeakModel, DropModel, TroughModel, JumpModel, GeneralModel

import aiounittest
from analytic_unit_manager import AnalyticUnitManager
from collections import namedtuple

TestData = namedtuple('TestData', ['uid', 'type', 'values', 'segments'])

def get_random_id() -> str:
    return str(id(list()))

class TestDataset(aiounittest.AsyncTestCase):

    timestep = 50 #ms

    def _fill_task(self, uid, data, task_type, analytic_unit_type, segments=None, cache=None):
        task = {
            'analyticUnitId': uid,
            'type': task_type,
            'payload': {
                'data': data,
                'from': data[0][0],
                'to': data[-1][0],
                'analyticUnitType': analytic_unit_type,
                'detector': 'pattern',
                'cache': cache
            },
            '_id': get_random_id()
        }
        if segments: task['payload']['segments'] = segments

        return task

    def _convert_values(self, values) -> list:
        from_t = 0
        to_t = len(values) * self.timestep
        return list(zip(range(from_t, to_t, self.timestep), values))

    def _index_to_test_time(self, idx) -> int:
        return idx * self.timestep

    def _get_learn_task(self, test_data):
        uid, analytic_unit_type, values, segments = test_data
        data = self._convert_values(values)
        segments = [{
            'analyticUnitId': uid,
            'from': self._index_to_test_time(s[0]),
            'to': self._index_to_test_time(s[1]),
            'labeled': True,
            'deleted': False
        } for s in segments]
        return self._fill_task(uid, data, 'LEARN', analytic_unit_type, segments=segments)

    def _get_detect_task(self, test_data, cache):
        uid, analytic_unit_type, values, _ = test_data
        data = self._convert_values(values)
        return self._fill_task(uid, data, 'DETECT', analytic_unit_type, cache=cache)

    def _get_test_dataset(self, pattern) -> tuple:
        """
        pattern name: ([dataset values], [list of segments])

        segment - (begin, end) - indexes in dataset values
        returns dataset in format (data: List[int], segments: List[List[int]])
        """
        datasets = {
            'PEAK': ([0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0], [[2, 8]]),
            'JUMP': ([0, 0, 1, 2, 3, 4, 4, 4], [[1, 6]]),
            'DROP': ([4, 4, 4, 3, 2, 1, 0, 0], [[1, 6]]),
            'TROUGH': ([4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4], [[1, 9]]),
            'GENERAL': ([0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0], [[2, 8]])
        }
        return datasets[pattern]

    async def _learn(self, task, manager=None) -> dict:
        if not manager: manager = AnalyticUnitManager()
        result = await manager.handle_analytic_task(task)
        return result['payload']['cache']

    async def _detect(self, task, manager=None) -> dict:
        if not manager: manager = AnalyticUnitManager()
        result = await manager.handle_analytic_task(task)
        return result

    async def _test_detect(self, test_data, manager=None):
        learn_task = self._get_learn_task(test_data)
        cache = await self._learn(learn_task, manager)
        detect_task = self._get_detect_task(test_data, cache)
        result = await self._detect(detect_task, manager)
        return result

    async def test_unit_manager(self):
        test_data = TestData(get_random_id(), 'PEAK', [0,1,2,5,10,5,2,1,1,1,0,0,0,0], [[1,7]])
        manager = AnalyticUnitManager()

        with_manager = await self._test_detect(test_data, manager)
        without_manager = await self._test_detect(test_data)
        self.assertEqual(with_manager, without_manager)

    async def test_cache(self):
        empty_cache = {
            'pattern_center': [],
            'pattern_model': [],
            'confidence': 0,
            'convolve_max': 0,
            'convolve_min': 0,
            'WINDOW_SIZE': 0,
            'conv_del_min': 0,
            'conv_del_max': 0,
            'height_max': 0,
            'height_min': 0,
            'JUMP_HEIGHT': 0,
            'JUMP_LENGTH': 0,
            'DROP_HEIGHT': 0,
            'DROP_LENGTH': 0,
        }
        peak_and_trough_cache = {
            'pattern_center': [1],
            'pattern_model': [1,2,3],
            'confidence': 1,
            'convolve_max': 1,
            'convolve_min': 1,
            'WINDOW_SIZE': 1,
            'height_max': 1,
            'height_min': 1,
        }
        jump_cache = {
            'pattern_center': [1],
            'pattern_model': [1, 2, 3],
            'confidence': 1,
            'convolve_max': 1,
            'convolve_min': 1,
            'WINDOW_SIZE': 1,
            'JUMP_HEIGHT': 1,
            'JUMP_LENGTH': 1,
        }
        drop_cache = {
            'pattern_center': [1],
            'pattern_model': [1, 2, 3],
            'confidence': 1,
            'convolve_max': 1,
            'convolve_min': 1,
            'WINDOW_SIZE': 1,
            'DROP_HEIGHT': 1,
            'DROP_LENGTH': 1,
        }
        general_cache = {
            'pattern_center': [1],
            'pattern_model': [1, 2, 3],
            'convolve_max': 1,
            'convolve_min': 1,
            'WINDOW_SIZE': 1,
        }
        cache_attrs = {
            'PEAK': peak_and_trough_cache.keys(),
            'JUMP': jump_cache.keys(),
            'DROP': drop_cache.keys(),
            'TROUGH': peak_and_trough_cache.keys(),
            'GENERAL': general_cache.keys()
        }

        for pattern, attrs in cache_attrs.items():
            test_data = TestData(get_random_id(), pattern, *self._get_test_dataset(pattern))
            learn_task = self._get_learn_task(test_data)
            cache = await self._learn(learn_task)

            for a in attrs:
                self.assertTrue((a in cache.keys() and cache.get(a) != empty_cache.get(a)), msg='{} not in cache keys: {}'.format(a, cache.keys()))
