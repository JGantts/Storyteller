export {};

import electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, dialog, globalShortcut } = electron;

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

// Window/Quit handling support variables
let mainWindow: Nullable<Electron.BrowserWindow> = null;
const browserWindows: Electron.BrowserWindow[] = [];
const windowData: {[id:number]: BrowserData} = {};
let quitIfAllWindowsClose: boolean = true;

ipcMain.on('minimize', (event, arg) => {
    ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow).minimize();
});

ipcMain.on('close', (event, arg) => {
    const browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    if (browserWindow == mainWindow) {
        closeWindow(browserWindow);
    }
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
      console.error(err);
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
                    console.error(err);
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
        console.error(err);
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
  initQuitListeners();
}

function loadSettings(then: any){
  let settingLoaderWin = new BrowserWindow({show: false})
  then();
  settingLoaderWin.once('ready-to-show', () => {
    settingLoaderWin.show();
  })
}

function createStorytellerWindow () {
    if (mainWindow != null) {
        return;
    }
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
    win.on('closed', function () {
        // Dereference the main window object
        if (mainWindow == win) {
            mainWindow = null;
        }
    });
    
    loadWindow(win, './dist/storyteller-window/index.html');
    mainWindow = win;
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

  loadWindow(win, './dist/sorcerers-table-window/index.html')
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

  loadWindow(win, './dist/designers-table-window/index.html')
}

function createCartographersTableWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#503642',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true
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

  loadWindow(win, './dist/cartographers-table-window/index.html', true);
}

function isDev() {
    return !process.defaultApp;
}

ipcMain.on('should-close', (event) => {
    const browserWindow = ((event.sender as any).getOwnerBrowserWindow() as Electron.BrowserWindow);
    closeWindow(browserWindow);
});


/**
 * Removes a window from the global window array
 * Windows are tracked allow mass closing of them.
 * @param theWindow
 */
function removeWindowFromWindowArray(theWindow: Electron.BrowserWindow): boolean {
    const index = browserWindows.indexOf(theWindow);
    if (index < 0) {
        // Hopefully should not happen
        return false;
    }
    browserWindows.splice(index, 1);
    
    return true;
}

/**
 * Actually close the window, removing any in program references
 * @param browserWindow
 */
function closeWindow(browserWindow: Electron.BrowserWindow) {
    removeWindowFromWindowArray(browserWindow);
    const id = browserWindow.id;
    
    // Clear the browser window data object
    if (browserWindows.hasOwnProperty(id)) {
        delete browserWindows[id]
    }
    // Call destroy and not close, as close would cause recursion
    browserWindow.destroy();
    quitIfShould();
}

/**
 * Try to close a browser window whilst giving the user a chance to save un-saved work
 * @param e
 */
function requestWindowClose(this: Electron.BrowserWindow, e: Nullable<Electron.Event>): boolean {
    const browserWindow = this as Electron.BrowserWindow;
    const data = windowData.hasOwnProperty(browserWindow.id) ? windowData[browserWindow.id] : null;
    
    // Get whether the window should request a close, or simply close
    const requestToClose: boolean = data?.requestToClose ?? false;
    
    // Handle event, including preventing close if needed
    if (e != null) {
        e.returnValue = !requestToClose;
        if (requestToClose) {
            e.preventDefault();
        }
    }
    
    // Request that a window save its work before closing
    if (requestToClose) {
        browserWindow.webContents.send('request-close');
        return false;
    }
    closeWindow(browserWindow);
    return true;
}

/**
 * Initialize browser window and event listeners/handlers
 * @param browserWindow
 * @param loadFile
 * @param requestToClose
 */
function loadWindow(browserWindow: Electron.BrowserWindow, loadFile: any, requestToClose: boolean = false) {
    // Create window data for use by the other methods including #requestWindowClose
    windowData[browserWindow.id] = {
        requestToClose: requestToClose
    }
    // Stash browser instance
    browserWindows.push(browserWindow);
    
    // Add close listener to request close to handle saving if needed
    browserWindow.on('close', requestWindowClose.bind(browserWindow));
    
    // Load dev tools if in dev environment
    if (isDev()) {
        browserWindow.loadFile(loadFile);
    } else {
        loadWindowWithDevTools(browserWindow, loadFile);
    }
}

function loadWindowWithDevTools(browserWindow: Electron.BrowserWindow, loadFile: any) {
    let devtools = new BrowserWindow({
        width: 800,
        height: 600,
    });
    devtools.setBounds({x: 0, y: 0,})
    
    browserWindow.on('close', () => {
        if (!devtools.isDestroyed()) {
            devtools.close()
        }
    })
    
    browserWindow.loadFile(loadFile);
    
    browserWindow.webContents.setDevToolsWebContents(devtools.webContents)
    browserWindow.webContents.openDevTools();
}

/**
 * Tries to quit the app if all windows are closed properly.
 * If on macOS, it will not actually quit the app unless CMD+Q is used.
 * @param noCheck
 */
function quitIfShould(noCheck: boolean = false) {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    const canQuit = quitIfAllWindowsClose || process.platform !== 'darwin';
    const noHandles = (noCheck || browserWindows.length === 0);
    if (canQuit && noHandles) {
        console.log("Quiting...")
        app.quit();
        return;
    }
}

/**
 * Try to close all windows gracefully before quiting app.
 */
function requestQuit() {
    quitIfAllWindowsClose = true;
    const main = mainWindow;
    if (main != null) {
        mainWindow = null;
        requestWindowClose.call(main, null);
    }
    for(const browserWindow of browserWindows) {
        requestWindowClose.call(browserWindow, null);
    }
    // Run quit if should, in case request to quit was called after all windows closed
    quitIfShould();
}

/**
 * Add listeners for possible ways to close the app.
 */
function initQuitListeners() {
    
    // Add quit shortcut if on Mac
    if (process.platform === 'darwin') {
        quitIfAllWindowsClose = false;
        globalShortcut.register('Command+Q', requestQuit);
    }
// Listen to quit events, and try quiting when received.
    app.on('window-all-closed', requestQuit);
    app.on('quit', requestQuit);
    
}

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createStorytellerWindow();
    }
});



app.whenReady()
    .then(launchApp)
