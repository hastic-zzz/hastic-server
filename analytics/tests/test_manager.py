from models import PeakModel, DropModel, TroughModel, JumpModel

import aiounittest
from analytic_unit_manager import AnalyticUnitManager
from collections import namedtuple

TestData = namedtuple('TestData', ['uid', 'type', 'values', 'segments'])
STEP = 50
class TestDataset(aiounittest.AsyncTestCase):

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
            '_id': str(id(list()))
        }
        if segments: task['payload']['segments'] = segments

        return task

    def _get_learn_task(self, test_data):
        uid, analytic_unit_type, values, segments = test_data
        data = list(zip(range(0, STEP*len(values), STEP), values))
        segments = [{
            'analyticUnitId': uid,
            'from': s[0]*STEP,
            'to': s[1]*STEP,
            'labeled': True,
            'deleted': False
        } for s in segments]
        return self._fill_task(uid, data, 'LEARN', analytic_unit_type, segments=segments)

    def _get_detect_task(self, test_data, cache):
        uid, analytic_unit_type, values, _ = test_data
        data = list(zip(range(0, STEP*len(values), STEP), values))
        return self._fill_task(uid, data, 'DETECT', analytic_unit_type, cache=cache)

    def _get_test_dataset(self, pattern) -> tuple:
        #data, segments
        datasets = {
            'PEAK': ([0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0], [[2, 8]]),
            'JUMP': ([0, 0, 1, 2, 3, 4, 4, 4], [[1, 6]]),
            'DROP': ([4, 4, 4, 3, 2, 1, 0, 0], [[1, 6]]),
            'TROUGH': ([4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4], [[1, 9]])
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
        test_data = TestData(str(id(list())), 'PEAK', [0,1,2,5,10,5,2,1,1,1,0,0,0,0], [[1,7]])
        manager = AnalyticUnitManager()

        with_manager = await self._test_detect(test_data, manager)
        without_manager = await self._test_detect(test_data)
        self.assertEqual(with_manager, without_manager)

    async def test_cache(self):
        cache_attrs = {
            'PEAK': PeakModel().state.keys(),
            'JUMP': JumpModel().state.keys(),
            'DROP': DropModel().state.keys(),
            'TROUGH': TroughModel().state.keys()
        }

        for pattern, attrs in cache_attrs.items():
            test_data = TestData(str(id(list())), pattern, *self._get_test_dataset(pattern))
            learn_task = self._get_learn_task(test_data)
            cache = await self._learn(learn_task)

            for a in attrs:
                self.assertTrue(a in cache.keys(), msg='{} not in cache keys: {}'.format(a, cache.keys()))
