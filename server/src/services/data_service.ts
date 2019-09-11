import { getDbQueryWrapper, dbCollection, DBType } from './data_layer';
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

const COLLECTION_TO_NAME_MAPPING = new Map<Collection, string>([
  [Collection.ANALYTIC_UNITS, 'analytic_units'],
  [Collection.ANALYTIC_UNIT_CACHES, 'analytic_unit_caches'],
  [Collection.SEGMENTS, 'segments'],
  [Collection.THRESHOLD, 'threshold'],
  [Collection.DETECTION_SPANS, 'detection_spans'],
  [Collection.DB_META, 'db_meta']
]);

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
  updateOne: (query: string | object, updateQuery: any) => Promise<void>,
  updateMany: (query: string[] | object, updateQuery: any) => Promise<void>,
  removeOne: (query: string) => Promise<boolean>
  removeMany: (query: string[] | object) => Promise<number>
}

const queryWrapper = getDbQueryWrapper();
const db = new Map<Collection, dbCollection>();
let mongoClient: mongodb.MongoClient;

function dbCollectionFromCollection(collection: Collection): dbCollection {
  let dbCollection = db.get(collection);
  if(dbCollection === undefined) {
    throw new Error('Can`t find collection ' + collection);
  }
  return dbCollection;
}

export function makeDBQ(collection: Collection): DBQ {
  return {
    findOne: queryWrapper.dbFindOne.bind(null, dbCollectionFromCollection(collection)),
    findMany: queryWrapper.dbFindMany.bind(null, dbCollectionFromCollection(collection)),
    insertOne: queryWrapper.dbInsertOne.bind(null, dbCollectionFromCollection(collection)),
    insertMany: queryWrapper.dbInsertMany.bind(null, dbCollectionFromCollection(collection)),
    updateOne: queryWrapper.dbUpdateOne.bind(null, dbCollectionFromCollection(collection)),
    updateMany: queryWrapper.dbUpdateMany.bind(null, dbCollectionFromCollection(collection)),
    removeOne: queryWrapper.dbRemoveOne.bind(null, dbCollectionFromCollection(collection)),
    removeMany: queryWrapper.dbRemoveMany.bind(null, dbCollectionFromCollection(collection))
  }
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
  if(config.HASTIC_DB_CONNECTION_TYPE === DBType.nedb) {
    checkDataFolders();
    const inMemoryOnly = config.HASTIC_DB_IN_MEMORY;
    console.log('NeDB is used as the storage');
    // TODO: it's better if models request db which we create if it`s needed
    db.set(Collection.ANALYTIC_UNITS, new nedb({ filename: config.ANALYTIC_UNITS_DATABASE_PATH, autoload: true, timestampData: true, inMemoryOnly}));
    db.set(Collection.ANALYTIC_UNIT_CACHES, new nedb({ filename: config.ANALYTIC_UNIT_CACHES_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.SEGMENTS, new nedb({ filename: config.SEGMENTS_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.THRESHOLD, new nedb({ filename: config.THRESHOLD_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.DETECTION_SPANS, new nedb({ filename: config.DETECTION_SPANS_DATABASE_PATH, autoload: true, inMemoryOnly}));
    db.set(Collection.DB_META, new nedb({ filename: config.DB_META_PATH, autoload: true, inMemoryOnly}));
  } else if(config.HASTIC_DB_CONNECTION_TYPE === DBType.mongodb) {
    console.log('MongoDB is used as the storage');
    const dbConfig = config.HASTIC_DB_CONFIG;
    const uri = `mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.url}`;
    const auth = {
      user: dbConfig.user,
      password: dbConfig.password
    };
    mongoClient = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      auth,
      autoReconnect: true,
      useUnifiedTopology: true,
      authMechanism: 'SCRAM-SHA-1',
      authSource: dbConfig.dbName
    });
    try {
      const client: mongodb.MongoClient = await mongoClient.connect();
      const hasticDb: mongodb.Db = client.db(dbConfig.dbName);
      COLLECTION_TO_NAME_MAPPING.forEach((name, collection) => {
        db.set(collection, hasticDb.collection(name));
      });
    } catch(err) {
      console.log(`got error while connect to MongoDB ${err}`);
      throw err;
    }
  } else {
    throw new Error(
      `"${config.HASTIC_DB_CONNECTION_TYPE}" HASTIC_DB_CONNECTION_TYPE is not supported. Possible values: "nedb", "mongodb"`
    );
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
