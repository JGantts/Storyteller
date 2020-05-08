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
  var done = false;
  do{
    if (chunks.length === 0){
      done = true;
    }else if (ending.includes(chunks[0].toLowerCase())){
      done = true;
    }else if ('doif' === chunks[0].toLowerCase()){
      var commands_chunks = parseDoifElifElseEndiStatements(chunks);
      commandList.push(commands_chunks.commands);
      chunks = commands_chunks.chunks;
    }else{
      var command_chunks = parseCommand(chunks);
      commandList.push(command_chunks.command);
      chunks = command_chunks.chunks;
    }
  }while(!done);
  begining.commands = commandList;
  return {commandBlob: begining, chunks: chunks};
}

function parseDoifElifElseEndiStatements(chunks){
  var commandList = [];
  var done = false;
  do{
    if ('doif' === chunks[0].toLowerCase()){
      var conditional_chunks = parseConditional(chunks);
      var commands_chunks = parseCommandList(conditional_chunks.conditional, conditional_chunks.chunks, 'elif|else|endi');
      commandList.push(commands_chunks.commandBlob);
      chunks = commands_chunks.chunks;
    }else if ('elif' === chunks[0].toLowerCase()){
      var conditional_chunks = parseConditional(chunks);
      var commands_chunks = parseCommandList(conditional_chunks.conditional, conditional_chunks.chunks, 'elif|else|endi');
      commandList.push(commands_chunks.commandBlob);
      chunks = commands_chunks.chunks;
    }else if ('else' === chunks[0].toLowerCase()){
      var commands_chunks = parseCommandList({statement: chunks[0]}, chunks.slice(1), 'endi');
      commandList.push(commands_chunks.commandBlob);
      chunks = commands_chunks.chunks;
    }else if ('endi' === chunks[0].toLowerCase()){
      chunks = chunks.slice(1);
      done = true;
    }
  }while(!done);
  return {commands: {commandDoifBlob: commandList}, chunks: chunks};
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
