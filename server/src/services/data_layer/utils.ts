import { FilterQuery, ObjectID } from 'mongodb';

//TODO: move to DbQueryWrapper


export function wrapIdToQuery(query: string | object): object {
  if(typeof query === 'string') {
    return { _id: query };
  }
  return query;
}

export function wrapIdToMongoDbQuery(query: FilterQuery<string | object>): object {
  if(typeof query === 'string') {
    return { _id: new ObjectID(query) };
  }
  if(typeof query._id === 'string') {
    return { _id: new ObjectID(query._id) };
  }
  return query;
}

export function wrapIdsToQuery(query: string[] | object): object {
  console.log('wrapid type: ', typeof query);
  console.log('wrapid query: ', query);
  if(Array.isArray(query)) {
    return { _id: { $in: query } };
  }
  return query;
}

// mongodb uses ObjectIds to store _id
// we should wrap ids into ObjectID to generate correct query
export function wrapIdsToMongoDbQuery(query: string[] | object): object {
  if(Array.isArray(query)) {
    query = query.map(id => new ObjectID(id));
    return { _id: { $in: query } };
  }
  return query;
}

export function isEmptyArray(obj: any): boolean {
  if(!Array.isArray(obj)) {
    return false;
  }
  return obj.length == 0;
}
