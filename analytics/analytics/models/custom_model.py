from models import Model, AnalyticSegment
import utils
import pandas as pd
from typing import List


class CustomModel(Model):
    def do_fit(
        self,
        dataframe: pd.DataFrame,
        labeled_segments: List[AnalyticSegment],
        deleted_segments: List[AnalyticSegment],
        learning_info: dict
    ) -> None:
        pass

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        return []
