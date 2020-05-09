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
  for(index = 0; index < 10; index++){
    console.log(codeText.charCodeAt(index) + ':' + codeText[index]);
  }


  var chars = (codeText).split('', 10);
  /*chars.forEach((item, i) => {
    console.log(item.charCodeAt(0) + ':' + item[0]);
  });*/


  var lines = (codeText).split('\n');

  var noComments = lines.map((chunk) => {
    var astIndex = chunk.indexOf('*');
    if (astIndex === -1){
      return chunk;
    }else if(astIndex === 0){
      return '\n';
    }else{
      return chunk.slice(0, astIndex);
    }
  }).filter((chunk) => {return chunk!=='\n';})
  .map((chunk) => {return chunk;})
  .join('\n');

  var whiteSpaceList = noComments.match(/\s+/g);

  var commentList =
    codeText
    .split('\n')
    .filter((line) => {return leftTrim(line)[0]==='*'})
    .map((line) => {return leftTrim(line)});

  console.log(whiteSpaceList);
  console.log(commentList);

  var codeTree = parseCode(codeText);
  //$('#inprocessParse').text(JSON.stringify(codeTree));


  var highlighted = highlightSyntax(codeTree, whiteSpaceList, commentList, codeText, 0).highlighted;

  var highlightedHtml =
    highlighted
    .replace(/ {2,}/g, '&nbsp;')
    //.replace(/\t/g, '\t')
    .replace(/\n/g, '<br />');


  document.getElementById('highlighted').innerHTML = highlightedHtml;

  //codeElement.innerHTML = highlighted.highlighted.replace(new RegExp('\n', 'g'), '<br />');
    /*'<span style="color: green; display=\'inline-block;\'">'
    + lines.join('<br />')
    + '</span>';*/
}

function leftTrim(str) {
  return str.replace(/^\s+/g, '');
}
