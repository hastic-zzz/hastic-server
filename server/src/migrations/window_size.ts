import { Collection, makeDBQ } from '../services/data_service';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as AnalyticUnit from '../models/analytic_unit_model';

const db = makeDBQ(Collection.DB_VERSION);
const DB_INFO_ID = '0';
const REVISION_FOR_APPLY = 1

type DbInfo = {
  _id: string,
  revision: number
}


export async function convertHalfWinowSize() {
  const db_info: DbInfo = await db.findOne(DB_INFO_ID);

  if(db_info === null) {
    await db.insertOne({_id: DB_INFO_ID, revision: 0});
  }

  if(db_info.revision < REVISION_FOR_APPLY) {
    console.log('start migraiton of window sizes');
    const caches = await AnalyticUnitCache.getAllCaches();
    for(let cache of caches) {
      if(cache.data !== undefined) {
        cache.data.WINDOW_SIZE *= 2;
        await AnalyticUnitCache.setData(cache.id, cache.data)
      }
    }

    db_info.revision++;
    await db.updateOne(DB_INFO_ID, db_info);
    console.log('end migraiton of window sizes');
  } else {
    console.log('migraiton of window sizes not need');
  }
}
