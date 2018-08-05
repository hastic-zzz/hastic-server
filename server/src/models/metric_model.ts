import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.METRICS);


export type Datasource = {
  method: string,
  data: Object,
  params: Object,
  type: string,
  url: string
}

export type MetricId = string;

export type Metric = {
  id?: MetricId,
  datasource: Datasource,
  targets: string[]
}

export function metricFromObj(obj: any): Metric {
  return {
    datasource: obj.datasource,
    targets: obj.targets
  };
}

// export async function saveTargets(targets: string[]) {
//   let metrics = [];
//   for (let target of targets) {
//     metrics.push(create(target));
//   }
//   return metrics;
// }

export async function create(metric: Metric): Promise<MetricId> {
  return metric.id = await db.insert(metric);
}

export async function findMetric(id: MetricId): Promise<Metric> {
  return db.findOne(id);
}


