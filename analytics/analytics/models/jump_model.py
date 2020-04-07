from models import StairModel, ModelType

class JumpModel(StairModel):

    def get_model_type(self) -> ModelType:
        return ModelType.JUMP
