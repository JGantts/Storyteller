$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { Caos } = require('./parser/parser.js');
const highlighter = require('./syntax-highlighting/syntax-highlighting.js')
const { KeyCapture } = require('./key-capture.js');

function injectUserCode(){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = getVisibleTextInElement(codeElement);
  executeCaos(codeText, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function userTextKeyDown(event){
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  event.preventDefault();

  if (event.altKey || event.ctrlKey || event.metaKey){
    controlKey(event);
  }else{
    switch (event.key){
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'End':
      case 'Home':
        controlKey(event);
        break;
      case 'Backspace':
      case 'Delete':
        editingKey(event);
        break;
        case 'Tab':
          insertText('\t');
          break;
        case 'Enter':
          insertText('\n');
          break;
        default:
          if (
            (event.keyCode >= 32 && event.keyCode <= 126)
            || event.keyCode >= 160
          ){
            insertText(event.key);
          }else{
            assert(false, `key: ${event.key}, keyCode: ${event.keyCode}`)
          }
          break;
    }
  }
}

function controlKey(event){
  switch (event.key){
    case 'Tab':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'End':
    case 'Home':
      break;
    default:
      assert(false);
      break;
  }
}

function editingKey(event){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = getVisibleTextInElement(codeElement);
  var caretPosition = getCaretPositionWithin(codeElement);

  var newCodeText = '';
  var newCaretPosition = 0;

  switch (event.key){
    case 'Backspace':
      newCodeText =
        codeText.substring(0, caretPosition-1)
        + codeText.substring(caretPosition, codeText.length);
      newCaretPosition = caretPosition-1;
      break;
    case 'Delete':
      newCodeText =
        codeText.substring(0, caretPosition)
        + codeText.substring(caretPosition+1, codeText.length);
      newCaretPosition = caretPosition;
      break;
    default:
      assert(false);
      break;
  }

  checkCode(codeElement, newCodeText, newCaretPosition);
}

function userTextKeyUp(event){
  userTextChanged();
}

function insertText(text){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = getVisibleTextInElement(codeElement);
  var caretPosition = getCaretPositionWithin(codeElement);

  let newCodeText =
    codeText.substring(0, caretPosition)
    + text
    + codeText.substring(caretPosition, codeText.length)

  checkCode(codeElement, newCodeText, caretPosition+text.length);
}

function userTextChanged(){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = getVisibleTextInElement(codeElement);
  var caretPosition = getCaretPositionWithin(codeElement);
  checkCode(codeElement, codeText, caretPosition);
}

function checkCode(codeElement, codeText, caretPosition){
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
    .filter((line) => {return leftTrim(line)[0]==='*'})
    .map((line) => {return leftTrim(line)});

  var codeTree = Caos(codeText);
  //$('#inprocessParse').text(JSON.stringify(codeTree));

  var highlighted = highlighter.highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, 0);


  codeElement.innerHTML = highlighted;
  setCaretPositionWithin(codeElement, caretPosition);
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
    let visibleTextNodes =
      getNodesInRange(range)
      .filter(node =>
        node.parentNode.tagName !== 'DIV'
      )
      .filter(node =>
        node.parentNode.className !== 'tooltip'
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

      console.log(visibleTextNodes.map(node => node.parentNode))
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
      {
        return node.parentNode.className !== 'tooltip'
          && node.parentNode.className.includes('syntax-')
          && node.nodeType === Node.TEXT_NODE;
      }
    )
    .reduce(
      (total, node) => {
        return total + node.textContent;
      },
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
