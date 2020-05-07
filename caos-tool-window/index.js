$.getScript('../engine-api/CAOS.js');

function injectUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function parseText(){
  var code = $('#caos-user-code').val();

  chunks = chunkCode(code);

  var tree = parseInjectEventsRemove(chunks);

  $('#inprocessParse').text(JSON.stringify(tree));
}

function parseInjectEventsRemove(chunks){
  var inject_chunks = parseCommandList({}, chunks, 'scrp|rscr|EOF');
  $('#inprocessParse').text(JSON.stringify(inject_chunks));
  var events_chunks = parseEventsList(inject_chunks.chunks);
  $('#inprocessParse').text(JSON.stringify(events_chunks));
  var remove_chunks = parseCommandList({start: 'rscr'}, events_chunks.chunks, 'EOF');
  $('#inprocessParse').text(JSON.stringify(remove_chunks));
  return {inject: inject_chunks.commands, events: events_chunks.events, remove: remove_chunks.commands};
}

function parseEventsList(){

}

function parseScrp(chunks){

}

function parseCommandList(begining, chunks, ending){
  var commandList = [];
  do{
    if ('doif' === chunks[0].toLowerCase()){
      var conditional_chunks = parseConditional(chunks);
      var commands_chunks = parseCommandList(conditional_chunks.conditional, conditional_chunks.chunks, 'endi');
      commandList.push(commands_chunks.commands);
      chunks = commands_chunks.chunks;
    }else if ('elif' === chunks[0].toLowerCase()) {
      var conditional_chunks = parseConditional(chunks);
      var commands_chunks = parseCommandList(conditional_chunks.conditional, conditional_chunks.chunks);
      commandList.push(commands_chunks.commands);
      chunks = commands_chunks.chunks;
    }else{
      var command_chunks = parseCommand(chunks);
      commandList.push(command_chunks.command);
      chunks = command_chunks.chunks;
    }
  }while(
    chunks.length!=0
    && (chunks[0].toLowerCase()!==ending)
    && !(ending==='scrp|rscr|EOF' && (chunks[0]==='scrp'||chunks[0]==='rscr'))
  );
  begining.commands = commandList;
  return {commands: begining, chunks: chunks};
}

function parseConditional(chunks){
  return {
    conditional: {
      statement: chunks[0],
      condition: {
        left: chunks[1],
        operator: chunks[2],
        right: chunks[3]
      }
    },
    chunks: chunks.slice(4)
  }
}

function parseCommand(chunks){
  return {
    command: {
      command: chunks[0],
      arguments: [chunks[1], chunks[2]]
    },
    chunks: chunks.slice(3)
  }
}



function chunkCode(code){
  var lines = code.split('\n');
  var linesNoComments = lines.filter((line) => {
    return line[0] !== '*';
  });
  var linesReducedWhitespace = linesNoComments.map((line) => {
    return line.replace(/\s+/g, ' ');
  });
  var linesRemovedInitialFinalWhitespace = linesReducedWhitespace.map((line) => {
    return line.trim();
  });

  var linesRemovedBlanks = linesRemovedInitialFinalWhitespace.filter((line) => {
    return line != '';
  });

  var chunksJoined = linesRemovedBlanks.join(' ');
  return chunksJoined.split(' ');
}
