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

function parseInjectEventsRemove(chunks){
  var inject_chunks = parseCommandList({}, chunks, 'scrp|rscr|EOF');
  //var events_chunks = parseEventsList(inject_chunks.chunks);
  //var remove_chunks = parseCommandList({start: 'rscr'}, events_chunks.chunks, 'EOF');
  return {inject: inject_chunks.commandBlob, events: {}, remove: {}};
}

function parseEventsList(){

}

function parseScrp(chunks){

}

function parseCommandList(begining, chunks, endings){
  var commandList = [];
  var done = false;
  do{
    if (chunks.length === 0){
      done = true;
    }else if (endings.includes(chunks[0].toLowerCase())){
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
    }else{
      console.log(chunks);
    }
  }while(!done);
  return {commands: {commandDoifBlob: commandList}, chunks: chunks};
}

function parseConditional(chunks){
  var chain = [];
  var statement = chunks[0];
  chunks = chunks.slice(1);
  var done = false;
  do{
    var boolean_chunks = parseBoolean(chunks);
    chain.push(boolean_chunks.boolean);
    var possibleBoolop_chunks = parsePossibleBoolop(boolean_chunks.chunks);
    chunks = possibleBoolop_chunks.chunks;
    if (possibleBoolop_chunks.possibleBoolop!==null){
      chain.push(possibleBoolop_chunks.possibleBoolop);
    }else{
      done = true;
    }
  }while (!done);


  return {
    conditional: {
      statement: statement,
      condition: chain
    },
    chunks: chunks
  }
}

function parseBoolean(chunks){
  var left_chunks = parseNumberOrString(chunks);
  var operator;
  if (['eq', 'ne', 'gt', 'ge', 'lt', 'le', '=', '<>', '>', '>=', '<', '<='].includes(left_chunks.chunks[0].toLowerCase())){
    operator = left_chunks.chunks[0];
  }else{
    console.log(chunks);
  }
  var right_chunks = parseNumberOrString(left_chunks.chunks.slice(1));
  return {
    boolean: {left: left_chunks.value, operator: operator, right: right_chunks.value},
    chunks: right_chunks.chunks
  }
}

function parsePossibleBoolop(chunks){
  if (['and', 'or'].includes(chunks[0].toLowerCase())){
    return {
      possibleBoolop: chunks[0], chunks: chunks.slice(1)
    };
  }
  return {
      possibleBoolop: null, chunks: chunks
  }
}

function parseCommand(chunks){
  if (['inst'].includes(chunks[0].toLowerCase())){
    return {
      command: chunks[0],
      chunks: chunks.slice(1)
    };
  }else if (['setv', 'addv'].includes(chunks[0].toLowerCase())){
    return parseSetvAddsEtc(chunks);
  }
  console.log(chunks);
}

function parseSetvAddsEtc(chunks){
  var command = chunks[0];
  var argument1_chunks = parseVariable(chunks.slice(1));
  var argument1_chunks;
  if (['setv', 'addv'].includes(command.toLowerCase())){
    argument2_chunks = parseNumber(argument1_chunks.chunks);
    return {
      command: {
        command: command,
        arguments: [argument1_chunks.variable, argument2_chunks.value]
      },
      chunks: argument2_chunks.chunks
    };
  }
  console.log(chunks);
}

function parseVariable(chunks){
  if (chunks[0][0].toLowerCase()==='v'
  && chunks[0][1].toLowerCase()==='a'
  && (chunks[0][2] >= '0' && chunks[0][2] <= '9')
  && (chunks[0][3] >= '0' && chunks[0][3] <= '9')){
    return {variable: chunks[0], chunks: chunks.slice(1)}
  }else if(['game'].includes(chunks[0].toLowerCase())){
    var string_chunks = parseString(chunks.slice(1));
    return {variable: {type: chunks[0], name: string_chunks.string}, chunks: string_chunks.chunks};
  }else if(['name'].includes(chunks[0].toLowerCase())){
    console.log(chunks);
  }else{
    return {variable: null, chunks: chunks};
  }
  console.log(chunks);
}

function parseNumber(chunks){
  if (!isNaN(chunks[0])){
    return {value: chunks[0], chunks: chunks.slice(1)};
  }else if (['rand'].includes(chunks[0].toLowerCase())){
    var leftArgument_chunks = parseNumber(chunks.slice(1));
    var rightArgument_chunks = parseNumber(leftArgument_chunks.chunks);
    return{
      value: {
        command: chunks[0],
        arguments: [leftArgument_chunks.value, rightArgument_chunks.value]
      },
      chunks: rightArgument_chunks.chunks,
    }
  }else{
    var variable_chunks = parseVariable(chunks);
    return {value: variable_chunks.variable, chunks: variable_chunks.chunks};
  }
  console.log(chunks);
}

function parseString(chunks){
  if (chunks[0][0]==='"'){
    var stringsChunks = []
    var index = 0
    while (chunks[index][chunks[index].length-1]!=='"'){
      stringsChunks.push(chunks[index]);
      index++;
    }
    stringsChunks.push(chunks[index].substring(0, chunks[index].length-1));
    return {value: stringsChunks.join(' '), chunks: chunks.slice(index+1)};
  }else{
    var variable_chunks = parseVariable(chunks);
    return {value: variable_chunks.variable, chunks: variable_chunks.chunks};
  }
  console.log(chunks);
}


function parseNumberOrString(chunks){
  var possibleNumber_chunks = parseNumber(chunks);
  if (possibleNumber_chunks.value!==null){
    return {value: possibleNumber_chunks.value, chunks: possibleNumber_chunks.chunks};
  }
  var possibleString_chunks = parseString(chunks);
  if (possibleString_chunks.value!==null){
    return {value: possibleString_chunks.value, chunks: possibleString_chunks.chunks};
  }
  console.log(chunks);
}
