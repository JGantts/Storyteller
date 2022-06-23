import { ipcRenderer } from "electron";

export class SettingsHelper {
  _promiseDictionary: any = new Object();

  constructor() {
      let dict = this._promiseDictionary;

      ipcRenderer.on('executed-promise-settingsmanager', (event, args) => {
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
              console.log("deleting: " + args.id);
              delete dict[args.id];
          } else {
             console.log("You're killin me Smalls!");
             console.log(args);
          }
      });
  }

  async setSetting(type: string, value: any) {
      let result = await this.makeSetSettingPromise(type, value);
      if (result.continue) {
        return result.value;
      }
      throw new Error(`Internal Error. Reference data: ${JSON.stringify(result)}`);
  }

  async getSetting(type: string, defaultValue: () => any) {
      let result = await this.makeGetSettingPromise(type);
      if (result.continue) {
        return result.value;
      } else {
        let value = defaultValue();
        await this.setSetting(type, value);
        return value;
      }
  }

  async makeSetSettingPromise(type: string, value: any): Promise<any> {
      return this.makeSettingsManagerPromise("set", { type: type, value: value });
  }

  async makeGetSettingPromise(type: string): Promise<any> {
      return this.makeSettingsManagerPromise("get", { type: type });
  }

  makeSettingsManagerPromise(promiseType: string, args: any): Promise<any> {
    let promiseId = crypto.randomUUID();
    let dict = this._promiseDictionary;
    return new Promise(function(resolve, reject) {
        dict[promiseId] = {
            type: promiseType,
            id: promiseId,
            resolve: resolve,
            reject: reject
        };
        console.log("sending: " + promiseId)
        ipcRenderer.send(
            'settingsmanager-promise',
            {
                type: promiseType,
                id: promiseId,
                args: args
            }
        );
    });
  }
}
