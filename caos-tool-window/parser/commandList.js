module.exports = {
  CommandList: _commandList,
}

const assert = require('assert');
const {
  Command,
  Arguments
} = require('./command.js');
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
      commandList.push(reps.startCommands);
      commandList.push(reps.end);
    }else if (['enum', 'esee', 'etch'].includes(State.tokens[0].toLowerCase())){
      var reps = _loop1(State.tokens[0], ['number', 'number', 'number'], 'next');
      commandList.push(reps.startCommands);
      commandList.push(reps.end);
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
  assert(State.tokens[0].toLowerCase() === start)
  let variant = State.tokens[0].toLowerCase();
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  var arguments = Arguments(arguments);
  var commandList = _commandList([end]);
  return {
    'startCommands': {
      type: 'flow',
      variant: variant,
      name: name,
      args: arguments,
      commandList: commandList
    },
    'end': _cherryPick(end)
  };
}

function _cherryPick(toPick){
  if (State.tokens.length === 0){
    return Eof(toPick);
  }
  assert(State.tokens[0].toLowerCase() === toPick)
  let variant = State.tokens[0].toLowerCase();
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  return {
    type: 'flow',
    variant: variant,
    name: name,
  }
}
