import { Collection } from '../collection';
import { DbConnector } from './index';
import { dbCollection } from '../../data_layer';
import * as config from '../../../config';

import * as nedb from 'nedb';
import * as fs from 'fs';


type NedbCollectionConfig = {
  filename: string,
  timestampData?: boolean
};

function maybeCreateDir(path: string): void {
  if (fs.existsSync(path)) {
    return;
  }
  console.log('data service: mkdir: ' + path);
  fs.mkdirSync(path);
}

function checkDataFolders(): void {
  [
    config.DATA_PATH
  ].forEach(maybeCreateDir);
}

export class NedbConnector implements DbConnector {
  private static _instance: NedbConnector;

  private _db = new Map<Collection, dbCollection>();

  private static COLLECTION_TO_CONFIG_MAPPING = new Map<Collection, NedbCollectionConfig>([
    [Collection.ANALYTIC_UNITS, { filename: config.ANALYTIC_UNITS_DATABASE_PATH, timestampData: true }],
    [Collection.ANALYTIC_UNIT_CACHES, { filename: config.ANALYTIC_UNIT_CACHES_DATABASE_PATH }],
    [Collection.SEGMENTS, { filename: config.SEGMENTS_DATABASE_PATH }],
    [Collection.THRESHOLD, { filename: config.THRESHOLD_DATABASE_PATH }],
    [Collection.DETECTION_SPANS, { filename: config.DETECTION_SPANS_DATABASE_PATH }],
    [Collection.DB_META, { filename: config.DB_META_PATH }],
  ]);

  constructor() { }

  async init(): Promise<void> {
    checkDataFolders();

    const inMemoryOnly = config.HASTIC_DB_IN_MEMORY;
    // TODO: it can throw an error, so we should catch it
    NedbConnector.COLLECTION_TO_CONFIG_MAPPING.forEach(
      (config: NedbCollectionConfig, collection: Collection) => {
        this._db.set(collection, new nedb({ ...config, autoload: true, inMemoryOnly }));
      }
    );
  }

  get db(): Map<Collection, dbCollection> {
    return this._db;
  }

  static get instance(): NedbConnector {
    if (this._instance === undefined) {
      this._instance = new this();
    }
    return this._instance;
  }
}
