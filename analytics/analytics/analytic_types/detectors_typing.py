from typing import List, Tuple

import utils.meta

@utils.meta.JSONClass
class DetectionResult():

    def __init__(
        self,
        cache: dict = dict(),
        segments: list = [],
        last_detection_time: int = None
    ):
        self.cache = cache
        self.segments = segments
        self.last_detection_time = last_detection_time

@utils.meta.JSONClass
class ProcessingResult():

    def __init__(
        self,
        data: List[Tuple[int, int]] = []
    ):
        self.data = data