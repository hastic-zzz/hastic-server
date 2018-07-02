const zmq = require('zeromq');

import { spawn } from 'child_process'
import { ANALYTICS_PATH, ZEROMQ_CONNECTION_STRING } from '../config'

import * as fs from 'fs';
import * as path from 'path';



export class AnalyticsConnection {

  private _requester: any;

  constructor(private _onResponse: (response: any) => void) {
    this._initConnection();
  }

  public async sendTask(msgObj: any): Promise<void> {
    let message = JSON.stringify(msgObj);
    return this.sendMessage(message);
  }

  public async sendMessage(message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._requester.send(message, undefined, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public close() {
    // TODO: close socket & terminate process if you have any
    this._requester.close();
  }

  private async _initConnection() {
    this._requester = zmq.socket('pair');

    if(process.env.NODE_ENV !== 'development') {
      this._runAnalyticsProcess();
    }

    console.log("Binding to zmq...: %s", ZEROMQ_CONNECTION_STRING);
    this._requester.connect(ZEROMQ_CONNECTION_STRING);
    console.log('Ok');

    console.log('Sending ping to analytics...');
    await this._connectToAnalytics();
    console.log('Ok')

    this._requester.on("message", this._onAnalyticsMessage.bind(this));

  }

  private async _connectToAnalytics() {
    this.sendMessage('ping'); // we don`t await here
    return new Promise(resolve => {
      this._requester.once('message', (message) => {
        console.log('Got message from analytics: ' + message);
        resolve();
      })
    });
  }

  private _runAnalyticsProcess() {
    console.log('Creating analytics process...');
    if(fs.existsSync(path.join(ANALYTICS_PATH, 'dist/worker/worker'))) {
      console.log('dist/worker/worker');
      spawn('dist/worker/worker', [], { cwd: ANALYTICS_PATH })
    } else {
      console.log('python3 server.py');
      // If compiled analytics script doesn't exist - fallback to regular python
      spawn('python3', ['server.py'], { cwd: ANALYTICS_PATH })
    }
    console.log('ok');
  }

  private _onAnalyticsMessage(data) {
    console.log(`analytics message: ${data}`);
    let response = JSON.parse(data);
    this._onResponse(response);
  }

}
