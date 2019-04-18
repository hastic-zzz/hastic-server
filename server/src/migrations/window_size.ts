import { Collection, makeDBQ } from '../services/data_service';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as AnalyticUnit from '../models/analytic_unit_model';

const db = makeDBQ(Collection.DB_VERSION);
const DB_INFO_ID = '0';
const REVISION_FOR_APPLY = 1

type DbInfo = {
  revision: number
}


export async function convertHalfWinowSize() {
  const db_info: DbInfo = await db.findOne(DB_INFO_ID);

  if(db_info === null || db_info.revision < REVISION_FOR_APPLY) {
    const caches = await AnalyticUnitCache.getAllCaches();
    for(let cache of caches) {
      if(cache.data !== undefined) {
        cache.data.WINDOW_SIZE *= 2;
        await AnalyticUnitCache.setData(cache.id, cache.data)
      }
    }

    db_info.revision++;
    await db.updateOne(DB_INFO_ID, db_info);
  }
}
