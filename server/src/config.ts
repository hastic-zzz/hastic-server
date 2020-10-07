import { getJsonDataSync } from './services/json_service';
import { normalizeUrl } from './utils/url';
import { parseTimeZone } from './utils/time';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exit } from 'process'; // it's very bad to use it in config, but life is full of pain
import * as dotenv from 'dotenv';
import { URL } from 'url';

const EXIT_CODE_MISSING_FIELD = 3;
const EXIT_CODE_BAD_VALUE_FIELD = 4;

// GIT_BRANCH, GIT_COMMITHASH, GIT_VERSION variables are defined by webpack
// TypeScript doesn't know that these variables exist
declare const GIT_BRANCH: string;
declare const GIT_COMMITHASH: string;
declare const GIT_VERSION: string;

dotenv.config();

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

export const HASTIC_DB_IN_MEMORY = getConfigFieldAndPrintOrExit('HASTIC_IN_MEMORY_PERSISTANCE', false);
// TODO: enum for DB types
export const HASTIC_DB_CONNECTION_TYPE = getConfigFieldAndPrintOrExit('HASTIC_DB_CONNECTION_TYPE', 'nedb', ['nedb', 'mongodb']);

//connection string syntax: <db_user>:<db_password>@<db_url>/<db_name>
export const HASTIC_DB_CONNECTION_STRING = getConfigFieldAndPrintOrExit(
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

export const HASTIC_PORT = getConfigFieldAndPrintOrExit('HASTIC_PORT', '8000');
export const HASTIC_API_KEY = getConfigFieldAndPrintOrExit('HASTIC_API_KEY');
export const GRAFANA_URL = normalizeUrl(getConfigFieldAndPrintOrExit('GRAFANA_URL', null));

// TODO: save orgId in analytic_units.db
export const ORG_ID = getConfigFieldAndPrintOrExit('ORG_ID', 1);

export enum AlertTypes {
  WEBHOOK = 'webhook',
  ALERTMANAGER = 'alertmanager'
};
export const HASTIC_ALERT_TYPE = getConfigFieldAndPrintOrExit('HASTIC_ALERT_TYPE', AlertTypes.WEBHOOK, _.values(AlertTypes));
export const HASTIC_ALERT_IMAGE = getConfigFieldAndPrintOrExit('HASTIC_ALERT_IMAGE', false);

export const HASTIC_WEBHOOK_URL = getConfigFieldAndPrintOrExit('HASTIC_WEBHOOK_URL', null);
export const HASTIC_TIMEZONE_OFFSET = getTimeZoneOffset();

export const HASTIC_ALERTMANAGER_URL = getConfigFieldAndPrintOrExit('HASTIC_ALERTMANAGER_URL', null);

export const ANALYTICS_PING_INTERVAL = 500; // ms
export const PACKAGE_VERSION = getPackageVersion();
export const GIT_INFO = {
  branch: GIT_BRANCH,
  commitHash: GIT_COMMITHASH,
  version: GIT_VERSION
};
export const INSIDE_DOCKER = process.env.INSIDE_DOCKER !== undefined;
export const PRODUCTION_MODE = process.env.NODE_ENV !== 'development';

// TODO: maybe rename it to "HASTIC_SERVER_ANALYTICS_URL"
export const HASTIC_SERVER_URL = getHasticServerUrl();
export const HASTIC_INSTANCE_NAME = getConfigFieldAndPrintOrExit('HASTIC_INSTANCE_NAME', os.hostname());


/**
 * You get a value or exit from the main process
 */
function getConfigFieldAndPrintOrExit(field: string, defaultVal?: any, allowedVals?: any[]) {
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
      console.log(`Please configure ${field}`);
      exit(EXIT_CODE_MISSING_FIELD);
    }

    val = defaultVal;
  }

  if(allowedVals !== undefined && !_.includes(allowedVals, val)) {
    console.log(`${field} value must be one of: ${allowedVals}, got ${val}`);
    exit(EXIT_CODE_BAD_VALUE_FIELD);
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
  let configTimeZone = getConfigFieldAndPrintOrExit('HASTIC_TIMEZONE_OFFSET', null);
  if(configTimeZone !== null) {
    return parseTimeZone(configTimeZone);
  } else {
    const serverUtcOffset = moment().utcOffset();
    return serverUtcOffset;
  }
}

function getHasticServerUrl() {
  const urlString = getConfigFieldAndPrintOrExit('HASTIC_SERVER_URL', 'ws://localhost:8002');

  try {
    const url = new URL(urlString);
    if(url.protocol !== 'ws:') {
      throw new Error(`Invalid protocol ${url.protocol}`);
    }

    return url;
  } catch(e) {
    console.log(`Invalid HASTIC_SERVER_URL, value must be url, got: ${urlString}`);
    exit(EXIT_CODE_BAD_VALUE_FIELD);
  }
}
