function launchDockingStation(){
  var { spawn } = require('child_process');
  var executablePath = "C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station/";

  const engineRef = spawn(executablePath + 'engine.exe', {
    detached: true,
    stdio: 'ignore',
    cwd: executablePath
  });

  engineRef.unref();
}
