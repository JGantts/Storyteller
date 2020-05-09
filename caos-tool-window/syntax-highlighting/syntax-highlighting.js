var assert = require('assert');
$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'syntax-highlighting/syntax-highlighting-oldschool.css') );

function highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, codeIndex){
  //console.log(codeTree.type + ':' + codeTree.variant);

  var highlighted = '';

  if ('caos-file' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.inject, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;


  }else if ('event-scripts' === codeTree.type){

  }else if ('variable' === codeTree.type){
    if('va' === codeTree.variant){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
      codeIndex += codeTree.name.length;
      highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }else if(['game'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
      codeIndex += codeTree.name.length;
      highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.varname, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }else {
      //console.log(JSON.stringify(codeTree))
    }
  }else if ('command-list' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.commands.forEach((command, index) => {
      //console.log('here');
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(command, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    });
  }else if ('command' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    if (['inst'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      //console.log('here codeIndex: ' + codeIndex);
      //console.log(codeTree.name + ':' + codeTree.name.length);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
      codeIndex += codeTree.name.length;
      //console.log(codeIndex);
      highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }else if(['bhvr', 'setv'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
      assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
      codeIndex += codeTree.name.length;
      highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
      codeTree.arguments.forEach((arg, index) => {
        highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(arg, whiteSpaceList, commentList, codeText, codeIndex);
        highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
        whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
        commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
        codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
      });
    }
  }else if ('returning-command' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
    codeIndex += codeTree.name.length;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    codeTree.arguments.forEach((arg, index) => {
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(arg, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    });
  }else if ('doif-blob' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.sections.forEach((blob, index) => {
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(blob, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    });
  }else if ('flow' === codeTree.type){
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex] + ' ' + codeText.substr(codeIndex, 8));
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
    codeIndex += codeTree.name.length;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    if (highlighted_whiteSpaceList_commentList_newIndex !== null){
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }
    if (['doif', 'elif'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.conditional, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }
    if (['doif', 'elif', 'else'].includes(codeTree.variant)){
      //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.commandList, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    }
  }else if(['conditional'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    codeTree.conditional.forEach((boolOrBoolop, index) => {
      highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(boolOrBoolop, whiteSpaceList, commentList, codeText, codeIndex);
      highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
      whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
      commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
      codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    });
  }else if(['boolean'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.left, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.operator, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    highlighted_whiteSpaceList_commentList_newIndex = highlightSyntax(codeTree.right, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commentList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
  }else if(['operator'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
    codeIndex += codeTree.name.length;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
  }else if(['bool-op'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.name}</span>`;
    assert(codeTree.name === codeText.substr(codeIndex, codeTree.name.length));
    codeIndex += codeTree.name.length;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
  }else if(['number-literal'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    //console.log('here codeTree.value: ' + codeTree.value + ':' + codeTree.value.length);
    highlighted += `<span class='syntax-${codeTree.type}'>${codeTree.value}</span>`;
    assert(codeTree.value === codeText.substr(codeIndex, codeTree.value.length));
    codeIndex += codeTree.value.length;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
  }else if(['string-literal'].includes(codeTree.type)) {
    //console.log('here codeIndex: ' + codeIndex + ':' + codeText[codeIndex]);
    highlighted += `<span class='syntax-${codeTree.type}'>"${codeTree.value}"</span>`;
    assert(codeTree.value === codeText.substr(codeIndex+1, codeTree.value.length));
    codeIndex += codeTree.value.length+2;
    highlighted_whiteSpaceList_commentList_newIndex = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += highlighted_whiteSpaceList_commentList_newIndex.highlighted;
    whiteSpaceList = highlighted_whiteSpaceList_commentList_newIndex.whiteSpaceList;
    commandList = highlighted_whiteSpaceList_commentList_newIndex.commentList;
    codeIndex = highlighted_whiteSpaceList_commentList_newIndex.newIndex;
  }else{
    console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
  }
  return {
    highlighted: highlighted,
    whiteSpaceList: whiteSpaceList,
    commentList: commentList,
    newIndex: codeIndex
  };
}

function checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex){
  var highlighted = '';

  //console.log(codeIndex);
  if (/\s/.test(codeText[codeIndex])){
    whiteSpaceToAdd_newWhiteSpaceList_newIndex = addWhiteSpace(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
    highlighted += whiteSpaceToAdd_newWhiteSpaceList_newIndex.whiteSpace;
    whiteSpaceList = whiteSpaceToAdd_newWhiteSpaceList_newIndex.whiteSpaceList;
    codeIndex = whiteSpaceToAdd_newWhiteSpaceList_newIndex.newIndex;
  }else if ('*' === codeText[codeIndex]){
    commentToAdd_newCommentList_newIndex = addComment(commentList, codeText, codeIndex);
    highlighted += commentToAdd_newCommentList_newIndex.comment;
    commandList = commentToAdd_newCommentList_newIndex.commandList;
    codeIndex = commentToAdd_newCommentList_newIndex.newIndex;
  }else{

    /*console.log(codeTree.type);
    if (codeTree.type === undefined){
      console.log(JSON.stringify(codeTree));
    }
    console.log(codeText.substring(codeIndex-20, codeIndex));
    console.log(codeIndex + ':' + codeText[codeIndex]);
    console.log(codeText.substr(codeIndex, 20));*/
    return null;
  }
  var attempt = checkForWhiteSpaceAndComments(codeTree, whiteSpaceList, commentList, codeText, codeIndex);
  if (attempt !== null){
    highlighted += attempt.highlighted;
    whiteSpaceList = attempt.whiteSpaceList;
    commandList = attempt.commentList;
    codeIndex = attempt.newIndex;
  }
  return {
    highlighted: highlighted,
    whiteSpaceList: whiteSpaceList,
    commentList: commentList,
    newIndex: codeIndex
  };
}

function addWhiteSpace(codeTree, whiteSpaceList, commentList, codeText, codeIndex){
  assert(
    whiteSpaceList[0] === codeText.substr(codeIndex, whiteSpaceList[0].length),
    codeText.substr(codeIndex-2, whiteSpaceList[0].length+2)
    + '\n|\n'
    + whiteSpaceList[0].length
    + '\n|\n'
    + `'` + codeText.substr(codeIndex, whiteSpaceList[0].length) + `'`
  );
  //console.log('whitespace:|' + whiteSpaceList[0] + '|' );
  return {
    whiteSpace: whiteSpaceList[0],
    whiteSpaceList: whiteSpaceList.slice(1),
    newIndex: codeIndex + whiteSpaceList[0].length
  };
}

function addComment(commentList, codeText, codeIndex){
  assert(commentList[0] === codeText.substr(codeIndex, commentList[0].length));
  return {
    comment: `<span class='syntax-comment'>${commentList[0]}</span>`,
    commentList: commentList.slice(1),
    newIndex: codeIndex + commentList[0].length
  };
}
