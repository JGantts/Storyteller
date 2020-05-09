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

  var codeTree = parseCode(codeText);

  //$('#inprocessParse').text(JSON.stringify(codeTree));

  var asSplit = ('\n' + codeText).split('*');
  var noComments = asSplit.map((chunk) => {
    return chunk.slice(chunk.indexOf('\n'))
  })
  .join('');

  var whiteSpaceList = noComments.slice(1).match(/\s+/g);

  var commentList =
    codeText
    .split('\n')
    .filter((line) => {return line.trim()[0]==='*'})
    .map((line) => {return leftTrim(line)});

  console.log(whiteSpaceList);
  console.log(commentList);

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
