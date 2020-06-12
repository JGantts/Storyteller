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

module.exports = {
  Command: _publicCommand,
}

var _namespaces = [
  {
    'name': 'global',
    'commands': [
    {'name': 'inst', params: []},
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

function _publicCommand() {
  var namespace =
    _namespaces
    .filter(namespace => namespace.name === State.tokens[0].toLowerCase())[0]

  if (namespace){
    let variant = State.tokens[0].toLowerCase();
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    var command =
      namespace.commands
      .filter(command => command.name === State.tokens[0].toLowerCase())[0]
    if (command){
      variant += ' ' + State.tokens[0].toLowerCase();
      name += ' ' + State.tokens[0];
      return _command(command, variant, name);
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
      return _command(command, variant, name);
    }else{
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return Error('command', name);
    }
  }
}

function _command(command, variant, name){
  State.tokens = State.tokens.slice(1);
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
  }else if (param === 'number'){
    return String();
  }else{
    console.log(State.tokens);
    assert(false);
  }
}