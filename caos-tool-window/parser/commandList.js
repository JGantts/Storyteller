module.exports = {
  CommandList: _commandList,
}

const assert = require('assert');
const {
  Command,
  Arguments
} = require('./command.js');
const { CherryPick } = require('./common.js');
const { Conditional } = require('./conditional.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');
const { State } = require('./tokens.js');

function _commandList(endings){
  var commandList = [];
  var done = false;
  do{
    if (
      endings.includes('EOF')
      && State.tokens.length === 0
    ){
      done = true;
    }else if (State.tokens.length === 0){
      commandList.push({
        type: 'end-of-file',
        variant: 'error',
        message: `Expected command but found end of file instead.`
      });
      done = true;
    }else if (State.tokens[0] === ''){
      done = true;
    }else if (endings.includes(State.tokens[0].toLowerCase())){
      done = true;
    }else if ('doif' === State.tokens[0].toLowerCase()){
      var commands = _doifElifElseEndiStatements();
      commandList.push(commands);
    }else if ('reps' === State.tokens[0].toLowerCase()){
      var reps = _loop1('reps', ['number'], 'repe');
      commandList.push(reps);
    }else if (['enum', 'esee', 'etch'].includes(State.tokens[0].toLowerCase())){
      var enumeration = _loop1(State.tokens[0], ['number', 'number', 'number'], 'next');
      commandList.push(enumeration);
    }else if (['loop'].includes(State.tokens[0].toLowerCase())){
      var loop = _loop2(State.tokens[0], ['untl', 'ever'], [['condition'], []]);
      commandList.push(loop);
    }else{
      var command = Command('doesnt');
      commandList.push(command);
    }
  }while(!done);
  return {type: 'command-list', commands: commandList};
}

function _doifElifElseEndiStatements(){
  assert(State.tokens[0].toLowerCase() === 'doif')
  var sections = [];
  let variant = State.tokens[0].toLowerCase();
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  var conditional = Conditional();
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
    if (State.tokens.length === 0){
      sections.push({
        type: 'end-of-file',
        variant: 'error',
        message: `Expected 'endi' but found end of file instead.`
      });
      State.tokens = State.tokens.slice(1);
      done = true;
    }else if ('endi' === State.tokens[0].toLowerCase()){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      sections.push({
        type: 'flow',
        variant: variant,
        name: name
      });
      State.tokens = State.tokens.slice(1);
      done = true;
    }else if (needEndi){
        let variant = 'error';
        let name = State.tokens[0]
        State.tokens = State.tokens.slice(1);
        var conditional = Conditional();
        var commandList = _commandList(['elif', 'else', 'endi']);
        sections.push({
          type: 'flow',
          variant: variant,
          name: name,
          message: `Expected 'endi' but found ${name} instead.`
        });
        done = true;
    }else if ('elif' === State.tokens[0].toLowerCase()){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
      var conditional = Conditional();
      var commandList = _commandList(['elif', 'else', 'endi']);
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        conditional: conditional,
        commandList: commandList
      });
    }else if ('else' === State.tokens[0].toLowerCase()){
      let variant = State.tokens[0].toLowerCase();
      let name = State.tokens[0];
      State.tokens = State.tokens.slice(1);
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
      console.log(State.tokens);
      assert(false);
    }
  }while(!done);
  return {type: 'doif-blob', sections: sections};
}

function _loop1(start, arguments, end){
  return {
    type: 'loop1',
    start: CherryPick('flow', start),
    arguments: Arguments(arguments),
    commandList: _commandList([end]),
    end: CherryPick('flow', end),
  };
}

function _loop2(start, ends, arguments){
  var start = CherryPick('flow', start);
  var commandList = _commandList(ends);
  assert(ends[0] === 'untl');
  assert(ends[1] === 'ever');
  var endString = State.tokens[0];
  var end = CherryPick('flow', endString);
  var arguments = Arguments(arguments[ends.indexOf(endString.toLowerCase())]);
  return {
    type: 'loop2',
    start: start,
    commandList: commandList,
    end: end,
    arguments: arguments,
  };
}
