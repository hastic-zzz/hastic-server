import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { getJsonDataSync } from './services/json_service';


let configFile = path.join(__dirname, '../../config.json');
let configExists = fs.existsSync(configFile);

export const ANALYTICS_PATH = path.join(__dirname, '../../analytics');

export const DATA_PATH = path.join(__dirname, '../../data');

export const ANALYTIC_UNITS_DATABASE_PATH = path.join(DATA_PATH, 'analytic_units.db');
export const METRICS_DATABASE_PATH = path.join(DATA_PATH, 'metrics.db');
export const SEGMENTS_DATABASE_PATH = path.join(DATA_PATH, 'segments.db');
export const FILES_DATABASE_PATH = path.join(DATA_PATH, 'files.db');

export const HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
export const ZMQ_CONNECTION_STRING = getConfigField('ZMQ_CONNECTION_STRING', null);
export const ZMQ_IPC_PATH = getConfigField('ZMQ_IPC_PATH', path.join(os.tmpdir(), 'hastic'));
export const ZMQ_DEV_PORT = getConfigField('ZMQ_DEV_PORT', '8002');
export const ANLYTICS_PING_INTERVAL = 500; // ms


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
