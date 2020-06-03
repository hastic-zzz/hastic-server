import { Collection } from './collection';
import { getDbQueryWrapper, dbCollection } from '../data_layer';
import { DbConnector } from './db_connector';
import { DbConnectorFactory } from './db_connector/factory';

import * as deasync from 'deasync';


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
let db: Map<Collection, dbCollection>;

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


let done = false;
DbConnectorFactory.getDbConnector().then((connector: DbConnector) => {
  done = true;
  db = connector.db;
}).catch((err) => {
  console.log(`data service got error while connect to data base ${err}`);
  //TODO: choose best practice for error handling
  throw err;
});
deasync.loopWhile(() => !done);
