$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { Caos } = require('./parser/parser.js');
const { clipboard, remote } = require('electron')
const highlighter = require('./syntax-highlighting/syntax-highlighting.js')
const { KeyCapture } = require('./key-capture.js');
const { TreeToText } = require('./tree-to-text.js');
const { TreeToErrors } = require('./tree-to-errors.js');
const { CheckCode } = require('./code-editing-helper.js');
const{
  GetCaretPositionWithin,
  SetCaretPositionWithin,
  GetVisibleTextInElement,
  GetNodesInRange,
} = require('./html-editing-helper.js');
const dialog = remote.dialog;
const fs = require('fs');
//const path = require("path");
const WIN = remote.getCurrentWindow();

let currentFile = null;
let currentFileNeedsSaving = false;
let codeElement = document.getElementById('caos-user-code');


async function newFile(){
  if (currentFileNeedsSaving){
    if (!await displaySaveFileReminderDialog()){
      return;
    }
  }
  codeElement.innerHTML = '<span class="syntax-whitespace"></span>';
  setCaretPositionWithin(codeElement, 0);
  if (currentFileNeedsSaving){
    currentFileNeedsSaving = false;
  }
  if (currentFile){
    currentFile = null;
  }
  updateTitle();
}

async function openFile(){
  if (currentFileNeedsSaving){
    if (!await displaySaveFileReminderDialog()){
      return;
    }
  }

  let options = {
   title : 'Open CASO file',
   defaultPath : '%HOMEPATH%/Documents/',
   buttonLabel : 'Open',
   filters :[
    {name: 'CAOS', extensions: ['cos']},
    {name: 'All Files', extensions: ['*']}
   ],
   properties: ['openFile']
  }

  let result = await dialog.showOpenDialog(WIN, options)
  if (result.canceled){
    return;
  }
  currentFile = result.filePaths[0];
  try{
    let fileContents = fs.readFileSync(currentFile, 'utf-8');
    codeElement.innerHTML = '<span class="syntax-whitespace"></span>';
    setCaretPositionWithin(codeElement, 0);
    insertText(fileContents.replace(/(?:\r\n|\r|\n)/g, '\n'));
    currentFileNeedsSaving = false;
    updateTitle();
  }catch (err){
    console.log(err);
    throw err;
  }
}

async function saveFile(){
  if (!currentFileNeedsSaving){
    return;
  }
  if (!currentFile){
    let result = await displaySaveFileDialog();
    if (result.canceled){
      return false;
    }
    currentFile = result.filePaths[0];
  }
  try{
    await fs.writeFileSync(currentFile, getVisibleTextInElement(codeElement), 'utf-8');
    if (currentFileNeedsSaving){
      currentFileNeedsSaving = false;
      updateTitle();
    }
    return true;
  }catch (err){
    console.log(err);
    throw err;
  }
}

function saveAllFiles(){

}

async function displaySaveFileReminderDialog(){
  let options  = {
   buttons: ['Save', 'Toss', 'Cancel'],
   message: 'Do you want to save your work?'
  }
  let result = await dialog.showMessageBox(options);
  if(result.response === 0){
    await saveFile();
    return true;
  }else if (result.response === 1){
    return true;
  }else{
    return false;
  }
}

async function displaySaveFileDialog(){
  let options = {
    title: "Save CAOS file",
    defaultPath : '%HOMEPATH%/Documents/',
    buttonLabel : "Save",
    filters :[
      {name: 'CAOS', extensions: ['cos']},
      {name: 'All Files', extensions: ['*']}
    ]
  }
  return dialog.showSaveDialog(WIN, options);
}

function updateTitle(){
  let title = '';
  if (currentFile){
    title += path.basename(currentFile) + ' ';
  }
  if (currentFileNeedsSaving){
    title += '* '
    $('#saveFileImg').css('opacity','1')
  }else{
    $('#saveFileImg').css('opacity','0.4')
  }
  if (currentFile){
    title += '- ';
  }
  title += 'CAOS Tool 2020';
  document.title = title;

}

function cut(){

}

function copy(){

}

function paste(){
  let toInsert = clipboard.readText().replace(/(?:\r\n|\r|\n)/g, '\n')
  if (toInsert === ''){
    return;
  }
  insertText(toInsert);
}

function find(){

}

function undo(){

}

function redo(){

}

function comment(){

}

function uncomment(){

}

function autoFormat(){

}

function injectInstall(){
  injectUserCode(true, false, false);
}

function injectEvents(){
  injectUserCode(false, true, false);
}

function injectAll(){
  injectUserCode(true, true, true);
}

function injectRemove(){
  injectUserCode(false, false, true);
}

function injectUserCode(doInstall, doEvents, doRemove){
  let resultElement = document.getElementById('caos-result');
  resultElement.innerHTML = '';
  let codeText = getVisibleTextInElement(codeElement);
  let codeTree = Caos(codeText);

  let errors = TreeToErrors(codeTree);
  if (errors !== ''){
    resultElement.innerHTML = errors;
    return;
  }

  if (doRemove && codeTree.remove){
    let remove = TreeToText(codeTree.remove).slice(5);
    executeCaos(remove, function (error, result) {
        if (error) console.log(error);
        resultElement.innerHTML += 'Injected remove script:<br />';
        resultElement.innerHTML += result + '<br />';
    });
  }

  if(doEvents && codeTree.eventScripts.length >= 1){
    let events = codeTree.eventScripts
      .map(script => {return {
        family: script.start.arguments[0].value,
        genus: script.start.arguments[1].value,
        species: script.start.arguments[2].value,
        eventNum: script.start.arguments[3].value,
        script: TreeToText(script.commands)
      };});

    events.forEach((script, i) => {
      injectScript(script, function (error, result) {
          if (error) console.log(error);
          resultElement.innerHTML += `Injected ${script.family} ${script.genus} ${script.species} ${script.eventNum} event script:<br />`;
          resultElement.innerHTML += result + '<br />';
      });
    });
  }


  if (doInstall && codeTree.inject){
    let inject = TreeToText(codeTree.inject);
    executeCaos(inject, function (error, result) {
        if (error) console.log(error);
        resultElement.innerHTML += 'Injected install script:<br />';
        resultElement.innerHTML += result;
    });
  }
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
        caretKey(event);
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
      case 'Shift':

        break
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
  if (event.ctrlKey && event.key === 'v'){
    paste();
  }
}

function caretKey(event){
  let codeText = GetVisibleTextInElement(codeElement);
  let caretPositionIn = GetCaretPositionWithin(codeElement);
  let caretPositionOut = caretPositionIn.end;

  switch (event.key){
    case 'ArrowDown':
      break;
    case 'ArrowLeft':
      if (caretPositionIn.start === caretPositionIn.end){
        caretPositionOut = caretPositionIn.start - 1;
      }else{
        caretPositionOut = caretPositionIn.start;
      }
      break;
    case 'ArrowRight':
    if (caretPositionIn.start === caretPositionIn.end){
      caretPositionOut = caretPositionIn.end + 1;
    }else{
      caretPositionOut = caretPositionIn.end;
    }
      break;
    case 'ArrowUp':
    case 'End':
    case 'Home':
      break;
    default:
      assert(false);
      break;
  }

  SetCaretPositionWithin(codeElement, caretPositionOut);
}

function editingKey(event){
  var codeText = GetVisibleTextInElement(codeElement);
  var caretPositionIn = GetCaretPositionWithin(codeElement);

  var newCodeText = '';
  var newCaretPosition = 0;

  if (caretPositionIn.start === caretPositionIn.end){
    switch (event.key){
      case 'Backspace':
        newCodeText =
          codeText.substring(0, caretPositionIn.end-1)
          + codeText.substring(caretPositionIn.end, codeText.length);
        caretPositionOut = caretPositionIn.end-1;
        break;
      case 'Delete':
        newCodeText =
          codeText.substring(0, caretPositionIn.end)
          + codeText.substring(caretPositionIn.end+1, codeText.length);
        caretPositionOut = caretPositionIn.end;
        break;
      default:
        assert(false);
        break;
    }
  }else{
    switch (event.key){
      case 'Backspace':
      case 'Delete':
        newCodeText =
          codeText.substring(0, caretPositionIn.start)
          + codeText.substring(caretPositionIn.end, codeText.length);
        caretPositionOut = caretPositionIn.start;
        break;
      default:
        assert(false);
        break;
    }
  }

  CheckCode(codeElement, newCodeText, caretPositionOut);
}

function insertText(text){
  var codeText = GetVisibleTextInElement(codeElement);
  var caretPosition = GetCaretPositionWithin(codeElement);

  let newCodeText;
  if (caretPosition.start === caretPosition.end){
    newCodeText =
      codeText.substring(0, caretPosition.end)
      + text
      + codeText.substring(caretPosition.end, codeText.length);
  }else{
    newCodeText =
      codeText.substring(0, caretPosition.start)
      + text
      + codeText.substring(caretPosition.end, codeText.length);
  }

  CheckCode(codeElement, newCodeText, caretPosition.start+text.length);
}


function userTextKeyUp(event){
  //userTextChanged();
}
