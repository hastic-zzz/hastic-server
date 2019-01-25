from models import Model
import utils
import pandas as pd


class CustomModel(Model):
    def do_fit(self, dataframe: pd.DataFrame, labeled_segments: list, deleted_segments: list) -> None:
        pass

    def do_detect(self, dataframe: pd.DataFrame) -> list:
        return []
