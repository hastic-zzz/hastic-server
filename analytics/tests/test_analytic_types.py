from analytic_types import TimeSeriesIndex, TimeSeries2

import unittest


class TestDataset(unittest.TestCase):
    def test_basic_timeseries_index(self):
        tsi = TimeSeriesIndex(['2017-12-31 16:00:00-08:00'])
        self.assertEqual(len(tsi), 1)
        tsi2 = TimeSeriesIndex(['2017-12-31 16:00:00-08:00', '2017-12-31 17:00:00-08:00', '2017-12-31 18:00:00-08:00'])
        self.assertEqual(len(tsi2), 3)

    def test_basic_timeseries(self):
        tsis = TimeSeriesIndex(['2017-12-31 16:00:00-08:00', '2017-12-31 17:00:00-08:00', '2017-12-31 18:00:00-08:00'])
        ts = TimeSeries2([4, 5, 6], tsis)
        self.assertEqual(len(ts), 3)
