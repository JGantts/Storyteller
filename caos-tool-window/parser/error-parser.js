const assert = require('assert');
const chunks = require('./parser.js').chunks;

module.exports = {
  ErrorOrEof: _errorOrEof,
  Error: _error,
  Eof: _eof,
}

function _errorOrEof(expecting){
  if (chunks.length === 0){
    return {
      type: 'end-of-file',
      variant: 'error',
      message: `Expected ${expecting}, but found end of file instead.`
    };
  }else{
    let name = chunks[0];
    chunks = chunks.slice(1);
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
