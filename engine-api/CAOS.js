var edge = require('electron-edge-js');
var path = require('path');

var helloWorld = edge.func(`
#r "resources/app/engine-api/CAOS.dll"

using CAOS;

async (input) => {

  CaosInjector injector = new CaosInjector("Docking Station");

  if (injector.CanConnectToGame())
  {
    return "Connected to game.";
  }
  else
  {
    return "Couldn't connect to game.";
  }

  return ".NET Welcomes " + input.ToString();
}
`);

helloWorld('JavaScript', function (error, result) {
    if (error) throw error;
    console.log(result);
});


/*var child = require('child_process').execFile;
//var executablePath = "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
var executablePath = "engine-api/CAOS.dll";

child(executablePath, function(err, data) {
    if(err){
       console.error(err);
       return;
    }
    console.log(data.toString());
});*/
