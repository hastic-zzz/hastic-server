import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';

let db = makeDBQ(Collection.PANELS);


export type PanelId = string;

export class Panel {
  constructor(
    public panelUrl: string,
    public analyticUnits: AnalyticUnitId[],
    public id?: PanelId
  ) {
    if(this.panelUrl === undefined) {
      throw new Error('panelUrl is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      panelUrl: this.panelUrl,
      analyticUnits: this.analyticUnits
    };
  }

  static fromObject(obj: any): Panel {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Panel(
      obj.panelUrl,
      obj.analyticUnits,
      obj._id
    );
  }
}

export type FindOneQuery = {
  panelUrl: string
}

export async function findOne(query: FindOneQuery): Promise<Panel> {
  let panel = await db.findOne(query);
  if(panel === null) {
    return null;
  }
  return Panel.fromObject(panel);
}

export async function insertAnalyticUnit(panelUrl: string, analyticUnitId: AnalyticUnitId) {
  const panel = await db.findOne({ panelUrl });

  return db.updateOne({ panelUrl }, {
    analyticUnits: panel.analyticUnits.concat(analyticUnitId)
  });
}

export async function removeAnalyticUnit(panelUrl: string, analyticUnitId: AnalyticUnitId) {
  const panel = await db.findOne({ panelUrl });
  
  return db.updateOne({ panelUrl }, {
    analyticUnits: panel.analyticUnits.filter(analyticUnit => analyticUnit !== analyticUnitId)
  });
}

export async function createPanel(panelUrl: string) {
  let panel = new Panel(panelUrl, []);

  return db.insertOne(panel.toObject());
}
