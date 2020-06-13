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

  inject = _highlightSyntax(codeTreeIn.inject);
  //events = _highlightSyntax(codeTreeIn.events);
  //remove = _highlightSyntax(codeTreeIn.remove);
  assert(
    codeText.length === codeIndex,
    codeText
  );
  assert(
    whiteSpaceList.length === 0,
    whiteSpaceList
  );
  assert(
    commentList.length === 0,
    commentList
  );
  return inject ;//+ events + remove;
}

function _highlightSyntax(codeTree){
  var highlighted = '';

  highlighted += checkForWhiteSpaceAndComments();
  if (['command-list'].includes(codeTree.type)){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.commands.forEach((command, i) => {
      highlighted += _highlightSyntax(command);
    });
  }else if ('event-scripts' === codeTree.type){

  }else if ('variable' === codeTree.type){
    if('va' === codeTree.variant){
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
      highlighted += `<span class='syntax-error'>${codeTree.name}</span>`;
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
  }else if ('command' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    if (['inst'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      //console.log('here codeIndex: ' + codeIndex);
      //console.log(codeTree.name + ':' + codeTree.name.length);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      //console.log(codeIndex);
      highlighted += checkForWhiteSpaceAndComments();
    }else if (['bhvr', 'setv', 'new: simp'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
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
    }else if ('error' === codeTree.variant){
      highlighted += `<span class='syntax-error tooltip-holder'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
    }
  }else if ('returning-command' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(
      codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
      codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
    );
    codeIndex += codeTree.name.length;
    highlighted += checkForWhiteSpaceAndComments();
    codeTree.arguments.forEach((arg, index) => {
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += _highlightSyntax(arg);
    });
  }else if ('doif-blob' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.sections.forEach((blob, index) => {
      highlighted += _highlightSyntax(blob);
    });
  }else if ('flow' === codeTree.type){
    if ('error' !== codeTree.variant){
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
      if (['reps'].includes(codeTree.variant)){
        codeTree.args.forEach((arg, i) => {
          highlighted += _highlightSyntax(arg);
        });
      }
      if (['doif', 'elif', 'else', 'reps'].includes(codeTree.variant)){
        //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
        highlighted += _highlightSyntax(codeTree.commandList);
      }
    }else{
      highlighted += `<span class='syntax-error tooltip-holder'>${codeTree.name}<span class='tooltip'>${codeTree.message}</span></span>`;
      assert(
        codeTree.name === codeText.substr(codeIndex, codeTree.name.length),
        codeTree.name +'|'+ codeText.substr(codeIndex, codeTree.name.length)
      );
      codeIndex += codeTree.name.length;
      highlighted += checkForWhiteSpaceAndComments();
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
    && ['number'].includes(codeTree.variant)
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
    codeIndex += codeTree.value.length+2;
    highlighted += checkForWhiteSpaceAndComments();
  }else if ('end-of-file' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += `\n<span class='code-decorator tooltip-holder' contenteditable='false'>EOF<span class='tooltip'>${codeTree.message}</span></span>`;
  }else if ('number-string-variable' === codeTree.type){
    assert('error' === codeTree.variant);
    highlighted += `\n<span class='code-decorator tooltip-holder' contenteditable='false'>EOF<span class='tooltip'>${codeTree.message}</span></span>`;
  }else{
    console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
  }
  return highlighted;
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
  console.log(codeText.substr(codeIndex, whiteSpaceList[0].length))
  assert(
    whiteSpaceList[0] === codeText.substr(codeIndex, whiteSpaceList[0].length),
    whiteSpaceList[0].split('').map((char) => {return char.charCodeAt(0);}).join('')
    + '|'
    + codeText.substr(codeIndex, whiteSpaceList[0].length).split('').map((char) => {return char.charCodeAt(0);}).join('')
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
