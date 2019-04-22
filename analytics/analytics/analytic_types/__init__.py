"""
It is the place where we put all classes and types
which is common for all of the code.

For example, if you write someting which is used
in analytic_unit_manager, it should be here.

If you create something spicific which is used only in one place, 
like PatternDetectionCache, then it should not be here.
"""
import pandas as pd
from typing import Union, List

from analytic_types.data_bucket import DataBucket

AnalyticUnitId = str


"""
Example:

tsis = TimeSeriesIndex(['2017-12-31 16:00:00-08:00', '2017-12-31 17:00:00-08:00', '2017-12-31 18:00:00-08:00'])
ts = TimeSeries([4, 5, 6], tsis)
"""
Timestamp = Union[str, pd.Timestamp]

class TimeSeriesIndex(pd.DatetimeIndex):
    def __init__(self, timestamps: List[Timestamp]):
        super().__init__(timestamps, dtype='datetime64[ns]')

class TimeSeries(pd.Series):
    def __init__(self, values: List[object], tsindex: TimeSeriesIndex):
        super().__init__(values, index=tsindex)
