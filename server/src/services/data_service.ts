import * as config from '../config'

import * as nedb from 'nedb';
import * as fs from 'fs';

export const db = {
  analyticUnits: new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true }),
  metrics: new nedb({ filename: config.METRICS_DATABASE_PATH, autoload: true }),
  segments: new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true })
};

// see analytics/pattern_detection_model.py with folders available

function maybeCreate(path: string): void {
  if(fs.existsSync(path)) {
    return;
  }
  fs.mkdirSync(path);
}

export function checkDataFolders(): void {
  [
    config.DATA_PATH,
    config.DATASETS_PATH,
    config.ANALYTIC_UNITS_PATH,
    config.MODELS_PATH,
    config.METRICS_PATH,
    config.SEGMENTS_PATH
  ].forEach(maybeCreate);
}
