from models import StairModel, ModelType

class DropModel(StairModel):

    def get_model_type(self) -> ModelType:
        return ModelType.DROP
