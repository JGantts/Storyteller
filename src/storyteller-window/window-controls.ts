const { ipcRenderer } = require('electron');


// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

function handleWindowControls() {
      let template = null;
      let cssFile = "";
      switch (os.type()) {
          case "Darwin":
              template = $("#mac-window-controls");
              cssFile = './mac-stoplights.css';
              break;

          case "Windows_NT":
              template = $("#win-window-controls");
              cssFile = './win-close-minimize.css';
              break;

          case "Linux":
              template = $("#win-window-controls");
              cssFile = './win-close-minimize.css';
              break;
      }

      let link = document.createElement( "link" );
      link.href = cssFile;
      link.type = "text/css";
      link.rel = "stylesheet";
      link.media = "screen,print";
      document.getElementsByTagName( "head" )[0].appendChild( link );

      let templateClone = template[0].content.cloneNode(true);
      $("#window-controls")[0].appendChild(templateClone);

    document.getElementById('min-button')!.addEventListener("click", event => {
        ipcRenderer.send('minimize');
    });

    document.getElementById('close-button')!.addEventListener("click", event => {
        ipcRenderer.send('close');
    });
}
