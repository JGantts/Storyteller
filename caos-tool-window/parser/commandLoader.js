module.exports = {
  C3Commands: _c3Commands,
}

const assert = require('assert');
const fs = require('fs');

const handledCommands = [
  'doif',
  'elif',
  'else',
  'endi',
  'scrp',
  'endm',
//'gsub',
  'subr',
  'reps',
  'repe',
  'enum',
  'econ',
  'epas',
  'etch',
  //'next',
]

function _c3Commands(){
  let namespaces = [];

  let c3In = JSON.parse(fs.readFileSync('caos-tool-window/parser/commandinfo.json', 'utf8')).variants.c3;

  for (var key in c3In) {
    if (c3In.hasOwnProperty(key)) {
      let commandIn = c3In[key];
      let namespaceString = commandIn.namespace;
      if (!namespaceString){
        namespaceString = 'global';
      }
      if (!(namespaceString in namespaces)){
        namespaces[namespaceString] = [];
      }
      let commandName = commandIn.match.toLowerCase();
      if (!handledCommands.includes(commandName)){
        commandReturnType = commandIn.type;
        if (commandReturnType === 'command'){
          commandReturnType = 'doesnt'
        }
        let commandParams = commandIn.arguments
          .map(param => param.type);
        namespaces[namespaceString].push(
          {
            name: commandName,
            returnType: commandReturnType,
            params: commandParams,
          }
        );
      }
    }
  }
  //console.log(namespaces);
  return namespaces;
}
