async function initialize() {
  // gamepath display
  var executablePath = await globalThis.settings.getSetting('dsPath', findDSPath);
  displayPathInfo(executablePath);
}


// devtools checkbox
$('.setting-checkbox').each(async function() {
  this.checked = await globalThis.settings.getSetting(this.getAttribute('data-backend-name'), () => { this.getAttribute('data-default') })
  this.addEventListener('change', async (event) => {
    await globalThis.settings.setSetting(event.target.getAttribute('data-backend-name'), event.target.checked);
    setStatehint(event.target);
  });
  setStatehint(this);
 });

function setStatehint(checkbox){
  let stateHintDivSelector = '#' + checkbox.id + '-statehint';
  $(stateHintDivSelector).text('(' + (
    checkbox.checked
    ? $(stateHintDivSelector).attr('data-checked-statehint')
    : $(stateHintDivSelector).attr('data-unchecked-statehint')
  ) + ')');
}

/**
 * @return {string|boolean} Game path if it finds it, false if it doesn't.
 */
function findDSPath() {
  return "Hey";


  // // checking settings first
  // if (settings.get('gamePath')) {
  //   return settings.get('gamePath');
  // }
  // // then try to guess based on common paths
  // // (should maybe externalized these at some point?)
  // const possiblePaths = [
  // 'C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station',
  // 'C:/Program Files (x86)/Docking Station',
  // 'C:/Program Files/Docking Station',
  // `C:${(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).split('\\').join('/')}/Documents/Creatures/Docking Station`
  // ]
  // for (const path of possiblePaths) {
  //   if (fs.existsSync(`${path}/engine.exe`)) {
  //     settings.set('gamePath', path);
  //     return path;
  //   }
  // }
  // return false;
}

/**
 * Updates the #info component with text regarding the status of the path
 * @param  {String} The pathname. If there is none, the element will display as such.
 * @param  {Boolean} If the path given is invalid (used if the user selected the path but if did not validate)
 */
function displayPathInfo(path, invalid) {
  if (path && !invalid) {
    $('#info').text(`Current Game Path: ${path}`);
    $('#find-path-button').hide();
    $('#launch-button').show();
  } else if (!path) {
    $('#info').text('Your Docking Station path could not be automatically detected. Please set one manually.');
    $('#launch-button').hide();
    $('#find-path-button').show();
  } else if (invalid) {
    $('#info').text(`Sorry, ${path} isn't a valid path. (Valid paths contain an engine.exe file)`);
    $('#launch-button').hide();
    $('#find-path-button').show();
  }
}

/**
 * @param  {String} The path of an intended DS directory
 * @return {Boolean|String} Returns the path if it is valid, and false if it is not.
 */
function validateDSPath(path) {
  if(path) {
    const pathString = path.toString();
    if (fs.existsSync(`${pathString}/engine.exe`)) {
      return pathString;
    } else {
     return false;
    }
  }
}

/**
 * Assumes access to executablePath and settings
 * Prompts user to select a directory from their machine
 * If it's a valid DS path, sets it in settings and updates the display
 */
async function selectDSPath() {
  var attemptedPath = dialog.showOpenDialogSync({ properties: ['openDirectory', 'multiSelections'] });
  if (attemptedPath) {
    var gamePath = validateDSPath(attemptedPath)
    if (gamePath) {
        executablePath = gamePath;
        await globalThis.settings.setSetting('dsPath', gamePath);
        displayPathInfo(gamePath);
    } else {
      displayPathInfo(attemptedPath,true);
    }
  }
}

initialize();
