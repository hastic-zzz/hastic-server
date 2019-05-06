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
