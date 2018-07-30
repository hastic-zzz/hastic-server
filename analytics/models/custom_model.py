from models import Model
import utils

# Paste your model here:
class CustomModel(Model):

    def __init__(self):
        super()
        # Use self.state to store results of your learning
        # It will be saved in filesystem and loaded after server restart
        self.state = {}
    
    async def fit(self, dataframe, segments):
        pass
    
    async def predict(self, dataframe):
        return []
