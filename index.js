const { app, BrowserWindow, ipcMain } = require('electron')
const devEnv = false;


function launchApp(){
  ipcMain.on('launchCaosTool', (event, args) => {
    createCaosToolWindow();
  });
  createLauncherWindow();
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
  if(!devEnv){
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

  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools()
}

app.whenReady().then(launchApp)
