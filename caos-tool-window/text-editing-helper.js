module.exports = {
  GetCaretPositionOneLineDown: getCaretPositionOneLineDown,
  GetCaretPositionOneLineUp: getCaretPositionOneLineUp,
}

const TAB_WIDTH_IN_SPACES = 6;

let _idealCaretDepth = 0;

function getCaretPositionOneLineDown(caretPositionIn, text){
  let lineZeroStart = text.lastIndexOf('\n', caretPositionIn-1) + 1;
  let lineOneStart = text.indexOf('\n', caretPositionIn) + 1;
  let lineTwoStart = text.indexOf('\n', lineOneStart) + 1;

  let caretDepthIn = _lineLength(text.substring(lineZeroStart, caretPositionIn));
  let lineOneLength = _lineLength(text.substring(lineOneStart, lineTwoStart-1));
  let caretDepthOut =
    caretDepthIn > lineOneLength
      ? lineOneLength
      : caretDepthIn;
  let caretIndexOut = _caretIndexFromCaretDepth(lineOneStart, text, caretDepthOut);

  return caretIndexOut;
}

function getCaretPositionOneLineUp(caretPositionIn, text){
  let lineOneStart = text.indexOf('\n', caretPositionIn) + 1;
  let lineZeroStart = text.lastIndexOf('\n', caretPositionIn-1) + 1;
  let lineNegOneStart = text.lastIndexOf('\n', lineZeroStart-2) + 1;

  let caretDepthIn = _lineLength(text.substring(lineZeroStart, caretPositionIn));
  let lineNegOneLength = _lineLength(text.substring(lineNegOneStart, lineZeroStart-1));
  let caretDepthOut =
    caretDepthIn > lineNegOneLength
      ? lineNegOneLength
      : caretDepthIn;
  let caretIndexOut = _caretIndexFromCaretDepth(lineNegOneStart, text, caretDepthOut);

  return caretIndexOut;
}

function _lineLength(text){
  let length =
    text
    .split('')
    .reduce((total, char) => {
      if (char !== '\t'){
        return total + 1;
      }else{
        return total + TAB_WIDTH_IN_SPACES;
      }
    }, 0);

  return length;
}

function _caretIndexFromCaretDepth(lineIndex, text, caretDepth){
  let caretIndex = lineIndex;
  let charDepth = 0;
  while (charDepth < caretDepth){
    if (text.charAt(caretIndex) !== '\t'){
      charDepth += 1;
    }else{
      charDepth += TAB_WIDTH_IN_SPACES;
    }
    caretIndex += 1;
  }

  return caretIndex;
}
