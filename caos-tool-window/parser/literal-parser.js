const assert = require('assert');
const { chunks } = require('./parser.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error-parser.js');

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
  var possibleVariable = _possibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }
  let name = chunks[0];
  chunks = chunks.slice(1);
  return _error('number-string-variable', name);
}

function _number(){
  let possibleNumber = _possibleNumber();
  if (possibleNumber){
    return possibleNumber;
  }else{
      return _errorOrEof('number');
  }
}

function _possibleNumber() {
  if (chunks.length === 0){
    return null;
  }else if (!isNaN(chunks[0])){
    let value = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'literal',
      variant: 'number',
      name: 'number',
      value: value
    };
  }else if (['rand'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    var leftArgument = _number();
    var rightArgument = _number();
    return {
      type: 'returning-command',
      variant: variant,
      name: name,
      arguments: [leftArgument, rightArgument]
    }
  }else{
    var variable = _variable();
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
  if (chunks.length === 0){
    return null;
  }else if (chunks[0][0]==='"'){
    var stringsChunks = [];
    var index = 0;
    chunks[0] = chunks[0].slice(1);
    while (chunks[index][chunks[index].length-1]!=='"'){
      stringsChunks.push(chunks[index]);
      index++;
    }
    stringsChunks.push(chunks[index].substring(0, chunks[index].length-1));
    chunks = chunks.slice(index+1);
    return {type: 'literal', variant: 'string', value: stringsChunks.join(' ')};
  }else{
    var variable = _variable();
    return variable;
  }
}
