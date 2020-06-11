const assert = require('assert');
const { State } = require('./tokens.js');

module.exports = {
  ErrorOrEof: _errorOrEof,
  Error: _error,
  Eof: _eof,
}

function _errorOrEof(expecting){
  if (State.tokens.length === 0){
    return {
      type: 'end-of-file',
      variant: 'error',
      message: `Expected ${expecting}, but found end of file instead.`
    };
  }else{
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    return _error(expecting, name);
  }
}

function _error(expecting, foundName){
  return {
    type: expecting,
    variant: 'error',
    name: foundName,
    message: `Excpected ${expecting}, but found ${foundName} instead.`
  };
}

function _eof(expecting){
  return {
    type: 'end-of-file',
    variant: 'error',
    message: `Excpected ${expecting}, but found end of file instead.`
  };
}
