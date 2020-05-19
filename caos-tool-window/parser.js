var chunks = null;

exports.caos = (code) => {
  chunks = _chunkCode(code);
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
  .filter((line) => {
    return line != '';
  })
  .join(' ')
  .split(' ');
}

function _injectEventsRemove(){
  var inject = _commandList('scrp|rscr|EOF');
  //var events_chunks = parseEventsList(inject_chunks.chunks);
  //var remove_chunks = parseCommandList({start: 'rscr'}, events_chunks.chunks, 'EOF');
  return {type: 'caos-file', inject: inject, events: {}, remove: {}};
}

function _eventsList(){

}

function _scrp(chunks){

}

function _commandList(endings){
  var commandList = [];
  var done = false;
  do{
    if (chunks.length === 0){
      done = true;
    }else if (endings.includes(chunks[0].toLowerCase())){
      done = true;
    }else if ('doif' === chunks[0].toLowerCase()){
      var commands = _doifElifElseEndiStatements();
      commandList.push(commands);
    }else{
      var command = _command();
      commandList.push(command);
    }
  }while(!done);
  return {type: 'command-list', commands: commandList};
}

function _doifElifElseEndiStatements(){
  assert(chunks[0].toLowerCase() === 'doif')
  var sections = [];
  let variant = chunks[0].toLowerCase();
  let name = chunks[0];
  chunks = chunks.slice(1);
  var conditional = _conditional();
  var commandList = _commandList('elif|else|endi');
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
    if (chunks.length === 0){
      sections.push({
        type: 'end-of-file',
        variant: 'error',
        name: chunks[0],
        message: `Expected 'endi' but found end of file instead.`
      });
      chunks = chunks.slice(1);
      done = true;
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
    }else if (needEndi){
        let variant = 'error';
        let name = chunks[0]
        chunks = chunks.slice(1);
        var conditional = _conditional();
        var commandList = _commandList('elif|else|endi');
        sections.push({
          type: 'flow',
          variant: variant,
          name: name,
          message: `Expected 'endi' but found ${name} instead.`
        });
        done = true;
    }else if ('elif' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      var conditional = _conditional();
      var commandList = _commandList('elif|else|endi');
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        conditional: conditional,
        commandList: commandList
      });
    }else if ('else' === chunks[0].toLowerCase()){
      let variant = chunks[0].toLowerCase();
      let name = chunks[0];
      chunks = chunks.slice(1);
      //Pass fake endings so errors propogate back up to this while loop.
      var commandList = _commandList('elif|else|endi');
      sections.push({
        type: 'flow',
        variant: variant,
        name: name,
        commandList: commandList
      });
      needEndi = true;
    }else{
      console.log(chunks);
      assert(false);
    }
  }while(!done);
  return {type: 'doif-blob', sections: sections};
}

function _conditional(){
  if (chunks.length === 0){
    return {
      type: 'end-of-file',
      variant: 'error',
      message: `Expected conditional but found end of file instead.`
    }
  }
  var chain = [];
  var done = false;
  do{
    var boolean = _boolean();
    chain.push(boolean);
    var possibleBoolop = _possibleBoolop();
    if (possibleBoolop){
      chain.push(possibleBoolop);
    }else{
      done = true;
    }
  }while (!done);

  return {
    type: 'conditional',
    conditional: chain
  }
}

function _boolean(){
  var left = _numberOrString();
  var operator = chunks[0];
  chunks = chunks.slice(1);
  var right = _numberOrString();
  if (
    ['eq', 'ne', 'gt', 'ge', 'lt', 'le', '=', '<>', '>', '>=', '<', '<=']
    .includes(operator.toLowerCase())
  ){
    return {
      type: 'boolean',
      left: left,
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
      right: right
    };
  }else{
    return {
      type: 'boolean',
      left: left,
      operator: {
        type: 'operator',
        variant: 'error',
        name: operator,
        message: `Expected operator but found '${operator}'.`},
      right: right
    };
  }
}

function _possibleBoolop(){
  if (['and', 'or'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1)
    return {
      type: 'bool-op',
      variant: variant,
      name: name
    };
  }
  return null;
}

function _command(){
  if (['inst'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'command',
      variant: variant,
      name: name
    };
  }else if (['setv', 'addv'].includes(chunks[0].toLowerCase())){
    return _setvAddsEtc();
  }else{
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'command',
      variant: 'error',
      name: name,
      message: `Expected command but found '${name}'`
    };
  }
}

function _setvAddsEtc(){
  var commandName = chunks[0];
  chunks = chunks.slice(1);
  var argument1 = _variable();
  if (['setv', 'addv'].includes(commandName.toLowerCase())){
    argument2 = _number();
    return {
      type: 'command',
      variant: commandName.toLowerCase(),
      name: commandName,
      arguments: [argument1, argument2]
    };
  }else{
    console.log(chunks);
    assert(false);
  }
}

function _numberOrString(){
  var possibleNumber = _possibleNumber();
  if (possibleNumber){
    return possibleNumber;
  }
  var possibleString = _possibleString();
  if (possibleString){
    return possibleString;
  }
  var possibleVariable = _possibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }
  let name = chunks[0];
  chunks = chunks.slice(1);
  return {
    type: 'number-string-variable',
    variant: 'error',
    name: name,
    message: `Excpected number, string, or variable, but found ${name} instead.`
  };
}

function _variable(){
  let possibleVariable = _possibleVariable();
  if (possibleVariable){
    return possibleVariable;
  }else{
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'variable',
      variant: 'error',
      name: name,
      message: `Excpected variable, but found ${name} instead.`
    };
  }
}

function _possibleVariable(){
  if (
    chunks[0][0].toLowerCase()==='v'
    && chunks[0][1].toLowerCase()==='a'
    && (chunks[0][2] >= '0' && chunks[0][2] <= '9')
    && (chunks[0][3] >= '0' && chunks[0][3] <= '9')
  ){
    let name = chunks[0];
    chunks = chunks.slice(1);
    return {
      type: 'variable',
      variant: 'va',
      name: name
    }
  }else if(['game'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    var string = _string();
    return {
      type: 'variable',
      variant: variant,
      name: name,
      varname: string
    };
  }else if(['name'].includes(chunks[0].toLowerCase())){
    console.log(chunks);
  }else{
    return null;
  }
}

function _number(){
  let possibleNumber = _possibleNumber();
  if (possibleNumber){
    return possibleNumber;
  }else{
    return {
      type: 'number',
      variant: 'error',
      name: ''
    };
  }
}

function _possibleNumber(){
  if (!isNaN(chunks[0])){
    let value = chunks[0];
    chunks = chunks.slice(1);
    return {type: 'number-literal', value: value};
  }else if (['rand'].includes(chunks[0].toLowerCase())){
    let variant = chunks[0].toLowerCase();
    let name = chunks[0];
    chunks = chunks.slice(1);
    var leftArgument = _number();
    var rightArgument = _number();
    return {
      type: 'returning-command',
      variant: variant,
      name: name,
      arguments: [leftArgument, rightArgument]
    }
  }else{
    var variable = _variable();
    return variable;
  }
}

function _string(){
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
    return {type:'string-literal', value: stringsChunks.join(' ')};
  }else{
    var variable = _variable();
    return variable;
  }
}
