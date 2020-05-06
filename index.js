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

  devtools = new BrowserWindow({show: false})
  devtools.setBounds({ x: 0, y: 0,})
  devtools.minimize()

  win.on('close', () => {
    if(!devtools.isDestroyed()){
      devtools.close()
    }
  })

  // and load the index.html of the app.
  win.loadFile('launcher-window/index.html')

  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools()
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

  devtools = new BrowserWindow({show: false})
  devtools.setBounds({ x: 0, y: 0,})
  devtools.minimize()

  win.on('close', () => {
    if(!devtools.isDestroyed()){
      devtools.close()
    }
  })

  // and load the index.html of the app.
  win.loadFile('caos-tool-window/index.html')

  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools()
}

app.whenReady().then(launchApp)
