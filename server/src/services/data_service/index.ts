import { Collection } from './collection';
import { getDbQueryWrapper, dbCollection } from '../data_layer';
import { DbConnector } from './db_connector';
import { DbConnectorFactory } from './db_connector/factory';


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

export class DataService {
  private static _instance: DataService;

  private _queryWrapper = getDbQueryWrapper();

  private constructor() {
    if(DataService._instance !== undefined) {
      throw new Error(`Can't create 2nd instance of singleton class`);
    }
  }

  private async getConnector(): Promise<DbConnector> {
    try {
      const connector = await DbConnectorFactory.getDbConnector();
      return connector;
    } catch(err) {
      console.log(`data service got an error while connecting to database: ${err}`);
      throw err;
    }
  }

  public static getInstance(): DataService {
    if(DataService._instance === undefined) {
      DataService._instance = new DataService();
    }
    return DataService._instance;
  }

  public makeDBQ(collection: Collection): DBQ {
    return {
      findOne: async (query: object | string) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbFindOne(dbCollection, query);
      },
      findMany: async (query: object | string[], sortQuery: object) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbFindMany(dbCollection, query, sortQuery);
      },
      insertOne: async (doc: object) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbInsertOne(dbCollection, doc);
      },
      insertMany: async (docs: object[]) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbInsertMany(dbCollection, docs);
      },
      updateOne: async(query: object | string, updateQuery: object) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbUpdateOne(dbCollection, query, updateQuery);
      },
      updateMany: async (query: object | string[], updateQuery: object) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbUpdateMany(dbCollection, query, updateQuery);
      },
      removeOne: async (query: string | object) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbRemoveOne(dbCollection, query);
      },
      removeMany: async (query: object | string[]) => {
        const dbCollection = await this.getDbCollectionFromCollection(collection);
        return this._queryWrapper.dbRemoveMany(dbCollection, query);
      }
    };
  }

  private async getDbCollectionFromCollection(collection: Collection): Promise<dbCollection> {
    const connector = await this.getConnector();
    const db = connector.db;

    let dbCollection = db.get(collection);
    if (dbCollection === undefined) {
      throw new Error('Can`t find collection ' + collection);
    }
    return dbCollection;
  }
}
