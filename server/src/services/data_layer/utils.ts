import { ObjectID } from 'mongodb';
import * as _ from 'lodash';

//TODO: move to DbQueryWrapper

export function wrapIdToQuery(query: string | object): object {
  if(typeof query === 'string') {
    return { _id: query };
  }
  return query;
}

export function wrapIdToMongoDbQuery(query: string | object): object {
  if(typeof query === 'string') {
    return { _id: new ObjectID(query) };
  }
  return query;
}

export function wrapIdsToQuery(query: string[] | object): object {
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

export function useMongoSyntax(query: any): any {
  let mongoQuery = [];
  for (const key in query) {
    const newObject = _.pick(query, key);
    mongoQuery.push(newObject);
  }
  return mongoQuery;
}
