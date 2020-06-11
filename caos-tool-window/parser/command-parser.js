const assert = require('assert');
const { Chunks } = require('./parser.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error-parser.js');

module.exports = {
  Command: _command,
}

function _command() {
  console.log(Chunks);
  if (['inst'].includes(Chunks()[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'command',
      variant: variant,
      name: name
    };
  }else if (['setv', 'addv'].includes(chunks[0].toLowerCase())){
    return _setvAddsEtc();
  }else{
    let name = chunks[0];
    chunks = chunks.slice(1);
    return _error('command', name);
  }
}

function _setvAddsEtc() {
  var commandName = chunks[0];
  chunks = chunks.slice(1);
  var argument1 = _variable();
  if (argument1.type === 'end-of-file'){
    return {
      type: 'command',
      variant: commandName.toLowerCase(),
      name: commandName,
      arguments: [argument1]
    };
  }
  if (['setv', 'addv'].includes(commandName.toLowerCase())){
    argument2 = _number();
    return {
      type: 'command',
      variant: commandName.toLowerCase(),
      name: commandName,
      arguments: [argument1, argument2]
    };
  }else{
    console.log(chunks);
    assert(false);
  }
}
