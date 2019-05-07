import utils.meta
import operator


@utils.meta.JSONClass
class DetectionResult:

    def __init__(
        self,
        cache: dict = dict(),
        segments: list = [],
        last_detection_time: int = None
    ):
        self.cache = cache
        self.segments = segments
        self.last_detection_time = last_detection_time
