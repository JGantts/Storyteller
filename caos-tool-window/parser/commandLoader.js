module.exports = {
  C3Commands: _c3Commands,
}

const assert = require('assert');
const fs = require('fs');

function _c3Commands(){
  //var obj = JSON.parse(fs.readFileSync('caos-tool-window/parser/commandinfo.json', 'utf8'));
  return [
    {
      'name': 'global',
      'commands': [
      //Agents
        {name: 'abba', returnType: 'number', params: []},
        {name: 'alph', returnType: 'doesnt', params: ['number', 'number']},
        {name: 'anim', returnType: 'doesnt', params: ['byte-string']},
        {name: 'anms', returnType: 'doesnt', params: ['string']},
        {name: 'attr', returnType: 'doesnt', params: ['number']},
        {name: 'attr', returnType: 'number', params: []},
        {name: 'base', returnType: 'doesnt', params: ['number']},
        {name: 'base', returnType: 'number', params: []},
        {name: 'bhvr', returnType: 'doesnt', params: ['number']},
        {name: 'bhvr', returnType: 'number', params: []},
        {name: 'call', returnType: 'doesnt', params: ['number', 'anything', 'anything']},
        {name: 'carr', returnType: 'agent', params: []},
        {name: 'cata', returnType: 'number', params: []},
        {name: 'cati', returnType: 'number', params: ['number', 'number', 'number']},
        {name: 'cato', returnType: 'doesnt', params: ['number']},
        {name: 'catx', returnType: 'string', params: ['number']},
        {name: 'clac', returnType: 'number', params: []},
        {name: 'clik', returnType: 'number', params: ['number']},
        {name: 'core', returnType: 'doesnt', params: ['number', 'number', 'number', 'number']},
        {name: 'dcor', returnType: 'doesnt', params: ['number']},
        {name: 'disq', returnType: 'number', params: ['agent']},
        {name: 'drop', returnType: 'doesnt', params: []},
        {name: 'dsee', returnType: 'doesnt', params: ['number']},
        {name: 'fltx', returnType: 'number', params: []},
        {name: 'flty', returnType: 'number', params: []},
        {name: 'fmly', returnType: 'number', params: []},
        {name: 'frat', returnType: 'doesnt', params: ['number']},
        {name: 'from', returnType: 'anything', params: []},
        {name: 'gait', returnType: 'doesnt', params: ['number']},
        {name: 'gall', returnType: 'doesnt', params: ['number']},
        {name: 'gall', returnType: 'string', params: []},
        {name: 'gnus', returnType: 'number', params: []},
        {name: 'hand', returnType: 'doesnt', params: ['string']},
        {name: 'hand', returnType: 'string', params: []},
        {name: 'held', returnType: 'agent', params: []},
        {name: 'hght', returnType: 'number', params: []},
        {name: 'iitt', returnType: 'agent', params: []},
        {name: 'imsk', returnType: 'number', params: []},
        {name: 'kill', returnType: 'doesnt', params: ['agent']},
        {name: 'mira', returnType: 'doesnt', params: ['number']},
        {name: 'mira', returnType: 'number', params: []},
        {name: 'mows', returnType: 'number', params: []},
        {name: 'mthx', returnType: 'number', params: []},
        {name: 'mthy', returnType: 'number', params: []},
        {name: 'ncls', returnType: 'agent', params: ['agent', 'number', 'number', 'number']},
        {name: 'nohh', returnType: 'doesnt', params: []},
        {name: 'null', returnType: 'agent', params: []},
        {name: 'over', returnType: 'doesnt', params: []},
        {name: 'ownr', returnType: 'agent', params: []},
        {name: 'paus', returnType: 'doesnt', params: ['number']},
        {name: 'paus', returnType: 'number', params: []},
        {name: 'pcls', returnType: 'agent', params: ['agent', 'number', 'number', 'number']},
        {name: 'plne', returnType: 'doesnt', params: ['number']},
        {name: 'plne', returnType: 'number', params: []},
        {name: 'pntr', returnType: 'agent', params: []},
        {name: 'posb', returnType: 'number', params: []},
        {name: 'pose', returnType: 'doesnt', params: ['number']},
        {name: 'pose', returnType: 'number', params: []},
        {name: 'posl', returnType: 'number', params: []},
        {name: 'posr', returnType: 'number', params: []},
        {name: 'post', returnType: 'number', params: []},
        {name: 'posx', returnType: 'number', params: []},
        {name: 'posy', returnType: 'number', params: []},
        {name: 'puhl', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'puhl', returnType: 'number', params: ['number', 'number']},
        {name: 'pupt', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'pupt', returnType: 'number', params: ['number', 'number']},
        {name: 'rnge', returnType: 'doesnt', params: ['number']},
        {name: 'rnge', returnType: 'number', params: []},
        {name: 'rtar', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'seee', returnType: 'number', params: ['agent', 'agent']},
        {name: 'show', returnType: 'doesnt', params: ['number']},
        {name: 'spcs', returnType: 'number', params: []},
        {name: 'star', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'targ', returnType: 'agent', params: []},
        {name: 'tcor', returnType: 'number', params: ['number', 'number', 'number', 'number']},
        {name: 'tick', returnType: 'doesnt', params: ['number']},
        {name: 'tick', returnType: 'number', params: []},
        {name: 'tino', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number']},
        {name: 'tint', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number']},
        {name: 'tint', returnType: 'number', params: ['number']},
        {name: 'totl', returnType: 'number', params: ['number', 'number', 'number']},
        {name: 'touc', returnType: 'number', params: ['agent', 'agent']},
        {name: 'tran', returnType: 'number', params: ['number', 'number']},
        {name: 'ttar', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'twin', returnType: 'agent', params: ['agent', 'number']},
        {name: 'ucln', returnType: 'doesnt', params: []},
        {name: 'visi', returnType: 'number', params: ['number']},
        {name: 'wdth', returnType: 'number', params: []},
        {name: 'wild', returnType: 'string', params: ['number', 'number', 'number', 'string', 'number']},
        {name: '_it_', returnType: 'agent', params: []},

      //Brain
        {name: 'adin', returnType: 'doesnt', params: ['number', 'number', 'number', 'number']},
        {name: 'doin', returnType: 'doesnt', params: ['number']},

      //Camera
      //CD Player

      //Compounds
        {name: 'fcus', returnType: 'doesnt', params: []},
        {name: 'frmt', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number', 'number', 'number']},
        {name: 'grpl', returnType: 'doesnt', params: ['number', 'number', 'number', 'number', 'number']},
        {name: 'grpv', returnType: 'doesnt', params: ['number', 'number']},
        {name: 'npgs', returnType: 'number', params: []},
        {name: 'page', returnType: 'doesnt', params: ['number']},
        {name: 'page', returnType: 'number', params: []},
        {name: 'part', returnType: 'doesnt', params: ['number']},
        {name: 'part', returnType: 'number', params: ['number']},
        {name: 'pnxt', returnType: 'number', params: ['number']},
        {name: 'ptxt', returnType: 'doesnt', params: ['string']},
        {name: 'ptxt', returnType: 'string', params: []},

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
        {name: 'caos', returnType: 'string', params: ['number', 'number', 'anything', 'anything', 'string', 'number', 'number', 'variable']},
        {name: 'inst', returnType: 'doesnt', params: []},
        {name: 'ject', returnType: 'doesnt', params: ['string', 'number']},
        {name: 'lock', returnType: 'doesnt', params: []},
        {name: 'scrx', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'slow', returnType: 'doesnt', params: []},
        {name: 'sorc', returnType: 'string', params: ['number', 'number', 'number', 'number']},
        {name: 'sorq', returnType: 'number', params: ['number', 'number', 'number', 'number']},
        {name: 'stop', returnType: 'doesnt', params: []},
        {name: 'stpt', returnType: 'doesnt', params: []},
        {name: 'unlk', returnType: 'doesnt', params: []},
        {name: 'wait', returnType: 'doesnt', params: ['number']},
      //Sounds
      //Time
      //Variables
      //Vehicles

        {name: '____', returnType: 'doesnt', params: ['____', '____']},

        {name: 'elas', returnType: 'doesnt', params: ['number']},
        {name: 'aero', returnType: 'doesnt', params: ['number']},
        {name: 'accg', returnType: 'doesnt', params: ['number']},
        {name: 'perm', returnType: 'doesnt', params: ['number']},
        {name: 'rand', returnType: 'number', params: ['number', 'number']},
        {name: 'mvto', returnType: 'doesnt', params: ['number', 'number']},
        {name: 'setv', returnType: 'doesnt', params: ['variable', 'number']},
        {name: 'sets', returnType: 'doesnt', params: ['variable', 'string']},
        {name: 'addv', returnType: 'doesnt', params: ['variable', 'number']},
        //{name: 'read', returnType: 'string', params: ['string', 'number']},
        {name: 'sndc', returnType: 'doesnt', params: ['string']},
    ]},
    {
      'name': 'brn:',
      'commands': [
        {name: 'dmpb', returnType: 'doesnt', params: []},
        {name: 'dmpd', returnType: 'doesnt', params: ['number']},
        {name: 'dmpl', returnType: 'doesnt', params: ['number']},
        {name: 'dmpn', returnType: 'doesnt', params: ['number', 'number']},
        {name: 'dmpt', returnType: 'doesnt', params: ['number']},
        {name: 'setd', returnType: 'doesnt', params: ['number', 'number', 'number', 'number']},
        {name: 'setl', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'setn', returnType: 'doesnt', params: ['number', 'number', 'number', 'number']},
        {name: 'sett', returnType: 'doesnt', params: ['number', 'number', 'number']},
    ]},
    {
      'name': 'gids',
      'commands': [
        {name: 'fmly', returnType: 'doesnt', params: ['number']},
        {name: 'gnus', returnType: 'doesnt', params: ['number', 'number']},
        {name: 'root', returnType: 'doesnt', params: []},
        {name: 'spcs', returnType: 'doesnt', params: ['number', 'number', 'number']},
    ]},
    {
      'name': 'mesg',
      'commands': [
        {name: 'writ', returnType: 'doesnt', params: ['agent', 'number']},
        {name: 'wrt+', returnType: 'doesnt', params: ['agent', 'number', 'anything', 'anything', 'number']},
    ]},
    {
      'name': 'new:',
      'commands': [
        {name: 'simp', returnType: 'doesnt', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
        {name: 'comp', returnType: 'doesnt', params: ['number', 'number', 'number', 'string', 'number', 'number', 'number']},
    ]},
    {
      'name': 'pat:',
      'commands': [
        {name: 'butt', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'byte-string', 'number', 'number']},
        {name: 'cmra', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']},
        {name: 'dull', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number']},
        {name: 'fixd', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number', 'string']},
        {name: 'grph', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number', 'number']},
        {name: 'kill', returnType: 'doesnt', params: ['number']},
        {name: 'move', returnType: 'doesnt', params: ['number', 'number', 'number']},
        {name: 'text', returnType: 'doesnt', params: ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'string']},
    ]},
  ];
}
