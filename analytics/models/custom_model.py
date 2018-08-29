from models import Model
import utils
import pandas as pd

# Paste your model here:
class CustomModel(Model):

    def __init__(self):
        super()
        # Use self.state to store results of your learning
        # It will be saved in filesystem and loaded after server restart
        self.state = {}
    
    def fit(self, dataframe: pd.DataFrame, segments: list, cache: dict) -> dict:
        pass
    
    def predict(self, dataframe, cache: dict):
        return []
