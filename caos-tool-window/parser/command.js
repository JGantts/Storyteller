module.exports = {
  PossibleCommand: _parsePossibleCommand,
  Command: _parseCommand,
  Arguments: _arguments,
}

const assert = require('assert');
const { Conditional } = require('./conditional.js')
const { C3Commands } = require('./commandLoader.js')
const {
  Decimal,
  PossibleDecimal,
  Integer,
  PossibleInteger,
  Float,
  PossibleFloat,
  String,
  PossibleString,
  ByteString,
  PossibleByteString,
} = require('./literal.js');
const {
  CheckForEof,
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const { PossibleVariable, Variable } = require('./variable.js');
const { State } = require('./tokens.js');

var _commands = C3Commands();

function _parseCommand(returnType) {
  let possibleCommand = _parsePossibleCommand();
  if (possibleCommand){
    return possibleCommand;
  }else{
    if (returnType === 'doesnt'){
        return ErrorOrEof('command');
      }else{
        return ErrorOrEof(`command that returns a ${returnType}`);
      }
  }
}

function _parsePossibleCommand(returnType) {
  if (State.tokens.length === 0){
    return null;
  }

  var namespaceName =
    Object.keys(_commands)
    .filter(namespaceKey => namespaceKey === State.tokens[0].toLowerCase())[0];

  var namespaceDef = _commands[namespaceName];

  if (namespaceDef){
    let nsVariant = State.tokens[0].toLowerCase();
    let nsName = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    var commandDef =
      namespaceDef
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
      return null;
    }
  }else{
    var commandDef =
      _commands['global']
      .filter(command => command.name === State.tokens[0].toLowerCase())[0]
    if (commandDef){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      return _command(commandDef, variant, name);
    }else{
      return null;
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
/*
  "anything" -> "agent", "decimal", "string"
  "agent"
  "bytestring"
  "condition"
  "decimal" -> "float", "integer"
  "float"
  "integer"
  "label"
  "string"
*/
  let possible = null;
  possible = CheckForEof(param);
  if (possible){
    return possible;
  }
  if (param === 'anything'){
    possible = PossibleDecimal();
    if (possible){ return possible }
    possible = PossibleString();
    if (possible){ return possible }
    return ErrorOrEof(`anything`);

  }else if (param === 'variable'){
    return Variable();
  }else if (param === 'decimal'){
      possible = PossibleDecimal();
      if (possible){ return possible }
      possible = _parsePossibleCommand(`integer`);
      if (possible){ return possible }
      possible = _parsePossibleCommand(`float`);
      if (possible){ return possible }
      return ErrorOrEof(`decimal`);
  }else if (param === 'float'){
    return Float();
  }else if (param === 'integer'){
    return Integer();
  }else if (param === 'string'){
    return String();
  }else if (param === 'bytestring'){
    return ByteString();
  }else if (param === 'condition'){
    return Conditional();
  }else{
    return _parseCommand(param);
  }
}
