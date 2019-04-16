from inspect import signature, Parameter
from functools import wraps


def inited_params(target_init):
    target_params = signature(target_init).parameters.values() 
    if len(target_params) < 1:
        raise ValueError('init function mush have at least self parameter')
    if len(target_params) == 1:
        return target_init
    _, *target_params = target_params # we will not use self any more

    @wraps(target_init)
    def wrapped_init(wrapped_self, *wrapped_args, **wrapped_kwargs):
        for tp in target_params:
            if tp.default is Parameter.empty:
                continue
            setattr(wrapped_self, tp.name, tp.default)

        for tp, v in zip(target_params, wrapped_args):
            setattr(wrapped_self, tp.name, v)

        for k, v in wrapped_kwargs.items():
            setattr(wrapped_self, k, v)

        target_init(wrapped_self, *wrapped_args, **wrapped_kwargs)

    return wrapped_init

def JSONClass(target_class):

    def to_json(self) -> dict:
        """
        returns a json representation of the class
        where all None - values and private fileds are skipped
        """
        private_prefix = '__'
        result = {
            k: v for k, v in self.__dict__.items()
            if v is not None and not k.startswith(private_prefix)
        }
        return result
    
    def from_json(json_object: dict) -> target_class:
        return target_class(**json_object)

    target_class.__init__ = inited_params(target_class.__init__)
    target_class.to_json = to_json
    target_class.from_json = from_json
    return target_class
