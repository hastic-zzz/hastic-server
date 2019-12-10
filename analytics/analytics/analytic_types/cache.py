from typing import Optional, List, Dict

from analytic_types.segment import AnomalyDetectorSegment
from analytic_types.detector_typing import Bound

import utils.meta

@utils.meta.JSONClass
class AnomalyCache:
    def __init__(
        self,
        alpha: float,
        confidence: float,
        enable_bounds: str = None,
        seasonality: Optional[int] = None,
        segments: Optional[List[Dict]] = None,
        time_step: Optional[int] = None,
    ):
        self.alpha = alpha
        self.confidence = confidence
        self.enable_bounds = enable_bounds
        if seasonality != None and seasonality < 0:
            raise ValueError(f'{self.analytic_unit_id} got invalid seasonality {seasonality}')
        self.seasonality = seasonality
        self.segments = segments
        self.time_step = time_step

    def set_segments(self, segments: List[AnomalyDetectorSegment]):
        if len(segments) > 0:
            self.segments = list(map(lambda s: s.to_json(), segments))

    def get_segments(self) -> List[AnomalyDetectorSegment]:
        if self.segments != None:
            return map(AnomalyDetectorSegment.from_json, self.segments)
        else:
            return None

    def append_segment(self, segment: AnomalyDetectorSegment):
        if self.segments == None:
            self.segment = [segment.to_json()]
        else:
            self.segments.append(segment.to_json())

    def get_enable_bounds(self) -> Bound:
        return Bound(self.enable_bounds)
