import { getJsonDataSync } from './services/json_service';
import { normalizeUrl } from './utils/url';
import { parseTimeZone } from './utils/time';

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as moment from 'moment';

let configFile = path.join(__dirname, '../../config.json');
let configExists = fs.existsSync(configFile);

// TODO: move to data_layer
export type DBConfig = {
  user: string,
  password: string,
  url: string,
  dbName: string
}

export const ANALYTICS_PATH = path.join(__dirname, '../../analytics');

export const HASTIC_DB_IN_MEMORY = getConfigField('HASTIC_IN_MEMORY_PERSISTANCE', false);
export const HASTIC_DB_CONNECTION_TYPE = getConfigField('HASTIC_DB_CONNECTION_TYPE', 'nedb'); //nedb or mongodb

//connection string syntax: <db_user>:<db_password>@<db_url>/<db_name>
export const HASTIC_DB_CONNECTION_STRING = getConfigField(
  'HASTIC_DB_CONNECTION_STRING',
  'hastic:password@mongodb:27017/hastic'
);

export const HASTIC_DB_CONFIG = getDbConfig(HASTIC_DB_CONNECTION_STRING);

export const DATA_PATH = path.join(__dirname, '../../data');
export const ANALYTIC_UNITS_DATABASE_PATH = path.join(DATA_PATH, 'analytic_units.db');
export const ANALYTIC_UNIT_CACHES_DATABASE_PATH = path.join(DATA_PATH, 'analytic_unit_caches.db');
export const SEGMENTS_DATABASE_PATH = path.join(DATA_PATH, 'segments.db');
export const THRESHOLD_DATABASE_PATH = path.join(DATA_PATH, 'treshold.db');
export const DETECTION_SPANS_DATABASE_PATH = path.join(DATA_PATH, 'detection_spans.db');
export const DB_META_PATH = path.join(DATA_PATH, 'db_meta.db');

export const HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
export const ZMQ_IPC_PATH = getConfigField('ZMQ_IPC_PATH', path.join(os.tmpdir(), 'hastic'));
export const ZMQ_DEV_PORT = getConfigField('ZMQ_DEV_PORT', '8002');
export const ZMQ_HOST = getConfigField('ZMQ_HOST', '127.0.0.1');
export const HASTIC_API_KEY = getConfigField('HASTIC_API_KEY');
export const GRAFANA_URL = normalizeUrl(getConfigField('GRAFANA_URL', null));
// TODO: save orgId in analytic_units.db
export const ORG_ID = getConfigField('ORG_ID', 1);
export const HASTIC_WEBHOOK_URL = getConfigField('HASTIC_WEBHOOK_URL', null);
export const HASTIC_WEBHOOK_TYPE = getConfigField('HASTIC_WEBHOOK_TYPE', 'application/json');
export const HASTIC_WEBHOOK_SECRET = getConfigField('HASTIC_WEBHOOK_SECRET', null);
export const HASTIC_WEBHOOK_IMAGE_ENABLED = getConfigField('HASTIC_WEBHOOK_IMAGE', false);
export const TIMEZONE_UTC_OFFSET = getTimeZoneOffset();

export const ANLYTICS_PING_INTERVAL = 500; // ms
export const PACKAGE_VERSION = getPackageVersion();
export const GIT_INFO = getGitInfo();
export const INSIDE_DOCKER = process.env.INSIDE_DOCKER !== undefined;
export const PRODUCTION_MODE = process.env.NODE_ENV !== 'development';

export const ZMQ_CONNECTION_STRING = createZMQConnectionString();
export const HASTIC_INSTANCE_NAME = getConfigField('HASTIC_INSTANCE_NAME', os.hostname());


function getConfigField(field: string, defaultVal?: any) {
  let val;

  if(process.env[field] !== undefined) {
    val = process.env[field];
  } else if(configExists) {
    let config: any = getJsonDataSync(configFile);

    if(config[field] !== undefined) {
      val = config[field];
    }
  }

  if(val === undefined || val == '') {
    if(defaultVal === undefined) {
      throw new Error(`Please configure ${field}`);
    }
    val = defaultVal;
  }
  console.log(`${field}: ${val}`);
  return val;
}

function getPackageVersion() {
  if(process.env.npm_package_version !== undefined) {
    return process.env.npm_package_version;
  } else {
    let packageFile = path.join(__dirname, '../package.json');
    if(fs.existsSync(packageFile)) {
      let packageJson: any = getJsonDataSync(packageFile);
      return packageJson.version;
    } else {
      console.log(`Can't find package file ${packageFile}`);
      return null;
    }
  }
}

function getGitInfo() {
  let gitRoot = path.join(__dirname, '../../.git');
  let gitHeadFile = path.join(gitRoot, 'HEAD');
  if(!fs.existsSync(gitHeadFile)) {
    console.error(`Can't find git HEAD file ${gitHeadFile}`);
    return null;
  }
  const ref = fs.readFileSync(gitHeadFile).toString();
  let branchPath = ref.indexOf(':') === -1 ? ref : ref.slice(5, -1);
  let branch = branchPath.split('/').pop();
  const branchFilename = `${gitRoot}/${branchPath}`;
  if(!fs.existsSync(branchFilename)) {
    console.error(`Can't find git branch file ${branchFilename}`);
    return null;
  }
  let commitHash = fs.readFileSync(branchFilename).toString().slice(0, 7);
  return { branch, commitHash };
}

function createZMQConnectionString() {
  let zmq =`tcp://${ZMQ_HOST}:${ZMQ_DEV_PORT}`; //debug mode
  let zmqConf = getConfigField('ZMQ_CONNECTION_STRING', null);
  if(INSIDE_DOCKER) {
    return zmqConf;
  } else if(PRODUCTION_MODE) {
    if(zmqConf === null) {
      return 'ipc://' + `${path.join(ZMQ_IPC_PATH, process.pid.toString())}.ipc`;
    }
  }
  return zmq;
}

// TODO: move to data_layer
function getDbConfig(connectionStr: string): DBConfig {
  const [user, password] = connectionStr.split('@')[0].split(':');
  const [dbName, ...urlParts] = connectionStr.split('@')[1].split('/').reverse();
  const url = urlParts.reverse().join('/');

  const config = {
    user,
    password,
    url,
    dbName
  };
  return config;
}

function getTimeZoneOffset(): number {
  let configTimeZone = getConfigField('TIMEZONE_UTC_OFFSET', null);
  console.log('getTimeZoneOffset- configTimeZone:', configTimeZone);
  if(configTimeZone !== null) {
    return parseTimeZone(configTimeZone);
  } else {
    const serverUtcOffset = moment().utcOffset();
    return serverUtcOffset;
  }
}
