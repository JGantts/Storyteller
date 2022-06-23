import { ipcRenderer } from "electron";
import { SettingsHelper } from "../render-helpers/settings-helper";

const os = require("os");

class WindowControls {

  static initializWindowControls() {
    // When document has loaded, initialise
    document.onreadystatechange = (event) => {
        if (document.readyState == "complete") {
            WindowControls.handleWindowControls();
        }
    };
  }

  static handleWindowControls() {
        let templateContainer: HTMLElement|null;
        let cssFile = "";
        switch (os.type()) {
            case "Darwin":
                templateContainer = $("#mac-window-controls")[0];
                cssFile = './mac-stoplights.css';
                break;

            case "Windows_NT":
                templateContainer = $("#win-window-controls")[0];
                cssFile = './win-close-minimize.css';
                break;

            case "Linux":
            default:
                templateContainer = $("#win-window-controls")[0];
                cssFile = './win-close-minimize.css';
                break;
        }

        let template = templateContainer as Element;
        if (!(template instanceof Element)) { return; }

        let link = document.createElement("link");
        link.href = cssFile;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        let head = $("head");
        if (head !instanceof HTMLHeadElement) {return;}
        head[0].appendChild(link);

        let templateClone = document.createElement("div") as Element;
        if (!(templateClone instanceof Element)) { return; }
        templateClone.innerHTML = template.innerHTML;
        $("#window-controls")[0].appendChild(templateClone);

      document.getElementById('min-button')!.addEventListener("click", event => {
          ipcRenderer.send('minimize');
      });

      document.getElementById('close-button')!.addEventListener("click", event => {
          ipcRenderer.send('close');
      });
  }
}

module.exports = {
  WindowControls
};
