module.exports = {
  Command: _paseCommand,
  Arguments: _arguments,
}

const assert = require('assert');
const {
  NumberOrString,
  Number,
  PossibleNumber,
  String,
  PossibleString,
} = require('./literal.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const { PossibleVariable, Variable } = require('./variable.js');
const { State } = require('./tokens.js');

var _namespaces = [
  {
    'name': 'global',
    'commands': [
      {name: 'inst', returnType: 'doesnt', params: []},
      {name: 'attr', returnType: 'doesnt', params: ['number']},
      {name: 'bhvr', returnType: 'doesnt', params: ['number']},
      {name: 'tick', returnType: 'doesnt', params: ['number']},
      {name: 'elas', returnType: 'doesnt', params: ['number']},
      {name: 'aero', returnType: 'doesnt', params: ['number']},
      {name: 'accg', returnType: 'doesnt', params: ['number']},
      {name: 'perm', returnType: 'doesnt', params: ['number']},
      {name: 'rand', returnType: 'number', params: ['number', 'number']},
      {name: 'pose', returnType: 'doesnt', params: ['number']},
      {name: 'pose', returnType: 'number', params: []},
      {name: 'puhl', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'tick', returnType: 'doesnt', params: ['number']},
      {name: 'mvto', returnType: 'doesnt', params: ['number', 'number']},
      {name: 'setv', returnType: 'doesnt', params: ['variable', 'number']},
      {name: 'addv', returnType: 'doesnt', params: ['variable', 'number']},
  ]},
  {
    'name': 'new:',
    'commands': [
      {name: 'simp', returnType: 'doesnt', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
      {name: 'comp', returnType: 'doesnt', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
  ]},
]

function _paseCommand(returnType) {
  var namespaceDef =
    _namespaces
    .filter(namespace => namespace.name === State.tokens[0].toLowerCase())[0]

  if (namespaceDef){
    let nsVariant = State.tokens[0].toLowerCase();
    let nsName = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    var commandDef =
      namespaceDef.commands
      .filter(
        command =>
        command.name === State.tokens[0].toLowerCase()
        && command.returnType
      )[0]
    if (commandDef){
      let cmdVariant = State.tokens[0].toLowerCase();
      let cmdName = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return _namespacedCommand(commandDef, nsVariant, nsName, cmdVariant, cmdName);
    }else{
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return Error('command', nsName);
    }
  }else{
    var commandDef =
      _namespaces[0].commands
      .filter(command => command.name === State.tokens[0].toLowerCase())[0]
    if (commandDef){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return _command(commandDef, variant, name);
    }else{
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return Error('command', name);
    }
  }
}

function _namespacedCommand(commandDef, nsVariant, nsName, cmdVariant, cmdName){
  namespace = {
    type: 'namespace',
    variant: nsVariant,
    name: nsName,
  }
  command = _command(commandDef, cmdVariant, cmdName);
  return {
    type: 'namespaced-command',
    namespace: namespace,
    command: command
  }
}

function _command(commandDef, variant, name){
  arguments = _arguments(commandDef.params);
  return {
    type: 'command',
    variant: variant,
    name: name,
    arguments: arguments
  };
}

function _arguments(params){
  return params.map(param => _argument(param));
}

function _argument(param){
  if (param === 'variable'){
    return Variable();
  }else if (param === 'number'){
    return Number();
  }else if (param === 'string'){
    return String();
  }else{
    console.log(param);
    console.log(State.tokens);
    assert(false);
  }
}
