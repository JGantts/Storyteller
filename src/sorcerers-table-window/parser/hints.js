module.exports = {
  AddHints: Hints
}

const assert = require('assert');
const { State } = require('./tokens.js');

function Hints(codeTree, addNewlines){
  if (codeTree === null){
    return;
  }else if (Array.isArray(codeTree)){
    codeTree.forEach((element, i) => {
      Hints(element, addNewlines);
    });
  }else if (['command-list'].includes(codeTree.type)){
    Hints(codeTree.start, addNewlines);
    codeTree.commands.forEach((command, i) => {
      Hints(command, addNewlines);
    });
    Hints(codeTree.end, addNewlines);
  }else if ('end-of-file' === codeTree.type){
    throw new Error(codeTree.message);
  }else if ('error' === codeTree.variant){
    throw new Error(codeTree.message);
  }else if ('variable' === codeTree.type){
    if(['ov'].includes(codeTree.variant)){
      codeTree.hint = {"en-GB": "Object variable"}
    }else if(['va'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
    }else if(['mv'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
    }else if(['game'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
      Hints(codeTree.varname, addNewlines);
    }else if(['name'].includes(codeTree.variant)){
      codeText += codeTree.name + ' ';
      Hints(codeTree.varname, addNewlines);
    }else {
      throw new Error(codeTree.message);
    }
  }else if ('' === codeTree.type){
    codeText += codeTree.name + ' ';
  }else if ('namespaced-command' === codeTree.type){
    Hints(codeTree.namespace, addNewlines);
    Hints(codeTree.command, addNewlines);
  }else if (['namespace', 'returning-namespace'].includes(codeTree.type)){
    codeText += codeTree.name + ' ';
  }else if (['command', 'returning-command'].includes(codeTree.type)){
    codeText += codeTree.name + ' ';
    codeTree.arguments.forEach((arg, index) => {
      Hints(arg, addNewlines);
    });
  }else if(['condition'].includes(codeTree.type)) {
    codeTree.condition.forEach((boolOrBoolop, index) => {
      Hints(boolOrBoolop, addNewlines);
    });
  }else if(['boolean'].includes(codeTree.type)) {
    Hints(codeTree.left, addNewlines);
    Hints(codeTree.operator, addNewlines);
    Hints(codeTree.right, addNewlines);
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
      .reduce((total, particle) => total + Hints(particle, addNewlines), '');
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
  if (['command'].includes(codeTree.type)){
      if (addNewlines) {
          codeText += "\n";
      }
  }
  return codeText;
}
