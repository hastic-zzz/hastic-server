from abc import ABC, abstractmethod
from pandas import DataFrame
import pickle

class Model(ABC):
    
    def __init__(self):
        """
        Variables which are obtained as a result of fit() method 
        should be stored in self.state dict
        in order to be saved in model file
        """
        self.state = {}
        self.segments = []

    @abstractmethod
    def fit(self, dataframe: DataFrame, segments: list):
        pass

    @abstractmethod
    def predict(self, dataframe: DataFrame) -> list:
        pass

    def save(self, model_filename: str):
        with open(model_filename, 'wb') as file:
            pickle.dump(self.state, file)

    def load(self, model_filename: str):
        with open(model_filename, 'rb') as f:
            self.state = pickle.load(f)
