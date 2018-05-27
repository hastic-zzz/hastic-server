import * as config from '../config'
import * as fs from 'fs';



export function checkDataFolders() {
  if(fs.existsSync(config.DATA_PATH)) {
    return;
  }
  fs.mkdirSync(config.DATA_PATH);
  fs.mkdirSync(config.ANOMALIES_PATH);
  fs.mkdirSync(config.SEGMENTS_PATH);
  fs.mkdirSync(config.METRICS_PATH);
}