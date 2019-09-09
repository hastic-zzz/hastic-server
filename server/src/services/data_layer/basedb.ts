import * as nedb from 'nedb';
import * as mongodb from 'mongodb';

export interface dbQueryWrapper {
  dbInsertOne(collection: nedb | mongodb.Collection, doc: object): Promise<string>;
  dbInsertMany(nd: nedb | mongodb.Collection, docs: object[]): Promise<string[]>;
  dbUpdateOne(nd: nedb | mongodb.Collection, query: string | object, updateQuery: object): Promise<void>;
  dbUpdateMany(nd: nedb | mongodb.Collection, query: string[] | object, updateQuery: object): Promise<void>;
  dbFindOne(nd: nedb | mongodb.Collection, query: string | object): Promise<any>;
  dbFindMany(nd: nedb | mongodb.Collection, query: string[] | object, sortQuery: object): Promise<any[]>;
  dbRemoveOne(nd: nedb | mongodb.Collection, query: string | object): Promise<boolean>;
  dbRemoveMany(nd: nedb | mongodb.Collection, query: string[] | object): Promise<number>;
}
