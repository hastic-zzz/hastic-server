from models import Model
import utils
import pandas as pd
from typing import Optional


class CustomModel(Model):    
    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[dict]) -> dict:
        pass
    
    def do_predict(self, dataframe: pd.DataFrame) -> list:
        return []
