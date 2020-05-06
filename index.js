const { app, BrowserWindow, ipcMain } = require('electron')

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

  loadWindowWithDevTools(win, 'launcher-window/index.html')
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

  loadWindowWithDevTools(win, 'caos-tool-window/index.html')
}

function loadWindow(browserWindow, loadFile){
  browserWindow.loadFile(loadFile);
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
