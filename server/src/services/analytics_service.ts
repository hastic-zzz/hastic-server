import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { WebhookType } from '../services/notification_service';
import * as config from '../config';
import { AlertService } from './alert_service';

import * as WebSocket from 'ws';

import * as childProcess from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { HASTIC_SERVER_URL } from '../config';


export class AnalyticsService {

  private _alertService = new AlertService();
  private _socket_server: WebSocket.Server;
  private _socket_connection: WebSocket = null;
  private _ready: boolean = false;
  private _lastAlive: Date = null;
  private _pingResponded = false;
  private _analyticsPinger: NodeJS.Timeout = null;
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
      if(this._socket_connection === null) {
        reject('Can`t send because analytics is not connected');
      }
      this._socket_connection.send(text, undefined, (err: any) => {
        if(err) {
          console.trace(`got error while sending ${err}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public get ready(): boolean { return this._ready; }
  public get lastAlive(): Date { return this._lastAlive; }

  private async _init() {
    this._socket_server = new WebSocket.Server({ host: HASTIC_SERVER_URL.hostname, port: +HASTIC_SERVER_URL.port });

    // TODO: move this to config OR use existing http server
    console.log("Creating websocket server ... %s", HASTIC_SERVER_URL.origin);

    this._socket_server.on("connection", this._onNewConnection.bind(this));
    // TODO: handle connection drop

    if(this._productionMode && !this._inDocker) {
      console.log('Creating analytics process...');
      try {
        var cp = await AnalyticsService._runAnalyticsProcess();
      } catch(error) {
        console.error('Can`t run analytics process: %s', error);
        return;
      }
      console.log('Analytics creating successful, pid: %s', cp.pid);
    }

  }

  /**
   * Spawns analytics process. Reads process stderr and fails if it isn`t empty.
   * No need to stop the process later.
   *
   * @returns Creaded child process
   * @throws Process start error or first exception during python start
   */
  private static async _runAnalyticsProcess(): Promise<childProcess.ChildProcess> {
    let cp: childProcess.ChildProcess;
    let cpOptions = {
      cwd: config.ANALYTICS_PATH,
      env: {
        ...process.env,
        HASTIC_SERVER_URL: config.HASTIC_SERVER_URL.origin
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
    this._alertService.sendMessage(msg, WebhookType.RECOVERY);
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
      console.error('Can`t parse response from analytics as json:');
      console.error(text);
      throw new Error('Can`t parse response from analytics as json, see log');
    }
    this._onMessage(AnalyticsMessage.fromObject(response));
  }
  
  // cb(this: WebSocket, socket: WebSocket, request: http.IncomingMessage)
  private async _onNewConnection(connection: WebSocket) {
    if(this._socket_connection !== null) {
      // TODO: use buildin websocket validator
      console.error('There is already an analytics connection. Only one connection is supported.');
      // we send error and then close connection
      connection.send('EALREADYEXISTING', () => { connection.close(); });
      return;
    }
    // TODO: log connection id
    console.log('Got new analytic connection');
    this._socket_connection = connection;
    this._socket_connection.on("message", this._onAnalyticsMessage.bind(this));
    // TODO: implement closing
    this._socket_connection.on("close", this._onAnalyticsDown.bind(this));
    await this.sendText('hey');

    console.log('Start analytics pinger...');
    // TODO: use websockets buildin pinger
    this._runAlalyticsPinger();
    console.log('Analytics pinger started');
  }

  private async _onAnalyticsDown() {
    if(!this._ready) {
      // it's possible that ping is too slow and connection is closed
      return;
    }
    this._stopAlalyticsPinger();
    if(this._socket_connection !== null) {
      this._socket_connection.close();
      this._socket_connection = null;
    }
    this._ready = false;
    const msg = 'Analytics is down';
    console.log(msg);
    this._alertService.sendMessage(msg, WebhookType.FAILURE);
    if(this._productionMode && !this._inDocker) {
      await AnalyticsService._runAnalyticsProcess();
    }
  }

  private _runAlalyticsPinger() {
    this._analyticsPinger = setInterval(() => {
      if(this._isClosed) {
        return;
      }
      if(!this._pingResponded && this._ready) {
        this._onAnalyticsDown();
      }
      this._pingResponded = false;
      // TODO: set life limit for this ping
      this.sendText('PING');
    }, config.ANALYTICS_PING_INTERVAL);
  }

  private _stopAlalyticsPinger() {
    if(this._analyticsPinger !== null) {
      clearInterval(this._analyticsPinger);
    }
    this._analyticsPinger = null;
  }

  public get queueLength() {
    return this._queue.length;
  }

  public close() {
    this._isClosed = true;
    console.log('Terminating analytics service...');
    this._stopAlalyticsPinger();
    if(this._socket_connection !== null) {
      this._socket_connection.close();
    }
    console.log('Termination successful');
  }

}
