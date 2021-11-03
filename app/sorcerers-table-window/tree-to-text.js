module.exports = {
  TreeToText: _treeToText,
}

function _treeToText(codeTree){
  var codeText = '';

  if (codeTree === null){
    return codeText;
  }else if (Array.isArray(codeTree)){
    codeTree.forEach((element, i) => {
      codeText += _treeToText(element);
    });
  }else if (['command-list'].includes(codeTree.type)){
    codeText += _treeToText(codeTree.start);
    codeTree.commands.forEach((command, i) => {
      codeText += _treeToText(command);
    });
    codeText += _treeToText(codeTree.end);
  }else if ('end-of-file' === codeTree.type){
    throw new Error(codeTree.message);
  }else if ('error' === codeTree.variant){
    throw new Error(codeTree.message);
  }else if ('variable' === codeTree.type){
    if(['ov', 'va', 'mv'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
    }else if(['game', 'name'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
      codeText += _treeToText(codeTree.varname);
    }else {
      throw new Error(codeTree.message);
    }
  }else if ('' === codeTree.type){
    codeText += codeTree.name + ' ';
  }else if ('namespaced-command' === codeTree.type){
    codeText += _treeToText(codeTree.namespace);
    codeText += _treeToText(codeTree.command);
  }else if (['namespace', 'returning-namespace'].includes(codeTree.type)){
    codeText += codeTree.name + ' ';
  }else if (['command', 'returning-command'].includes(codeTree.type)){
    codeText += codeTree.name + ' ';
    codeTree.arguments.forEach((arg, index) => {
      codeText += _treeToText(arg);
    });
  }else if(['condition'].includes(codeTree.type)) {
    codeTree.condition.forEach((boolOrBoolop, index) => {
      codeText += _treeToText(boolOrBoolop);
    });
  }else if(['boolean'].includes(codeTree.type)) {
    codeText += _treeToText(codeTree.left);
    codeText += _treeToText(codeTree.operator);
    codeText += _treeToText(codeTree.right);
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
  }else{
    codeText += codeTree.name + ' ';
  }
  return codeText;
}
