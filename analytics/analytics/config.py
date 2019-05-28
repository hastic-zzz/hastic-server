import os
import json


PARENT_FOLDER = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
CONFIG_FILE = os.path.join(PARENT_FOLDER, 'config.json')


config_exists = os.path.isfile(CONFIG_FILE)
if config_exists:
    with open(CONFIG_FILE) as f:
        config = json.load(f)
else:
    print('Config file %s doesn`t exist, using defaults' % CONFIG_FILE)


def get_config_field(field: str, default_val = None):
    if field in os.environ:
        return os.environ[field]

    if config_exists and field in config and config[field] != '':
        return config[field]

    if default_val is not None:
        return default_val

    raise Exception('Please configure {}'.format(field))

ZMQ_DEV_PORT = get_config_field('ZMQ_DEV_PORT', '8002')
ZMQ_CONNECTION_STRING = get_config_field('ZMQ_CONNECTION_STRING', 'tcp://0.0.0.0:%s' % ZMQ_DEV_PORT)
LEARNING_TIMEOUT = get_config_field('LEARNING_TIMEOUT', 120)
