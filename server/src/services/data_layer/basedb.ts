import * as nedb from 'nedb';
import * as mongodb from 'mongodb';

export type dbCollection = nedb | mongodb.Collection;

export interface dbQueryWrapper {
  dbInsertOne(collection: dbCollection, doc: object): Promise<string>;
  dbInsertMany(collection: dbCollection, docs: object[]): Promise<string[]>;
  dbUpdateOne(collection: dbCollection, query: string | object, updateQuery: object): Promise<void>;
  dbUpdateMany(collection: dbCollection, query: string[] | object, updateQuery: object): Promise<void>;
  dbFindOne(collection: dbCollection, query: string | object): Promise<any>;
  dbFindMany(collection: dbCollection, query: string[] | object, sortQuery: object): Promise<any[]>;
  dbRemoveOne(collection: dbCollection, query: string | object): Promise<boolean>;
  dbRemoveMany(collection: dbCollection, query: string[] | object): Promise<number>;
}
