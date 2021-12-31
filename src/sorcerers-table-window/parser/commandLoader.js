module.exports = {
  C3Commands: _c3Commands,
}

const assert = require('assert');
const fs = require('fs');

async function _c3Commands(){
  let namespaces = new Object();

  let commandinfoPath = (await globalThis.fileHelper.getResourcePath('commandinfo.json')).path;

  let c3In = JSON.parse(fs.readFileSync(commandinfoPath, 'utf8')).variants.c3;

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
  return namespaces;
}
