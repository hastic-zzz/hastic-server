import * as config from '../config';

const zmq = require('zeromq');

import * as childProcess from 'child_process'
import * as fs from 'fs';
import * as path from 'path';


export type AnalyticsMessage = {
  method: string,
  payload?: string
}

export class AnalyticsService {

  private _requester: any;
  private _ready: boolean = false;
  private _pingResponded = false;
  private _zmqConnectionString = null;
  private _ipcPath = null;
  private _analyticsPinger: NodeJS.Timer = null;
  private _isClosed = false;

  constructor(private _onResponse: (response: any) => void) {
    this._init();
  }

  public async sendTask(msgObj: any): Promise<void> {
    if(!this._ready) {
      return Promise.reject("Analytics is not ready");
    }
    let message = {
      method: 'task',
      payload: JSON.stringify(msgObj)
    }
    return this.sendMessage(message);
  }

  public async sendMessage(message: AnalyticsMessage): Promise<void> {
    let strMessage = JSON.stringify(message);
    if(message.method === 'ping') {
      strMessage = 'ping';
    }
    return new Promise<void>((resolve, reject) => {
      this._requester.send(strMessage, undefined, (err) => {
        if(err) {
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
      fs.unlinkSync(this._ipcPath);
    }
    this._requester.close();
    console.log('Ok');
  }

  public get ready(): boolean { return this._ready; }

  private async _init() {
    this._requester = zmq.socket('pair');
    let productionMode = process.env.NODE_ENV !== 'development';

    this._zmqConnectionString = `tcp://127.0.0.1:${config.ZMQ_DEV_PORT}`; // debug mode
    if(productionMode) {
      this._zmqConnectionString = config.ZMQ_CONNECTION_STRING;
      if(this._zmqConnectionString === null) {
        var createResult = await AnalyticsService.createIPCAddress();
        this._zmqConnectionString = createResult.address;
        this._ipcPath = createResult.file;
      }
    }

    console.log("Binding to zmq... %s", this._zmqConnectionString);
    this._requester.connect(this._zmqConnectionString);
    this._requester.on("message", this._onAnalyticsMessage.bind(this));
    console.log('Ok');

    if(productionMode) {
      console.log('Creating analytics process...');
      try {
        var cp = await AnalyticsService._runAnalyticsProcess(this._zmqConnectionString);
      } catch(error) {
        console.error('Can`t run analytics process: %s', error);
        return;
      }
      console.log('Ok, pid: %s', cp.pid);
    }

    console.log('Start analytics pinger...');
    this._runAlalyticsPinger();
    console.log('Ok');

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

    if(fs.existsSync(path.join(config.ANALYTICS_PATH, 'dist/worker/worker'))) {
      console.log('dist/worker/worker');
      cp = childProcess.spawn('dist/worker/worker', [], cpOptions);
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

      cp.stdout.on('data', () => {
        if(resolved) {
          return;
        } else {
          resolved = true;
        }
        resolve(cp);
      });

      cp.stderr.on('data', function(data) {
        if(resolved) {
          return;
        } else {
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
    if(process.env.NODE_ENV !== 'development') {
      await AnalyticsService._runAnalyticsProcess(this._zmqConnectionString);
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
      this.sendMessage({ method: 'ping' });
    }, config.ANLYTICS_PING_INTERVAL);
  }

  private static async createIPCAddress(): Promise<{ address: string, file: string }> {
    let filename = `${process.pid}.ipc`
    let p = path.join(config.ZMQ_IPC_PATH, filename);
    fs.writeFileSync(p, '');
    return Promise.resolve({ address: 'ipc://' + p, file: p });
  }

}
