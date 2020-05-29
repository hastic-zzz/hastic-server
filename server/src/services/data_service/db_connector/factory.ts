import { DBType } from '../../data_layer';
import { DbConnector } from './index';
import { MongodbConnector } from './mongodb_connector';
import { NedbConnector } from './nedb_connector';

import * as config from '../../../config';


export class DbConnectorFactory {
  private static _connector: DbConnector;

  public static async getDbConnector(): Promise<DbConnector> {
    if (this._connector !== undefined) {
      return this._connector;
    }

    let connector: DbConnector;
    switch (config.HASTIC_DB_CONNECTION_TYPE) {
      case DBType.nedb:
        connector = new NedbConnector();
        break;

      case DBType.mongodb:
        connector = new MongodbConnector();
        break;

      default:
        throw new Error(
          `"${config.HASTIC_DB_CONNECTION_TYPE}" HASTIC_DB_CONNECTION_TYPE is not supported. Possible values: "nedb", "mongodb"`
        );
    }

    await connector.init();
    this._connector = connector;
    return this._connector;
  }
}
