export class Metric {
  constructor(public datasource: string, public targets: any[]) {
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
      targets: this.targets
    };
  }

  static fromObject(obj: any): Metric {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Metric(
      obj.datasource,
      obj.targets
    );
  }
}


