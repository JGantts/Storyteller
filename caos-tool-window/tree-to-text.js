module.exports = {
  TreeToText: _treeToText,
}

function _treeToText(codeTree){
  var codeText = '';

  if (['command-list'].includes(codeTree.type)){
    codeTree.commands.forEach((command, i) => {
      codeText += _treeToText(command);
    });
  }else if ('events-list' === codeTree.type){
    codeText += _treeToText(codeTree.scrp);
    codeText += _treeToText(codeTree.family);
    codeText += _treeToText(codeTree.genus);
    codeText += _treeToText(codeTree.species);
    codeText += _treeToText(codeTree.script);
    codeText += _treeToText(codeTree.commands);
    codeText += _treeToText(codeTree.endm);
  }else if ('remove' === codeTree.type){
    codeText += _treeToText(codeTree.rscr);
    codeText += _treeToText(codeTree.commands);
  }else if ('end-of-file' === codeTree.type){
    assert('error' === codeTree.variant);
    throw new Error(codeTree.message);
  }else if ('error' === codeTree.variant){
    throw new Error(codeTree.message);
  }else if ('variable' === codeTree.type){
    if(['ov', 'va'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
    }else if(['game'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
      codeText += _treeToText(codeTree.varname);
    }else {
      throw new Error(codeTree.message);
    }
  }else if ('command-list' === codeTree.type){
    codeTree.commands.forEach((command, index) => {
      codeText += _treeToText(command);
    });
  }else if ('namespaced-command' === codeTree.type){
    codeText += _treeToText(codeTree.namespace);
    codeText += _treeToText(codeTree.command);
  }else if ('namespace' === codeTree.type){
    codeText += codeTree.name + ' ';
  }else if (['command', 'returning-command'].includes(codeTree.type)){
    codeText += codeTree.name + ' ';
    codeTree.arguments.forEach((arg, index) => {
      codeText += _treeToText(arg);
    });
  }else if ('doif-blob' === codeTree.type){
    codeTree.sections.forEach((blob, index) => {
      codeText += _treeToText(blob);
    });
  }else if ('loop1' === codeTree.type){
    codeText += _treeToText(codeTree.start);
    codeText += codeTree.arguments
      .reduce((total, arg) => total + _treeToText(arg), '');
    codeText += _treeToText(codeTree.commandList);
    codeText += _treeToText(codeTree.end);
  }else if ('loop2' === codeTree.type){
    codeText += _treeToText(codeTree.start);
    codeText += _treeToText(codeTree.commandList);
    codeText += _treeToText(codeTree.end);
    codeText += codeTree.arguments
      .reduce((total, arg) => total + _treeToText(arg), '');
  }else if ('flow' === codeTree.type){
    codeText += codeTree.name + ' ';
    if (['doif', 'elif'].includes(codeTree.variant)){
      codeText += _treeToText(codeTree.conditional);
    }
    if (['doif', 'elif', 'else'].includes(codeTree.variant)){
      codeText += _treeToText(codeTree.commandList);
    }
  }else if(['conditional'].includes(codeTree.type)) {
    if ('end-of-file' == codeTree.variant){

    }else{
      codeTree.conditional.forEach((boolOrBoolop, index) => {
        codeText += _treeToText(boolOrBoolop);
      });
    }
  }else if(['boolean'].includes(codeTree.type)) {
    codeText += _treeToText(codeTree.left);
    codeText += _treeToText(codeTree.operator);
    codeText += _treeToText(codeTree.right);
  }else if(['operator'].includes(codeTree.type)) {
    codeText += codeTree.name + ' ';
  }else if(['bool-op'].includes(codeTree.type)) {
    codeText += codeTree.name + ' ';
  }else if(
    ['literal'].includes(codeTree.type)
    && ['integer', 'float'].includes(codeTree.variant)
  ) {
    codeText += codeTree.value + ' ';
  }else if(
    ['literal'].includes(codeTree.type)
    && ['string'].includes(codeTree.variant)
  ) {
    codeText += `"${codeTree.value}" `;
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring'].includes(codeTree.variant)
  ) {
    codeText += `[`;
    codeText += codeTree.particles
      .reduce((total, particle) => total + _treeToText(particle), '');
    codeText += `]`;
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring-particle'].includes(codeTree.variant)
  ) {
    codeText += codeTree.value + ' ';
  }else if ('number-string-variable' === codeTree.type){
    throw new Error(codeTree.message);
  }else if ('script' === codeTree.type){
    codeText += codeTree.name + ' ';
  }else{
    console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
    assert(false);
  }
  return codeText;
}
