const { app, BrowserWindow, ipcMain, Menu } = require('electron');
let settings;

ipcMain.on('createSorcerersKitWindow', (event, args) => {
  createSorcerersKitWindow();
});

ipcMain.on('createDesignersKitWindow', (event, args) => {
  createDesignersKitWindow();
});

ipcMain.on('createCartographersKitWindow', (event, args) => {
  createCartographersKitWindow();
});

function launchApp(){
  loadSettings(createStorytellerWindow);
}

function loadSettings(then){
  settings = require('electron-settings');
  let settingLoaderWin = new BrowserWindow({show: false})
  then();
  settingLoaderWin.once('ready-to-show', () => {
    settingLoaderWin.show();
  })
}

function createStorytellerWindow () {
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

  loadWindow(win, 'storyteller-window/index.html')
}

function createSorcerersKitWindow() {
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

  loadWindow(win, 'sorcerers-kit-window/index.html')
}

function createDesignersKitWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#233D43',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    }
  })

  win.setMenu(null)

  loadWindow(win, 'designers-kit-window/index.html')
}

function createCartographersKitWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#503642',
    webPreferences: {
      nodeIntegration: true
    }
  })

  const template =
   [
     {
        label: 'File',
        submenu: [
           {
              label: 'New',
              click() {
                 console.log('item 1 clicked')
              }
           },
           {
              role: 'redo'
           },
           {
              type: 'separator'
           },
           {
              role: 'cut'
           },
           {
              role: 'copy'
           },
           {
              role: 'paste'
           }
        ]
     },

     {
        label: 'Edit',
        submenu: [
           {
              role: 'undo'
           },
           {
              role: 'redo'
           },
           {
              type: 'separator'
           },
           {
              role: 'cut'
           },
           {
              role: 'copy'
           },
           {
              role: 'paste'
           }
        ]
     },

     {
        label: 'View',
        submenu: [
           {
              role: 'reload'
           },
           {
              role: 'toggledevtools'
           },
           {
              type: 'separator'
           },
           {
              role: 'resetzoom'
           },
           {
              role: 'zoomin'
           },
           {
              role: 'zoomout'
           },
           {
              type: 'separator'
           },
           {
              role: 'togglefullscreen'
           }
        ]
     },

     {
        role: 'window',
        submenu: [
           {
              role: 'minimize'
           },
           {
              role: 'close'
           }
        ]
     },

     {
        role: 'help',
        submenu: [
           {
              label: 'Learn More'
           }
        ]
     }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  loadWindow(win, 'cartographers-kit-window/index.html')
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
  });
  devtools.setBounds({ x: 0, y: 0,})

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
