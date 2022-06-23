declare let $: any

const os = require("os");

export class MenuBar {

  static initializeMenuBar() {
    let templateSettingsButton = document.getElementById("settings-button") as Element;
    if (!(templateSettingsButton instanceof Element)) { throw new Error(`ID: 4872948373 Reference Data: ${JSON.stringify(templateSettingsButton)}`); }
    let templateRestOfButtons = document.getElementById("rest-of-buttons") as Element;
    if (!(templateRestOfButtons instanceof Element)) { throw new Error(`ID: 5193649059 Reference Data: ${JSON.stringify(templateRestOfButtons)}`); }
    let cssFile = "";
    let menuBar = document.getElementById("menu-bar") as Element;
    if (!(menuBar instanceof Element)) { throw new Error(`ID: 4367600878 Reference Data: ${JSON.stringify(menuBar)}`); }
    let menuBarCss = (document.getElementById("menu-bar") as HTMLElement).style as CSSStyleDeclaration;
    if (!(menuBarCss instanceof CSSStyleDeclaration)) { throw new Error(`ID: 1273696525 Reference Data: ${JSON.stringify(menuBarCss)}`); }
    switch (os.type()) {
        case "Darwin":
            menuBar.innerHTML += templateRestOfButtons.innerHTML;
            menuBar.innerHTML += templateSettingsButton.innerHTML;
            menuBarCss.cssText = `right: 0;`;
            break;

        case "Windows_NT":
            menuBar.innerHTML += templateSettingsButton.innerHTML;
            menuBar.innerHTML += templateRestOfButtons.innerHTML;
            menuBarCss.cssText = `left: 0;`;
            break;

        case "Linux":
            menuBar.innerHTML += templateSettingsButton.innerHTML;
            menuBar.innerHTML += templateRestOfButtons.innerHTML;
            menuBarCss.cssText = `left: 0;`;
            break;
    }
    MenuBar.loadLocalPage('nav-btn-local');
  }

  static loadSettingsPage(clicked: any|null){
    $("#main").load("settings-page/settings-page.html");
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(' active', '');
    document.getElementById(clicked)!.className += ' active';
  }

  static loadLocalPage(clicked: any|null){
    $("#main").load("local-page/local-page.html");
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(' active', '');
    document.getElementById(clicked)!.className += ' active';
  }

  static loadServerPage(clicked: any|null){
    $("#main").load("server-page/server-page.html");
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(' active', '');
    document.getElementById(clicked)!.className += ' active';
  }

  static loadEemFooPage(clicked: any|null){
    $("#main").load("eem-foo-page/eem-foo-page.htm");
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(' active', '');
    document.getElementById(clicked)!.className += ' active';
  }

  static loadDevToolsPage(clicked: any|null){
    $("#main").load("dev-tools-page/dev-tools-page.html");
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(' active', '');
    document.getElementById(clicked)!.className += ' active';
  }
}
