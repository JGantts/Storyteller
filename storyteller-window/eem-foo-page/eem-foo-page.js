var { ipcRenderer } = require('electron');

$.getScript('../engine-api/CAOS.js');

function executeUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function launchSorcerersTable(){
  ipcRenderer.send('createSorcerersTableWindow', null)
}

function launchDesignersTable(){
  ipcRenderer.send('createDesignersTableWindow', null)
}

function launchCartographersTable(){
  ipcRenderer.send('createCartographersTableWindow', null)
}
