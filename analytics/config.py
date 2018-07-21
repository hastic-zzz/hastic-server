import os
import json


PARENT_FOLDER = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
DATA_FOLDER = os.path.join(PARENT_FOLDER, 'data')
CONFIG_FILE = os.path.join(PARENT_FOLDER, 'config.json')


config_exists = os.path.isfile(CONFIG_FILE)
if config_exists:
    with open(CONFIG_FILE) as f:
        config = json.load(f)


def get_config_field(field, default_val = None):

    if field in os.environ:
        return os.environ[field]

    if config_exists and field in config:
        return config[field]

    if default_val is not None:
        return default_val
    
    raise Exception('Please configure {}'.format(field))



DATASET_FOLDER = os.path.join(DATA_FOLDER, 'datasets')
ANALYTIC_UNITS_FOLDER = os.path.join(DATA_FOLDER, 'analytic_units')
MODELS_FOLDER = os.path.join(DATA_FOLDER, 'models')
METRICS_FOLDER = os.path.join(DATA_FOLDER, 'metrics')

HASTIC_API_KEY = get_config_field('HASTIC_API_KEY')
ZEROMQ_CONNECTION_STRING = get_config_field('ZEROMQ_CONNECTION_STRING', 'tcp://*:8002')
