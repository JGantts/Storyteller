module.exports = {
  GetCaretPositionWithin: getCaretPositionWithin,
  SetCaretPositionWithin: setCaretPositionWithin,
  GetVisibleTextInElement: getVisibleTextInElement,
  GetNodesInRange: getNodesInRange,
}


function getCaretPositionWithin(element) {
    var caretPosition = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);

      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      if (range.startContainer)
      preCaretRange.setEnd(range.startContainer, range.startOffset);

      caretStartPosition = (
        getNodesInRange(preCaretRange)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .reduce(
          (total, node) => total + node.textContent.length,
          0
        )
        - (preCaretRange.endContainer.textContent.length - preCaretRange.endOffset));

      var prePlusInCaretRange = range.cloneRange();
      prePlusInCaretRange.selectNodeContents(element);
      prePlusInCaretRange.setEnd(range.endContainer, range.endOffset);

      caretEndPosition = (
        getNodesInRange(prePlusInCaretRange)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .reduce(
          (total, node) => total + node.textContent.length,
          0
        )
        - (prePlusInCaretRange.endContainer.textContent.length - prePlusInCaretRange.endOffset));
      return {start: caretStartPosition, end: caretEndPosition};
    }else{
      return {start: 0, end: 0};
    }
}

function setCaretPositionWithin(element, caretPosition) {
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  sel = win.getSelection();
  let range = doc.createRange();
  range.selectNode(element);
  let visibleTextNodes =
    getNodesInRange(range)
    .filter(node =>
      node.parentNode.tagName !== 'DIV'
    )
    .filter(node =>
      node.nodeType === Node.TEXT_NODE
    );

  let textLength = visibleTextNodes.reduce((total, node) => total + node.textContent.length, 0);
  if (caretPosition > textLength){
    caretPosition = textLength;
  }else if (caretPosition < 0){
    caretPosition = 0;
  }

  if (visibleTextNodes.length > 0){
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
    sel.removeAllRanges();
    sel.addRange(range);
  }else{
    //Don't do anything?
  }
}

function getVisibleTextInElement(element){
  var doc = element.ownerDocument || element.document;

  let range = doc.createRange();
  range.selectNode(element);
  return (getNodesInRange(range)
    .filter(node =>
      {
        return node.parentNode.className.includes('syntax-')
          && node.nodeType === Node.TEXT_NODE;
      }
    )
    .reduce(
      (total, node) => {
        return total + node.textContent;
      },
      ''
    )
    /*.replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&amp;/g,'&')*/);
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
  while ((startNode = _getNextNode(startNode, false, endNode))
    && (startNode != endNode));
  nodes.push(endNode);
  return nodes;
};

function _getNextNode(node, skipChildren, endNode){
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
         || _getNextNode(node.parentNode, true, endNode);
};
