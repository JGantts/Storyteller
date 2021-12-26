module.exports = {
  Condition: _condition,
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

function _condition(){
  let possibleEof = CheckForEof('condition');
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
    type: 'condition',
    condition: chain
  }
}

function _boolean(){
  if (State.tokens.length === 0){
    return Eof('boolean');
  }
  var left = Arguments(['anything'])[0];
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
  var right = Arguments(['anything'])[0];
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
    variant: 'boolean',
    left: left,
    operator: operator,
    right: right
  };
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
