import * as nedb from 'nedb';
import * as mongodb from 'mongodb';

export type dbCollection = nedb | mongodb.Collection;

export interface dbQueryWrapper {
  dbInsertOne(collection: dbCollection, doc: object): Promise<string>;
  dbInsertMany(nd: dbCollection, docs: object[]): Promise<string[]>;
  dbUpdateOne(nd: dbCollection, query: string | object, updateQuery: object): Promise<void>;
  dbUpdateMany(nd: dbCollection, query: string[] | object, updateQuery: object): Promise<void>;
  dbFindOne(nd: dbCollection, query: string | object): Promise<any>;
  dbFindMany(nd: dbCollection, query: string[] | object, sortQuery: object): Promise<any[]>;
  dbRemoveOne(nd: dbCollection, query: string | object): Promise<boolean>;
  dbRemoveMany(nd: dbCollection, query: string[] | object): Promise<number>;
}
