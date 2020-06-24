module.exports = {
  TreeToErrors: _treeToErrors,
}

function _treeToErrors(codeTree){
  var errorText = '';

  if (codeTree === null){
    return errorText;
  }else if (Array.isArray(codeTree)){
    codeTree.forEach((element, i) => {
      errorText += _treeToErrors(element);
    });
  }else if ('caos-file' === codeTree.type){
    errorText += _treeToErrors(codeTree.inject);
    errorText += _treeToErrors(codeTree.eventScripts);
    errorText += _treeToErrors(codeTree.remove);
  }else if (['command-list'].includes(codeTree.type)){
    errorText += _treeToErrors(codeTree.start);
    codeTree.commands.forEach((command, i) => {
      errorText += _treeToErrors(command);
    });
    errorText += _treeToErrors(codeTree.end);
  }else if ('end-of-file' === codeTree.type){
    errorText += `${codeTree.name}: ${codeTree.message} `;
  }else if ('error' === codeTree.variant){
    errorText += `${codeTree.name}: ${codeTree.message} `;
  }else if ('variable' === codeTree.type){
    if(['ov', 'va', 'mv'].includes(codeTree.variant)){
      //errorText += codeTree.name + ' ';
    }else if(['game', 'name'].includes(codeTree.variant)){
      //errorText += codeTree.name + ' ';
      errorText += _treeToErrors(codeTree.varname);
    }else {
      errorText += `${codeTree.name}: ${codeTree.message} `;
    }
  }else if ('' === codeTree.type){
    //errorText += codeTree.name + ' ';
  }else if ('namespaced-command' === codeTree.type){
    errorText += _treeToErrors(codeTree.namespace);
    errorText += _treeToErrors(codeTree.command);
  }else if (['namespace', 'returning-namespace'].includes(codeTree.type)){
    //errorText += codeTree.name + ' ';
  }else if (['command', 'returning-command'].includes(codeTree.type)){
    //errorText += codeTree.name + ' ';
    codeTree.arguments.forEach((arg, index) => {
      errorText += _treeToErrors(arg);
    });
  }else if(['condition'].includes(codeTree.type)) {
    codeTree.condition.forEach((boolOrBoolop, index) => {
      errorText += _treeToErrors(boolOrBoolop);
    });
  }else if(['boolean'].includes(codeTree.type)) {
    errorText += _treeToErrors(codeTree.left);
    errorText += _treeToErrors(codeTree.operator);
    errorText += _treeToErrors(codeTree.right);
  }else if(
    ['literal'].includes(codeTree.type)
    && ['string'].includes(codeTree.variant)
  ) {
    //errorText += `"${codeTree.value}" `;
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring'].includes(codeTree.variant)
  ) {
    /*errorText += `[`;
    errorText += codeTree.particles
      .reduce((total, particle) => total + _treeToErrors(particle), '');
    errorText += `]`;*/
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring-particle'].includes(codeTree.variant)
  ) {
    //errorText += codeTree.value + ' ';
  }else if ('number-string-variable' === codeTree.type){
    errorText += `${codeTree.name}: ${codeTree.message} `;
  }else{
    //errorText += codeTree.name + ' ';
  }
  return errorText;
}
