import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { WebhookType } from '../services/notification_service';
import * as config from '../config';
import { AlertService } from './alert_service';

import * as zmq from 'zeromq';

import * as childProcess from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';


export class AnalyticsService {

  private _alertService = new AlertService();
  private _requester: any;
  private _ready: boolean = false;
  private _lastAlive: Date = null;
  private _pingResponded = false;
  private _zmqConnectionString: string = null;
  private _ipcPath: string = null;
  private _analyticsPinger: NodeJS.Timer = null;
  private _isClosed = false;
  private _productionMode = false;
  private _inDocker = false;
  private _queue: AnalyticsTask[] = [];

  constructor(private _onMessage: (message: AnalyticsMessage) => void) {
    this._productionMode =  config.PRODUCTION_MODE;
    this._inDocker = config.INSIDE_DOCKER;
    this._init();
  }

  public async sendTask(task: AnalyticsTask, fromQueue = false): Promise<void> {
    if(!this._ready) {
      console.log('Analytics is not ready');
      if(!fromQueue) {
        // TODO: add to db?
        this._queue.push(task);
        console.log('Adding task to queue');
      }
      return;
    }
    let method = task.type === AnalyticsTaskType.PUSH ?
      AnalyticsMessageMethod.DATA : AnalyticsMessageMethod.TASK
    let message = new AnalyticsMessage(
      method,
      task.toObject()
    );
    return this.sendMessage(message);
  }

  public async sendMessage(message: AnalyticsMessage): Promise<void> {
    let strMessage = JSON.stringify(message);
    return this.sendText(strMessage);
  }

  public async sendText(text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._requester.send(text, undefined, (err: any) => {
        if(err) {
          console.trace(`got error while sending ${err}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public close() {
    this._isClosed = true;
    console.log('Terminating analytics service...');
    clearInterval(this._analyticsPinger);
    if(this._ipcPath !== null) {
      console.log('Remove ipc path: ' + this._ipcPath);
      fs.unlinkSync(this._ipcPath);
    }
    this._requester.close();
    console.log('Terminating successful');
  }

  public get ready(): boolean { return this._ready; }
  public get lastAlive(): Date { return this._lastAlive; }

  private async _init() {
    this._requester = zmq.socket('pair');

    this._zmqConnectionString = config.ZMQ_CONNECTION_STRING;

    if(this._zmqConnectionString.startsWith('ipc')) {
      this._ipcPath = AnalyticsService.createIPCAddress(this._zmqConnectionString);
    }

    console.log("Binding to zmq... %s", this._zmqConnectionString);
    this._requester.connect(this._zmqConnectionString);
    this._requester.on("message", this._onAnalyticsMessage.bind(this));
    console.log('Binding successful');

    if(this._productionMode && !this._inDocker) {
      console.log('Creating analytics process...');
      try {
        var cp = await AnalyticsService._runAnalyticsProcess(this._zmqConnectionString);
      } catch(error) {
        console.error('Can`t run analytics process: %s', error);
        return;
      }
      console.log('Analytics creating successful, pid: %s', cp.pid);
    }

    console.log('Start analytics pinger...');
    this._runAlalyticsPinger();
    console.log('Analytics pinger started');

  }

  /**
   * Spawns analytics process. Reads process stderr and fails if it isn`t empty.
   * No need to stop the process later.
   *
   * @returns Creaded child process
   * @throws Process start error or first exception during python start
   */
  private static async _runAnalyticsProcess(zmqConnectionString: string): Promise<childProcess.ChildProcess> {
    let cp: childProcess.ChildProcess;
    let cpOptions = {
      cwd: config.ANALYTICS_PATH,
      env: {
        ...process.env,
        ZMQ_CONNECTION_STRING: zmqConnectionString
      }
    };

    if(fs.existsSync(path.join(config.ANALYTICS_PATH, 'dist/server/server'))) {
      console.log('dist/server/server');
      cp = childProcess.spawn('dist/server/server', [], cpOptions);
    } else {
      const ANALYTICS_SERVER_PATH = path.join('bin', 'server');
      console.log('python3 ' + ANALYTICS_SERVER_PATH);
      // If compiled analytics script doesn't exist - fallback to regular python
      console.log(config.ANALYTICS_PATH);
      // maybe starting it via bash better that put python3
      cp = childProcess.spawn('python3', [ANALYTICS_SERVER_PATH], cpOptions);
    }

    if(cp.pid === undefined) {
      return new Promise<childProcess.ChildProcess>((resolve, reject) => {
        cp.on('error', reject);
      });
    }

    return new Promise<childProcess.ChildProcess>((resolve, reject) => {
      var resolved = false;

      cp.stdout.on('data', (data) => {
        console.log(data.toString());
        if(resolved) {
          return;
        }
        resolved = true;
        resolve(cp);
      });

      cp.stderr.on('data', (data) => {
        console.error(data.toString());
        if(resolved) {
          return;
        }
        resolved = true;
        reject(data);
      });
    });

  }

  private _onAnalyticsUp() {
    const msg = 'Analytics is up';
    for(let i in _.range(this._queue.length)) {
      // TODO: check if task is done before removing it from the queue
      this.sendTask(this._queue.shift(), true);
    }
    console.log(msg);
    //this._alertService.sendMsg(msg, WebhookType.RECOVERY);
  }

  private async _onAnalyticsDown() {
    const msg = 'Analytics is down';
    console.log(msg);
    // TODO: enable analytics down webhooks when it stops bouncing
    // this._alertService.sendMsg(msg);
    if(this._productionMode && !this._inDocker) {
      await AnalyticsService._runAnalyticsProcess(this._zmqConnectionString);
    }
  }

  private _onAnalyticsMessage(data: any) {

    let text = data.toString();
    if(text === 'PONG') {
      this._pingResponded = true;
      this._lastAlive = new Date(Date.now());
      if(!this._ready) {
        this._ready = true;
        this._onAnalyticsUp();
      }
      return;
    }

    let response;
    try {
      response = JSON.parse(text);
    } catch (e) {
      console.error("Can`t parse response from analytics as json:");
      console.error(text);
      throw new Error('Unexpected response');
    }
    this._onMessage(AnalyticsMessage.fromObject(response));
  }

  private async _runAlalyticsPinger() {
    this._analyticsPinger = setInterval(() => {
      if(this._isClosed) {
        return;
      }
      if(!this._pingResponded && this._ready) {
        this._ready = false;
        this._onAnalyticsDown();
      }
      this._pingResponded = false;
      // TODO: set life limit for this ping
      this.sendText('PING');
    }, config.ANLYTICS_PING_INTERVAL);
  }

  private static createIPCAddress(zmqConnectionString: string): string {
    let filename = zmqConnectionString.substring(6); //without 'ipc://'
    fs.writeFileSync(filename, '');
    return filename;
  }

  public get queueLength() {
    return this._queue.length;
  }

}
