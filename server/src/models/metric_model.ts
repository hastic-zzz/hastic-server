type Datasource = {
  url: string,
  type: string,
  params: {
    db: string,
    q: string,
    epoch: string
  }
}

export type MetricId = string;

export class Metric {
  constructor(
    public datasource: Datasource,
    public targets: any[],
    public id?: MetricId
  ) {
    if(datasource === undefined) {
      throw new Error('datasource is undefined');
    }
    if(targets === undefined) {
      throw new Error('targets is undefined');
    }
    if(targets.length === 0) {
      throw new Error('targets is empty');
    }
  }

  public toObject() {
    return {
      datasource: this.datasource,
      targets: this.targets,
      _id: this.id
    };
  }

  static fromObject(obj: any): Metric {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Metric(
      obj.datasource,
      obj.targets,
      obj._id
    );
  }
}
