import utils.meta
from analytic_types import ModelCache
from analytic_types.segment import Segment

from typing import List


@utils.meta.JSONClass
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
