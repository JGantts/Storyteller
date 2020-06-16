module.exports = {
  Caos: _caos,
};

const assert = require('assert');
const { CommandList } = require('./commandList.js');
const { CherryPick } = require('./common.js');
const { Integer } = require('./literal.js');
const { State } = require('./tokens.js');

function _caos(code){
  State.tokens = _chunkCode(code);
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
  .join(' ')
  .split(' ')
  .filter((line) => {
    return line != '';
  });
}

function _injectEventsRemove(){
  var inject = CommandList(['scrp', 'rscr', 'EOF']);
  var eventScripts = _eventsList();
  var remove = _rscr();
  return {type: 'caos-file', inject: inject, eventScripts: eventScripts, remove: remove};
}

function _eventsList(){
  eventScripts = [];
  while (
    State.tokens.length > 0
    && 'rscr' !== State.tokens[0].toLowerCase()
  ){
    var scrp = CherryPick('script', 'scrp');
    var family = Integer();
    var genus = Integer();
    var species = Integer();
    var script = Integer();
    var commands = CommandList(['endm']);
    var endm = CherryPick('script', 'endm')
    eventScripts.push({
      type: 'events-list',
      scrp: scrp,
      family: family,
      genus: genus,
      species: species,
      script: script,
      commands: commands,
      endm: endm
    });
  }
  return eventScripts;
}

function _rscr(){
  if (State.tokens.length > 0){
    var rscr = CherryPick('script', 'rscr');
    return {
      type: 'remove',
      rscr: rscr,
      commands: CommandList(['EOF'])
    };
  }else{
    return null;
  }

}
