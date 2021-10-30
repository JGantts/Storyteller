const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');

//let settings;

let files = new Object();

ipcMain.on('minimize', (event, arg) => {
    event.sender.getOwnerBrowserWindow().minimize();
});

ipcMain.on('close', (event, arg) => {
    event.sender.getOwnerBrowserWindow().close();
});

function getWindowsFiles(browserWindow) {
    let windowType = getWindowType(browserWindow);
    assert(typeof windowType === "string");
    if (!files[windowType]) {
        files[windowType] = new Object();
    }
    if (!files[windowType][browserWindow.id]) {
        files[windowType][browserWindow.id] = new Object();
    }
    return files[windowType][browserWindow.id];
}

ipcMain.on('new-file', async (event, arg) => {
    let browserWindow = event.sender.getOwnerBrowserWindow();
    let windowsFiles = getWindowsFiles(browserWindow);
    let newFileId = crypto.randomUUID();
    let newFilePath = null;
    let fileContents = "";
    let newFile =
    {
        id: newFileId,
        path: newFilePath
    };
    windowsFiles[newFileId] = newFile;
    let newFiles =
    [{
        fileRef: windowsFiles[newFileId],
        contents: ""
    }];
    event.reply(
        'open-files',
        {
            files: newFiles
        }
    );
});

ipcMain.on('open-files', async (event, arg) => {
    let browserWindow = event.sender.getOwnerBrowserWindow();
    let windowsFiles = getWindowsFiles(browserWindow);
    try {
        let result = await dialog.showOpenDialog(
            browserWindow,
            arg.options
        );
        if (result.canceled){
          event.reply(
              'open-files',
              {
                  files: []
              }
          );
        } else {
            let openedFiles = [];
            for (path of result.filePaths) {
                let fileId = crypto.randomUUID();
                let fileRef =
                {
                    id: fileId,
                    path: path
                };
                let fileContents
                try {
                    fileContents = fs.readFileSync(path, 'utf-8');
                } catch (err) {
                    console.log(err);
                    fileRef.path = "";
                    fileContents = err.message;
                }
                windowsFiles[fileId] = fileRef;
                let openedFile = {
                    fileRef: windowsFiles[fileId],
                    contents: fileContents
                }
                openedFiles.push(openedFile);
            }
            event.reply(
                'open-files',
                {
                    files: openedFiles
                }
            );
        }
    } catch(err) {
        console.log(err);
        alert(err);
    }
})

ipcMain.on('save-file', async (event, arg) => {
    let browserWindow = event.sender.getOwnerBrowserWindow();
    let windowsFiles = getWindowsFiles(browserWindow);


    if (!windowsFiles[arg.fileId]){
        let result = await dialog.showSaveDialog(
            browserWindow,
            arg.options
        );
        if (result.canceled) {
            event.reply(
                'save-done',
                {
                  saved: false,
                  error: "User canceled"
                }
            );
            return;
        }
        windowsFiles[arg.fileId] = result.filePath;
    }
    let fileRef = windowsFiles[arg.fileId];
    try{
      await fs.writeFileSync(fileRef.path, arg.content, 'utf-8');
      event.reply(
          'save-done',
          { saved: true }
      );
      return;
    }catch (err){
      console.log(err);
      event.reply(
          'save-done',
          {
             saved: false,
             error: err
          }
      );
      return;
    }

});

ipcMain.on('close-file', async (event, arg) => {

});

async function displaySaveFileDialog(browserWindow){

}


async function displaySaveFileReminderDialog(){
    let options  = {
      buttons: ['Save', 'Toss', 'Cancel'],
      message: 'Do you want to save your work?'
    }
    let result = await dialog.showMessageBox(options);
    if(result.response === 0){
        return true;
    }else if (result.response === 1){
        return true;
    }else{
        return false;
    }
}

async function saveFile(){

  if (!currentFile){
    let result = await displaySaveFileDialog();
    if (result.canceled){
      return false;
    }
    currentFile = result.filePaths[0];
  }
  try{
    await fs.writeFileSync(currentFile, GetVisibleTextInElement(codeElement), 'utf-8');
    if (currentFileNeedsSaving){
      currentFileNeedsSaving = false;
      updateTitle();
    }
    return true;
  }catch (err){
    console.log(err);
    throw err;
  }
}

function getWindowType(browserWindow) {
    assert(
        typeof browserWindow === 'object',
        `Expected browserWindow, found ${typeof browserWindow} instead`
    );
    let path = browserWindow.webContents.getURL();
    let lastIndex = path.lastIndexOf("/");
    let secondTolastIndex = path.lastIndexOf("/", lastIndex-1);
    assert(lastIndex != secondTolastIndex, "Couldn't find two '/'s");
    let windowName = path.slice(secondTolastIndex+1, lastIndex);
    return windowName;
}

ipcMain.on('createSorcerersTableWindow', (event, args) => {
  createSorcerersTableWindow();
});

ipcMain.on('createDesignersTableWindow', (event, args) => {
  createDesignersTableWindow();
});

ipcMain.on('createCartographersTableWindow', (event, args) => {
  createCartographersTableWindow();
});

function launchApp(){
  loadSettings(createStorytellerWindow);
}

function loadSettings(then){
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
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.setMenu(null)

  storytellerWindow = win;

  loadWindow(win, 'storyteller-window/index.html')
}

function createSorcerersTableWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#353D53',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.setMenu(null)

  sorcerersTableWindow = win;

  loadWindow(win, 'sorcerers-table-window/index.html')
}

function createDesignersTableWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#233D43',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    }
  })

  win.setMenu(null)

  loadWindow(win, 'designers-table-window/index.html')
}

function createCartographersTableWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#503642',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
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

  loadWindow(win, 'cartographers-table-window/index.html')
}

function loadWindow(browserWindow, loadFile){
  //if(!settings.get('development.javascript')){
    //browserWindow.loadFile(loadFile);
  //}else{
    loadWindowWithDevTools(browserWindow, loadFile);
  //}
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
