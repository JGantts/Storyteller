module.exports = {
  Conditional: _conditional,
}

const assert = require('assert');
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
    return _eof('boolean');
  }
  var left = _numberOrString();
  if (State.tokens.length === 0){
    var operator = _eof('operator');
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
      var operator = _error('operator', operatorName);
    }
  }
  var right = _numberOrString();
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

function _numberOrString(){
  var possibleNumber = PossibleInteger();
  if (possibleNumber){
    return possibleNumber;
  }
  var possibleString = PossibleString();
  if (possibleString){
    return possibleString;
  }
  var possibleVariable = PossibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }
  let name = State.tokens[0];
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
  return {
    type: operator.type,
    variant: 'error',
    name: operator.name,
    message: message
  };
}
