const assert = require('assert');
const { ipcRenderer } = require('electron')

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
      this._openFile(options);
  }

  async openCartFile() {
      let options = {
          title: "Open Cartographer file",
          defaultPath : '%HOMEPATH%/Documents/',
          buttonLabel : "Save",
          filters :[
              {name: 'Cartographer', extensions: ['cart']}
          ]
      };
      this._openFile(options);
  }

  async saveCaosFile() {
      this._saveFile(caosSaveOptions);
  }

  async saveCaosFileAs() {
      this._saveFileAs(caosSaveOptions);
  }

  async saveCartFile() {
      this._saveFile(cartSaveOptions);
  }

  async saveCartFileAs() {
      await this._saveFileAs(cartSaveOptions);
  }

  async _openFile(options) {
      if (!(await this.saveFileIfNeeded()).continue) {
          return;
      }
      if (!(await this.closeFileIfNeeded()).continue) {
          return;
      }
      let newOpenFile = await this.openFilePromise(options);
      if (!newOpenFile.continue) {
          return;
      }
      let newFile = newOpenFile.files[0];
      this._currentFileRef = newFile.fileRef;
      this._currentFileNeedsSaving = false;
      this._displayFiles([newFile]);
  }

  async _saveFile(options) {
      if (!this._currentFileRef.path) {
          let newPath = (await this.getNewSaveFilePromise(options)).fileRef.path;
          this._currentFileRef.path = newPath;
      }
      if (!(await this.saveFilePromise()).continue) {
          return {continue: false};
      }
      this._currentFileNeedsSaving = false;
      this._updateTitle();
      return {continue: true};
  }

  async _saveFileAs(options) {
      let newPath = (await this.getNewSaveFilePromise(options)).fileRef.path;
      this._currentFileRef.path = newPath;
      console.log(newPath);
      if (!(await this.saveFilePromise()).continue) {
          return {continue: false};
      }
      this._currentFileNeedsSaving = false;
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

  async openFilePromise(options) {
      return this.makeFileManagerPromise("open-files", {
          options: options
      });
  }

  async getNewSaveFilePromise(options) {
      return this.makeFileManagerPromise("get-new-save-file", {
          options: options,
          fileRef: this._currentFileRef,
      });
  }

  async saveFilePromise() {
      return this.makeFileManagerPromise("save-file", {
          fileRef: this._currentFileRef,
          content: this._getText()
      });
  }

  async saveFileReminderPromise() {
      let options  = {
        buttons: ['Save', 'Toss', 'Cancel'],
        message: 'Do you want to save your work?'
      };
      return this.makeFileManagerPromise("save-file-reminder", {
          options: options,
          fileRef: this._currentFileRef,
      });
  }

  async closeFilePromise() {
      return this.makeFileManagerPromise("close-file", {
          fileRef: this._currentFileRef
      });
  }

  async makeFileManagerPromise(promiseType, args) {
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
