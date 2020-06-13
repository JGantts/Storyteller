module.exports = {
  Command: _command,
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
      {'name': 'inst', params: []},
      {'name': 'attr', params: ['number']},
      {'name': 'bhvr', params: ['number']},
      {'name': 'tick', params: ['number']},
      {'name': 'elas', params: ['number']},
      {'name': 'aero', params: ['number']},
      {'name': 'accg', params: ['number']},
      {'name': 'perm', params: ['number']},
      {'name': 'rand', params: ['number', 'number']},
      {'name': 'pose', params: ['number']},
      {'name': 'puhl', params: ['number', 'number', 'number']},
      {'name': 'tick', params: ['number']},
      {'name': 'mvto', params: ['number', 'number']},
      {'name': 'setv', params: ['variable', 'number']},
      {'name': 'addv', params: ['variable', 'number']},
  ]},
  {
    'name': 'new:',
    'commands': [
      {'name': 'simp', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
      {'name': 'comp', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
  ]},
]

function _command() {
  var namespace =
    _namespaces
    .filter(namespace => namespace.name === State.tokens[0].toLowerCase())[0]

  if (namespace){
    let variant = State.tokens[0].toLowerCase();
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    if (State.tokens.length === 0){
      return Eof('command');
    }
    var command =
      namespace.commands
      .filter(command => command.name === State.tokens[0].toLowerCase())[0]
    if (command){
      variant += ' ' + State.tokens[0].toLowerCase();
      name += ' ' + State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return _commandTree(command, variant, name);
    }else{
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return Error('command', name);
    }
  }else{
    var command =
      _namespaces[0].commands
      .filter(command => command.name === State.tokens[0].toLowerCase())[0]
    if (command){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return _commandTree(command, variant, name);
    }else{
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return Error('command', name);
    }
  }
}

function _commandTree(command, variant, name){
  arguments = _arguments(command.params);
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
