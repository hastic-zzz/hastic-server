from models import StairModel, ModelType, ExtremumType

class DropModel(StairModel):

    def get_model_type(self) -> ModelType:
        return ModelType.DROP

    def get_extremum_type(self) -> ExtremumType:
        return ExtremumType.MIN
