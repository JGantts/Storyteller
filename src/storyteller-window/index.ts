import { SettingsHelper } from "../render-helpers/settings-helper";

const { WindowControls } = require('./window-controls.js');
const { MenuBar } = require('./menu-bar.js');

export function initPage () {
  globalThis.settings = new SettingsHelper();

  MenuBar.initializeMenuBar();

  let settingsTab = document.getElementById("nav-btn-settings") as EventTarget&Element;
  settingsTab.addEventListener("click", (e: Event) => MenuBar.loadSettingsPage(settingsTab.id));
  let localTab = document.getElementById("nav-btn-local") as EventTarget&Element;
  localTab?.addEventListener("click", (e: Event) => MenuBar.loadLocalPage(localTab?.id));
  let serverTab = document.getElementById("nav-btn-server") as EventTarget&Element;
  serverTab?.addEventListener("click", (e: Event) => MenuBar.loadServerPage(serverTab?.id));
  let eemfooTab = document.getElementById("nav-btn-eemfoo") as EventTarget&Element;
  eemfooTab?.addEventListener("click", (e: Event) => MenuBar.loadEemFooPage(eemfooTab?.id));
  let devTab = document.getElementById("nav-btn-dev") as EventTarget&Element;
  devTab?.addEventListener("click", (e: Event) => MenuBar.loadDevToolsPage(devTab?.id));

  WindowControls.initializWindowControls();
}

window.onload = function(){
   initPage();
};
