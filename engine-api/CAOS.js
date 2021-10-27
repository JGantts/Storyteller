/*var edge = require('electron-edge-js');
var path = require('path');


//#r "resources/app/engine-api/CAOS.dll"
//#r "engine-api/CAOS.dll"


var executeCaos = edge.func(`
#r "engine-api/CAOS.dll"
using CAOS;

async (dynamic input) => {

  CaosInjector injector = new CaosInjector("Docking Station");

  if (injector.CanConnectToGame())
  {
    try
    {
        CaosResult result = injector.ExecuteCaos(input.ToString());
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
    //return "Connected to game. ";// +
      //injector.ProcessID().ToString();
  }
  else
  {
    return "Couldn't connect to game.";
  }

}
`);

var injectScript = edge.func(`
#r "engine-api/CAOS.dll"
using CAOS;

async (dynamic input) => {

  CaosInjector injector = new CaosInjector("Docking Station");

  if (injector.CanConnectToGame())
  {
    try
    {
        CaosResult result = injector.AddScriptToScriptorium(
          int.Parse(input.family.ToString()),
          int.Parse(input.genus.ToString()),
          int.Parse(input.species.ToString()),
          int.Parse(input.eventNum.ToString()),
          input.script.ToString()
        );
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
    //return "Connected to game. ";// +
      //injector.ProcessID().ToString();
  }
  else
  {
    return "Couldn't connect to game.";
  }
}
`);*/
