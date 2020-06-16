module.exports = {
  C3Commands: _c3Commands,
}

const assert = require('assert');
const fs = require('fs');

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
      commandReturnType = commandIn.type;
      if (commandReturnType === 'command'){
        commandReturnType = 'doesnt'
      }
      let commandParams = commandIn.arguments
        .map(param => param.type)
//FIX FOR TYPOS IN openc2e
        .map(type => {
          if (type === 'any'){
            return 'anything';
          }else if (type === 'bytestring'){
            return 'byte-string';
          }else{
            return type;
          }
        })
//FIX FOR TYPOS IN openc2e
        ;
      namespaces[namespaceString].push(
        {
          name: commandName,
          returnType: commandReturnType,
          params: commandParams,
        }
      );
    }
  }

  console.log(namespaces);

  return namespaces;

  return [
    {
      'name': 'global',
      'commands': [
      //Agents
        {name: 'abba', returnType: 'integer', params: []},
        {name: 'alph', returnType: 'doesnt', params: ['integer', 'integer']},
        {name: 'anim', returnType: 'doesnt', params: ['byte-string']},
        {name: 'anms', returnType: 'doesnt', params: ['string']},
        {name: 'attr', returnType: 'doesnt', params: ['integer']},
        {name: 'attr', returnType: 'integer', params: []},
        {name: 'base', returnType: 'doesnt', params: ['integer']},
        {name: 'base', returnType: 'integer', params: []},
        {name: 'bhvr', returnType: 'doesnt', params: ['integer']},
        {name: 'bhvr', returnType: 'integer', params: []},
        {name: 'call', returnType: 'doesnt', params: ['integer', 'anything', 'anything']},
        {name: 'carr', returnType: 'agent', params: []},
        {name: 'cata', returnType: 'integer', params: []},
        {name: 'cati', returnType: 'integer', params: ['integer', 'integer', 'integer']},
        {name: 'cato', returnType: 'doesnt', params: ['integer']},
        {name: 'catx', returnType: 'string', params: ['integer']},
        {name: 'clac', returnType: 'integer', params: []},
        {name: 'clik', returnType: 'integer', params: ['integer']},
        {name: 'core', returnType: 'doesnt', params: ['float', 'float', 'float', 'float']},
        {name: 'dcor', returnType: 'doesnt', params: ['integer']},
        {name: 'disq', returnType: 'float', params: ['agent']},
        {name: 'drop', returnType: 'doesnt', params: []},
        {name: 'dsee', returnType: 'doesnt', params: ['integer']},
        {name: 'fltx', returnType: 'float', params: []},
        {name: 'flty', returnType: 'float', params: []},
        {name: 'fmly', returnType: 'integer', params: []},
        {name: 'frat', returnType: 'doesnt', params: ['integer']},
        {name: 'from', returnType: 'variable', params: []},
        {name: 'gait', returnType: 'doesnt', params: ['integer']},
        {name: 'gall', returnType: 'doesnt', params: ['string', 'integer']},
        {name: 'gall', returnType: 'string', params: []},
        {name: 'gnus', returnType: 'integer', params: []},
        {name: 'hand', returnType: 'doesnt', params: ['string']},
        {name: 'hand', returnType: 'string', params: []},
        {name: 'held', returnType: 'agent', params: []},
        {name: 'hght', returnType: 'integer', params: []},
        {name: 'iitt', returnType: 'agent', params: []},
        {name: 'imsk', returnType: 'integer', params: []},
        {name: 'kill', returnType: 'doesnt', params: ['agent']},
        {name: 'mira', returnType: 'doesnt', params: ['integer']},
        {name: 'mira', returnType: 'integer', params: []},
        {name: 'mows', returnType: 'integer', params: []},
        {name: 'mthx', returnType: 'float', params: []},
        {name: 'mthy', returnType: 'float', params: []},
        {name: 'pose', returnType: 'doesnt', params: ['integer']},

      //Brain

      //Camera
      //CD Player

      //Compounds
        {name: 'fcus', returnType: 'doesnt', params: []},
        {name: 'part', returnType: 'doesnt', params: ['integer']},
        {name: 'part', returnType: 'integer', params: ['integer']},

      //Creatures
      //Debug
      //Files
      //Flow
      //Genetics
      //History
      //Input
      //Map
      //Motion
      //Net
      //Ports
      //Resources

      //Scripts
        {name: 'caos', returnType: 'string', params: ['integer', 'integer', 'anything', 'anything', 'string', 'integer', 'integer', 'variable']},
        {name: 'inst', returnType: 'doesnt', params: []},
        {name: 'ject', returnType: 'doesnt', params: ['string', 'integer']},
        {name: 'lock', returnType: 'doesnt', params: []},
        {name: 'scrx', returnType: 'doesnt', params: ['integer', 'integer', 'integer']},
        {name: 'slow', returnType: 'doesnt', params: []},
        {name: 'sorc', returnType: 'string', params: ['integer', 'integer', 'integer', 'integer']},
        {name: 'sorq', returnType: 'number', params: ['integer', 'integer', 'integer', 'integer']},
        {name: 'stop', returnType: 'doesnt', params: []},
        {name: 'stpt', returnType: 'doesnt', params: []},
        {name: 'unlk', returnType: 'doesnt', params: []},
        {name: 'wait', returnType: 'doesnt', params: ['integer']},
      //Sounds
      //Time
      //Variables
      //Vehicles

        {name: '____', returnType: 'doesnt', params: ['____', '____']},

        {name: 'elas', returnType: 'doesnt', params: ['integer']},
        {name: 'aero', returnType: 'doesnt', params: ['integer']},
        {name: 'accg', returnType: 'doesnt', params: ['float']},
        {name: 'perm', returnType: 'doesnt', params: ['integer']},
        {name: 'rand', returnType: 'integer', params: ['integer', 'integer']},
        {name: 'mvto', returnType: 'doesnt', params: ['float', 'float']},
        {name: 'setv', returnType: 'doesnt', params: ['variable', 'decimal']},
        {name: 'sets', returnType: 'doesnt', params: ['variable', 'string']},
        {name: 'addv', returnType: 'doesnt', params: ['variable', 'decimal']},
        //{name: 'read', returnType: 'string', params: ['string', 'number']},
        {name: 'sndc', returnType: 'doesnt', params: ['string']},
    ]},
    {
      'name': 'mesg',
      'commands': [
        {name: 'writ', returnType: 'doesnt', params: ['agent', 'integer']},
        {name: 'wrt+', returnType: 'doesnt', params: ['agent', 'integer', 'anything', 'anything', 'integer']},
    ]},
    {
      'name': 'new:',
      'commands': [
        {name: 'simp', returnType: 'doesnt', params: ['integer', 'integer', 'integer', 'string', 'integer', 'integer', 'integer']},
        {name: 'comp', returnType: 'doesnt', params: ['integer', 'integer', 'integer', 'string', 'integer', 'integer', 'integer']},
    ]},
    {
      'name': 'pat:',
      'commands': [
        {name: 'butt', returnType: 'doesnt', params: ['integer', 'string', 'integer', 'integer', 'decimal', 'decimal', 'integer', 'byte-string', 'integer', 'integer']},
        {name: 'cmra', returnType: 'doesnt', params: ['integer', 'string', 'integer', 'decimal', 'decimal', 'integer', 'integer', 'integer', 'integer', 'integer']},
        {name: 'dull', returnType: 'doesnt', params: ['integer', 'string', 'integer', 'decimal', 'decimal', 'integer']},
    ]},
  ];
}
