$.getScript('../engine-api/CAOS.js');
$.getScript('parser.js');
$.getScript('syntax-highlighting/syntax-highlighting.js');


function injectUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function userTextChanged(){
  var codeElement = document.getElementById('caos-user-code');
  var code = codeElement.innerText;

  var codeTree = parseCode(code);

  $('#inprocessParse').text(JSON.stringify(codeTree));

  var highlighted = highlightSyntax(codeTree, code, 0);

  document.getElementById('highlighted').innerHTML = highlighted.highlighted;

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}
