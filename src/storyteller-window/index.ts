import { SettingsHelper } from "../render-helpers/settings-helper";

const { WindowControls } = require('./window-controls.js');
const { MenuBar } = require('./menu-bar.js');

export function initPage () {
  globalThis.settings = new SettingsHelper();

  WindowControls.initializWindowControls();
  MenuBar.initializeMenuBar();

  let settingsTab = document.getElementById("nav-btn-settings") as EventTarget&Element;
  settingsTab.addEventListener("click", (e: Event) => MenuBar.loadSettingsPage(settingsTab.id));
  let localTab = document.getElementById("nav-btn-local") as  EventTarget&Element;
  //if (!(localTab instanceof EventTarget&Element)) { throw new Error(`ID: 5682068764 Reference Data: ${JSON.stringify(localTab)}`); }
  localTab?.addEventListener("click", (e: Event) => MenuBar.loadLocalPage(localTab?.id));
  let serverTab = document.getElementById("nav-btn-server") as  EventTarget&Element;
  //if (!(serverTab instanceof EventTarget&Element)) { throw new Error(`ID: 7441965918 Reference Data: ${JSON.stringify(serverTab)}`); }
  serverTab?.addEventListener("click", (e: Event) => MenuBar.loadServerPage(serverTab?.id));
  let eemfooTab = document.getElementById("nav-btn-eemfoo") as  EventTarget&Element;
  //if (!(eemfooTab instanceof EventTarget&Element)) { throw new Error(`ID: 5475770654 Reference Data: ${JSON.stringify(eemfooTab)}`); }
  eemfooTab?.addEventListener("click", (e: Event) => MenuBar.loadEemFooPage(eemfooTab?.id));
  let devTab = document.getElementById("nav-btn-dev") as  EventTarget&Element;
  //if (!(devTab instanceof EventTarget&Element)) { throw new Error(`ID: 4389403662 Reference Data: ${JSON.stringify(devTab)}`); }
  devTab?.addEventListener("click", (e: Event) => MenuBar.loadDevToolsPage(devTab?.id));
}

window.onload = function(){
   initPage();
};
