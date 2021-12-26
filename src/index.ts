export {};

import electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, dialog } = electron;

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const pathModule = require('path');
//var iconv = require('iconv-lite');

//let settings;

type FileRef = {
    id: string;
    path: string;
    type: string;
}

let files: {
  [key: string]:
  {
    [key: string]:
    {
      [key: string]:
        FileRef
    }
  };
} = {};



ipcMain.on('minimize', (event, arg) => {
    ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow).minimize();
});

ipcMain.on('close', (event, arg) => {
    ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow).close();
});

function getWindowsFiles(browserWindow: Electron.BrowserWindow) {
    let windowType: string = getWindowType(browserWindow);
    if (!files[windowType]) {
        files[windowType] = { };
    }
    if (!files[windowType][browserWindow.id]) {
        files[windowType][browserWindow.id] = { };
    }
    return files[windowType][browserWindow.id];
}

ipcMain.on('filemanager-execute-promise', async (
  event: Electron.IpcMainEvent,
  arg: {
    type: string,
    id: string,
    args: any
  }
) => {
    switch (arg.type) {
      case "new-file":
        fileManager_newFile(event, arg.id, arg.args);
        break;
      case "open-files":
        fileManager_openFiles(event, arg.id, arg.args);
        break;
      case "get-new-save-file":
        fileManager_getNewSaveFile(event, arg.id, arg.args);
        break;
      case "save-file-reminder":
        fileManager_saveFileReminder(event, arg.id, arg.args);
        break;
      case "save-file":
        fileManager_saveFile(event, arg.id, arg.args);
        break;
      case "close-file":
        fileManager_closeFile(event, arg.id, arg.args);
        break;
      case "select-files":
        fileManager_selectFile(event, arg.id, arg.args);
        break;
      case "get-resource-path":
        fileManager_getResourcePath(event, arg.id, arg.args);
        break;
      default:
        throw new Error(`Internal Error. Reference data: ${JSON.stringify(arg)}`);
        break;
  }
});

function fileManager_newFile(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);
    let newFileId = crypto.randomUUID();
    let newFilePath = "";
    let fileContents = "";
    windowsFiles[newFileId] = {
        id: newFileId,
        path: newFilePath,
        type: newFilePath ? pathModule.extname(newFilePath) : ".cart"
    };
    let newFile =
    {
        fileRef: windowsFiles[newFileId],
        contents: ""
    };
    event.reply(
        'executed-promise',
        {
            id: id,
            success: true,
            args: {
                file: newFile
            }
        }
    );
}

async function fileManager_selectFile(event: Electron.IpcMainEvent, id: string, args: any) {
  let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
  try {
      let result = await dialog.showOpenDialog(
          browserWindow,
          args.options
      );
      if (result.canceled) {
        event.reply(
            'executed-promise',
            {
                id: id,
                success: true,
                args: {
                    continue: false
                }
            }
        );
      } else {
          event.reply(
              'executed-promise',
              {
                  id: id,
                  success: true,
                  args: {
                      continue: true,
                      files: result.filePaths
                  }
              }
          );
      }
  } catch(err) {
      console.log(err);
      event.reply(
          'executed-promise',
          {
              id: id,
              success: false,
              args: {
                  error: err
              }
          }
      );
  }
}

async function fileManager_openFiles(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);
    try {
        let result = await dialog.showOpenDialog(
            browserWindow,
            args.options
        );
        if (result.canceled) {
          event.reply(
              'executed-promise',
              {
                  id: id,
                  success: true,
                  args: {
                      continue: false
                  }
              }
          );
        } else {
            let openedFiles = [];
            for (let path of result.filePaths) {
                let fileId = crypto.randomUUID();
                let fileRef =
                {
                    id: fileId,
                    path: path,
                    type: pathModule.extname(path)
                };
                let fileContents
                try {
                    fileContents = fs.readFileSync(path, args.encoding);
                } catch (err) {
                    console.log(err);
                    event.reply(
                        'executed-promise',
                        {
                            id: id,
                            success: false,
                            args: {
                                error: err
                            }
                        }
                    );
                }
                windowsFiles[fileId] = fileRef;
                let openedFile = {
                    fileRef: windowsFiles[fileId],
                    contents: fileContents
                }
                openedFiles.push(openedFile);
            }
            event.reply(
                'executed-promise',
                {
                    id: id,
                    success: true,
                    args: {
                        continue: true,
                        files: openedFiles
                    }
                }
            );
        }
    } catch(err) {
        console.log(err);
        event.reply(
            'executed-promise',
            {
                id: id,
                success: false,
                args: {
                    error: err
                }
            }
        );
    }
}

async function fileManager_getNewSaveFile(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);

    let result = await dialog.showSaveDialog(browserWindow, args.options);

    if (result.canceled) {
        event.reply(
            'executed-promise',
            {
                id: id,
                success: true,
                args: {
                    continue: false
                }
            }
        );
        return;
    }

    windowsFiles[args.fileRef.id].path = result.filePath ?? "";
    windowsFiles[args.fileRef.id].type = pathModule.extname(result.filePath);

    event.reply(
        'executed-promise',
        {
            id: id,
            success: true,
            args: {
                continue: true,
                fileRef: windowsFiles[args.fileRef.id]
            }
        }
    );
    return;
}

async function fileManager_saveFileReminder(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);

    let result = await dialog.showMessageBox(
        browserWindow,
        args.options
    );
    switch (result.response) {
      case 0:
        event.reply(
            'executed-promise',
            {
                id: id,
                success: true,
                args: {
                    continue: true,
                    toss: false
                }
            }
        );
        break;
      case 1:
        event.reply(
            'executed-promise',
            {
                id: id,
                success: true,
                args: {
                    continue: true,
                    toss: true
                }
            }
        );
        break;
      case 2:
        event.reply(
            'executed-promise',
            {
                id: id,
                success: true,
                args: {
                    continue: false,
                    toss: false
                }
            }
        );
        break;
    }
}

async function fileManager_saveFile(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);


    let fileRef = windowsFiles[args.fileRef.id];
    if (!fileRef.path){
        event.reply(
            'executed-promise',
            {
                id: id,
                success: false,
                args: {
                    error: new Error("No file path found.")
                }
            }
        );
        return;
    }
    try {
      fs.writeFileSync(fileRef.path, args.content.replace(/\n/g, "\r\n"), args.encoding);
      event.reply(
          'executed-promise',
          {
              id: id,
              success: true,
              args: {
                  continue: true
              }
          }
      );
      return;
    } catch (err) {
      event.reply(
          'executed-promise',
          {
              id: id,
              success: false,
              args: {
                  error: err
              }
          }
      );
      return;
    }
}

async function fileManager_closeFile(event: Electron.IpcMainEvent, id: string, args: any) {
    let browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    let windowsFiles = getWindowsFiles(browserWindow);
    delete windowsFiles[args.fileRef.id]
    event.reply(
        'executed-promise',
        {
            id: id,
            success: true,
            args: {
                continue: true
            }
        }
    );
    return;
}

async function fileManager_getResourcePath(event: Electron.IpcMainEvent, id: string, args: any) {
    event.reply(
        'executed-promise',
        {
            id: id,
            success: true,
            args: {
                continue: true,
                path: pathModule.join(app.getAppPath(), "resources", args.resource)
            }
        }
    );
    return;
}

function getWindowType(browserWindow: Electron.BrowserWindow) {
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

function loadSettings(then: any){
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

  loadWindow(win, './app/storyteller-window/index.html')
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

  loadWindow(win, './app/sorcerers-table-window/index.html')
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

  loadWindow(win, './app/designers-table-window/index.html')
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

  const template: any =
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

  loadWindow(win, './app/cartographers-table-window/index.html')
}

function loadWindow(browserWindow: Electron.BrowserWindow, loadFile: any){
  //if(!settings.get('development.javascript')){
    //browserWindow.loadFile(loadFile);
  //}else{
    loadWindowWithDevTools(browserWindow, loadFile);
  //}
}

function loadWindowWithDevTools(browserWindow: Electron.BrowserWindow, loadFile: any){
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
