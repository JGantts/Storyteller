var edge = require('electron-edge-js');
var path = require('path');

var helloWorld = edge.func(`
#r "resources/app/engine-api/CAOS.dll"
using CAOS;

async (input) => {

  CaosInjector injector = new CaosInjector("Docking Station");

  if (injector.CanConnectToGame())
  {
    try
    {
        CaosResult result = injector.ExecuteCaos("outs \\"hi\\"");
        if (result.Success)
        {
            return result.Content;
        }
        else
        {
           return "Error Code: " + result.ResultCode;
        }
    }
    catch (NoGameCaosException e)
    {
        return "Game exited unexpectedly. Error message: " + e.Message;
    }
    return "Connected to game. ";// +
      //injector.ProcessID().ToString();
  }
  else
  {
    return "Couldn't connect to game.";
  }

}
`);

(async function(){
  await helloWorld('JavaScript', function (error, result) {
      if (error) throw error;
      console.log(result);
  });
}());




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
