import { DbQueryWrapper } from './basedb';

import { Collection, FilterQuery, ObjectID } from 'mongodb';
import { wrapIdToMongoDbQuery, wrapIdsToMongoDbQuery, isEmptyArray } from './utils';

import * as _ from 'lodash';


export class MongoDbQueryWrapper implements DbQueryWrapper {

  async dbInsertOne(collection: Collection, doc: any): Promise<string> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertOne

    // TODO: move to utils
    if(doc._id !== undefined) {
      doc._id = new ObjectID(doc._id);
    }
    const newDoc = await collection.insertOne(doc);
    return newDoc.insertedId.toString();
  }

  async dbInsertMany(collection: Collection, docs: any[]): Promise<string[]> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertMany
    if(docs.length === 0) {
      return [];
    }

    // TODO: move to utils
    docs.forEach(doc => {
      if(doc._id !== undefined) {
        doc._id = new ObjectID(doc._id);
      }
    });
    const newDocs = await collection.insertMany(docs);
    return _.map(newDocs.insertedIds, (id: ObjectID) => id.toString());
  }

  async dbUpdateOne(collection: Collection, query: FilterQuery<string | object>, updateQuery: any): Promise<void> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateOne

    // "_id" is immutable. Mongo throws an exception if updateQuery contains "_id" field.
    if(updateQuery._id !== undefined) {
      delete updateQuery._id;
    }
    let mongodbUpdateQuery = { $set: updateQuery }
    query = wrapIdToMongoDbQuery(query);

    await collection.updateOne(
      query,
      mongodbUpdateQuery
    );
  }

  async dbUpdateMany(collection: Collection, query: string[] | object, updateQuery: any): Promise<void> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateMany
    if(isEmptyArray(query)) {
      return;
    }
    // "_id" is immutable. Mongo throws an exception if updateQuery contains "_id" field.
    if(updateQuery._id !== undefined) {
      delete updateQuery._id;
    }
    let mongodbUpdateQuery = { $set: updateQuery };
    query = wrapIdsToMongoDbQuery(query);
    await collection.updateMany(
      query,
      mongodbUpdateQuery
    );
  }

  async dbFindOne(collection: Collection, query: FilterQuery<string | object>): Promise<any> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOne
    query = wrapIdToMongoDbQuery(query);
    let doc = await collection.findOne(query);
    // TODO: move to utils
    if(doc !== null) {
      doc._id = doc._id.toString();
    }
    return doc;
  }

  async dbFindMany(collection: Collection, query: string[] | object, sortQuery: object = {}): Promise<any[]> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find
    if(isEmptyArray(query)) {
      return [];
    }
    query = wrapIdsToMongoDbQuery(query);
    const docs = await collection.find(query).sort(sortQuery).toArray();
    // TODO: move to utils
    docs.forEach(doc => {
      if(doc !== null) {
        doc._id = doc._id.toString();
      }
    });
    return docs;
  }

  async dbRemoveOne(collection: Collection, query: FilterQuery<string | object>): Promise<boolean> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteOne
    query = wrapIdToMongoDbQuery(query);
    const deleted = await collection.deleteOne(query);
    if(deleted.deletedCount > 1) {
      throw new Error(`Removed ${deleted.deletedCount} elements with query: ${JSON.stringify(query)}. Only one is Ok.`);
    }
    return deleted.deletedCount === 1;
  }

  async dbRemoveMany(collection: Collection, query: string[] | object): Promise<number> {
    // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteMany
    if(isEmptyArray(query)) {
      return 0;
    }
    query = wrapIdsToMongoDbQuery(query);
    const deleted = await collection.deleteMany(query);
    return deleted.deletedCount;
  }
}
