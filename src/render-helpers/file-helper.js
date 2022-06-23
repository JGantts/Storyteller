const assert = require('assert');
const { ipcRenderer } = require('electron');
const crypto = require('crypto');
const path = require("path");

const cartSaveOptions = {
    title: "Save Cartographer file",
    defaultPath : '%HOMEPATH%/Documents/',
    buttonLabel : "Save",
    filters :[
        {name: 'Cartographer', extensions: ['cart']}
    ]
};

const caosSaveOptions = {
    title: "Save CAOS file",
    defaultPath : '%HOMEPATH%/Documents/',
    buttonLabel : "Save",
    filters :[
        {name: 'CAOS', extensions: ['cos']}
    ]
};

class FileHelper {
  constructor(updateTitle, displayFiles, getText) {
      this._currentFileRef = null;
      this._currentFileNeedsSaving = false;
      this._promiseDictionary = new Object();
      this._updateTitle = updateTitle;
      this._displayFiles = displayFiles;
      this._getText = getText;

      let dict = this._promiseDictionary;

      ipcRenderer.on('executed-promise', (event, args) => {
          let promise = dict[args.id]
          if (promise) {
              if (args.success) {
                  promise.resolve(args.args);
              } else {
                  if (promise.reject) {
                      promise.reject(args.args);
                  } else {
                      console.log("You're killin me Smalls!");
                      console.log(args);
                  }
              }
              delete dict[args.id];
          } else {
             console.log("You're killin me Smalls!");
             console.log(args);
          }
      });
  }

  hasFile() {
      return this.getCurrentFileRef() != null;
  }

  getCurrentFileName() {
      if (this._currentFileRef) {
          return this.tileNameFromFileRef(this._currentFileRef);
      }
      return "";
  }

  getCurrentFileRef() {
      return this._currentFileRef;
  }

  getCurrentFileNeedsSaving() {
      return this._currentFileNeedsSaving;
  }

  fileModified() {
      this._currentFileNeedsSaving = true;
      this._updateTitle();
  }

  async newFile() {
      if (!(await this.saveFileIfNeeded()).continue) {
          return;
      }
      if (!(await this.closeFileIfNeeded()).continue) {
          return;
      }
      let newFile = (await this.newFilePromise()).file;
      this._currentFileRef = newFile.fileRef
      this._currentFileNeedsSaving = false;
      this._displayFiles([newFile]);
  }

  async openCaosFile() {
      let options = {
          title: "Open CAOS file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Open",
          filters :[
              {name: 'CAOS', extensions: ['cos']}
          ]
      };
      let newFile = await this._openFile(options, "Latin1");
      if (newFile) {
          this._currentFileRef = newFile.fileRef;
          this._currentFileNeedsSaving = false;
          this._displayFiles([newFile]);
      }
  }

  async openCartFile() {
      let options = {
          title: "Open Cartographer file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Open",
          filters :[
              {name: 'Cartographer', extensions: ['cart']}
          ]
      };
      let newFile = await this._openFile(options, "utf-8");
      if (newFile) {
          this._currentFileRef = newFile.fileRef;
          this._currentFileNeedsSaving = false;
          this._displayFiles([newFile]);
      }
  }

  async importCaosFile() {
      let options = {
          title: "Import CAOS file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Import",
          filters :[
              {name: 'CAOS', extensions: ['cos']}
          ]
      };
      let newFile = await this._openFile(options, "Latin1");
      if (newFile) {
          newFile.fileRef.path = "";
          newFile.fileRef.fileExistsOnDisk = false;
          this._currentFileRef = newFile.fileRef;
          this._currentFileNeedsSaving = true;
          this._displayFiles([newFile]);
      }
  }

  async saveCaosFile() {
      return await this._saveFile(caosSaveOptions, "caos", "Latin1");
  }

  async saveCaosFileAs() {
      return await this._saveFileAs(caosSaveOptions, "caos", "Latin1");
  }

  async saveCartFile() {
      return await this._saveFile(cartSaveOptions, "json", "utf-8");
  }

  async saveCartFileAs() {
      return await this._saveFileAs(cartSaveOptions, "json", "utf-8");
  }

  async saveCartFileCopy() {
      return await this._saveFileCopy(cartSaveOptions, "json", "utf-8");
  }

  async exportToCaos() {
      await this._saveFileAs({
          title: "Export CAOS file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Export",
          filters :[
              {name: 'CAOS', extensions: ['cos']}
          ]
      },
      "caos",
      "Latin1"
    );
  }

  async selectBackgroundFile() {
      let options = {
          title: "Select background file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Select",
          filters :[
              {name: 'Background', extensions: ['png', 'bmp', 'jpg', 'blk']}
          ]
      };
      return await this._selectFile(options);
  }

  async getResourcePath(resource) {
      return await this.getResourcePathPromise(resource);
  }

  tileNameFromFileRef(fileRef) {
      // assert(
      //   typeof path === 'string'
      //   || typeof path === 'object',
      //   `Expected string or NULL, instead found \{${JSON.stringify(path)}\}.`)
      if (!fileRef.dir || ! fileRef.name) {
          return "Unsaved";
      }

      let lastIndexOfSlash = fileRef.dir.lastIndexOf(path.sep);
      let secondToLastIndex = fileRef.dir.lastIndexOf(path.sep, lastIndexOfSlash - 1);
      let titleName = "..." + fileRef.dir.slice(secondToLastIndex);
      titleName += path.sep;
      titleName += fileRef.name;
      titleName += fileRef.type;
      return titleName;
  }

  async _selectFile(options) {
      let newSelectedFile = await this.selectFilePromise(options);
      if (!newSelectedFile.continue) {
          return ;
      }
      let newFile = newSelectedFile.files[0];
      return newFile;
  }

  async _openFile(options, encoding) {
      if (!(await this.saveFileIfNeeded()).continue) {
          return;
      }
      if (!(await this.closeFileIfNeeded()).continue) {
          return;
      }
      let newOpenFile = await this.openFilePromise(options, encoding);
      if (!newOpenFile.continue) {
          return;
      }
      let newFile = newOpenFile.files[0];
      return newFile;
  }

  async _saveFile(options, format, encoding) {
      if (!this._currentFileRef.fileExistsOnDisk) {
          options.defaultPath = path.join(this._currentFileRef.dir, this._currentFileRef.name);
          let newSaveeFile = (await this.getNewSaveFilePromise(options));
          if (!newSaveeFile.continue) {
              return {continue: false};
          }
          let newPath = newSaveeFile.fileRef;
          this._currentFileRef.dir = newSaveeFile.fileRef.dir;
          this._currentFileRef.name = newSaveeFile.fileRef.name;
          this._currentFileRef.type = newSaveeFile.fileRef.type;
      }
      return this._reallySaveFile(this._currentFileRef, format, encoding);
  }

  async _saveFileAs(options, format, encoding) {
      options.defaultPath = path.join(this._currentFileRef.dir, this._currentFileRef.name) + "_copy" + this._currentFileRef.type;
      let newSaveFile = await this.getNewSaveFilePromise(options);
      if (newSaveFile.continue) {
          let reallySaveFile = this._reallySaveFile(newSaveFile.fileRef, format, encoding);
          if (reallySaveFile.continue) {
              this._currentFileRef = newSaveFile.fileRef;
          }
          return reallySaveFile;
      }
      return newSaveFile;
  }

  async _saveFileCopy(options, format, encoding) {
      options.defaultPath = path.join(this._currentFileRef.dir, this._currentFileRef.name) + "_copy" + this._currentFileRef.type;
      let newSaveFile = await this.getNewSaveFilePromise(options);
      if (newSaveFile.continue) {
          return this._reallySaveFile(newSaveFile.fileRef, format, encoding);
      }
      return newSaveFile;
  }

  async _reallySaveFile(fileRef, format, encoding) {
      if (!(await this.saveFilePromise(
        fileRef,
        this._getText(format),
        encoding
      )).continue) {
          return {continue: false};
      }
      this._currentFileNeedsSaving = false;
      this._currentFileRef.fileExistsOnDisk = true;
      this._updateTitle();
      return {continue: true};
  }

  async closeFile() {
      return await this.closeFilePromise();
  }

  async saveFileIfNeeded() {
      if (this._currentFileNeedsSaving) {
          let result = await this.saveFileReminderPromise();
          if (!result.continue) {
              return {continue: false};
          }
          if (!result.toss) {
              return (await this.saveFile());
          }
      }
      return {continue: true};
  }

  async closeFileIfNeeded() {
      if (this._currentFileRef) {
          return await this.closeFile();
      }
      return {continue: true};
  }

  async newFilePromise() {
      return this.makeFileManagerPromise("new-file", new Object());
  }

  async openFilePromise(options, encoding) {
      return this.makeFileManagerPromise("open-files", {
          options: options,
          encoding
      });
  }

  async selectFilePromise(options) {
      return this.makeFileManagerPromise("select-files", {
          options: options
      });
  }

  async getNewSaveFilePromise(options) {
      return this.makeFileManagerPromise("get-new-save-file", {
          options: options,
          fileRef: this._currentFileRef
      });
  }

  async saveFilePromise(fileRef, fileContents, encoding) {
      return this.makeFileManagerPromise("save-file", {
          fileRef,
          content: fileContents,
          encoding
      });
  }

  async saveFileReminderPromise() {
      let options  = {
        buttons: ['Save', 'Toss', 'Cancel'],
        message: 'Do you want to save your work?'
      };
      return this.makeFileManagerPromise("save-file-reminder", {
          options: options,
          fileRef: this._currentFileRef
      });
  }

  async closeFilePromise() {
      return this.makeFileManagerPromise("close-file", {
          fileRef: this._currentFileRef
      });
  }

  async getResourcePathPromise(resource) {
      return this.makeFileManagerPromise("get-resource-path", {
          resource
      });
  }

  makeFileManagerPromise(promiseType, args) {
    let promiseId = crypto.randomUUID();
    let dict = this._promiseDictionary;
    return new Promise(function(resolve, reject) {
        dict[promiseId] = {
            type: promiseType,
            id: promiseId,
            resolve: resolve,
            reject: reject
        };
        ipcRenderer.send(
            'filemanager-execute-promise',
            {
                type: promiseType,
                id: promiseId,
                args: args
            }
        );
    });
  }
}

module.exports = { FileHelper };
