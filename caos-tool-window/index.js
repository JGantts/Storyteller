$.getScript('../engine-api/CAOS.js');
$.getScript('parser.js');


function injectUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function userTextChanged(){
    document.getElementById('caos-user-code').innerHTML = '<span style="color: green;">' + $('#caos-user-code').text() + '</span>';
    
}
