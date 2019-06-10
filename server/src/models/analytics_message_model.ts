export enum AnalyticsMessageMethod {
  TASK = 'TASK',
  TASK_RESULT = 'TASK_RESULT',
  DETECT = 'DETECT',
  PUSHDETECT = 'PUSHDETECT',
  DATA = 'DATA'
}

export class AnalyticsMessage {
  public constructor(
    public method: AnalyticsMessageMethod,
    public payload?: any,
    public requestId?: number
  ) {

  }

  public toObject() {
    return {
      method: this.method,
      payload: this.payload,
      requestId: this.requestId
    };
  }

  static fromObject(obj: any): AnalyticsMessage {
    if(obj.method === undefined) {
      throw new Error('No method in obj:' + obj);
    }
    return new AnalyticsMessage(obj.method, obj.payload, obj.requestId);
  }
}
