import { DbQueryWrapper } from './basedb';
import { wrapIdToQuery, wrapIdsToQuery, isEmptyArray } from './utils';

import * as nedb from 'nedb';


export class NeDbQueryWrapper implements DbQueryWrapper {
  async dbInsertOne(nd: nedb, doc: object): Promise<string> {
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
    
  async dbInsertMany(nd: nedb, docs: object[]): Promise<string[]> {
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
    
  async dbUpdateOne(nd: nedb, query: string | object, updateQuery: object): Promise<void> {
    // https://github.com/louischatriot/nedb#updating-documents
    let nedbUpdateQuery = { $set: updateQuery }
    query = wrapIdToQuery(query);
    return new Promise<void>((resolve, reject) => {
      nd.update(
        query,
        nedbUpdateQuery,
        { returnUpdatedDocs: true },
        (err: Error, numAffected: number, affectedDocument: any) => {
          if(err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
    
  async dbUpdateMany(nd: nedb, query: string[] | object, updateQuery: object): Promise<any> {
    // https://github.com/louischatriot/nedb#updating-documents
    if(isEmptyArray(query)) {
      return;
    }
    let nedbUpdateQuery = { $set: updateQuery };
    query = wrapIdsToQuery(query);
    return new Promise<void>((resolve, reject) => {
      nd.update(
        query,
        nedbUpdateQuery,
        { returnUpdatedDocs: true, multi: true },
        (err: Error, numAffected: number, affectedDocuments: any[]) => {
          if(err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
  
  async dbFindOne(nd: nedb, query: string | object): Promise<any> {
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
  
  async dbFindMany(nd: nedb, query: string[] | object, sortQuery: object = {}): Promise<any[]> {
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
  
  async dbRemoveOne(nd: nedb, query: string | object): Promise<boolean> {
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
  
  async dbRemoveMany(nd: nedb, query: string[] | object): Promise<number> {
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
}
