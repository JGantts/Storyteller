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


// gamepath display stuff is in in settings-page.js)