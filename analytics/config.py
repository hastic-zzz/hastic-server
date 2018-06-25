import os
import json

def get_config_field(field, default_val = None):
    val = default_val

    config_exists = os.path.isfile(CONFIG_FILE)
    if config_exists:
        with open(CONFIG_FILE) as f:
            config = json.load(f)

    if field in os.environ:
        val = os.environ[field]
    elif config_exists and field in config:
        val = config[field]
    else:
        raise Exception('Please configure {}'.format(field))

    return val

DATA_FOLDER = '../data'
CONFIG_FILE = '../config.json'

DATASET_FOLDER = os.path.join(DATA_FOLDER, 'datasets/')
ANOMALIES_FOLDER = os.path.join(DATA_FOLDER, 'anomalies/')
MODELS_FOLDER = os.path.join(DATA_FOLDER, 'models/')
METRICS_FOLDER = os.path.join(DATA_FOLDER, 'metrics/')

HASTIC_API_KEY = get_config_field('HASTIC_API_KEY')

