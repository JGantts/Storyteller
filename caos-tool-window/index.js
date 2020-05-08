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
  var codeElement = document.getElementById('caos-user-code');
  var code = codeElement.innerText;

  var codeTree = parseCode(code);

  $('#inprocessParse').text(JSON.stringify(codeTree));

  var highlighted = highlightSyntax(codeTree, code, 0);

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}

function highlightSyntax(codeTree, code, codeIndex){
  //Apparently string += string is faster than builind an array and using .join()

  var highlighted = '';

  if ('inject' in codeTree){
    highlighted_newIndex = highlightSyntax(codeTree.inject, code, codeIndex);
    highlighted += highlighted_newIndex.highlighted;
    codeIndex = highlighted.newIndex;


  }else if ('singleEventScript' in codeTree){

  }else{

  }
  return {highlighted: highlighted, newIndex: codeIndex};
}
