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
	}
}


function findDSPath() {
	//should probably externalize these at some point 
	const possiblePaths = [
	'C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station',
	'C:/Program Files (x86)/Docking Station',
	'C:/Program Files/Docking Station',
	`C:${(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).split('\\').join('/')}/Documents/Creatures/Docking Station`
	]
	for (const path of possiblePaths) {
		if (fs.existsSync(`${path}/engine.exe`)) {
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
			displayPathInfo();
		} else {
			$('#info').text(`Sorry, ${pathString} isn't a valid path. (Valid paths contain an engine.exe file)`);
			$('#launch-button').hide();
		}
	}
}

function setDSPath() {
	validateDSPath(dialog.showOpenDialogSync({ properties: ['openDirectory', 'multiSelections'] }));
}

//this seems unsafe... what's a good way to check if the content is loaded before running this?
executablePath =  findDSPath();
displayPathInfo();
