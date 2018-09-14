import * as config from '../config';

import * as nedb from 'nedb';
import * as fs from 'fs';


export enum Collection { ANALYTIC_UNITS, SEGMENTS, ANALYTIC_UNIT_CACHES };


/**
 * Class which helps to make queries to your collection
 *
 * @param { string | object } query: a key as a string or mongodb-style query
 */
export type DBQ = {
  findOne: (query: string | object) => Promise<any | null>,
  findMany: (query: string[] | object) => Promise<any[]>,
  insertOne: (document: object) => Promise<string>,
  insertMany: (documents: object[]) => Promise<string[]>,
  updateOne: (query: string | object, updateQuery: any) => Promise<any>,
  updateMany: (query: string[] | object, updateQuery: any) => Promise<any[]>,
  removeOne: (query: string) => Promise<boolean>
  removeMany: (query: string[] | object) => Promise<number>
}

export function makeDBQ(collection: Collection): DBQ {
  return {
    findOne: dbFindOne.bind(null, collection),
    findMany: dbFindMany.bind(null, collection),
    insertOne: dbInsertOne.bind(null, collection),
    insertMany: dbInsertMany.bind(null, collection),
    updateOne: dbUpdateOne.bind(null, collection),
    updateMany: dbUpdateMany.bind(null, collection),
    removeOne: dbRemoveOne.bind(null, collection),
    removeMany: dbRemoveMany.bind(null, collection)
  }
}

function wrapIdToQuery(query: string | object): any {
  if(typeof query === 'string') {
    return { _id: query };
  }
  return query;
}

function wrapIdsToQuery(query: string[] | object): any {
  if(Array.isArray(query)) {
    return { _id: { $in: query } };
  }
  return query;
}

function isEmptyArray(obj: any): boolean {
  if(!Array.isArray(obj)) {
    return false;
  }
  return obj.length == 0;
}

const db = new Map<Collection, nedb>();

let dbInsertOne = (collection: Collection, doc: object) => {
  return new Promise<string>((resolve, reject) => {
    db.get(collection).insert(doc, (err, newDoc: any) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDoc._id);
      }
    });
  });
}

let dbInsertMany = (collection: Collection, docs: object[]) => {
  if(docs.length === 0) {
    return Promise.resolve([]);
  }
  return new Promise<string[]>((resolve, reject) => {
    db.get(collection).insert(docs, (err, newDocs: any[]) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDocs.map(d => d._id));
      }
    });
  });
}

let dbUpdateOne = (collection: Collection, query: string | object, updateQuery: object) => {
  // https://github.com/louischatriot/nedb#updating-documents
  let nedbUpdateQuery = { $set: updateQuery }
  query = wrapIdToQuery(query);
  return new Promise<any>((resolve, reject) => {
    db.get(collection).update(
      query,
      nedbUpdateQuery,
      { returnUpdatedDocs: true },
      (err: Error, numAffected: number, affectedDocument: any) => {
        if(err) {
          reject(err);
        } else {
          resolve(affectedDocument);
        }
      }
    );
  });
}

let dbUpdateMany = (collection: Collection, query: string[] | object, updateQuery: object) => {
  // https://github.com/louischatriot/nedb#updating-documents
  if(isEmptyArray(query)) {
    return Promise.resolve([]);
  }
  let nedbUpdateQuery = { $set: updateQuery };
  query = wrapIdsToQuery(query);
  return new Promise<any[]>((resolve, reject) => {
    db.get(collection).update(
      query,
      nedbUpdateQuery,
      { returnUpdatedDocs: true, multi: true },
      (err: Error, numAffected: number, affectedDocuments: any[]) => {
        if(err) {
          reject(err);
        } else {
          resolve(affectedDocuments);
        }
      }
    );
  });
}

let dbFindOne = (collection: Collection, query: string | object) => {
  query = wrapIdToQuery(query);
  return new Promise<any | null>((resolve, reject) => {
    db.get(collection).findOne(query, (err, doc) => {
      if(err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}

let dbFindMany = (collection: Collection, query: string[] | object) => {
  if(isEmptyArray(query)) {
    return Promise.resolve([]);
  }
  query = wrapIdsToQuery(query);
  return new Promise<any[]>((resolve, reject) => {
    db.get(collection).find(query, (err, docs: any[]) => {
      if(err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

let dbRemoveOne = (collection: Collection, query: string | object) => {
  query = wrapIdToQuery(query);
  return new Promise<boolean>((resolve, reject) => {
    db.get(collection).remove(query, { /* options */ }, (err, numRemoved) => {
      if(err) {
        reject(err);
      } else {
        if(numRemoved > 1) {
          throw new Error(`Removed ${numRemoved} elements with query: ${JSON.stringify(query)}. Only one is Ok.`);
        } else {
          resolve(numRemoved == 1);
        }
      }
    });
  });
}

let dbRemoveMany = (collection: Collection, query: string[] | object) => {
  if(isEmptyArray(query)) {
    return Promise.resolve([]);
  }
  query = wrapIdsToQuery(query);
  return new Promise<number>((resolve, reject) => {
    db.get(collection).remove(query, { multi: true }, (err, numRemoved) => {
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
db.set(Collection.ANALYTIC_UNITS, new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true }));
db.set(Collection.SEGMENTS, new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true }));
db.set(Collection.ANALYTIC_UNIT_CACHES, new nedb({ filename: config.ANALYTIC_UNIT_CACHES_DATABASE_PATCH, autoload: true }));
