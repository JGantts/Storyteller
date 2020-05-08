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

  document.getElementById('highlighted').innerHTML = highlighted.highlighted;

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}

function highlightSyntax(codeTree, code, codeIndex){
  //Apparently string += string is faster than builind an array and using .join()

  var highlighted = '';

  if ('caos-file' === codeTree.type){
    highlighted_newIndex = highlightSyntax(codeTree.inject, code, codeIndex);
    highlighted += highlighted_newIndex.highlighted;
    codeIndex = highlighted_newIndex.newIndex;


  }else if ('event-scripts' === codeTree.type){

  }else if ('variable' === codeTree.type){
    if('va' === codeTree.variant){
      highlighted += '<span style="color: green;">'
      + codeTree.name
      + '</span>';
      codeIndex += 4;
    }else if(['game'].includes(codeTree.type)){

    }else {
      console.log(JSON.stringify(codeTree))
    }
  }else if ('command-list' === codeTree.type){
    codeTree.commands.forEach((command, index) => {
      highlighted_newIndex = highlightSyntax(command, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    });
  }else if ('command' === codeTree.type){
    if (['inst'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    }else if(['bhvr', 'setv'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      codeTree.arguments.forEach((arg, index) => {
        highlighted_newIndex = highlightSyntax(arg, code, codeIndex);
        highlighted += highlighted_newIndex.highlighted;
        codeIndex = highlighted_newIndex.newIndex;
      });
    }
  }else if ('returning-command' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeTree.arguments.forEach((arg, index) => {
      highlighted_newIndex = highlightSyntax(arg, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    });
  }else if ('doif-blob' === codeTree.type){
    codeTree.sections.forEach((blob, index) => {
      highlighted_newIndex = highlightSyntax(blob, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    });
  }else if ('flow' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    if (['doif', 'elif'].includes(codeTree.variant)){
      highlighted_newIndex = highlightSyntax(codeTree.conditional, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    }
    if (['doif', 'elif', 'else'].includes(codeTree.variant)){
      highlighted_newIndex = highlightSyntax(codeTree.commandList, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    }
  //}else if('') {

  }else{
    console.log(codeTree.type);
  }
  return {highlighted: highlighted, newIndex: codeIndex};
}
