export function wrapIdToQuery(query: string | object): object {
  if(typeof query === 'string') {
    return { _id: query };
  }
  return query;
}

export function wrapIdsToQuery(query: string[] | object): object {
  if(Array.isArray(query)) {
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