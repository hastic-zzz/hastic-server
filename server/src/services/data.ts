import * as config from '../config'
import * as fs from 'fs';


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
    config.ANOMALIES_PATH,
    config.MODELS_PATH,
    config.METRICS_PATH,
    config.SEGMENTS_PATH
  ].forEach(maybeCreate);
}
