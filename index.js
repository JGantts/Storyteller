const { app, BrowserWindow, ipcMain } = require('electron');
let settings;

ipcMain.on('launchCaosTool', (event, args) => {
  createCaosToolWindow();
});

function launchApp(){
  loadSettings(createLauncherWindow);
}

function loadSettings(then){
  settings = require('electron-settings');
  let settingLoaderWin = new BrowserWindow({show: false})
  then();
  settingLoaderWin.once('ready-to-show', () => {
    settingLoaderWin.show();
  })
}

function createLauncherWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#332D53',
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
    backgroundColor: '#353D53',
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null)

  loadWindow(win, 'caos-tool-window/index.html')
}

function loadWindow(browserWindow, loadFile){
  if(!settings.get('development.javascript')){
    browserWindow.loadFile(loadFile);
  }else{
    loadWindowWithDevTools(browserWindow, loadFile);
  }
}

function loadWindowWithDevTools(browserWindow, loadFile){
  let devtools = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  });
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
