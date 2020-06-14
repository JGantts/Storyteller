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
      {name: 'abba', returnType: 'number', params: []},
      {name: 'alph', returnType: 'doesnt', params: ['number', 'number']},
      {name: 'anim', returnType: 'doesnt', params: ['byte-string']},
      {name: 'anms', returnType: 'doesnt', params: ['string']},
      {name: 'attr', returnType: 'doesnt', params: ['number']},
      {name: 'attr', returnType: 'number', params: []},
      {name: 'base', returnType: 'doesnt', params: ['number']},
      {name: 'base', returnType: 'number', params: []},
      {name: 'bhvr', returnType: 'doesnt', params: ['number']},
      {name: 'bhvr', returnType: 'number', params: []},
      {name: 'call', returnType: 'doesnt', params: ['number', 'anything', 'anything']},
      {name: 'carr', returnType: 'agent', params: []},
      {name: 'cata', returnType: 'number', params: []},
      {name: 'cati', returnType: 'number', params: ['number', 'number', 'number']},
      {name: 'cato', returnType: 'doesnt', params: ['number']},
      {name: 'catx', returnType: 'string', params: ['number']},
      {name: 'clac', returnType: 'number', params: []},
      {name: 'clik', returnType: 'number', params: ['number']},
      {name: 'core', returnType: 'doesnt', params: ['number', 'number', 'number', 'number']},
      {name: 'dcor', returnType: 'doesnt', params: ['number']},
      {name: 'disq', returnType: 'number', params: ['agent']},
      {name: 'drop', returnType: 'doesnt', params: []},
      {name: 'dsee', returnType: 'doesnt', params: ['number']},
      {name: 'fltx', returnType: 'number', params: []},
      {name: 'flty', returnType: 'number', params: []},
      {name: 'fmly', returnType: 'number', params: []},
      {name: 'frat', returnType: 'doesnt', params: ['number']},
      {name: 'from', returnType: 'any', params: []},
      {name: 'gait', returnType: 'doesnt', params: ['number']},
      {name: 'gall', returnType: 'doesnt', params: ['number']},
      {name: 'gall', returnType: 'string', params: []},
      {name: 'gnus', returnType: 'number', params: []},
      {name: 'hand', returnType: 'doesnt', params: ['string']},
      {name: 'hand', returnType: 'string', params: []},
      {name: 'held', returnType: 'agent', params: []},
      {name: 'hght', returnType: 'number', params: []},
      {name: 'iitt', returnType: 'agent', params: []},
      {name: 'imsk', returnType: 'number', params: []},
      {name: 'kill', returnType: 'doesnt', params: ['agent']},
      {name: 'mira', returnType: 'doesnt', params: ['number']},
      {name: 'mira', returnType: 'number', params: []},
      {name: 'mows', returnType: 'number', params: []},
      {name: 'mthx', returnType: 'number', params: []},
      {name: 'mthy', returnType: 'number', params: []},
      {name: 'ncls', returnType: 'agent', params: ['agent', 'number', 'number', 'number']},
      {name: 'nohh', returnType: 'doesnt', params: []},
      {name: 'null', returnType: 'agent', params: []},
      {name: 'over', returnType: 'doesnt', params: []},
      {name: 'ownr', returnType: 'agent', params: []},
      {name: 'paus', returnType: 'doesnt', params: ['number']},
      {name: 'paus', returnType: 'number', params: []},
      {name: 'pcls', returnType: 'agent', params: ['agent', 'number', 'number', 'number']},
      {name: 'plne', returnType: 'doesnt', params: ['number']},
      {name: 'plne', returnType: 'number', params: []},
      {name: 'pntr', returnType: 'agent', params: []},
      {name: 'posb', returnType: 'number', params: []},
      {name: 'pose', returnType: 'doesnt', params: ['number']},
      {name: 'pose', returnType: 'number', params: []},
      {name: 'posl', returnType: 'number', params: []},
      {name: 'posr', returnType: 'number', params: []},
      {name: 'post', returnType: 'number', params: []},
      {name: 'posx', returnType: 'number', params: []},
      {name: 'posy', returnType: 'number', params: []},
      {name: 'puhl', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'puhl', returnType: 'number', params: ['number', 'number']},
      {name: 'pupt', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'pupt', returnType: 'number', params: ['number', 'number']},
      {name: 'rnge', returnType: 'doesnt', params: ['number']},
      {name: 'rnge', returnType: 'number', params: []},
      {name: 'rtar', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'seee', returnType: 'number', params: ['agent', 'agent']},
      {name: 'show', returnType: 'doesnt', params: ['number']},
      {name: 'spcs', returnType: 'number', params: []},
      {name: 'star', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'targ', returnType: 'agent', params: []},
      {name: 'tcor', returnType: 'number', params: ['number', 'number', 'number', 'number']},
      {name: 'tick', returnType: 'doesnt', params: ['number']},
      {name: 'tick', returnType: 'number', params: []},
      {name: 'tino', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number']},
      {name: 'tint', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number']},
      {name: 'tint', returnType: 'number', params: ['number']},
      {name: 'totl', returnType: 'number', params: ['number', 'number', 'number']},
      {name: 'touc', returnType: 'number', params: ['agent', 'agent']},
      {name: 'tran', returnType: 'number', params: ['number', 'number']},
      {name: 'ttar', returnType: 'doesnt', params: ['number', 'number', 'number']},
      {name: 'twin', returnType: 'agent', params: ['agent', 'number']},
      {name: 'ucln', returnType: 'doesnt', params: []},
      {name: 'visi', returnType: 'number', params: ['number']},
      {name: 'wdth', returnType: 'number', params: []},
      {name: 'wild', returnType: 'string', params: ['number', 'number', 'number', 'string', 'number']},
      {name: '_it_', returnType: 'agent', params: []},
      {name: '____', returnType: 'doesnt', params: ['____', '____']},

      {name: 'inst', returnType: 'doesnt', params: []},
      {name: 'elas', returnType: 'doesnt', params: ['number']},
      {name: 'aero', returnType: 'doesnt', params: ['number']},
      {name: 'accg', returnType: 'doesnt', params: ['number']},
      {name: 'perm', returnType: 'doesnt', params: ['number']},
      {name: 'rand', returnType: 'number', params: ['number', 'number']},
      {name: 'mvto', returnType: 'doesnt', params: ['number', 'number']},
      {name: 'setv', returnType: 'doesnt', params: ['variable', 'number']},
      {name: 'addv', returnType: 'doesnt', params: ['variable', 'number']},
  ]},
  {
    'name': 'mesg',
    'commands': [
      {name: 'writ', returnType: 'doesnt', params: ['agent', 'number']},
      {name: 'wrt+', returnType: 'doesnt', params: ['agent', 'number', 'any', 'any', 'number']},
  ]},,
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
  var type = '';
  if (commandDef.returnType === 'doesnt'){
    type = 'namespace';
  }else{
    type = 'returning-namespace';
  }
  namespace = {
    type: type,
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
  var type = '';
  if (commandDef.returnType === 'doesnt'){
    type = 'command';
  }else{
    type = 'returning-command';
  }
  arguments = _arguments(commandDef.params);
  return {
    type: type,
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
  }else if (param === 'string'){
    return String();
  }else{
    return _paseCommand(param);
  }
}
