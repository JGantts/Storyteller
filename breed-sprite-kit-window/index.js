const TabGroup = require("electron-tabs");

let tabGroup = new TabGroup();
tabGroup.addTab({
  title: '',
  iconURL: 'icons/blender-script.svg',
  src: 'blender-script-tab/index.html',
  visible: true,
  closable: false,
  active: true,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/png-crop.svg',
  src: 'png-crop-tab/index.html',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/png-to-c16.svg',
  src: 'png-to-c16-tab/index.html',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/reslotter.svg',
  src: 'reslotter-tab/index.html',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/att-editor.svg',
  src: 'att-editor-tab/index.html',
  visible: true,
  closable: false,
});
tabGroup.addTab({
  title: '',
  iconURL: 'icons/apperance-genetics-editor.svg',
  src: 'apperance-genetics-editor-tab/index.html',
  visible: true,
  closable: false,
});
