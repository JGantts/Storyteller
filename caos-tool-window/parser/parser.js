const assert = require('assert');
const { Command } = require('./command-parser.js');
const {
  NumberOrString,
  Number,
  PossibleNumber,
  String,
  PossibleString,
} = require('./literal-parser.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error-parser.js');


module.exports = {
  Chunks: _chunks,
  Caos: _caos,
};

let chunks = null;
function _chunks(){
  return chunks;
}

function _caos(code){
  chunks = _chunkCode(code);
  var tree = _injectEventsRemove();
  return tree;
}


function _chunkCode(code){
  return code
  .split('\n')
  .filter((line) => {
    return line.trim()[0] !== '*';
  })
  .map((line) => {
    return line.replace(/\s+/g, ' ');
  })
  .map((line) => {
    return line.trim();
  })
  .filter((line) => {
    return line != '';
  })
  .join(' ')
  .split(' ');
}

function _injectEventsRemove(){
  var inject = _commandList(['scrp', 'rscr', 'EOF']);
  //var events_chunks = parseEventsList(inject_chunks.chunks);
  //var remove_chunks = parseCommandList({start: 'rscr'}, events_chunks.chunks, 'EOF');
  return {type: 'caos-file', inject: inject, events: {}, remove: {}};
}

function _eventsList(){

}

function _scrp(chunks){

}

function _commandList(endings){
  var commandList = [];
  var done = false;
  do{
    if (
      endings.includes('EOF')
      && chunks.length === 0
    ){
      done = true;
    }else if (chunks.length === 0){
      commandList.push({
        type: 'end-of-file',
        variant: 'error',
        message: `Expected command but found end of file instead.`
      });
      done = true;
    }else if (chunks[0] === ''){
      done = true;
    }else if (endings.includes(chunks[0].toLowerCase())){
      done = true;
    }else if ('doif' === chunks[0].toLowerCase()){
      var commands = _doifElifElseEndiStatements();
      commandList.push(commands);
    }else{
      var command = Command();
      commandList.push(command);
    }
  }while(!done);
  return {type: 'command-list', commands: commandList};
}

function _doifElifElseEndiStatements(){
  assert(chunks[0].toLowerCase() === 'doif')
  var sections = [];
  let variant = chunks[0].toLowerCase();
  let name = chunks[0];
  chunks = chunks.slice(1);
  var conditional = _conditional();
  var commandList = _commandList(['elif', 'else', 'endi']);
  sections.push({
    type: 'flow',
    variant: variant,
    name: name,
    conditional: conditional,
    commandList: commandList
  });
  var done = false;
  var needEndi = false;
  do{
    if (chunks.length === 0){
      sections.push({
        type: 'end-of-file',
        variant: 'error',
        message: `Expected 'endi' but found end of file instead.`
      });
      chunks = chunks.slice(1);
      done = true;
    }else if ('endi' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      sections.push({
        type: 'flow',
        variant: variant,
        name: name
      });
      chunks = chunks.slice(1);
      done = true;
    }else if (needEndi){
        let variant = 'error';
        let name = chunks[0]
        chunks = chunks.slice(1);
        var conditional = _conditional();
        var commandList = _commandList(['elif', 'else', 'endi']);
        sections.push({
          type: 'flow',
          variant: variant,
          name: name,
          message: `Expected 'endi' but found ${name} instead.`
        });
        done = true;
    }else if ('elif' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      var conditional = _conditional();
      var commandList = _commandList(['elif', 'else', 'endi']);
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        conditional: conditional,
        commandList: commandList
      });
    }else if ('else' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      //Pass fake endings so errors propogate back up to this while loop.
      var commandList = _commandList(['elif', 'else', 'endi']);
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        commandList: commandList
      });
      needEndi = true;
    }else{
      console.log(chunks);
      assert(false);
    }
  }while(!done);
  return {type: 'doif-blob', sections: sections};
}

function _conditional(){
  if (chunks.length === 0){
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
  if (chunks.length === 0){
    return _eof('boolean');
  }
  var left = _numberOrString();
  if (chunks.length === 0){
    var operator = _eof('operator');
  }else{
    var operatorName = chunks[0];
    chunks = chunks.slice(1);
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
  if (chunks.length === 0){
    return null;
  }
  if (['and', 'or'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1)
    return {
      type: 'bool-op',
      variant: variant,
      name: name
    };
  }
  return null;
}

function _variable(){
  let possibleVariable = _possibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }else{
    return _errorOrEof('variable');
  }
}

function _possibleVariable(){
  if (chunks.length === 0){
    return null;
  }else if (
    chunks[0].length === 4
    && chunks[0][0].toLowerCase()==='v'
    && chunks[0][1].toLowerCase()==='a'
    && (chunks[0][2] >= '0' && chunks[0][2] <= '9')
    && (chunks[0][3] >= '0' && chunks[0][3] <= '9')
  ){
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'variable',
      variant: 'va',
      name: name
    }
  }else if(['game'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    var string = _string();
    return {
      type: 'variable',
      variant: variant,
      name: name,
      varname: string
    };
  }else if(['name'].includes(chunks[0].toLowerCase())){
    console.log(chunks);
  }else{
    return null;
  }
}
