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

    class NewJSONClass(target_class):

        def to_json(self) -> dict:
            """
            returns a json representation of the class
            where all None - values and private fileds are skipped
            """
            private_prefix = '__' + target_class.__name__
            result = {
                k: v for k, v in self.__dict__.items()
                if v is not None and not k.startswith(private_prefix)
            }
            return result

        @staticmethod
        def from_json(json_object: dict):
            return NewJSONClass(**json_object)

    return NewJSONClass


class ServerMessage:

    @inited_params
    def __init__(self, method: str, payload: object = None, request_id: int = None):
        """
        does something interesting
        """
        print('mymethod', self.method)

s = ServerMessage('naaaame', request_id=3)

#ServerMessage.from_json({})
#print(s.to_json())