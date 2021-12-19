const assert = require('assert');
const { ipcRenderer } = require('electron');
const crypto = require('crypto');

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

      console.log("here");
      console.log(new Error().stack);

      let dict = this._promiseDictionary;

      ipcRenderer.on('executed-promise', (event, args) => {
          console.log(args);
          console.log(dict);
          let promise = dict[args.id]
          if (args.success) {
              promise.resolve(args.args);
          } else {
              if (promise.reject) {
                  promise.reject(args.args);
              } else {
                  console.log(args.args);
              }
          }
          delete dict[args.id];
      });
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
      this._openFile(options, "Latin1");
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
      this._openFile(options, "utf-8");
  }

  async saveCaosFile() {
      await this._saveFile(caosSaveOptions, "Latin1");
  }

  async saveCaosFileAs() {
      await this._saveFileAs(caosSaveOptions, "Latin1");
  }

  async saveCartFile() {
      await this._saveFile(cartSaveOptions, "utf-8");
  }

  async saveCartFileAs() {
      await this._saveFileAs(cartSaveOptions, "utf-8");
  }

  async exportToCaos() {
      await this._saveFileAs({
          title: "Export CAOS file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Export",
          filters :[
              {name: 'CAOS', extensions: ['cos']}
          ]
      });
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
      console.log("here");
      console.log(new Error().stack);
      return await this.getResourcePathPromise(resource);
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
      this._currentFileRef = newFile.fileRef;
      this._currentFileNeedsSaving = false;
      this._displayFiles([newFile]);
  }

  async _saveFile(options, encoding) {
      if (!this._currentFileRef.path) {
          let newPath = (await this.getNewSaveFilePromise(options)).fileRef.path;
          this._currentFileRef.path = newPath;
      }
      if (!(await this.saveFilePromise(
          this._currentFileRef,
          this._getText("json"),
          encoding
        )).continue) {
          return {continue: false};
      }
      this._currentFileNeedsSaving = false;
      this._updateTitle();
      return {continue: true};
  }

  async _saveFileAs(options, encoding) {
      let fileRef = (await this.getNewSaveFilePromise(options)).fileRef;
      if (!(await this.saveFilePromise(
        fileRef,
        this._getText("caos"),
        encoding
      )).continue) {
          return {continue: false};
      }
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
    console.log(promiseId);
    let dict = this._promiseDictionary;
    return new Promise(function(resolve, reject) {
        dict[promiseId] = {
            type: promiseType,
            id: promiseId,
            resolve: resolve,
            reject: reject
        };
        console.log("here");
        console.log(promiseId);
        console.log(dict);
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
