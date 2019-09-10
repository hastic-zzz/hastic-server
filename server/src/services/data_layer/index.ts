import { DbQueryWrapper, dbCollection } from './basedb';
import { NeDbQueryWrapper } from './nedb';
import { MongoDbQueryWrapper } from './mongodb';

import { HASTIC_DB_CONNECTION_TYPE } from '../../config';

export { NeDbQueryWrapper, MongoDbQueryWrapper, DbQueryWrapper, dbCollection };

export function getDbQueryWrapper(): DbQueryWrapper {
  if(HASTIC_DB_CONNECTION_TYPE === 'nedb') {
    return new NeDbQueryWrapper();
  }
  if(HASTIC_DB_CONNECTION_TYPE === 'mongodb') {
    return new MongoDbQueryWrapper();
  }

  throw new Error(`Unexpected db connection type ${HASTIC_DB_CONNECTION_TYPE}, only mongodb or nedb available.`);
}
