from analytic_types import ModelCache
from analytic_types.segment import Segment

from typing import List, Optional, Tuple

import utils.meta

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
        data: List[Tuple[int, int]] = None
    ):
        if data is None:
            data = []
        self.data = data
