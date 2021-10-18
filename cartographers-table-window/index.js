//$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard, remote } = require('electron');
const dialog = remote.dialog;
const fs = require('fs');
//const path = require("path");
const WIN = remote.getCurrentWindow();

const { metaroom } = require('./dollhouse.js');
const { geometry } = require('./geometryHelper.js');
const { selectionRenderer } = require('./selectionRenderer.js');
const { selected, selectionChecker } = require('./selectionChecker.js');
const { dataStructureFactory } = require('./dataStructureFactory.js');

let metaroomWalls = [];
let metaroomDoors = [];
let metaroomPoints = [];

let currentFile = null;
let currentFileNeedsSaving = false;
let backgroundCanvasElement = document.getElementById('backgroundCanvas');
let selectionCanvasElement = document.getElementById('selectionCanvas');
let roomCanvasElement = document.getElementById('roomCanvas');
let pastiesCanvasElement = document.getElementById('pastiesCanvas');
let backgroundCtx = setupCanvas(backgroundCanvasElement, backgroundCanvasElement.getBoundingClientRect());
let selectionCtx = setupCanvas(selectionCanvasElement, selectionCanvasElement.getBoundingClientRect());
let roomCtx = setupCanvas(roomCanvasElement, roomCanvasElement.getBoundingClientRect());
let pastiesCtx = setupCanvas(pastiesCanvasElement, pastiesCanvasElement.getBoundingClientRect());

let topCanvasElement = pastiesCanvasElement;
topCanvasElement.onmousedown=handleMouseDown;
topCanvasElement.onmousemove=handleMouseMove;
topCanvasElement.onmouseup=handleMouseUp;
topCanvasElement.onmouseout=handleMouseOut;

window.onkeydown = userTextKeyDown;
window.onkeyup = userTextKeyUp;

let selectionCheckMargin = 6;
const selctionSquareWidth = selectionCheckMargin * 4/3;

function getSelectionMultiplier() {
    return shiftKeyIsDown ? 1.375 : 1;
}

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

function setupCanvas(canvas, rect) {
  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  //let rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.height = rect.height * dpr;
  let ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  return ctx;
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



async function newFile(){




  /*if (currentFileNeedsSaving){
    if (!await displaySaveFileReminderDialog()){
      return;
    }
  }
  codeElement.innerHTML = '<span class="syntax-whitespace"></span>';
  SetCaretPositionWithin(codeElement, 0);
  if (currentFileNeedsSaving){
    currentFileNeedsSaving = false;
  }
  if (currentFile){
    currentFile = null;
  }
  updateTitle();
  _undoList = [];
  _redoList = [];
  updateUndoRedoButtons();*/
}

async function openFile(){

}

async function saveFile(){

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
    $('#save-file-img').css('opacity','1')
  }else{
    $('#save-file-img').css('opacity','0.4')
  }
  if (currentFile){
    title += '- ';
  }
  title += 'Map Editor 2020';
  document.title = title;
}

function updateUndoRedoButtons(){
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
  updateUndoRedoButtons();
}

function redo(){
  let command = _redoList.pop();
  if (!command){
    return;
  }
  command.redo()
  _undoList.push(command);
  updateUndoRedoButtons();
}

function userTextKeyDown(event){
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  event.preventDefault();

  if (event.altKey || event.ctrlKey || event.metaKey){
    controlKeyDown(event);
  } else if (event.shiftKey){
    shiftKeyDown(event);
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

function userTextKeyUp(event){
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  event.preventDefault();

  if (event.key === "control" || event.key === "Meta"){
    controlKeyUp(event);
  } else if (event.key === "Shift"){
    shiftKeyUp(event);
  }
}

let ctrlKeyIsDown = false;
let shiftKeyIsDown = false;

function controlKeyDown(event){
  console.log("what?");
  ctrlKeyIsDown = true;
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

function controlKeyUp(event){
  ctrlKeyIsDown = false;
}

function shiftKeyDown(event){
  shiftKeyIsDown = true;
}

function shiftKeyUp(event){
  shiftKeyIsDown = false;
}



let isDragging = false;
let whatDragging = "";

function handleMouseDown(e){
    //console.log(e);
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    startX=parseInt(e.offsetX);
    startY=parseInt(e.offsetY);

    let wasSelectedType = selected.selectedType;
    let wasSelectedId = selected.selectedId;

    selectionChecker.checkSelection(startX, startY);

    if (
      wasSelectedType === selected.selectedType;
      && wasSelectedId === selected.selectedId;
    ) {
        if (selected.selectedType === "wall") {
            isDragging = true;
            whatDragging = "wall"
            idDragging = selected.selectedId;
        }
    }
}

function handleMouseUp(e){

}

function handleMouseOut(e){
    // return if we're not dragging

}

function handleMouseMove(e){
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();
  // calculate the current mouse position
  startX=parseInt(e.offsetX);
  startY=parseInt(e.offsetY);

  //checkSelection(startX, startY);
}



function loadMetaroom(){

    let metaroomWallsOverreach = dataStructureFactory.getWallsFromRooms(metaroom.rooms).filter(function(val) {return val});
    metaroomDoors = dataStructureFactory.getDoorsFromRooms(metaroom.rooms, metaroom.perms).filter(function(val) {return val});
    metaroomWalls = dataStructureFactory.subtractDoorsFromWalls(metaroomWallsOverreach, metaroomDoors).filter(function(val) {return val});
    metaroomPoints = dataStructureFactory.getPointsFromRooms(metaroom.rooms);
    backgroundCanvasElement.width =  metaroom.width;
    backgroundCanvasElement.height =  metaroom.height;
    backgroundCtx = setupCanvas(backgroundCanvasElement, metaroom);
    roomCanvasElement.width =  metaroom.width;
    roomCanvasElement.height =  metaroom.height;
    roomCtx = setupCanvas(roomCanvasElement, metaroom);
    selectionCanvasElement.width =  metaroom.width;
    selectionCanvasElement.height =  metaroom.height;
    selectionCtx = setupCanvas(selectionCanvasElement, metaroom);
    pastiesCanvasElement.width =  metaroom.width;
    pastiesCanvasElement.height =  metaroom.height;
    pastiesCtx = setupCanvas(pastiesCanvasElement, metaroom);
    roomCtx.lineWidth = 2;
    redrawMetaroom()
}

async function redrawMetaroom(){
    redrawRooms();
    backgroundCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    let img = new Image;
    img.src = metaroom.background;
    backgroundCtx.moveTo(0, 0);
    await img.decode();
    backgroundCtx.drawImage(img, 0, 0);
}

async function redrawRooms(){
    roomCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    metaroomWalls.concat(metaroomDoors)
        .forEach((door, i) => {
            if (door.permeability < 0) {
              roomCtx.strokeStyle = 'rgb(005, 170, 255)';
            } else if (door.permeability === 0) {
              roomCtx.strokeStyle = 'rgb(228, 000, 107)';
            } else if (door.permeability < 1) {
              roomCtx.strokeStyle = 'rgb(207, 140, 003)';
            } else if (door.permeability === 1) {
              roomCtx.strokeStyle = 'rgb(172, 255, 083)';
            }
            roomCtx.beginPath();
            roomCtx.moveTo(door.start.x, door.start.y);
            roomCtx.lineTo(door.end.x, door.end.y);
            roomCtx.stroke();
        });
    redrawPasties();
      //redrawSelection();
}

const roomLineThickness = 2;

async function redrawPasties(){
    pastiesCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    metaroomPoints
        .forEach((point, i) => {
            if ( ((selected.selectedType === "point") || (selected.selectedType === "corner")) && (selected.selectedId === i)) {
                selctionSquareWidthToUse = selctionSquareWidth * getSelectionMultiplier();
                pastiesCtx.fillStyle = 'rgb(0, 0, 0)';
                pastiesCtx.beginPath();
                pastiesCtx.rect(
                  point.x-selctionSquareWidthToUse/2 + roomLineThickness/2,
                  point.y-selctionSquareWidthToUse/2 + roomLineThickness/2,
                  selctionSquareWidthToUse - roomLineThickness,
                  selctionSquareWidthToUse - roomLineThickness
                );
                pastiesCtx.fill();
            } else {
                pastiesCtx.fillStyle = 'rgb(255, 255, 255)';
                pastiesCtx.beginPath();
                pastiesCtx.arc(point.x, point.y, roomLineThickness, 0, 2 * Math.PI, true);
                pastiesCtx.fill();
            }

        });
}

async function redrawSelection(){
    selectionRenderer.redrawSelection();
}


loadMetaroom();

setInterval(redrawSelection, 50);
