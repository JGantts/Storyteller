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
  assert(State.tokens[0].toLowerCase() === toPick, '"' + State.tokens[0] + '|' + toPick + '"')
  let variant = State.tokens[0].toLowerCase();
  let name = State.tokens[0];
  State.tokens = State.tokens.slice(1);
  return {
    type: type,
    variant: variant,
    name: name,
  }
}
