from analytic_types import ModelCache, TimeSeries
from analytic_types.segment import Segment

from enum import Enum
from typing import List, Optional, Tuple

import utils.meta

class Bound(Enum):
    ALL = 'ALL'
    UPPER = 'UPPER'
    LOWER = 'LOWER'

class DetectionResult:

    def __init__(
        self,
        cache: Optional[ModelCache] = None,
        segments: Optional[List[Segment]] = None,
        last_detection_time: int = None
    ):
        if cache is None:
            cache = {}
        if segments is None:
            segments = []
        self.cache = cache
        self.segments = segments
        self.last_detection_time = last_detection_time

    # TODO: use @utils.meta.JSONClass (now it can't serialize list of objects)
    def to_json(self):
        return {
            'cache': self.cache,
            'segments': list(map(lambda segment: segment.to_json(), self.segments)),
            'lastDetectionTime': self.last_detection_time
        }

@utils.meta.JSONClass
class ProcessingResult():

    def __init__(
        self,
        lower_bound: Optional[TimeSeries] = None,
        upper_bound: Optional[TimeSeries] = None,
    ):
        self.lower_bound = lower_bound
        self.upper_bound = upper_bound
