import { dbQueryWrapper } from './basedb';
import { NeDbAdapter } from './nedb';
import { MongoDbQueryWrapper } from './mongodb';

import { HASTIC_DB_CONNECTION_TYPE } from '../../config';

export { NeDbAdapter };

export function getDbAdapter() {
  if(HASTIC_DB_CONNECTION_TYPE === 'nedb') {
    return new NeDbAdapter();
  }
  if(HASTIC_DB_CONNECTION_TYPE === 'mongodb') {
    return new MongoDbQueryWrapper();
  }

  throw new Error(`Unexpected db connection type ${HASTIC_DB_CONNECTION_TYPE}, only mongodb or nedb available.`);
}
