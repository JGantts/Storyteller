module.exports = {
  CommandByName: _parseCommandByName,
  PossibleCommandByName: _parsePossibleCommandByName,
  CommandByReturnType: _parseCommandByReturnType,
  PossibleCommandByReturnType: _parsePossibleCommandByReturnType,
  Arguments: _arguments,
}

const assert = require('assert');
const { Condition } = require('./condition.js')
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

function _parseCommandByName(name){
  let possibleCommand = _parsePossibleCommandByName(name);
  if (possibleCommand){
    return possibleCommand;
  }else{
    return ErrorOrEof(`command named ${name}`);
  }
}

function _parsePossibleCommandByName(name){
  return _parsePossibleCommandByNameAndReturnType(name, null);
}

function _parseCommandByReturnType(returnType){
  let possibleCommand = _parsePossibleCommandByReturnType(returnType);
  if (possibleCommand){
    return possibleCommand;
  }else{
    if (returnType === 'doesnt'){
      return ErrorOrEof('command');
    }else{
      return ErrorOrEof(returnType);
    }
  }
}

function _parsePossibleCommandByReturnType(returnType){
  return _parsePossibleCommandByNameAndReturnType(null, returnType);
}


function _parsePossibleCommandByNameAndReturnType(name, returnType){
  if (State.tokens.length === 0){
    return null;
  }

  if (name && name !== State.tokens[0].toLowerCase()){
    return null;
  }

  let namespaceName =
    Object.keys(_commands)
    .filter(namespaceKey => namespaceKey === State.tokens[0].toLowerCase())[0];

  let namespaceDef;
  let nsVariant;
  let nsName;
  let cmdVariant;
  let cmdName;
  if (!namespaceName){
    if (State.tokens.length < 1){
      return null;
    }
    namespaceDef = _commands['global']
    cmdVariant = State.tokens[0].toLowerCase();
    cmdName = State.tokens[0];
  }else{
    if (State.tokens.length < 2){
      return null;
    }
    namespaceDef = _commands[namespaceName];
    nsVariant = State.tokens[0].toLowerCase();
    nsName = State.tokens[0];
    cmdVariant = State.tokens[1].toLowerCase();
    cmdName = State.tokens[1];
  }

  let commandDef = namespaceDef
    .filter(
      command => {return (
        command.name === cmdVariant
        && (!returnType || returnType === command.returnType)
      );}
    )[0];

  if (!commandDef){
    return null;
  }

  if (!namespaceName){
    State.tokens = State.tokens.slice(1);
  }else{
    State.tokens = State.tokens.slice(2);
  }

  let command = _command(commandDef, cmdVariant, cmdName);

  if (!namespaceName){
    return command;
  }else{
    return _namespacedCommand(commandDef.returnType, nsVariant, nsName, command);
  }
}

function _namespacedCommand(commandDefReturnType, nsVariant, nsName, command){
  var type = '';
  if (commandDefReturnType === 'doesnt'){
    type = 'namespace';
  }else{
    type = 'returning-namespace';
  }
  namespace = {
    type: type,
    variant: nsVariant,
    name: nsName,
  }
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
  "float" -> "integer"
  "integer" -> "float"
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
    possible = _parsePossibleCommandByReturnType(`agent`);
    if (possible){ return possible }
    possible = PossibleVariable();
    if (possible){ return possible }
    return ErrorOrEof(`anything`);
  }else if (param === 'agent'){
    possible = _parsePossibleCommandByReturnType(`agent`);
    if (possible){ return possible }
    possible = PossibleVariable();
    if (possible){ return possible }
    return _parseCommandByReturnType(param);
  }else if (param === 'variable'){
    return Variable();
  }else if (param === 'decimal'){
    possible = PossibleDecimal();
    if (possible){ return possible }
    possible = _parsePossibleCommandByReturnType(`integer`);
    if (possible){ return possible }
    possible = _parsePossibleCommandByReturnType(`float`);
    if (possible){ return possible }
    return ErrorOrEof(`decimal`);
  }else if (param === 'float'){
    possible = PossibleFloat();
    if (possible){ return possible; }
    return Integer();
  }else if (param === 'integer'){
    possible = PossibleInteger();
    if (possible){ return possible; }
    return Float();
  }else if (param === 'string'){
    return String();
  }else if (param === 'bytestring'){
    return ByteString();
  }else if (param === 'condition'){
    return Condition();
  }else if (param === 'label'){
    return _label();
  }else{
    let temp = _parseCommandByReturnType(param);
    return temp;
  }
}

function _label(){
  if (State.tokens.length === 0){
    return Eof('label');
  }
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  return {
    type: 'label',
    variant: 'label',
    name: name,
  };
}
