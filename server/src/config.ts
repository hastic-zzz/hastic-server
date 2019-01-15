import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { getJsonDataSync } from './services/json_service';


let configFile = path.join(__dirname, '../../config.json');
let configExists = fs.existsSync(configFile);

export const ANALYTICS_PATH = path.join(__dirname, '../../analytics');

export const DATA_PATH = path.join(__dirname, '../../data');

export const ANALYTIC_UNITS_DATABASE_PATH = path.join(DATA_PATH, 'analytic_units.db');
export const SEGMENTS_DATABASE_PATH = path.join(DATA_PATH, 'segments.db');
export const ANALYTIC_UNIT_CACHES_DATABASE_PATH = path.join(DATA_PATH, 'analytic_unit_caches.db');
export const PANELS_DATABASE_PATH = path.join(DATA_PATH, 'panels.db');
export const THRESHOLD_DATABASE_PATH = path.join(DATA_PATH, 'treshold.db');


export const HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
export const ZMQ_IPC_PATH = getConfigField('ZMQ_IPC_PATH', path.join(os.tmpdir(), 'hastic'));
export const ZMQ_DEV_PORT = getConfigField('ZMQ_DEV_PORT', '8002');
export const ZMQ_HOST = getConfigField('ZMQ_HOST', '127.0.0.1');
export const HASTIC_API_KEY = getConfigField('HASTIC_API_KEY');
export const GRAFANA_URL = getConfigField('GRAFANA_URL', null);
export const HASTIC_WEBHOOK_URL = getConfigField('HASTIC_WEBHOOK_URL', null);
export const HASTIC_WEBHOOK_TYPE = getConfigField('HASTIC_WEBHOOK_TYPE', 'application/x-www-form-urlencoded');
export const HASTIC_WEBHOOK_SECRET = getConfigField('HASTIC_WEBHOOK_SECRET', null);
export const ANLYTICS_PING_INTERVAL = 500; // ms
export const PACKAGE_VERSION = getPackageVersion();
export const GIT_INFO = getGitInfo();
export const INSIDE_DOCKER = process.env.INSIDE_DOCKER !== undefined;
export const PRODUCTION_MODE = process.env.NODE_ENV !== 'development';

export const ZMQ_CONNECTION_STRING = createZMQConnectionString();


function getConfigField(field: string, defaultVal?: any) {
  let val = defaultVal;

  if(process.env[field] !== undefined) {
    val = process.env[field];
  } else if(configExists) {
    let config: any = getJsonDataSync(configFile);

    if(config[field] !== undefined) {
      val = config[field];
    }
  }

  if(val === undefined || val == '') {
    throw new Error(`Please configure ${field}`);
  }
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
      console.debug(`Can't find package file ${packageFile}`);
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
