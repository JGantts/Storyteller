$.getScript('engine-api/CAOS.js');

function executeUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  helloWorld(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}
