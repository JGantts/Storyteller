module.exports = {
  Variable: _variable,
  PossibleVariable: _possibleVariable,
}

const assert = require('assert');
const {
  Command,
  Arguments,
  PossibleCommand,
} = require('./command.js');
const {
  String,
} = require('./literal.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const { State } = require('./tokens.js');

function _variable(){
  let possibleVariable = _possibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }else{
    return ErrorOrEof('variable');
  }
}

function _possibleVariable(){
  if (State.tokens.length === 0){
    return null;
  }else if (
    State.tokens[0].length === 4
    && State.tokens[0][0].toLowerCase()==='v'
    && State.tokens[0][1].toLowerCase()==='a'
    && (State.tokens[0][2] >= '0' && State.tokens[0][2] <= '9')
    && (State.tokens[0][3] >= '0' && State.tokens[0][3] <= '9')
  ){
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    return {
      type: 'variable',
      variant: 'va',
      name: name
    }
  }else if (
    State.tokens[0].length === 4
    && State.tokens[0][0].toLowerCase()==='o'
    && State.tokens[0][1].toLowerCase()==='v'
    && (State.tokens[0][2] >= '0' && State.tokens[0][2] <= '9')
    && (State.tokens[0][3] >= '0' && State.tokens[0][3] <= '9')
  ){
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    return {
      type: 'variable',
      variant: 'ov',
      name: name
    }
  }else if (
    State.tokens[0].length === 4
    && State.tokens[0][0].toLowerCase()==='m'
    && State.tokens[0][1].toLowerCase()==='v'
    && (State.tokens[0][2] >= '0' && State.tokens[0][2] <= '9')
    && (State.tokens[0][3] >= '0' && State.tokens[0][3] <= '9')
  ){
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    return {
      type: 'variable',
      variant: 'mv',
      name: name
    }
  }else{
    let possibleCommand = PossibleCommand('variable');
    return possibleCommand;
  }
}
