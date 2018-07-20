import { MODELS_PATH } from '../config';

import * as fs from 'fs';
import * as path from 'path';

export function saveModel(task: any) {
  let filename = path.join(MODELS_PATH, `${task.id}.m`);

  return new Promise((resolve, reject) => {
    fs.writeFile(filename, task.model, 'utf8', (err) => {
      if(err) {
        console.error(err);
        reject('Can`t write file');
      } else {
        resolve();
      }
    });
  });
}

export function getModel(task: any) {
  let filename = path.join(MODELS_PATH, `${task.id}.m`);

  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        reject('Can`t write file');
      } else {
        resolve(data);
      }
    });
  });
}
