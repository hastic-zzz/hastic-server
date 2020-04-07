from models import Model, AnalyticSegment, ModelState, ModelType
from analytic_types import AnalyticUnitId, ModelCache
from analytic_types.learning_info import LearningInfo
import utils

import pandas as pd
from typing import List, Optional


class CustomModel(Model):
    def do_fit(
        self,
        dataframe: pd.DataFrame,
        labeled_segments: List[AnalyticSegment],
        deleted_segments: List[AnalyticSegment],
        learning_info: LearningInfo
    ) -> None:
        pass

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        return []

    def find_segment_center(self, dataframe: pd.DataFrame, start: int, end: int) -> int:
        pass

    def get_model_type(self) -> ModelType:
        pass

    def get_state(self, cache: Optional[ModelCache] = None) -> ModelState:
        pass
