function launchDockingStation(){
  var { spawn } = require('child_process');
  var executablePath = FindDSPath();

  if (executablePath) {
  	$('#info').text(`Docking Station Path found at ${executablePath}`);
	const engineRef = spawn(executablePath + 'engine.exe', {
	detached: true,
	stdio: 'ignore',
	cwd: executablePath
	});

	engineRef.unref();
	} else {
	$('#info').text('No Docking Station Path was found...');
	}
}


function FindDSPath() {
	const fs = require("fs");
	const possiblePaths = [
	"C:/Program Files (x86)/GOG Galaxy/Games/Creatures Exodus/Docking Station/",
	"C:/Program Files (x86)/Docking Station/",
	"C:/Program Files/Docking Station/",
	`C:${(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).split('\\').join('/')}/Documents/Creatures/Docking Station`
	]
	for (const path in possiblePaths) {
		if (fs.existsSync(`${path}/engine.exe`)) {
			return path;
		}
	}
	return false;
}

