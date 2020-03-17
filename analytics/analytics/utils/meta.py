from inspect import signature, Parameter
from functools import wraps
from typing import Optional, List
import re


CAMEL_REGEX = re.compile(r'([A-Z])')
UNDERSCORE_REGEX = re.compile(r'_([a-z])')

def camel_to_underscore(name):
    #TODO: need to rename 'from'/'to' to 'from_timestamp'/'to_timestamp' everywhere(in analytics, server, panel)
    if name == 'from' or name == 'to':
        name += '_timestamp'
    return CAMEL_REGEX.sub(lambda x: '_' + x.group(1).lower(), name)

def underscore_to_camel(name):
    if name == 'from_timestamp' or name == 'to_timestamp':
        name = name.replace('_timestamp', '')
    return UNDERSCORE_REGEX.sub(lambda x: x.group(1).upper(), name)

def is_field_private(field_name: str) -> Optional[str]:
    m = re.match(r'_[^(__)]+__', field_name)
    return m is not None

def serialize(obj):
    if hasattr(obj, 'to_json') == True:
        return obj.to_json()
    else:
        return obj

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
        return {
            underscore_to_camel(k): serialize(v) for k, v in self.__dict__.items()
            if v is not None and not is_field_private(k)
        }

    def from_json(json_object: Optional[dict]) -> target_class:
        if json_object is None:
            json_object = {}
        init_object = { camel_to_underscore(k): v for k, v in json_object.items() }
        return target_class(**init_object)

    # target_class.__init__ = inited_params(target_class.__init__)
    target_class.to_json = to_json
    target_class.from_json = from_json
    return target_class

class SerializableList(List[dict]):
    def to_json(self):
        return list(map(lambda s: s.to_json(), self))
