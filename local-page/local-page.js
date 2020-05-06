function launchDockingStation(){
  var exec = require('child_process').execFile;
  var executablePath = "C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station/engine.exe";

  exec(executablePath,{
    cwd: 'C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station'
  }, function(err, data) {
      if(err){
         console.error(err);
         return;
      }

      console.log(data.toString());
  });
}
