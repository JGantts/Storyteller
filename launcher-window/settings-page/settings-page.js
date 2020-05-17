// devtools checkbox
$('.setting-checkbox').each(function() {
  this.checked = settings.get(this.getAttribute('data-backend-name'), this.getAttribute('data-default'))
  this.addEventListener('change', (event) => {
    settings.set(event.target.getAttribute('data-backend-name'), event.target.checked);
    setStatehint(event.target);
  });
  setStatehint(this);
 });

// gamepath display
executablePath =  findDSPath();
displayPathInfo();

function setStatehint(checkbox){
  let stateHintDivSelector = '#' + checkbox.id + '-statehint';
  $(stateHintDivSelector).text('(' + (
    checkbox.checked
    ? $(stateHintDivSelector).attr('data-checked-statehint')
    : $(stateHintDivSelector).attr('data-unchecked-statehint')
  ) + ')');
}

function findDSPath() {
  // checking settings first
  if (settings.get('gamePath')) {
    return settings.get('gamePath');
  }
  // then try to guess based on common paths
  // (should maybe externalized these at some point?)
  const possiblePaths = [
  'C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station',
  'C:/Program Files (x86)/Docking Station',
  'C:/Program Files/Docking Station',
  `C:${(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).split('\\').join('/')}/Documents/Creatures/Docking Station`
  ]
  for (const path of possiblePaths) {
    if (fs.existsSync(`${path}/engine.exe`)) {
      settings.set('gamePath', path);
      return path;
    }
  }
  return false;
}

function displayPathInfo() {
  if (executablePath) {
    $('#info').text(`Current Path: ${executablePath}`);
  } else {
    $('#info').text('Your Docking Station path could not be automatically detected. Please set one manually.');

  }
}

function validateDSPath(path) {
  if(path) {
    const pathString = path.toString();
    if (fs.existsSync(`${pathString}/engine.exe`)) {
      executablePath = pathString;
      settings.set('gamePath', pathString);
      displayPathInfo();
    } else {
      $('#info').text(`Sorry, ${pathString} isn't a valid path. (Valid paths contain an engine.exe file)`);
    }
  }
}

function selectDSPath() {
  validateDSPath(dialog.showOpenDialogSync({ properties: ['openDirectory', 'multiSelections'] }));
}
