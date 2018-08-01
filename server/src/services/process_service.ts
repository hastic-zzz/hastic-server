

var exitHandlers = []
var exitHandled = false;

/**
 * Add a callback for closing programm bacause of any reason
 * 
 * @param callback a sync function
 */
export function registerExitHandler(callback: () => void) {
  exitHandlers.push(callback);
}

function exitHandler(options, err) {
  if(exitHandled) {
    return;
  }
  exitHandled = true;
  for(let i = 0; i < exitHandlers.length; i++) {
    exitHandlers[i]();
  }
  console.log('process exit');
  process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));