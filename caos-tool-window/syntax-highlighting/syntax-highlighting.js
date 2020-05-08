$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'syntax-highlighting/syntax-highlighting-oldschool.css') );

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
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      codeIndex += codeTree.name.length;
    }else if(['game'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      codeIndex += codeTree.name.length;
      highlighted_newIndex = highlightSyntax(codeTree.varname, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
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
      codeIndex += codeTree.name.length;
    }else if(['bhvr', 'setv'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      codeIndex += codeTree.name.length;
      codeTree.arguments.forEach((arg, index) => {
        highlighted_newIndex = highlightSyntax(arg, code, codeIndex);
        highlighted += highlighted_newIndex.highlighted;
        codeIndex = highlighted_newIndex.newIndex;
      });
    }
  }else if ('returning-command' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeIndex += codeTree.name.length;
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
    codeIndex += codeTree.name.length;
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
  }else if(['conditional'].includes(codeTree.type)) {
    codeTree.conditional.forEach((boolOrBoolop, index) => {
      highlighted_newIndex = highlightSyntax(boolOrBoolop, code, codeIndex);
      highlighted += highlighted_newIndex.highlighted;
      codeIndex = highlighted_newIndex.newIndex;
    });
  }else if(['boolean'].includes(codeTree.type)) {
    highlighted_newIndex = highlightSyntax(codeTree.left, code, codeIndex);
    highlighted += highlighted_newIndex.highlighted;
    codeIndex = highlighted_newIndex.newIndex;
    highlighted_newIndex = highlightSyntax(codeTree.operator, code, codeIndex);
    highlighted += highlighted_newIndex.highlighted;
    codeIndex = highlighted_newIndex.newIndex;
    highlighted_newIndex = highlightSyntax(codeTree.right, code, codeIndex);
    highlighted += highlighted_newIndex.highlighted;
    codeIndex = highlighted_newIndex.newIndex;
  }else if(['operator'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeIndex += codeTree.name.length;
  }else if(['bool-op'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeIndex += codeTree.name.length;
  }else if(['number-literal', 'string-literal'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    codeIndex += codeTree.value;
  }else{
    console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
  }
  return {highlighted: highlighted, newIndex: codeIndex};
}
