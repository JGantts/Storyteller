var chunks = null;

exports.caos = (code) => {
  chunks = chunkCode(code);
  var tree = injectEventsRemove();
  return tree;
}

function chunkCode(code){
  var lines = code.split('\n');
  var linesNoComments = lines.filter((line) => {
    return line.trim()[0] !== '*';
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

function injectEventsRemove(){
  var inject = commandList('scrp|rscr|EOF');
  //var events_chunks = parseEventsList(inject_chunks.chunks);
  //var remove_chunks = parseCommandList({start: 'rscr'}, events_chunks.chunks, 'EOF');
  return {type: 'caos-file', inject: inject.commandList, events: {}, remove: {}};
}

function eventsList(){

}

function scrp(chunks){

}

function commandList(endings){
  var commandList = [];
  var done = false;
  do{
    if (chunks.length === 0){
      done = true;
    }else if (endings.includes(chunks[0].toLowerCase())){
      done = true;
    }else if ('doif' === chunks[0].toLowerCase()){
      var commands = doifElifElseEndiStatements(chunks);
      commandList.push(commands.commands);
    }else{
      var nextCommand = command();
      commandList.push(nextCommand.command);
    }
  }while(!done);
  return {commandList: {type: 'command-list', commands: commandList}};
}

function doifElifElseEndiStatements(){
  var sections = [];
  var done = false;
  do{
    if (chunks.length === 0){
      sections.push({
        type: 'end-of-file',
        variant: 'error',
        name: chunks[0],
        message: `Expected 'endi' but found end of file instead.`
      });
      chunks = chunks.slice(1);
      done = true;
    }
    else if ('doif' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      var conditional = conditional();
      var commands = commandList('elif|else|endi');
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        conditional: conditional.conditional,
        commandList: commands.commandList
      });
      chunks = commands_chunks.chunks;
    }else if ('elif' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      var conditional = conditional();
      var commands = commandList('elif|else|endi');
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        conditional: conditional.conditional,
        commandList: commands.commandList
      });
      chunks = commands_chunks.chunks;
    }else if ('else' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      var commands = commandList('endi');
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        commandList: commands.commandList
      });
      chunks = commands_chunks.chunks;
    }else if ('endi' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      sections.push({
        type: 'flow',
        variant: variant,
        name: name
      });
      chunks = chunks.slice(1);
      done = true;
    }else{
      console.log(chunks);
      assert(false);
    }
  }while(!done);
  return {commands: {type: 'doif-blob', sections: sections}};
}

function conditional(){
  if (chunks.length === 0){
    return {
      conditional: {
        type: 'end-of-file',
        variant: 'error',
        message: `Expected conditional but found end of file instead.`
      }
    }
  }
  var chain = [];
  var done = false;
  do{
    var boolean = boolean();
    chain.push(boolean.boolean);
    var possibleBoolop = possibleBoolop();
    if (possibleBoolop.possibleBoolop!==null){
      chain.push(possibleBoolop.possibleBoolop);
    }else{
      done = true;
    }
  }while (!done);

  return {
    conditional: {
      type: 'conditional',
      conditional: chain
    }
  }
}

function boolean(){
  var left = numberOrString();
  var operator = chunks[0];
  chunks = chunks.slice(1);
  var right = numberOrString();
  if (
    ['eq', 'ne', 'gt', 'ge', 'lt', 'le', '=', '<>', '>', '>=', '<', '<=']
    .includes(operator.toLowerCase())
  ){
    return {
      boolean: {
        type: 'boolean',
        left: left.value,
        operator: {
          type: 'operator',
          variant: operator.toLowerCase()
            .replace('eq', '=')
            .replace('ne', '<>')
            .replace('gt', '>')
            .replace('ge', '>=')
            .replace('lt', '<')
            .replace('le', '<='),
          name: operator},
        right: right.value
      }
    }
  }else{
    return {
      boolean: {
        type: 'boolean',
        left: left.value,
        operator: {
          type: 'operator',
          variant: 'error',
          name: operator,
          message: `Expected operator but found '${operator}'.`},
        right: right.value
      }
    }
  }
}

function possibleBoolop(){
  if (['and', 'or'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1)
    return {
      possibleBoolop: {
        type: 'bool-op',
        variant: variant,
        name: name
      }
    };
  }
  return {
      possibleBoolop: null
  }
}

function command(){
  if (['inst'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      command: {
        type: 'command',
        variant: variant,
        name: name
      }
    };
  }else if (['setv', 'addv'].includes(chunks[0].toLowerCase())){
    return setvAddsEtc();
  }else{
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      command: {
        type: 'command',
        variant: 'error',
        name: name,
        message: `Expected command but found '${name}'`
      }
    };
  }
}

function setvAddsEtc(){
  var commandName = chunks[0];
  chunks = chunks.slice(1);
  var argument1 = variable();
  if (['setv', 'addv'].includes(commandName.toLowerCase())){
    argument2 = number();
    return {
      command: {
        type: 'command',
        variant: commandName.toLowerCase(),
        name: commandName,
        arguments: [argument1.variable, argument2.value]
      }
    };
  }else{
    console.log(chunks);
    assert(false);
  }
}

function variable(){
  if (
    chunks[0][0].toLowerCase()==='v'
    && chunks[0][1].toLowerCase()==='a'
    && (chunks[0][2] >= '0' && chunks[0][2] <= '9')
    && (chunks[0][3] >= '0' && chunks[0][3] <= '9')
  ){
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      variable:
      {
        type: 'variable',
        variant: 'va',
        name: name
      }
    }
  }else if(['game'].includes(chunks[0].toLowerCase())){
    chunks = chunks.slice(1);
    var string = string();
    return {
      variable:
      {
        type: 'variable',
        variant: chunks[0].toLowerCase(),
        name: chunks[0],
        varname: string.value
      }
    };
  }else if(['name'].includes(chunks[0].toLowerCase())){
    console.log(chunks);
  }else{
    let name = chunks[0];
    chunks = chunk.slice(1);
    return {
      variable: {
        type: 'variable',
        variant: 'error',
        name: name,
      }
    };
  }
  console.log(chunks);
}

function number(){
  if (!isNaN(chunks[0])){
    let value = chunks[0];
    chunks = chunk.slice(1);
    return {value: {type: 'number-literal', value: value}};
  }else if (['rand'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    var leftArgument = number();
    var rightArgument = number();
    return{
      value: {
        type: 'returning-command',
        variant: chunks[0].toLowerCase(),
        name: chunks[0],
        arguments: [leftArgument.value, rightArgument.value]
      }
    }
  }else{
    var variable = variable();
    return {value: variable.variable};
  }
}

function string(){
  if (chunks[0][0]==='"'){
    var stringsChunks = [];
    var index = 0;
    chunks[0] = chunks[0].slice(1);
    while (chunks[index][chunks[index].length-1]!=='"'){
      stringsChunks.push(chunks[index]);
      index++;
    }
    stringsChunks.push(chunks[index].substring(0, chunks[index].length-1));
    chunks = chunks.slice(index+1);
    return {value: {type:'string-literal', value: stringsChunks.join(' ')}};
  }else{
    var variable = variable(chunks);
    return {value: variable.variable,};
  }
}

function numberOrString(){
  var possibleNumber = number();
  if (possibleNumber.value!==null){
    return {value: possibleNumber.value};
  }
  var possibleString = string();
  if (possibleString.value!==null){
    return {value: possibleString.value};
  }
  console.log(chunks);
}
