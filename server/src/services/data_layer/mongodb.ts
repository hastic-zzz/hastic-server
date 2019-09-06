import { Collection, FilterQuery, ObjectID } from 'mongodb';
import { wrapIdToQuery, wrapIdsToQuery, isEmptyArray } from './utils';

import * as _ from 'lodash';


export class MongoDbAdapter {

  async dbInsertOne(nd: Collection, doc: object): Promise<string> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertOne
    const newDoc = await nd.insertOne(doc);
    return newDoc.insertedId.toString();
  }
  
  async dbInsertMany(nd: Collection, docs: object[]): Promise<string[]> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertMany
    if(docs.length === 0) {
      return Promise.resolve([]);
    }
    const newDocs = await nd.insertMany(docs);
    return _.map(newDocs.insertedIds, (k,v) => v.toString());
  }
  
  async dbUpdateOne(nd: Collection, query: FilterQuery<string | object>, updateQuery: object): Promise<void> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateOne
    let mongodbUpdateQuery = { $set: updateQuery }
    query = wrapIdToQuery(query);
    const affected = await nd.updateOne(
      query,
      mongodbUpdateQuery
    );
  }
  
  async dbUpdateMany(collection: Collection, query: string[] | object, updateQuery: object): Promise<void> {
      // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateMany
      if(isEmptyArray(query)) {
      return Promise.resolve();
      }
      let mongodbUpdateQuery = { $set: updateQuery };
      query = wrapIdsToQuery(query);
      const affectedDocuments = await collection.updateMany(
          query,
          mongodbUpdateQuery
      );
  }
  
  async dbFindOne(collection: Collection, query: FilterQuery<string | object>): Promise<any> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
    if(typeof query === 'string') {
      query = new ObjectID(query as string);
    }
    query = wrapIdToQuery(query);
    let doc = await collection.findOne(query);
    if(doc !== null) {
      doc._id = doc._id.toString();
    }
    return doc;
  }
  
  async dbFindMany(collection: Collection, query: string[] | object, sortQuery: object = {}): Promise<any[]> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find  
    if(isEmptyArray(query)) {
      return Promise.resolve([]);
    }
    query = wrapIdsToQuery(query);
    return await collection.find(query).sort(sortQuery).toArray();
  }
  
  async dbRemoveOne(collection: Collection, query: FilterQuery<string | object>): Promise<boolean> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteOne
    query = wrapIdToQuery(query);
    const deleted = await collection.deleteOne(query);
    if(deleted.deletedCount > 1) {
      throw new Error(`Removed ${deleted.deletedCount} elements with query: ${JSON.stringify(query)}. Only one is Ok.`);
    }
    return deleted.deletedCount == 1;
  }
  
  async dbRemoveMany(collection: Collection, query: string[] | object): Promise<number> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteMany
    if(isEmptyArray(query)) {
      return Promise.resolve(0);
    }
    query = wrapIdsToQuery(query);
    const deleted = await collection.deleteMany(query);
    return deleted.deletedCount;
  }
}