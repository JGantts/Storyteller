function launchDockingStation(){
  var exec = require('child_process').execFile;
  var executablePath = "C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station/";

  exec(executablePath + 'engine.exe',{
    cwd: executablePath
  }, function(err, data) {
      if(err){
         console.error(err);
         return;
      }

      console.log(data.toString());
  });
}
