import * as config from '../config';

import * as nedb from 'nedb';
import * as fs from 'fs';


export enum Collection { ANALYTIC_UNITS, METRICS, SEGMENTS };


/**
 * Class which helps to make queries to your collection
 * 
 * @param { string | object } query: a key as a string or mongodb-style query
 */
export type DBQ = {
  insert: (document: object) => string,
  insertMany: (documents: object[]) => string[],
  update: (query: string | object, updateQuery: any) => void,
  findOne: (query: string | object) => any,
  remove: (query: string | object) => number
}

export function makeDBQ(collection: Collection): DBQ {
  return {
    insert: dbInsert.bind(null, collection),
    insertMany: dbInsertMany.bind(null, collection),
    update: dbUpdate.bind(null, collection),
    findOne: dbFindOne.bind(null, collection),
    remove: dbRemove.bind(null, collection)
  }
}

function wrapIdToQuery(query: string | object) {
  if(typeof query === 'string') {
    return { _id: query };
  }
  return query;
}

const db = new Map<Collection, nedb>();

let dbInsert = (collection: Collection, doc: object) => {
  return new Promise<string>((resolve, reject) => {
    db[collection].insert(doc, (err, newDoc) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDoc._id);
      }
    });
  });
}

let dbInsertMany = (collection: Collection, docs: object[]) => {
  return new Promise<string[]>((resolve, reject) => {
    db[collection].insert(docs, (err, newDocs: any[]) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDocs.map(d => d._id));
      }
    });
  });
}

let dbUpdate = (collection: Collection, query: string | object, updateQuery: object) => {
  query = wrapIdToQuery(query);
  return new Promise<void>((resolve, reject) => {
    db[collection].update(query, updateQuery, { /* options */ }, (err: Error) => {
      if(err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

let dbFindOne = (collection: Collection, query: string | object) => {
  query = wrapIdToQuery(query);
  return new Promise<any>((resolve, reject) => {
    db[collection].findOne(query, (err, doc) => {
      if(err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}

let dbRemove = (collection: Collection, query: string | object) => {
  query = wrapIdToQuery(query);
  return new Promise<number>((resolve, reject) => {
    db[collection].remove(query, (err, numRemoved) => {
      if(err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
}

function maybeCreateDir(path: string): void {
  if(fs.existsSync(path)) {
    return;
  }
  console.log('mkdir: ' + path);
  fs.mkdirSync(path);
}

function checkDataFolders(): void {
  [
    config.DATA_PATH,
    config.ZMQ_IPC_PATH
  ].forEach(maybeCreateDir);
}
checkDataFolders();

// TODO: it's better if models request db which we create if it`s needed
db[Collection.ANALYTIC_UNITS] = new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true });
db[Collection.METRICS] = new nedb({ filename: config.METRICS_DATABASE_PATH, autoload: true });
db[Collection.SEGMENTS] = new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true });
