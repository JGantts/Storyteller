$.getScript('../engine-api/CAOS.js');
$.getScript('parser.js');
$.getScript('syntax-highlighting/syntax-highlighting.js');


function injectUserCode(){
  let caosUserCode = document.getElementById('caos-user-code').value;
  executeCaos(caosUserCode, function (error, result) {
      if (error) throw error;
      document.getElementById('caos-result').innerHTML = result;
  });
}

function userTextChanged(){
  var codeElement = document.getElementById('caos-user-code');
  var codeText = codeElement.innerText;

////////////////
///BEGIN CRAP///
////////////////
//Remove this crap once we figure out where the double newlines subsequent to
//  first newline in a sequence of newlines are coming from.
  var inASequence = false;
  var odd = false;
  var codeText = codeText.split('')
    .filter((char, index) => {
      if (inASequence){
        if (char === '\n'){
          if (odd){
            odd = !odd;
            return false;
          }else{
            odd = !odd;
            return true;
          }
        }else{
          inASequence = false;
          return true;
        }
      }else{
        if (char === '\n'){
          inASequence = true;
          odd = false;
          return true;
        }else{
          return true;
        }
      }
    })
    .join('')
    .replace(/EOF/g, '');
//////////////
///END CRAP///
//////////////

/*  for(index = 0; index < 10; index++){
    console.log(codeText.charCodeAt(index) + ':' + codeText[index]);
  }*/

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

  var codeTree = parseCode(codeText);
  $('#inprocessParse').text(JSON.stringify(codeTree));


  var highlighted = highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, 0).highlighted;

  var highlightedHtml =
    highlighted
    .replace(/ {2,}/g, '&nbsp;')
    //.replace(/\t/g, '\t')
    .replace(/\n/g, '<br />');


  document.getElementById('caos-user-code').innerHTML = highlightedHtml;

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}

function leftTrim(str) {
  return str.replace(/^\s+/g, '');
}
