import { ANALYTICS_PATH, ZEROMQ_CONNECTION_STRING, ANLYTICS_PING_INTERVAL } from '../config'

const zmq = require('zeromq');

import { spawn } from 'child_process'
import * as fs from 'fs';
import * as path from 'path';


export class AnalyticsService {

  private _requester: any;
  private _ready: boolean = false;
  private _pingResponded = false;


  constructor(private _onResponse: (response: any) => void) {
    this._init();
  }

  public async sendTask(msgObj: any): Promise<void> {
    if(!this._ready) {
      return Promise.reject("Analytics is not ready");
    }
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

  public get ready(): boolean { return this._ready; }

  private async _init() {
    this._requester = zmq.socket('pair');

    if(process.env.NODE_ENV !== 'development') {
      this._runAnalyticsProcess();
    }

    console.log("Binding to zmq...: %s", ZEROMQ_CONNECTION_STRING);
    this._requester.connect(ZEROMQ_CONNECTION_STRING);
    this._requester.on("message", this._onAnalyticsMessage.bind(this));
    console.log('Ok');

    console.log('Start analytics pinger...');
    this._runAlalyticsPinger();
    console.log('Ok');

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

  private _onAnalyticsUp() {
    console.log('Analytics is up');
  }

  private _onAnalyticsDown() {
    console.log('Analytics is down');
    if(process.env.NODE_ENV !== 'development') {
      this._runAnalyticsProcess();
    }
  }

  private _onAnalyticsMessage(text: any, error) {
    if(text.toString() === 'pong') {
      this._pingResponded = true;
      if(!this._ready) {
        this._ready = true;
        this._onAnalyticsUp();
      }
      return;
    }
    console.log(`analytics message: "${text}"`);
    let response; 
    try {
      response = JSON.parse(text);
    } catch (e) {
      console.error("Can`t parse response from analytics as json:");
      console.error(text);
      throw new Error('Unexpected response');
    }
    this._onResponse(response);
  }

  private async _runAlalyticsPinger() {
    setInterval(() => {
      if(!this._pingResponded && this._ready) {
        this._ready = false;
        this._onAnalyticsDown();
      }
      this._pingResponded = false;
      // TODO: set life limit for this ping
      this.sendMessage('ping');
    }, ANLYTICS_PING_INTERVAL);
  }

}
