module.exports = {
  KeyCapture: keyCaputre,
}


function keyCaputre(event){

  switch (event.key){
    case 'Enter':
      return insertText('\n');
      break;
    case ' ':
      return insertText(' ');
      break;
    default:
      if (
        (event.keyCode >= 32 && event.keyCode <= 126)
        || event.keyCode >= 160
      ){
        return insertText(event.key);
      }
      return '';
      break;
  }

}

function insertText(toInsert){
  return toInsert;
}
