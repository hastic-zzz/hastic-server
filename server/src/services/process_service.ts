import * as config from '../config';

var exitHandlers: (() => void)[] = [];
var exitHandled = false;

/**
 * Add a callback for closing programm bacause of any reason
 * 
 * @param callback a sync function
 */
export function registerExitHandler(callback: () => void) {
  exitHandlers.push(callback);
}

function exitHandler(options: any, err?: any) {
  if(exitHandled) {
    return;
  }
  exitHandled = true;
  for(let i = 0; i < exitHandlers.length; i++) {
    try {
      exitHandlers[i]();
    } catch(e) {
      console.error('Got error during exit: ' + e);
      if(!config.PRODUCTION_MODE && e instanceof Error) {
        console.error(e.stack);
      }
    }
  }
  console.log('process exited successfully');
  process.exit();
}

function catchException(options: any, err: any) {
  console.log('Server exception:');
  console.log(err);
  exitHandler({ exit: true });
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup:true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit:true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit:true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit:true }));

//catches uncaught exceptions
process.on('uncaughtException', catchException.bind(null, { exit:true }));