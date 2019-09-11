import { DbQueryWrapper, dbCollection } from './basedb';
import { NeDbQueryWrapper } from './nedb';
import { MongoDbQueryWrapper } from './mongodb';

import { HASTIC_DB_CONNECTION_TYPE } from '../../config';

export enum DBType {
  nedb = 'nedb',
  mongodb = 'mongodb'
};

export { NeDbQueryWrapper, MongoDbQueryWrapper, DbQueryWrapper, dbCollection };

export function getDbQueryWrapper(): DbQueryWrapper {
  if(HASTIC_DB_CONNECTION_TYPE === DBType.nedb) {
    return new NeDbQueryWrapper();
  }
  if(HASTIC_DB_CONNECTION_TYPE === DBType.mongodb) {
    return new MongoDbQueryWrapper();
  }

  throw new Error(
    `"${HASTIC_DB_CONNECTION_TYPE}" HASTIC_DB_CONNECTION_TYPE is not supported. Possible values: "nedb", "mongodb"`
  );
}
