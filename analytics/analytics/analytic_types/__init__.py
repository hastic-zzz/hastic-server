"""
It is the place where we put all classes and types
common for all analytics code

For example, if you write someting which is used
in analytic_unit_manager, it should be here.

If you create something spicific which is used only in one place, 
like PatternDetectionCache, then it should not be here.
"""

import pandas as pd
from typing import Union, List, Tuple

AnalyticUnitId = str

ModelCache = dict

# TODO: explicit timestamp / value
TimeSeries = List[Tuple[int, float]]

"""
Example:

tsis = TimeSeriesIndex(['2017-12-31 16:00:00-08:00', '2017-12-31 17:00:00-08:00', '2017-12-31 18:00:00-08:00'])
ts = TimeSeries([4, 5, 6], tsis)
"""
Timestamp = Union[str, pd.Timestamp]

class TimeSeriesIndex(pd.DatetimeIndex):
    def __new__(cls, *args, **kwargs):
        return pd.DatetimeIndex.__new__(cls, *args, **kwargs)

# TODO: make generic type for values. See List definition for example of generic class
# TODO: constructor from DataFrame
# TODO: repleace TimeSeries (above) with this class: rename TimeSeries2 to TimeSeries
class TimeSeries2(pd.Series):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
