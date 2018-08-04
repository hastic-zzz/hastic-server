import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.METRICS);


export type Datasource = {
  method: string,
  data: Object,
  params: Object,
  type: string,
  url: string
}

export type Metric = {
  datasource: Datasource,
  targets: string[]
}

export function metricFromObj(obj: any): Metric {
  const metric: Metric = {
    datasource: obj.datasource,
    targets: obj.targets;
  };
  return metric;
}

export async function saveTargets(targets: string[]) {
  let metrics = [];
  for (let target of targets) {
    metrics.push(saveTarget(target));
  }
  return metrics;
}

export async function saveTarget(target: string) {
  //const md5 = crypto.createHash('md5')
  const targetId = crypto.createHash('md5').update(JSON.stringify(target)).digest('hex');
  let filename = path.join(METRICS_PATH, `${targetId}.json`);
  writeJsonDataSync(filename, target);
  return targetId;
}

export async function getTarget(targetId) {
  let filename = path.join(METRICS_PATH, `${targetId}.json`);
  return getJsonDataSync(filename);
}


