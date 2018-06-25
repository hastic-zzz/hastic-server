import { ANALYTICS_PATH } from '../config'

import { spawn, ChildProcess } from 'child_process'
import { split, mapSync } from 'event-stream';

import * as fs from 'fs';
import * as path from 'path';


export class AnalyticsConnection {

  private _learnWorker: ChildProcess;

  constructor(private _onResponse: (response: any) => void) {
    if(fs.existsSync(path.join(ANALYTICS_PATH, 'dist/worker/worker'))) {
      this._learnWorker = spawn('dist/worker/worker', [], { cwd: ANALYTICS_PATH })
    } else {
      // If compiled analytics script doesn't exist - fallback to regular python
      this._learnWorker = spawn('python3', ['worker.py'], { cwd: ANALYTICS_PATH })
    }

    this._learnWorker.stdout.pipe(
      split()).pipe(mapSync(this._onPipeMessage.bind(this))
    );
    this._learnWorker.stderr.on('data', data => console.error(`worker stderr: ${data}`));
  }

  private _onPipeMessage(data) {
    console.log(`worker stdout: ${data}`);
    let response = JSON.parse(data);
    this._onResponse(response);
  }

  public async sendMessage(task: any): Promise<void> {
    let command = JSON.stringify(task);
    this._learnWorker.stdin.write(`${command}\n`);
  }

}
