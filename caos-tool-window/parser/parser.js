const assert = require('assert');
const { CommandList } = require('./commandList.js');
const { State } = require('./tokens.js');

function _caos(code){
  State.tokens = _chunkCode(code);
  var tree = _injectEventsRemove();
  return tree;
}

module.exports = {
  Caos: _caos,
};

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
  var inject = CommandList(['scrp', 'rscr', 'EOF']);
  //var events_State.tokens = parseEventsList(inject_State.tokens.State.tokens);
  //var remove_State.tokens = parseCommandList({start: 'rscr'}, events_State.tokens.State.tokens, 'EOF');
  return {type: 'caos-file', inject: inject, events: {}, remove: {}};
}

function _eventsList(){

}

function _scrp(){

}
