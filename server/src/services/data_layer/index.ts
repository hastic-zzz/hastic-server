import { NeDbAdapter } from './nedb';
import { MongoDbAdapter } from './mongodb';

import { HASTIC_DB_CONNECTION_TYPE } from '../../config';

export { NeDbAdapter };

export function getDbAdapter() {
    if(HASTIC_DB_CONNECTION_TYPE === 'nedb') {
        return new NeDbAdapter();
    }
    if(HASTIC_DB_CONNECTION_TYPE === 'mongodb') {
        return new MongoDbAdapter();
    }
}