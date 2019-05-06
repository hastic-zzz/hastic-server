import utils.meta
from enum import Enum
import operator


@utils.meta.JSONClass
class DetectionResult:

    def __init__(
        self,
        cache: dict = dict(),
        segments: list = [],
        lastDetectionTime: int = None
    ):
        self.cache = cache
        self.segments = segments
        self.lastDetectionTime = lastDetectionTime

@utils.meta.JSONClass
class DetectorCache:
    pass

@utils.meta.JSONClass
class ThresholdCache(DetectorCache):

    def __init__(
        self,
        value: float = 0.0,
        condition: str = '>'
    ):
        self.value = value
        self.condition = condition
