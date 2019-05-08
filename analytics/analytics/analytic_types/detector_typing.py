from analytic_types import ModelCache
from analytic_types.segment import Segment

from typing import List


class DetectionResult:

    def __init__(
        self,
        cache: ModelCache = ModelCache(),
        segments: List[Segment] = [],
        last_detection_time: int = None
    ):
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
