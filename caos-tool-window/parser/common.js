module.exports = {
  CherryPick: _cherryPick,
}

const { State } = require('./tokens.js');
const {
  ErrorOrEof,
  Error,
  Eof,
} = require('./error.js');

function _cherryPick(type, toPick){
  if (State.tokens.length === 0){
    return Eof(toPick);
  }
  let name = State.tokens[0];
  let variant = State.tokens[0].toLowerCase();
  State.tokens = State.tokens.slice(1);
  if (variant === toPick){
    return {
      type: type,
      variant: variant,
      name: name,
    }
  }else{
    Error(toPick, name);
  }
}
