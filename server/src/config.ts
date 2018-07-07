import * as path from 'path';
import * as fs from 'fs';
import { getJsonDataSync } from './controllers/json';


let configFile = path.join(__dirname, '../../config.json');
let configExists = fs.existsSync(configFile);

export const ANALYTICS_PATH = path.join(__dirname, '../../analytics');

export const DATA_PATH = path.join(__dirname, '../../data');

export const DATASETS_PATH = path.join(DATA_PATH, 'datasets');
export const ANALYTIC_UNITS_PATH = path.join(DATA_PATH, 'analytic_units ');
export const MODELS_PATH = path.join(DATA_PATH, 'models');
export const METRICS_PATH = path.join(DATA_PATH, 'metrics');
export const SEGMENTS_PATH = path.join(DATA_PATH, 'segments');

export const HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
export const ZEROMQ_CONNECTION_STRING = getConfigField('ZEROMQ_CONNECTION_STRING', 'tcp://127.0.0.1:8002');


function getConfigField(field, defaultVal?) {
  let val = defaultVal;

  if(process.env[field] !== undefined) {
    val = process.env[field];
  } else if(configExists) {
    let config: any = getJsonDataSync(configFile);

    if(config[field] !== undefined) {
      val = config[field];
    }
  }

  if(val === undefined) {
    throw new Error(`Please configure ${field}`);
  }
  return val;
}
