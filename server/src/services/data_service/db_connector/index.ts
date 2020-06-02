import { Collection } from '../collection';
import { dbCollection } from '../../data_layer';


export interface DbConnector {
  db: Map<Collection, dbCollection>;
  init(): Promise<void>;
}
