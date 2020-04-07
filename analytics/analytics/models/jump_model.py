from models import StairModel, ModelType, ExtremumType

class JumpModel(StairModel):

    def get_model_type(self) -> ModelType:
        return ModelType.JUMP

    def get_extremum_type(self) -> ExtremumType:
        return ExtremumType.MAX
