module.exports = {
  Conditional: _conditional,
}

const assert = require('assert');
const {
  PossibleCommand,
  Command,
  Arguments
} = require('./command.js');
const {
  CheckForEof,
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const {
  Integer,
  PossibleInteger,
  Float,
  PossibleFloat,
  String,
  PossibleString,
  ByteString,
  PossibleByteString,
} = require('./literal.js');
const { PossibleVariable, Variable } = require('./variable.js');
const { State } = require('./tokens.js');

function _conditional(){
  let possibleEof = CheckForEof('conditional');
  if (possibleEof){ return possibleEof; }
  var chain = [];
  var done = false;
  do{
    var boolean = _boolean();
    chain.push(boolean);
    var possibleBoolop = _possibleBoolop();
    if (possibleBoolop){
      chain.push(possibleBoolop);
    }else{
      done = true;
    }
  }while (!done);

  return {
    type: 'conditional',
    conditional: chain
  }
}

function _boolean(){
  if (State.tokens.length === 0){
    return Eof('boolean');
  }
  var left = _numberOrStringOrAgent();
  if (State.tokens.length === 0){
    var operator = Eof('operator');
  }else{
    var operatorName = State.tokens[0];
    State.tokens = State.tokens.slice(1);
    if (
      ['eq', 'ne', 'gt', 'ge', 'lt', 'le', '=', '<>', '>', '>=', '<', '<=']
      .includes(operatorName.toLowerCase())
    ){
      var operator = {
        type: 'operator',
        variant: operatorName.toLowerCase()
          .replace('eq', '=')
          .replace('ne', '<>')
          .replace('gt', '>')
          .replace('ge', '>=')
          .replace('lt', '<')
          .replace('le', '<='),
        name: operatorName
      };
    }else{
      var operator = Error('operator', operatorName);
    }
  }
  var right = _numberOrStringOrAgent();
  if (
    left.type === 'literal'
    && right.type === 'literal'
    && left.variant !== right.variant
  ){
    message = `Cannot compare ${left.name}, which is a ${left.variant}, with ${right.name}, which is a ${right.variant}.`
    operator = _operatorToError(operator, message);
  }
  return {
    type: 'boolean',
    variant: left.variant,
    left: left,
    operator: operator,
    right: right
  };
}

function _numberOrStringOrAgent(){
  var possible = PossibleInteger();
  if (possible){ return possible; }
  var possible = PossibleFloat();
  if (possible){ return possible; }
  possible = PossibleString();
  if (possible){ return possible; }
  possible = PossibleVariable();
  if (possible){ return possible; }
  possible = PossibleCommand('string');
  if (possible){ return possible; }
  possible = PossibleCommand('integer');
  if (possible){ return possible; }
  possible = PossibleCommand('float');
  if (possible){ return possible; }
  possible = PossibleCommand('agent');
  if (possible){ return possible; }
  let name = State.tokens[0];
  console.log(State.tokens);
  State.tokens = State.tokens.slice(1);
  return Error('number-string-variable', name);
}

function _possibleBoolop(){
  if (State.tokens.length === 0){
    return null;
  }
  if (['and', 'or'].includes(State.tokens[0].toLowerCase())){
    let variant = State.tokens[0].toLowerCase();
    let name = State.tokens[0];
    State.tokens = State.tokens.slice(1)
    return {
      type: 'bool-op',
      variant: variant,
      name: name
    };
  }
  return null;
}

function _operatorToError(operator, message){
  assert(false);
  return {
    type: operator.type,
    variant: 'error',
    name: operator.name,
    message: message
  };
}
