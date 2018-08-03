import * as config from '../config';

import * as nedb from 'nedb';
import * as fs from 'fs';

export const db = {
  analyticUnits: new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true }),
  metrics: new nedb({ filename: config.METRICS_DATABASE_PATH, autoload: true }),
  segments: new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true }),
  files: new nedb({ filename: config.FILES_DATABASE_PATH, autoload: true })
};


let dbUpsertFile = (query: any, updateQuery: any) => {
  return new Promise<void>((resolve, reject) => {
    db.files.update(query, updateQuery, { upsert: true }, (err: Error) => {
      if(err) {
        reject(err);
      } else {
        console.log('saved shit with query ');
        console.log(query);
        console.log('saved shit with updateQuery ');
        console.log(updateQuery);
        resolve();
      }
    });
  });
}

let dbLoadFile = (query: any) => {
  return new Promise<any>((resolve, reject) => {
    db.files.findOne(query, (err, doc) => {
      if(err) {
        reject(err);
      } else {
        console.log('got shit with query');
        console.log(query);
        console.log('doc');
        console.log(doc);
        resolve(doc);
      }
    });
  });
}

function maybeCreate(path: string): void {
  if(fs.existsSync(path)) {
    return;
  }
  console.log('mkdir: ' + path);
  fs.mkdirSync(path);
  console.log('exists: ' + fs.existsSync(path));
}

export async function saveFile(filename: string, content: string): Promise<void> {
  return dbUpsertFile({ filename } , { filename, content });
}

export async function loadFile(filename: string): Promise<string> {
  let doc = await dbLoadFile({ filename });
  if(doc === null) {
    return null;
  }
  return doc.content;
}

export function checkDataFolders(): void {
  [
    config.DATA_PATH,
    config.DATASETS_PATH,
    config.MODELS_PATH,
    config.METRICS_PATH,
    config.SEGMENTS_PATH,
    config.ZMQ_IPC_PATH
  ].forEach(maybeCreate);
}
