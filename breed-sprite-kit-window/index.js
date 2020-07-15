const TabGroup = require("electron-tabs");

let tabGroup = new TabGroup();
tabGroup.addTab({
  title: '',
  iconURL: 'icons/blender-script.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
  active: true,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/png-crop.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/png-to-c16.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/reslotter.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/att-editor.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/apperance-genetics-editor.svg',
  src: 'http://electron.atom.io',
  visible: true,
  closable: false,
});
