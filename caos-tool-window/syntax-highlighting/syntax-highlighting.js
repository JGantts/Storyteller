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
  if (['command-list'].includes(codeTree.type)){
    codeTree.commands.forEach((command, i) => {
      highlighted += _highlightSyntax(command);
    });
  }else if ('events-list' === codeTree.type){
    highlighted += _highlightSyntax(codeTree.scrp);
    highlighted += _highlightSyntax(codeTree.family);
    highlighted += _highlightSyntax(codeTree.genus);
    highlighted += _highlightSyntax(codeTree.species);
    highlighted += _highlightSyntax(codeTree.script);
    highlighted += _highlightSyntax(codeTree.commands);
    highlighted += _highlightSyntax(codeTree.endm);
  }else if ('remove' === codeTree.type){
    highlighted += _highlightSyntax(codeTree.rscr);
    highlighted += _highlightSyntax(codeTree.commands);
  }else if ('error' === codeTree.variant){
    highlighted += `<span class='syntax-error tooltip-holder'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('end-of-file' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += `\n<span class='code-decorator tooltip-holder' contenteditable='false'>EOF<span class='tooltip'>${codeTree.message}</span></span>`;
  }else if ('variable' === codeTree.type){
    if(['ov', 'va'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
    }else if(['game'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
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
  }else if ('command-list' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.commands.forEach((command, index) => {
      //console.log('here');
      highlighted += _highlightSyntax(command);
    });
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
    codeTree.arguments.forEach((arg, index) => {
      highlighted += _highlightSyntax(arg);
    });
  }else if ('doif-blob' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.sections.forEach((blob, index) => {
      highlighted += _highlightSyntax(blob);
    });
  }else if ('loop1' === codeTree.type){
    highlighted += _highlightSyntax(codeTree.start);
    highlighted += codeTree.arguments
      .reduce((total, arg) => total + _highlightSyntax(arg), '');
    highlighted += _highlightSyntax(codeTree.commandList);
    highlighted += _highlightSyntax(codeTree.end);
  }else if ('loop2' === codeTree.type){
    highlighted += _highlightSyntax(codeTree.start);
    highlighted += _highlightSyntax(codeTree.commandList);
    highlighted += _highlightSyntax(codeTree.end);
    highlighted += codeTree.arguments
      .reduce((total, arg) => total + _highlightSyntax(arg), '');
  }else if ('flow' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex] + ' ' + codeText.substr(codeIndex, 8));
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
    if (['doif', 'elif'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += _highlightSyntax(codeTree.conditional);
    }
    if (['doif', 'elif', 'else'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += _highlightSyntax(codeTree.commandList);
    }
  }else if(['conditional'].includes(codeTree.type)) {
    if ('end-of-file' == codeTree.variant){

    }else{
      codeTree.conditional.forEach((boolOrBoolop, index) => {
        highlighted += _highlightSyntax(boolOrBoolop);
      });
    }
  }else if(['boolean'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += _highlightSyntax(codeTree.left);
    highlighted += _highlightSyntax(codeTree.operator);
    highlighted += _highlightSyntax(codeTree.right);
  }else if(['operator'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(['bool-op'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
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
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    //console.log('here codeTree.value: ' + codeTree.value + ':' + codeTree.value.length);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    assert(
      codeTree.value === codeText.substr(codeIndex, codeTree.value.length),
      codeTree.value +'|'+ codeText.substr(codeIndex, codeTree.value.length)
    );
    codeIndex += codeTree.value.length;
    highlighted += checkForWhiteSpaceAndComments();
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
  }else if(
    ['literal'].includes(codeTree.type)
    && ['string'].includes(codeTree.variant)
  ) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>"${codeTree.value}"</span>`;
    assert(
      codeTree.value === codeText.substr(codeIndex+1, codeTree.value.length),
      codeTree.value +'|'+ codeText.substr(codeIndex+1, codeTree.value.length)
    );
    skipWhitespaceInString(codeTree.value);
    codeIndex += codeTree.value.length+2;
    highlighted += checkForWhiteSpaceAndComments();
  }else if(
    ['literal'].includes(codeTree.type)
    && ['byte-string'].includes(codeTree.variant)
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
    && ['byte-string-particle'].includes(codeTree.variant)
  ) {
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    codeIndex += codeTree.value.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('number-string-variable' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += `\n<span class='code-decorator tooltip-holder' contenteditable='false'>EOF<span class='tooltip'>${codeTree.message}</span></span>`;
  }else if ('script' === codeTree.type){
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
  }else{
    console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
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

  //console.log(codeIndex);
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
  //console.log('whitespace:|' + whiteSpaceList[0] + '|' );
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
