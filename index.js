const { app, BrowserWindow } = require('electron')

var devtools

function createWindow () {
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

  win.on('close', () => {
    if(!devtools.isDestroyed()){
      devtools.close()
    }
  })

  devtools = new BrowserWindow({show: false})
  devtools.setBounds({ x: 0, y: 0,})
  devtools.minimize()

  // and load the index.html of the app.
  win.loadFile('index.html')

  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)
