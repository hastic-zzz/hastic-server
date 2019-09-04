import * as config from '../config';

import * as nedb from 'nedb';
import * as fs from 'fs';
import * as mongodb from 'mongodb';
import * as deasync from 'deasync';


export enum Collection { 
  ANALYTIC_UNITS,
  ANALYTIC_UNIT_CACHES,
  SEGMENTS,
  THRESHOLD,
  DETECTION_SPANS,
  DB_META
};

export const NamesCollection = {
  ANALYTIC_UNITS: 'analytic_units',
  ANALYTIC_UNIT_CACHES: 'analytic_unit_caches',
  SEGMENTS: 'segments',
  THRESHOLD: 'threshold',
  DETECTION_SPANS: 'detection_spans',
  DB_META: 'db_meta'
};

export enum SortingOrder { ASCENDING = 1, DESCENDING = -1 };

/**
 * Class which helps to make queries to your collection
 *
 * @param { string | object } query: a key as a string or mongodb-style query
 */
export type DBQ = {
  findOne: (query: string | object) => Promise<any | null>,
  findMany: (query: string[] | object, sortQuery?: object) => Promise<any[]>,
  insertOne: (document: object) => Promise<string>,
  insertMany: (documents: object[]) => Promise<string[]>,
  updateOne: (query: string | object, updateQuery: any) => Promise<any>,
  updateMany: (query: string[] | object, updateQuery: any) => Promise<any[]>,
  removeOne: (query: string) => Promise<boolean>
  removeMany: (query: string[] | object) => Promise<number>
}

function dbCollectionFromCollection(collection: Collection): nedb | mongodb.Collection<any> {
  let dbCollection = db.get(collection);
  if(dbCollection === undefined) {
    throw new Error('Can`t find collection ' + collection);
  }
  return dbCollection;
}

export function makeDBQ(collection: Collection): DBQ {
  return {
    findOne: dbFindOne.bind(null, dbCollectionFromCollection(collection)),
    findMany: dbFindMany.bind(null, dbCollectionFromCollection(collection)),
    insertOne: dbInsertOne.bind(null, dbCollectionFromCollection(collection)),
    insertMany: dbInsertMany.bind(null, dbCollectionFromCollection(collection)),
    updateOne: dbUpdateOne.bind(null, dbCollectionFromCollection(collection)),
    updateMany: dbUpdateMany.bind(null, dbCollectionFromCollection(collection)),
    removeOne: dbRemoveOne.bind(null, dbCollectionFromCollection(collection)),
    removeMany: dbRemoveMany.bind(null, dbCollectionFromCollection(collection))
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

// TODO: move to utils
function isEmptyArray(obj: any): boolean {
  if(!Array.isArray(obj)) {
    return false;
  }
  return obj.length == 0;
}

const db = new Map<Collection, nedb | mongodb.Collection<any>>();
let mongoClient: mongodb.MongoClient;


async function dbInsertOne(nd: nedb, doc: object): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    nd.insert(doc, (err, newDoc: any) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDoc._id);
      }
    })
  });
}

async function dbInsertMany(nd: nedb, docs: object[]): Promise<string[]> {
  if(docs.length === 0) {
    return Promise.resolve([]);
  }
  return new Promise<string[]>((resolve, reject) => {
    nd.insert(docs, (err, newDocs: any[]) => {
      if(err) {
        reject(err);
      } else {
        resolve(newDocs.map(d => d._id));
      }
    });
  });
}

async function dbUpdateOne(nd: nedb, query: string | object, updateQuery: object): Promise<any> {
  // https://github.com/louischatriot/nedb#updating-documents
  let nedbUpdateQuery = { $set: updateQuery }
  query = wrapIdToQuery(query);
  return new Promise<any>((resolve, reject) => {
    nd.update(
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

async function dbUpdateMany(nd: nedb, query: string[] | object, updateQuery: object): Promise<any[]> {
  // https://github.com/louischatriot/nedb#updating-documents
  if(isEmptyArray(query)) {
    return Promise.resolve([]);
  }
  let nedbUpdateQuery = { $set: updateQuery };
  query = wrapIdsToQuery(query);
  return new Promise<any[]>((resolve, reject) => {
    nd.update(
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

async function dbFindOne(nd: nedb, query: string | object): Promise<any> {
  query = wrapIdToQuery(query);
  return new Promise<any | null>((resolve, reject) => {
    nd.findOne(query, (err, doc) => {
      if(err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}

async function dbFindMany(nd: nedb, query: string[] | object, sortQuery: object = {}): Promise<any[]> {
  if(isEmptyArray(query)) {
    return Promise.resolve([]);
  }
  query = wrapIdsToQuery(query);
  return new Promise<any[]>((resolve, reject) => {
    nd.find(query).sort(sortQuery).exec((err, docs: any[]) => {
      if(err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

async function dbRemoveOne(nd: nedb, query: string | object): Promise<boolean> {
  query = wrapIdToQuery(query);
  return new Promise<boolean>((resolve, reject) => {
    nd.remove(query, { /* options */ }, (err, numRemoved) => {
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

async function dbRemoveMany(nd: nedb, query: string[] | object): Promise<number> {
  if(isEmptyArray(query)) {
    return Promise.resolve(0);
  }
  query = wrapIdsToQuery(query);
  return new Promise<number>((resolve, reject) => {
    nd.remove(query, { multi: true }, (err, numRemoved) => {
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
  console.log('data service: mkdir: ' + path);
  fs.mkdirSync(path);
}

function checkDataFolders(): void {
  [
    config.DATA_PATH,
    config.ZMQ_IPC_PATH
  ].forEach(maybeCreateDir);
}

async function connectToDb() {
  if(config.HASTIC_DB_CONNECTION_TYPE === 'nedb') {
    checkDataFolders();
    const inMemoryOnly = config.HASTIC_DB_IN_MEMORY;
    console.log('NeDB used as storage');
    // TODO: it's better if models request db which we create if it`s needed
    db.set(Collection.ANALYTIC_UNITS, new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true, timestampData: true, inMemoryOnly}));
    db.set(Collection.ANALYTIC_UNIT_CACHES, new nedb({ filename: config.ANALYTIC_UNIT_CACHES_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.SEGMENTS, new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.THRESHOLD, new nedb({ filename: config.THRESHOLD_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.DETECTION_SPANS, new nedb({ filename: config.DETECTION_SPANS_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.DB_META, new nedb({ filename: config.DB_META_PATH, autoload: true, inMemoryOnly}));
  } else {
    console.log('MongoDB used as storage');
    const dbConfig = config.HASTIC_DB_CONFIG;
    const uri = `mongodb://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.URL}`;
    const auth = {
      user: dbConfig.USER,
      password: dbConfig.PASSWORD
    };
    mongoClient = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      auth,
      autoReconnect: true,
      useUnifiedTopology: true,
      authMechanism: 'SCRAM-SHA-1',
      authSource: dbConfig.DB_NAME
    });
    try {
      const client: mongodb.MongoClient = await mongoClient.connect();
      const hasticDb: mongodb.Db = client.db(dbConfig.DB_NAME);
      db.set(Collection.ANALYTIC_UNITS, hasticDb.collection(NamesCollection.ANALYTIC_UNITS));
      db.set(Collection.ANALYTIC_UNIT_CACHES, hasticDb.collection(NamesCollection.ANALYTIC_UNIT_CACHES));
      db.set(Collection.SEGMENTS, hasticDb.collection(NamesCollection.SEGMENTS));
      db.set(Collection.THRESHOLD, hasticDb.collection(NamesCollection.THRESHOLD));
      db.set(Collection.DETECTION_SPANS, hasticDb.collection(NamesCollection.DETECTION_SPANS));
      db.set(Collection.DB_META, hasticDb.collection(NamesCollection.DB_META));
    } catch(err) {
      console.log(`got error while connect to MongoDB ${err}`);
      throw err;
    }
  }
}

export async function closeDb() {
  if(mongoClient !== undefined && mongoClient.isConnected) {
    await mongoClient.close();
  }
}

let done = false;
connectToDb().then(() => {
  done = true;
}).catch((err) => {
  console.log(`data service got error while connect to data base ${err}`);
  //TODO: choose best practice for error handling
  throw err;
});
deasync.loopWhile(() => !done);
