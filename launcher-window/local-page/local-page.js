var executablePath = false;
const { dialog } = require('electron').remote
const fs = require("fs");


function launchDockingStation(){
  var { spawn } = require('child_process');

  if (executablePath) {
	const engineRef = spawn(executablePath + '/engine.exe', {
	detached: true,
	stdio: 'ignore',
	cwd: executablePath
	});

	engineRef.unref();
	} else {
		//this shouldn't really show up because the button shouldn't exist?
		$('#info').text('Please set a valid Docking Station Path to launch');
	}
}


function findDSPath() {
	// checking settings first
	if (settings.get('gamePath')) {
		return settings.get('gamePath');
	}
	// then try to guess based on common paths
	// (should maybe externalize these at some point?)
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
		$('#info').text(`Docking Station Path set to ${executablePath}`);
		$('#launch-button').show();
	} else {
		$('#info').text('No Docking Station Path was found...');
		$('#launch-button').hide();
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
			$('#launch-button').hide();
		}
	}
}

function selectDSPath() {
	validateDSPath(dialog.showOpenDialogSync({ properties: ['openDirectory', 'multiSelections'] }));
}

//this seems unsafe... should there be a check if the content is loaded before running this?
executablePath =  findDSPath();
displayPathInfo();
