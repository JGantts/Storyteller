const assert = require('assert');
const {
  NumberOrString,
  Number,
  PossibleNumber,
  String,
  PossibleString,
} = require('./literal.js');
const { State } = require('./tokens.js');

module.exports = {
  Conditional: _conditional,
  //Boolean: _boolean,
  //PossibleBoolop: _possibleBoolop,
}

function _conditional(){
  if (State.tokens.length === 0){
    return {
      type: 'end-of-file',
      variant: 'error',
      message: `Expected conditional but found end of file instead.`
    }
  }
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
  var left = NumberOrString();
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
  var right = NumberOrString();
  if (left.variant === right.variant){
    return {
      type: 'boolean',
      variant: left.variant,
      left: left,
      operator: operator,
      right: right
    };
  }else{
    return {
      type: 'boolean',
      variant: 'error',
      left: left,
      operator: operator,
      right: right,
      message: `Cannot compare ${left.name}, which is a ${left.variant}, with ${right.name}, which is a ${right.variant}.`
    };
  }
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