from typing import Optional, List, Dict

from analytic_types.segment import AnomalyDetectorSegment
from analytic_types.detector import Bound

from utils.meta import JSONClass, SerializableList

@JSONClass
class AnomalyCache:
    def __init__(
        self,
        alpha: float,
        confidence: float,
        enable_bounds: str,
        seasonality: Optional[int] = None,
        segments: Optional[List[Dict]] = None,
        time_step: Optional[int] = None,
    ):
        self.alpha = alpha
        self.confidence = confidence
        self.enable_bounds = enable_bounds
        if seasonality != None and seasonality < 0:
            raise ValueError(f'Can`t create AnomalyCache: got invalid seasonality {seasonality}')
        self.seasonality = seasonality
        self.time_step = time_step
        if segments != None:
            anomaly_segments = map(AnomalyDetectorSegment.from_json, segments)
            self.segments = SerializableList(anomaly_segments)
        else:
            self.segments = []

    def set_segments(self, segments: List[AnomalyDetectorSegment]):
        if len(segments) > 0:
            self.segments = SerializableList(segments)

    def get_enabled_bounds(self) -> Bound:
        #TODO: use class with to_json()
        return Bound(self.enable_bounds)
