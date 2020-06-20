const assert = require('assert');
var whiteSpaceList = null;
var commentList = null;
var codeText = null;
var codeIndex = null;


exports.highlightSyntax = (codeTreeIn, whiteSpaceListIn, commentListIn, codeTextIn, codeIndexIn) => {
  assert('caos-file' === codeTreeIn.type);
  whiteSpaceList = whiteSpaceListIn;
  commentList = commentListIn;
  codeText = codeTextIn;
  codeIndex = codeIndexIn;

  var highlighted =
    _highlightSyntax(codeTreeIn.inject)
    + checkForWhiteSpaceAndComments();
  highlighted += codeTreeIn.eventScripts
    .reduce((sum, event) =>
      {
        return sum +=
          _highlightSyntax(event)
          + checkForWhiteSpaceAndComments();
      },
      ''
    );
  if (codeTreeIn.remove){
    highlighted +=
      _highlightSyntax(codeTreeIn.remove)
      + checkForWhiteSpaceAndComments();
  }
  assert(
    codeText.length === codeIndex,
    `${codeText.length}|${codeIndex}`
    + codeText + highlighted
  );
  assert(
    whiteSpaceList.length === 0,
    whiteSpaceList
  );
  assert(
    commentList.length === 0,
    commentList
  );
  return highlighted;
}

function _highlightSyntax(codeTree){
  var highlighted = '';

  highlighted += checkForWhiteSpaceAndComments();
  if (codeTree === null){
    return highlighted;
  }else if (Array.isArray(codeTree)){
    codeTree.forEach((element, i) => {
      highlighted += _highlightSyntax(element);
    });
  }else if (['command-list'].includes(codeTree.type)){
    highlighted += _highlightSyntax(codeTree.start);
    codeTree.commands.forEach((command, i) => {
      highlighted += _highlightSyntax(command);
    });
    highlighted += _highlightSyntax(codeTree.end);
  }else if ('end-of-file' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += ` <span class='code-decorator tooltip-holder' contenteditable='false'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
  }else if ('error' === codeTree.variant){
    highlighted += `<span class='syntax-error tooltip-holder' contenteditable='false'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('variable' === codeTree.type){
    if(['ov', 'va', 'mv'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
    }else if(['game', 'name'].includes(codeTree.variant)){
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
      highlighted += _highlightSyntax(codeTree.varname);
    }else {
      highlighted += `<span class='syntax-error tooltip-holder'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
    }
  }else if ('returning-namespace' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('namespaced-command' === codeTree.type){
    highlighted += _highlightSyntax(codeTree.namespace);
    highlighted += _highlightSyntax(codeTree.command);
  }else if ('namespace' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if (['command', 'returning-command'].includes(codeTree.type)){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
    if (codeTree.arguments.filter(arg => arg.value === '\"').length === 1){
      console.log(codeTree);
    }
    codeTree.arguments.forEach((arg, index) => {
      highlighted += _highlightSyntax(arg);
    });
  }else if(['conditional'].includes(codeTree.type)) {
    if ('end-of-file' == codeTree.variant){

    }else{
      codeTree.conditional.forEach((boolOrBoolop, index) => {
        highlighted += _highlightSyntax(boolOrBoolop);
      });
    }
  }else if(['boolean'].includes(codeTree.type)) {
    highlighted += _highlightSyntax(codeTree.left);
    highlighted += _highlightSyntax(codeTree.operator);
    highlighted += _highlightSyntax(codeTree.right);
  }else if(['operator'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(['bool-op'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(
    ['literal'].includes(codeTree.type)
    && ['integer', 'float'].includes(codeTree.variant)
  ) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    assert(
      codeTree.value === codeText.substr(codeIndex, codeTree.value.length),
      codeTree.value +'|'+ codeText.substr(codeIndex, codeTree.value.length)
    );
    codeIndex += codeTree.value.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(
    ['literal'].includes(codeTree.type)
    && ['string'].includes(codeTree.variant)
  ) {
    highlighted += `<span class='syntax-${codeTree.type}'>"${
      codeTree.value
        /*.replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')*/
    }"</span>`;
    assert(
      codeTree.value === codeText.substr(codeIndex+1, codeTree.value.length),
      codeTree.value +'|'+ codeText.substr(codeIndex+1, codeTree.value.length)
      + '|' + JSON.stringify(codeTree) + '|' + codeText.substr(codeIndex, 100)
    );
    skipWhitespaceInString(codeTree.value);
    codeIndex += codeTree.value.length+2;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring'].includes(codeTree.variant)
  ) {
    highlighted += `<span class='syntax-${codeTree.type}'>[</span>`;
    codeIndex += 1;
    highlighted += checkForWhiteSpaceAndComments();
    highlighted += codeTree.particles
      .reduce((total, particle) => total + _highlightSyntax(particle), '');
    highlighted += `<span class='syntax-${codeTree.type}'>]</span>`;
    codeIndex += 1;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(
    ['literal'].includes(codeTree.type)
    && ['bytestring-particle'].includes(codeTree.variant)
  ) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    codeIndex += codeTree.value.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('number-string-variable' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += `\n<span class='code-decorator tooltip-holder' contenteditable='false'>EOF<span class='tooltip'>${codeTree.message}</span></span>`;
  }else if (['label'].includes(codeTree.type)) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else{
    console.log(codeTree);
    assert(false);
  }
  return highlighted;
}

function skipWhitespaceInString(stringIn){
  let whitespaceInString = stringIn.match(/\s+/g);
  let toSkip = 0;
  if (whitespaceInString){
    toSkip = whitespaceInString.length;
  }
  whiteSpaceList = whiteSpaceList.slice(toSkip);
}

function checkForWhiteSpaceAndComments(){
  var highlighted = '';

  if (/\s/.test(codeText[codeIndex])){
    highlighted += addWhiteSpace();
  }else if ('*' === codeText[codeIndex]){
    highlighted += addComment();
  }else{
    return '';
  }
  highlighted += checkForWhiteSpaceAndComments();
  return highlighted;
}

function addWhiteSpace(){
  assert(
    whiteSpaceList[0] === codeText.substr(codeIndex, whiteSpaceList[0].length),
    whiteSpaceList[0].split('').map((char) => {return char.charCodeAt(0);}).join('')
    + '|'
    + codeText.substr(codeIndex, whiteSpaceList[0].length).split('').map((char) => {return char.charCodeAt(0);}).join('')
    + `code: '${codeText.substr(codeIndex-1, whiteSpaceList[0].length+2)}'`
  );
  let whiteSpaceToAdd = whiteSpaceList[0];
  whiteSpaceList = whiteSpaceList.slice(1);
  codeIndex += whiteSpaceToAdd.length;
  whiteSpaceToAdd = whiteSpaceToAdd.replace(/\x20/g, '&nbsp;')
  return `<span class='syntax-whitespace'>${whiteSpaceToAdd}</span>`;
}

function addComment(){
  assert(
    commentList[0] === codeText.substr(codeIndex, commentList[0].length),
    commentList[0] +'|'+ codeText.substr(codeIndex, commentList[0].length)
  );
  let commentToAdd = commentList[0];
  commentList = commentList.slice(1);
  codeIndex += commentToAdd.length;
  return `<span class='syntax-comment'>${commentToAdd}</span>`;
}
