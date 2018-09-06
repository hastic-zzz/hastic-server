from models import Model
import utils
import pandas as pd


class CustomModel(Model):    
    def do_fit(self, dataframe: DataFrame, segments: list) -> None:
        pass
    
    def do_predict(self, dataframe: pd.DataFrame) -> list:
        return []
