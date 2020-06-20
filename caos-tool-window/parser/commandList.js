module.exports = {
  CommandList: _commandList,
}

const assert = require('assert');
const {
  CommandByName,
  PossibleCommandByName,
  Command,
  Arguments
} = require('./command.js');
const { CherryPick } = require('./common.js');
const { Condition } = require('./condition.js');
const {
  ErrorOrEof,
  Error,
  TypedError,
  Eof,
} = require('./error.js');
const { State } = require('./tokens.js');

function _commandList(start, endings, eatsEnd){
  let startCommand = null
  if (start){
   startCommand = PossibleCommandByName(start);
 }else{
   startCommand = null;
 }

  let commands = [];
  let done = false;
  do{
    if (
      endings.includes('EOF')
      && State.tokens.length === 0
    ){
      done = true;
    }else if (State.tokens.length === 0){
      commands.push(Eof('command'));
      done = true;
    }else if (endings.includes(State.tokens[0].toLowerCase())){
      done = true;
    }else if (['doif', 'elif', 'else'].includes(State.tokens[0].toLowerCase())){
      let doifElifElse = _commandList(State.tokens[0].toLowerCase(), ['elif', 'else', 'endi'], true);
      commands.push(doifElifElse);
    }else if ('reps' === State.tokens[0].toLowerCase()){
      let reps = _commandList(State.tokens[0].toLowerCase(), ['repe'], true);
      commands.push(reps);
    }else if (['enum', 'esee', 'etch', 'epas', 'econ'].includes(State.tokens[0].toLowerCase())){
      let enumeration = _commandList(State.tokens[0].toLowerCase(), ['next'], true);
      commands.push(enumeration);
    }else if (['loop'].includes(State.tokens[0].toLowerCase())){
      let loop = _commandList(State.tokens[0].toLowerCase(), ['untl', 'ever'], true);
      commands.push(loop);
    }else if (['subr'].includes(State.tokens[0].toLowerCase())){
      let subroutine = _commandList(State.tokens[0].toLowerCase(), ['retn'], true);
      commands.push(subroutine);
    }else{
      var command = Command('doesnt');
      commands.push(command);
    }
  }while(!done);

// Horribleness
  if (State.tokens.length > 0){
    if (State.tokens[0] === 'endi'){
      eatsEnd = true;
    }
  }
// Horribleness


  let endCommand = null;
  if (eatsEnd){
    if (State.tokens.length > 0){
      let endName = State.tokens[0].toLowerCase();
      endCommand = PossibleCommandByName(endName);
    }else if (endings.includes('EOF')){
      endCommand = null;
    }else{
      endCommand = Eof('command');
    }
  }else{
    endCommand = null;
  }

  return {
    type: 'command-list',
    start: startCommand,
    commands: commands,
    end: endCommand,
  };
}
