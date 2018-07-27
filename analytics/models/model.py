from abc import ABC, abstractmethod
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
    async def fit(self, dataframe, segments):
        pass

    @abstractmethod
    async def predict(self, dataframe):
        pass

    def save(self, model_filename):
        with open(model_filename, 'wb') as file:
            pickle.dump(self.state, file)

    def load(self, model_filename):
        with open(model_filename, 'rb') as f:
            self.state = pickle.load(f)
