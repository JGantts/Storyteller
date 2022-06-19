$.getScript('../engine-api/CAOS.js');
const { FileHelper } = require('../render-helpers/file-helper.js');
globalThis.fileHelper = new FileHelper(
    updateTitle,
    displayFiles,
    (type) => {
        return GetVisibleTextInElement(codeElement);
    }
);
const assert = require('assert');
const { Caos } = require('./parser/parser.js');
const { clipboard, ipcRenderer } = require('electron')
const highlighter = require('./syntax-highlighting/syntax-highlighting.js')
const { KeyCapture } = require('./key-capture.js');
const { TreeToText } = require('./tree-to-text.js');
const { TreeToErrors } = require('./tree-to-errors.js');
const { CheckCode } = require('./code-editing-helper.js');
const crypto = require('crypto');
const{
  GetCaretPositionWithin,
  SetCaretPositionWithin,
  GetVisibleTextInElement,
  GetNodesInRange,
} = require('./html-editing-helper.js');
const{
  ResetIdealCaretDepth,
  GetCaretPositionOneCharLeft,
  GetCaretPositionOneCharRight,
  GetCaretPositionOneLineDown,
  GetCaretPositionOneLineUp,
} = require('./text-editing-helper.js');
//const path = require("path");

let codeElement = document.getElementById('caos-user-code');

let _undoList = [];
let _redoList = [];

class Command{
  constructor(
    undo,
    undoArgs,
    redo,
    redoArgs
  ) {
    this._undo = undo;
    this._undoArgs = undoArgs;
    this._redo = redo;
    this._redoArgs = redoArgs;
  }

  do(){
    this.redo();
  }

  redo(){
    this._redo(this._redoArgs);
  }

  undo(){
    this._undo(this._undoArgs);
  }
}

function buildMultiCommand(subcommands){
  let subcommandsForwards = subcommands;
  let subcommandsReversed = subcommands.slice();
  subcommandsReversed.reverse();
  return new Command(
    undoMultiCommand,
    subcommandsReversed,
    redoMultiCommand,
    subcommandsForwards,
  );
}

function undoMultiCommand(subcommands){
  subcommands
    .forEach((subcommand, i) => {
      subcommand.undo();
    });
}

function redoMultiCommand(subcommands){
  subcommands
    .forEach((subcommand, i) => {
      subcommand.redo();
    });
}

async function newFile() {
    globalThis.fileHelper.newFile();
}

async function openFile() {
    globalThis.fileHelper.openCaosFile();
}

async function saveFile() {
    globalThis.fileHelper.saveCaosFile();
}

async function saveAs() {
    await globalThis.fileHelper.saveCaosFileAs();
    updateBarButtons()
}

async function closeFile() {
    globalThis.fileHelper.closeFile();
}

function saveAllFiles(){
    globalThis.fileHelper.saveAllFiles();
}

function displayFiles(files) {
    if (!files) { return; }
    if (files.length === 0) { return; }
    let file = files[0];
    //for(file in files) {
        let fileContents = file.contents;
        codeElement.innerHTML = '<span class="syntax-whitespace"></span>';
        SetCaretPositionWithin(codeElement, 0);
        insertTextFromNewOrOpenedFile(fileContents.replace(/(?:\r\n|\r|\n)/g, '\n'));
        updateTitle();
        _undoList = [];
        _redoList = [];
        updateBarButtons();
    //}
}


function updateTitle() {
    let title = '';
    if ( fileHelper.hasFile() ) {
        title += fileHelper.getCurrentFileName();
        if (fileHelper.getCurrentFileNeedsSaving()) {
            title += '* ';
        }
        title += '- ';
    }
    title += 'Sorcerer\'s Table';
    document.title = title;
    updateBarButtons();
}

function updateBarButtons(){
  let currentFile = globalThis.fileHelper.getCurrentFileRef();
  if (!currentFile || !globalThis.fileHelper.getCurrentFileNeedsSaving()) {
    $('#save-file-img').css('opacity','0.4')
  }else{
    $('#save-file-img').css('opacity','1')
  }
  if (!currentFile) {
    $('#save-as-img').css('opacity','0.4')
  }else{
    $('#save-as-img').css('opacity','1')
  }

  let caretPosition = GetCaretPositionWithin(codeElement);
  if (caretPosition.start === caretPosition.end){
    $('#cut-img').css('opacity','0.4')
    $('#copy-img').css('opacity','0.4')
  }else{
    $('#cut-img').css('opacity','1')
    $('#copy-img').css('opacity','1')
  }

  if (_undoList.length === 0){
    $('#undo-button-img').css('opacity','0.4')
  }else{
    $('#undo-button-img').css('opacity','1')
  }
  if (_redoList.length === 0){
    $('#redo-button-img').css('opacity','0.4')
  }else{
    $('#redo-button-img').css('opacity','1')
  }

  if (!currentFile){
    $('#install-script-img').css('opacity','0.4')
  }else{
    $('#install-script-img').css('opacity','1')
  }
  if (!currentFile){
    $('#events-scripts-img').css('opacity','0.4')
  }else{
    $('#events-scripts-img').css('opacity','1')
  }
  if (!currentFile){
    $('#all-scripts-img').css('opacity','0.4')
  }else{
    $('#all-scripts-img').css('opacity','1')
  }
  if (!currentFile){
    $('#remove-script-img').css('opacity','0.4')
  }else{
    $('#remove-script-img').css('opacity','1')
  }
}

function tileNameFromPath(path) {
    assert(
      typeof path === 'string'
      || typeof path === 'object',
      `Expected string or NULL, instead found \{${JSON.stringify(path)}\}.`)

    if (!path) {
        return "Unsaved";
    }

    let lastIndexOfSlash = path.lastIndexOf("/")
    let secondTolastIndex = path.lastIndexOf("/", lastIndexOfSlash-1);
    let lastIndexOfDot = path.lastIndexOf(".")
    let fileName = "..." + path.slice(secondTolastIndex);
    return fileName;
}

function cut(){
  let codeText = GetVisibleTextInElement(codeElement);
  let caretPosition = GetCaretPositionWithin(codeElement);
  let toCopy = codeText.substring(caretPosition.start, caretPosition.end);
  if (toCopy === ''){
    return;
  }
  clipboard.writeText(toCopy);
  insertText('');
}

function copy(){
  let codeText = GetVisibleTextInElement(codeElement);
  let caretPosition = GetCaretPositionWithin(codeElement);
  let toCopy = codeText.substring(caretPosition.start, caretPosition.end);
  if (toCopy === ''){
    return;
  }
  clipboard.writeText(toCopy);
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
  let command = _undoList.pop();
  if (!command){
    return;
  }
  command.undo()
  _redoList.push(command);
  updateBarButtons();
}

function redo(){
  let command = _redoList.pop();
  if (!command){
    return;
  }
  command.redo()
  _undoList.push(command);
  updateBarButtons();
}

function comment(){

}

function uncomment(){

}

function autoFormat(){

}

async function injectInstall(){
  await injectUserCode(true, false, false);
}

async function injectEvents(){
  await injectUserCode(false, true, false);
}

async function injectAll(){
  await injectUserCode(true, true, true);
}

async function injectRemove(){
  await injectUserCode(false, false, true);
}

async function injectUserCode(doInstall, doEvents, doRemove){
  let resultElement = document.getElementById('caos-result');
  resultElement.innerHTML = '';
  let codeText = GetVisibleTextInElement(codeElement);
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


    console.log(doInstall);

  if (doInstall && codeTree.inject){
    let inject = TreeToText(codeTree.inject);
    console.log(inject);
    let result = await executeCaos(inject);
    resultElement.innerHTML += 'Injected install script:<br />';
    resultElement.innerHTML += result;
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
  }else if (event.ctrlKey && event.key === 'c'){
    copy();
  }else if (event.ctrlKey && event.key === 'x'){
    cut();
  }else if (event.ctrlKey && event.key === 'z'){
    undo();
  }else if (event.ctrlKey && event.key === 'y'){
    redo();
  }
}

function caretKey(event){
  let codeText = GetVisibleTextInElement(codeElement);
  let caretPositionIn = GetCaretPositionWithin(codeElement);
  let caretPositionOut = caretPositionIn.end;

  switch (event.key){
    case 'ArrowDown':
      caretPositionOut = GetCaretPositionOneLineDown(caretPositionIn.end, codeText);
      break;
    case 'ArrowLeft':
      if (caretPositionIn.start === caretPositionIn.end){
        caretPositionOut = GetCaretPositionOneCharLeft(caretPositionIn.end, codeText);
      }else{
        caretPositionOut = caretPositionIn.start;
      }
      break;
    case 'ArrowRight':
    if (caretPositionIn.start === caretPositionIn.end){
      caretPositionOut = GetCaretPositionOneCharRight(caretPositionIn.end, codeText);
    }else{
      caretPositionOut = caretPositionIn.end;
    }
      break;
    case 'ArrowUp':
      caretPositionOut = GetCaretPositionOneLineUp(caretPositionIn.end, codeText);
      break;
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
        let backspaceCommand = makeDeleteTextCommand(caretPositionIn.end-1, 1);
        _undoList.push(backspaceCommand);
        backspaceCommand.do();
        _redoList = [];
        break;
      case 'Delete':
        let deleteCommand = makeDeleteTextCommand(caretPositionIn.end, 1);
        _undoList.push(deleteCommand);
        deleteCommand.do();
        _redoList = [];
        break;
      default:
        assert(false);
        break;
    }
  }else{
    switch (event.key){
      case 'Backspace':
      case 'Delete':
        let deleteCommand = makeDeleteTextCommand(caretPositionIn.start, caretPositionIn.end - caretPositionIn.start);
        _undoList.push(deleteCommand);
        deleteCommand.do();
        _redoList = [];
        break;
      default:
        assert(false);
        break;
    }
  }

  //CheckCode(codeElement, newCodeText, caretPositionOut);
}

function insertText(text){
  var codeText = GetVisibleTextInElement(codeElement);
  var caretPosition = GetCaretPositionWithin(codeElement);

  let newCodeText;
  if (caretPosition.start === caretPosition.end){
    let insertCommand = makeInsertTextCommand(caretPosition.end, text);
    _undoList.push(insertCommand);
    insertCommand.do();
    _redoList = [];
    updateBarButtons();
  }else{
    let deleteCommand = makeDeleteTextCommand(caretPosition.start, caretPosition.end - caretPosition.start);
    let insertCommand = makeInsertTextCommand(caretPosition.start, text);
    let multiCommand = buildMultiCommand([deleteCommand, insertCommand])
    _undoList.push(multiCommand);
    multiCommand.do();
    _redoList = [];
    updateBarButtons();
  }
}

function makeInsertTextCommand(startIndex, text){
  return new Command(
    deleteTextAbsolute,
    {startIndex, text},
    insertTextAbsolute,
    {startIndex, text},
  );
}

async function insertTextAbsolute({startIndex, text}){
  let codeText = GetVisibleTextInElement(codeElement);
  let newCodeText =
    codeText.substring(0, startIndex)
      + text
      + codeText.substring(startIndex, codeText.length);
  globalThis.fileHelper.fileModified();
  await CheckCode(codeElement, newCodeText, startIndex+text.length);
}

function insertTextFromNewOrOpenedFile(text) {
  CheckCode(codeElement, text, 0);
}

function makeDeleteTextCommand(startIndex, length){
  let codeText = GetVisibleTextInElement(codeElement);
  let text = codeText.substring(startIndex, startIndex + length);
  return new Command(
    insertTextAbsolute,
    {startIndex, text},
    deleteTextAbsolute,
    {startIndex, text},
  );
}

function deleteTextAbsolute({startIndex, text}){
  let codeText = GetVisibleTextInElement(codeElement);
  let newCodeText =
    codeText.substring(0, startIndex)
      + codeText.substring(startIndex + text.length, codeText.length);
  globalThis.fileHelper.fileModified();
  CheckCode(codeElement, newCodeText, startIndex);
}

function userTextKeyUp(event){
  //userTextChanged();
}

function userTextOnClick(event){
  var codeText = GetVisibleTextInElement(codeElement);
  var caretPosition = GetCaretPositionWithin(codeElement);
  ResetIdealCaretDepth(caretPosition.end, codeText)
}

newFile();
