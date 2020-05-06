const { app, BrowserWindow, ipcMain } = require('electron');
const storage = require('electron-json-storage');

let javaScriptDevEnv;

ipcMain.on('launchCaosTool', (event, args) => {
  createCaosToolWindow();
});

function launchApp(){
  loadSettings(createLauncherWindow);
}

function loadSettings(then){
  storage.get('devEnvironment', function(error, data) {
    if (error) throw error;
    if (data == {}){
      console.log("empty data")
      storage.set('devEnvironment', { 'isDev': false }, function(error) {
        if (error) throw error;
        javaScriptDevEnv = false;
        then();
      });
    }else{
      if (data.isDev){
        javaScriptDevEnv = true;
        then();
      }else{
        javaScriptDevEnv = false;
        then();
      }
    }
  });
}

function createLauncherWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null)

  loadWindow(win, 'launcher-window/index.html')
}

function createCaosToolWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  loadWindow(win, 'caos-tool-window/index.html')
}

function loadWindow(browserWindow, loadFile){
  if(!javaScriptDevEnv){
    browserWindow.loadFile(loadFile);
  }else{
    loadWindowWithDevTools(browserWindow, loadFile);
  }
}

function loadWindowWithDevTools(browserWindow, loadFile){
  let devtools = new BrowserWindow({show: false})
  devtools.setBounds({ x: 0, y: 0,})
  devtools.minimize()

  browserWindow.on('close', () => {
    if(!devtools.isDestroyed()){
      devtools.close()
    }
  })

  browserWindow.loadFile(loadFile);

  browserWindow.webContents.setDevToolsWebContents(devtools.webContents)
  browserWindow.webContents.openDevTools()
}

app.whenReady().then(launchApp)
