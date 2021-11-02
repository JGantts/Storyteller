module.exports = {
  CheckCode: checkCode,
}

const{
  GetCaretPositionWithin,
  SetCaretPositionWithin,
  GetVisibleTextInElement,
  GetNodesInRange,
} = require('./html-editing-helper.js');

function checkCode(codeElement, codeText, caretPosition){
  $('#inprocessParse').text('');
  $('#highlighted').text('');

  var whiteSpaceList =
    codeText
    .split('\n')
    .map((chunk) => {
      var astIndex = chunk.indexOf('*');
      if (astIndex === -1){
        return chunk;
      }else if(astIndex === 0){
        return '*';
      }else{
        return chunk.slice(0, astIndex+1);
      }
    })
    .filter((chunk) => {return chunk!==null;})
    .join('\n')
    .match(/\s+/g);

  var whiteSpaceList = whiteSpaceList ? whiteSpaceList : [];

  var commentList =
    codeText
    .split('\n')
    .filter((line) => {return _leftTrim(line)[0]==='*'})
    .map((line) => {return _leftTrim(line)});

  var codeTree = Caos(codeText);

  //$('#inprocessParse').text(JSON.stringify(codeTree));

  var highlighted = highlighter.highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, 0);

  //$('#highlighted').text(highlighted);

  codeElement.innerHTML = highlighted;
  SetCaretPositionWithin(codeElement, caretPosition);
}

function _leftTrim(str) {
  return str.replace(/^\s+/g, '');
}
