$.getScript('../engine-api/CAOS.js');
const parser = require('./parser.js');
const highlighter = require('./syntax-highlighting/syntax-highlighting.js')

function injectUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').innerText;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function userTextChanged(){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = getVisibleTextInElement(codeElement);
  var caretPosition = getCaretPositionWithin(codeElement);

  var lines = codeText.split('\n');

  var whiteSpaceList = lines.map((chunk) => {
    var astIndex = chunk.indexOf('*');
    if (astIndex === -1){
      return chunk;
    }else if(astIndex === 0){
      return '*';
    }else{
      return chunk.slice(0, astIndex+1);
    }
  }).filter((chunk) => {return chunk!==null;})
  .join('\n')
  .match(/\s+/g);

  //var whiteSpaceList;

  var commentList =
    codeText
    .split('\n')
    .filter((line) => {return leftTrim(line)[0]==='*'})
    .map((line) => {return leftTrim(line)});

  //console.log(whiteSpaceList);
  //console.log(commentList);

  var codeTree = parser.caos(codeText);
  $('#inprocessParse').text(JSON.stringify(codeTree));


  var highlighted = highlighter.highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, 0);

  if (highlighted === ''){
    highlighted = '<span class="syntax-blankfile"> </span>'
  }

  var highlightedHtml =
    highlighted
    .replace(/ {2,}/g, '&nbsp;')
    //.replace(/\t/g, '\t')
    .replace(/\n/g, '<br />');

  codeElement.innerHTML = highlightedHtml;
  setCaretPositionWithin(codeElement, caretPosition);

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}

function leftTrim(str) {
  return str.replace(/^\s+/g, '');
}

function getCaretPositionWithin(element) {
    var caretPosition = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            caretPosition = (
              getNodesInRange(preCaretRange)
              .filter(node =>
                node.parentNode.className !== 'tooltip'
                && node.nodeType === Node.TEXT_NODE
              )
              .reduce(
                (total, node) => total + node.textContent.length,
                0
              )
              - (preCaretRange.endContainer.textContent.length - preCaretRange.endOffset));
        }
    }
    caretPosition =
      caretPosition < 0
      ? 0
      : caretPosition;
    return caretPosition;
}

function setCaretPositionWithin(element, caretPosition) {
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    let range = doc.createRange();
    range.selectNode(element);
    let visibleNodes =
      getNodesInRange(range)
      .filter(node =>
        node.parentNode.className !== 'tooltip'
      )
    let visibleTextNodes =
      visibleNodes
      .filter(node =>
        node.nodeType === Node.TEXT_NODE
      )

    if (visibleTextNodes.length > 1){
      var currentTextLength = 0
      var index = 0;
      var done = false;
      do{
        currentTextLength += visibleTextNodes[index].textContent.length;
        if (currentTextLength >= caretPosition){
          done = true;
        }
        index++;
      }while(index < visibleTextNodes.length && !done)

      let offsetInto = visibleTextNodes[index-1].length - (currentTextLength - caretPosition);

      range.setStart(visibleTextNodes[index-1], offsetInto);
      range.setEnd(visibleTextNodes[index-1], offsetInto);
    }else{
      range.setStart(visibleNodes[1], 0);
      range.setEnd(visibleNodes[1], 0);
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function getVisibleTextInElement(element){
  var doc = element.ownerDocument || element.document;
  let range = doc.createRange();
  range.selectNode(element);
  return getNodesInRange(range)
    .filter(node =>
      node.parentNode.className !== 'tooltip'
      && node.parentNode.className.includes('syntax-')
      && node.nodeType === Node.TEXT_NODE
    )
    .reduce(
      (total, node) => total + node.textContent,
      ''
    )
}

function getNodesInRange(range){
  var startNode = range.startContainer.childNodes[range.startOffset]
    || range.startContainer;//it's a text node
  var endNode = range.endContainer.childNodes[range.endOffset]
    || range.endContainer;

  if (startNode == endNode && startNode.childNodes.length === 0) {
    return [startNode];
  };

  var nodes = [];
  do {
    nodes.push(startNode);
  }
  while ((startNode = getNextNode(startNode, false, endNode))
    && (startNode != endNode));
  nodes.push(endNode);
  return nodes;
};

function getNextNode(node, skipChildren, endNode){
  //if there are child nodes and we didn't come from a child node
  if (endNode == node) {
    return null;
  }
  if (node.firstChild && !skipChildren) {
    return node.firstChild;
  }
  if (!node.parentNode){
    return null;
  }
  return node.nextSibling
         || getNextNode(node.parentNode, true, endNode);
};
