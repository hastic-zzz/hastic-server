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
export const ANALYTIC_UNIT_CACHES_DATABASE_PATCH = path.join(DATA_PATH, 'analytic_unit_caches.db');


export const HASTIC_PORT = getConfigField('HASTIC_PORT', '8000');
export const ZMQ_CONNECTION_STRING = getConfigField('ZMQ_CONNECTION_STRING', null);
export const ZMQ_IPC_PATH = getConfigField('ZMQ_IPC_PATH', path.join(os.tmpdir(), 'hastic'));
export const ZMQ_DEV_PORT = getConfigField('ZMQ_DEV_PORT', '8002');
export const ZMQ_HOST = getConfigField('ZMQ_HOST', '127.0.0.1');
export const HASTIC_API_KEY = getConfigField('HASTIC_API_KEY');
export const ANLYTICS_PING_INTERVAL = 500; // ms
export const PACKAGE_VERSION = getPackageVersion();
export const COMMIT_HASH = getCommitHash();


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
      let packageJson: any = getJsonDataSync('package.json');
      return packageJson.version;
    } else {
      console.debug(`Can't find package file ${packageFile}`);
      return null;
    }
  }
}

function getCommitHash() {
  let gitRoot = path.join(__dirname, '../../.git');
  let gitHeadFile = path.join(gitRoot, 'HEAD');
  if(!fs.existsSync(gitHeadFile)) {
    console.debug(`Can't find git HEAD file ${gitHeadFile}`);
    return null;
  }
  const rev = fs.readFileSync(gitHeadFile).toString();
  let branch = rev.indexOf(':') === -1 ? rev : rev.slice(5, -1);
  let commitHash = fs.readFileSync(`${gitRoot}/${branch}`).toString().slice(0, -1);
  return {
    branch: branch,
    commitHash: commitHash
  };
}
