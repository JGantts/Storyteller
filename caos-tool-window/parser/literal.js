const assert = require('assert');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const { PossibleVariable, Variable } = require('./variable.js');
const { State } = require('./tokens.js');

module.exports = {
  NumberOrString: _numberOrString,
  Number: _number,
  PossibleNumber: _possibleNumber,
  String: _string,
  PossibleString: _possibleString,
}

function _numberOrString(){
  var possibleNumber = _possibleNumber();
  if (possibleNumber){
    return possibleNumber;
  }
  var possibleString = _possibleString();
  if (possibleString){
    return possibleString;
  }
  var possibleVariable = PossibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  return _error('number-string-variable', name);
}

function _number(){
  let possibleNumber = _possibleNumber();
  if (possibleNumber){
    return possibleNumber;
  }else{
      return ErrorOrEof('number');
  }
}

function _possibleNumber() {
  if (State.tokens.length === 0){
    return null;
  }else if (!isNaN(State.tokens[0])){
    let value = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    return {
      type: 'literal',
      variant: 'number',
      name: 'number',
      value: value
    };
  }else if (['rand'].includes(State.tokens[0].toLowerCase())){
    let variant = State.tokens[0].toLowerCase();
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    var leftArgument = _number();
    var rightArgument = _number();
    return {
      type: 'returning-command',
      variant: variant,
      name: name,
      arguments: [leftArgument, rightArgument]
    }
  }else{
    var variable = Variable();
    return variable;
  }
}

function _string() {
  let possibleString = _possibleString();
  if (possibleString){
    return possibleString;
  }else{
    return _errorOrEof('string');
  }
}

function _possibleString() {
  if (State.tokens.length === 0){
    return null;
  }else if (State.tokens[0][0]==='"'){
    var stringsChunks = [];
    var index = 0;
    State.tokens[0] = State.tokens[0].slice(1);
    while (State.tokens[index][State.tokens[index].length-1]!=='"'){
      stringsChunks.push(State.tokens[index]);
      index++;
    }
    stringsChunks.push(State.tokens[index].substring(0, State.tokens[index].length-1));
    State.tokens = State.tokens.slice(index+1);
    return {type: 'literal', variant: 'string', value: stringsChunks.join(' ')};
  }else{
    var variable = Variable();
    return variable;
  }
}
