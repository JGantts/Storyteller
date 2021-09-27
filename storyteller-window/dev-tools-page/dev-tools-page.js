var { ipcRenderer } = require('electron');

$.getScript('../engine-api/CAOS.js');

function executeUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function launchSorcerersKit(){
  ipcRenderer.send('createSorcerersKitWindow', null)
}

function launchDesignersKit(){
  ipcRenderer.send('createDesignersKitWindow', null)
}

function launchCartographersKit(){
  ipcRenderer.send('createCartographersKitWindow', null)
}
