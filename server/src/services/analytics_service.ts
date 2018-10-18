import { AnalyticsTask } from '../models/analytics_task_model';
import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import * as config from '../config';

import * as zmq from 'zeromq';

import * as childProcess from 'child_process'
import * as fs from 'fs';
import * as path from 'path';


export class AnalyticsService {

  private _requester: any;
  private _ready: boolean = false;
  private _pingResponded = false;
  private _zmqConnectionString: string = null;
  private _ipcPath: string = null;
  private _analyticsPinger: NodeJS.Timer = null;
  private _isClosed = false;
  private _productionMode = false;
  private _inDocker = false;

  constructor(private _onMessage: (message: AnalyticsMessage) => void) {
    this._productionMode =  config.PRODUCTION_MODE;
    this._inDocker = config.INSIDE_DOCKER;
    this._init();
  }

  public async sendTask(task: AnalyticsTask): Promise<void> {
    if(!this._ready) {
      return Promise.reject("Analytics is not ready");
    }
    let message = new AnalyticsMessage(
      AnalyticsMessageMethod.TASK,
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
      console.log('Alanytics creating successful, pid: %s', cp.pid);
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
      console.log('python3 server.py');
      // If compiled analytics script doesn't exist - fallback to regular python
      console.log(config.ANALYTICS_PATH);
      cp = childProcess.spawn('python3', ['server.py'], cpOptions);
    }

    if(cp.pid === undefined) {
      return new Promise<childProcess.ChildProcess>((resolve, reject) => {
        cp.on('error', reject);
      });
    }

    return new Promise<childProcess.ChildProcess>((resolve, reject) => {
      var resolved = false;

      cp.stdout.on('data', (data) => {
        console.log(data);
        if(!resolved) {
          resolved = true;
        }
        resolve(cp);
      });

      cp.stderr.on('data', function(data) {
        console.error(data)
        if(!resolved) {
          resolved = true;
        }
        reject(data);
      });
    });

  }

  private _onAnalyticsUp() {
    console.log('Analytics is up');
  }

  private async _onAnalyticsDown() {
    console.log('Analytics is down');
    if(this._productionMode && !this._inDocker) {
      await AnalyticsService._runAnalyticsProcess(this._zmqConnectionString);
    }
  }

  private _onAnalyticsMessage(data: any) {

    let text = data.toString();
    if(text === 'PONG') {
      this._pingResponded = true;
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

}
