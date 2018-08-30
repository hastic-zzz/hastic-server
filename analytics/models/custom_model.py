from models import Model
import utils
import pandas as pd
from typing import Optional

# Paste your model here:
class CustomModel(Model):

    def __init__(self):
        super()
        # Use self.state to store results of your learning
        # It will be saved in filesystem and loaded after server restart
        self.state = {}
    
    def fit(self, dataframe: pd.DataFrame, segments: list, cache: Optional[dict]) -> dict:
        pass
    
    def predict(self, dataframe, cache: Optional[dict]):
        return []
