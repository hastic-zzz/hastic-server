import { Collection } from '../collection';
import { DbConnector } from './index';
import * as config from '../../../config';

import * as mongodb from 'mongodb';


export class MongodbConnector extends DbConnector {
  private static COLLECTION_TO_NAME_MAPPING = new Map<Collection, string>([
    [Collection.ANALYTIC_UNITS, 'analytic_units'],
    [Collection.ANALYTIC_UNIT_CACHES, 'analytic_unit_caches'],
    [Collection.SEGMENTS, 'segments'],
    [Collection.THRESHOLD, 'threshold'],
    [Collection.DETECTION_SPANS, 'detection_spans'],
    [Collection.DB_META, 'db_meta']
  ]);

  private _client: mongodb.MongoClient;

  constructor() {
    super();
  }

  async init() {
    // TODO: move this log outside
    console.log('MongoDB is used as the storage');
    const dbConfig = config.HASTIC_DB_CONFIG;
    const uri = `mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.url}`;
    const auth = {
      user: dbConfig.user,
      password: dbConfig.password
    };
    this._client = new mongodb.MongoClient(uri, {
      useNewUrlParser: true,
      auth,
      autoReconnect: true,
      useUnifiedTopology: true,
      // TODO: it should be configurable
      authMechanism: 'SCRAM-SHA-1',
      authSource: dbConfig.dbName
    });

    try {
      const client: mongodb.MongoClient = await this._client.connect();
      const hasticDb: mongodb.Db = client.db(dbConfig.dbName);
      MongodbConnector.COLLECTION_TO_NAME_MAPPING.forEach((name, collection) => {
        this._db.set(collection, hasticDb.collection(name));
      });
    } catch(err) {
      console.log(`got error while connecting to MongoDB: ${err}`);
      // TODO: throw a better error, e.g.: ServiceInitializationError
      throw err;
    }
  }
}
