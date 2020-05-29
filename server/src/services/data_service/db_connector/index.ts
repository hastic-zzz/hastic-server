import { Collection } from '../collection';
import { dbCollection } from '../../data_layer';


export abstract class DbConnector {
  protected _db = new Map <Collection, dbCollection>();

  constructor() { }
  abstract async init();

  get db(): Map<Collection, dbCollection> {
    return this._db;
  }
}
