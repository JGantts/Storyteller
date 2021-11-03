//$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard } = require('electron');
const fs = require('fs');
const crypto = require('crypto');
//const path = require("path");

const { FileHelper } = require('../render-helpers/file-helper.js');

const { geometry } = require('./geometryHelper.js');
const { selectionRenderer } = require('./selectionRenderer.js');
const { selectionChecker } = require('./selectionChecker.js');
const { dataStructureFactory } = require('./dataStructureFactory.js');
const { potentialFactory } = require('./potentialFactory.js');
const { lineSegmentComparison } = require('./lineSegmentComparison.js');

let zoom = 1;
let posX = 0;
let posY = 0;

let dataStructures = null;

let currentFile = null;
let currentFileNeedsSaving = false;
let backgroundCanvasElement = document.getElementById('backgroundCanvas');
let selectionRainbowCanvasElement = document.getElementById('selectionRainbowCanvas');
let roomCanvasElement = document.getElementById('roomCanvas');
let pastiesCanvasElement = document.getElementById('pastiesCanvas');
let potentialCanvasElement = document.getElementById('potentialCanvas');
let selectionHighlightCanvasElement = document.getElementById('selectionHighlightCanvas');
let backgroundCtx = setupCanvas(backgroundCanvasElement, backgroundCanvasElement.getBoundingClientRect());
let selectionRainbowCtx = setupCanvas(selectionRainbowCanvasElement, selectionRainbowCanvasElement.getBoundingClientRect());
let roomCtx = setupCanvas(roomCanvasElement, roomCanvasElement.getBoundingClientRect());
let pastiesCtx = setupCanvas(pastiesCanvasElement, pastiesCanvasElement.getBoundingClientRect());
let potentialCtx = setupCanvas(potentialCanvasElement, potentialCanvasElement.getBoundingClientRect());
let selectionHighlightCtx = setupCanvas(selectionHighlightCanvasElement, selectionHighlightCanvasElement.getBoundingClientRect());

let topCanvasElement = selectionHighlightCanvasElement;
topCanvasElement.onmousedown=handleMouseDown;
topCanvasElement.onmousemove=handleMouseMove;
topCanvasElement.onmouseup=handleMouseUp;
topCanvasElement.onmouseout=handleMouseOut;
topCanvasElement.onwheel = handleWheel;

window.onkeydown = userTextKeyDown;
window.onkeyup = userTextKeyUp;

let selectionCheckMargin = 6;
const selctionSquareWidth = selectionCheckMargin * 4/3;

let fileHelper = new FileHelper(
    updateTitle,
    displayFiles,
    () => {
        return JSON.stringify(dataStructures.metaroomDisk);
    }
);

function getSelectionMultiplier() {
    return (shiftKeyIsDown) ? 1.375 : 1;
}

let metaroom = null;

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
    fileHelper.newFile();
}

async function openFile() {
    fileHelper.openFile();
}

async function saveFile() {
    fileHelper.saveFile();
}

async function closeFile() {
    fileHelper.closeFile();
}

function saveAllFiles(){
    fileHelper.saveAllFiles();
}

function displayFiles(files) {
    if (!files) { return; }
    if (files.length === 0) { return; }
    zoom = 1.0;
    posX = 0;
    posY = 0;
    let file = files[0];
    //for(file in files) {
        let fileContents = file.contents;
        loadMetaroom(
            {
                background: backgroundCanvasElement,
                selection: selectionRainbowCanvasElement,
                room: roomCanvasElement,
                pasties: pastiesCanvasElement,
                potential: potentialCanvasElement,
                sandwich: selectionHighlightCanvasElement
            },
            {
                background: backgroundCtx,
                selection: selectionRainbowCtx,
                room: roomCtx,
                pasties: pastiesCtx,
                potential: potentialCtx,
                sandwich: selectionHighlightCtx
            },
            fileContents
        );
        updateTitle();
        _undoList = [];
        _redoList = [];
        updateUndoRedoButtons();
    //}
}

function updateTitle(){
  let title = '';
  let currentFileRef = fileHelper.getCurrentFileRef();
  if (currentFileRef){
    title += tileNameFromPath(currentFileRef.path) + ' ';
  }
  if (fileHelper.getCurrentFileNeedsSavings()) {
    title += '* '
    $('#save-file-img').css('opacity','1')
  }else{
    $('#save-file-img').css('opacity','0.4')
  }
  if (currentFileRef){
    title += '- ';
  }
  title += 'Cartographer\'s Table';
  document.title = title;
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

function setupCanvas(canvas, rect) {
  // Get the device pixel ratio, falling back to 1.
  //let dpr = window.devicePixelRatio || 1;
  let dpr = 1 * zoom;
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

let shiftKeyIsDown = false;

function userTextKeyDown(event){
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  event.preventDefault();

  if (event.key === "Shift") {
    shiftKeyDown();
  } else if (event.key === "Control") {
    controlKeyDown();
  } else if (event.altKey || event.ctrlKey || event.metaKey){
    controlKeyComboDown(event);
  } else if (event.shiftKey){
    shiftKeyComboDown(event);
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
        editingKeyDown(event);
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
    if (event.key === "Shift") {
        shiftKeyUp(event);
    } else if (event.key === "Control") {
        controlKeyUp(event);
    }
}

function editingKeyDown(event) {
    switch (event.key) {
        case 'Backspace':
        case 'Delete':
            tryDelete();
            break;
    }
}


function shiftKeyDown(event){
  shiftKeyIsDown = true;
}

function controlKeyDown(event){

}

function controlKeyComboDown(event){
  if (event.key === 'v'){
    paste();
  }else if (event.key === 'c'){
    copy();
  }else if (event.key === 'x'){
    cut();
  }else if (event.key === 'z'){
    undo();
  }else if (event.key === 'y'){
    redo();
  }
}
function tryDelete() {
    let selection = selectionChecker.getSelectionClick();
    if (selection.selectedType === "wall") {
        Function.prototype();
    } else if (
      selection.selectedType === "point"
      || selection.selectedType === "corner"
    ) {
        Function.prototype();
    } else if (selection.selectedType === "room") {
        deleteRoom(selection.selectedId);
    }
    selectionChecker.resetSelection();
}


function deleteRoom(id){
    let deleteCommand = makeDeleteRoomCommand(id);
    _undoList.push(deleteCommand);
    deleteCommand.do();
    _redoList = [];
    updateUndoRedoButtons();
}

function controlKeyUp(event){

}

function shiftKeyComboDown(event){
    if (event.key === "Shift") {
        shiftKeyIsDown = true;
    }
}

function shiftKeyUp(event){
    if (shiftKeyDown) {
        shiftKeyIsDown = false;

        if (isDragging) {
            if (whatDragging === "wall") {
                isDragging = false;
                whatDragging = "";
                idDragging = -1;
                startDragging = null;
                stopDragging = null;
            }
        }
    }
}

let isMouseButtonDown = false;

let isDragging = false;
let whatDragging = "";
let idDragging = -1;

let startDragging = null;
let stopDragging = null;

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    isMouseButtonDown = true;
    startX=parseInt(e.offsetX)/zoom;
    startY=parseInt(e.offsetY)/zoom;

    selectionChecker.checkSelectionClick(startX, startY, dataStructures);
}

function handleMouseUp(e){
    e.preventDefault();
    e.stopPropagation();
    isMouseButtonDown = false;

    tryCreateRoom();

    isDragging = false;
    whatDragging = "";
    idDragging = -1;
    startDragging = null;
    stopDragging = null;
}

function handleMouseOut(e){
    // return if we're not dragging
    /*isMouseButtonDown = false;

    isDragging = false;
    whatDragging = "";
    idDragging = -1;
    startDragging = null;
    stopDragging = null;*/
}

function handleMouseMove(e){
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();
  // calculate the current mouse position
  currX=parseInt(e.offsetX)/zoom;
  currY=parseInt(e.offsetY)/zoom;

  selectionChecker.checkSelectionHover(currX, currY, dataStructures);

  /*console.log({
    isMouseButtonDown: isMouseButtonDown,
    isDragging: isDragging,
    "selected.selectedType": selected.selectedType,
  });*/

  if (isMouseButtonDown) {
      let selection = selectionChecker.getSelectionClick();
      if (!isDragging) {
          if (selection.selectedType === "wall") {
              isDragging = true;
              whatDragging = "wall"
              idDragging = selection.selectedId;
              startDragging = {x: currX, y: currY};
              stopDragging = {x: currX, y: currY};
          } else if (selection.selectedType === "point") {
              isDragging = true;
              whatDragging = "point";
              idDragging = selection.selectedId;
              pointStart = dataStructures.points[selection.selectedId];
              startDragging = pointStart;
              stopDragging = {x: currX, y: currY};
          } else if (selection.selectedType === "corner") {
              isDragging = true;
              whatDragging = "corner";
              idDragging = selection.selectedId;
              pointStart = dataStructures.points[selection.selectedId];
              startDragging = pointStart;
              stopDragging = {x: currX, y: currY};
          } else {
              isDragging = true;
              whatDragging = "point";
              idDragging = null;
              pointStart = dataStructures.points[selection.selectedId];
              startDragging = {x: currX, y: currY};
              stopDragging = {x: currX, y: currY};
          }
      }
      if (isDragging) {
          stopDragging = {x: currX, y: currY};
      }
  }


  //checkSelection(startX, startY);
}

function handleWheel(e) {
    //e.preventDefault();


    if (e.ctrlKey) {
        zoom -= e.deltaY * 0.0025;
        zoom = Math.min(zoom, 2);
        zoom = Math.max(zoom, 0.01);
        loadMetaroom(
            {
                background: backgroundCanvasElement,
                selection: selectionRainbowCanvasElement,
                room: roomCanvasElement,
                pasties: pastiesCanvasElement,
                potential: potentialCanvasElement,
                sandwich: selectionHighlightCanvasElement
            },
            {
                background: backgroundCtx,
                selection: selectionRainbowCtx,
                room: roomCtx,
                pasties: pastiesCtx,
                potential: potentialCtx,
                sandwich: selectionHighlightCtx
            },
            metaroom
        );
    } else {

        posX -= e.deltaX * 2;
        posY += e.deltaY * 2;
    }
}

function tryCreateRoom() {
    let selection = selectionChecker.getSelectionHover();
    if (selection.selectedType === "") {
        selection = selectionChecker.getSelectionClick();
    }
    let _shiftKeyIsDown = shiftKeyIsDown;
    let newRoom = potentialFactory.getPotentialRoom
    (
        {
            dragging: {
              isDragging: isDragging,
              startDragging: startDragging,
              stopDragging: stopDragging
            },
            shiftKeyIsDown: _shiftKeyIsDown
        },
        selection,
        dataStructures
    );
    if (newRoom) {
        let id = crypto.randomUUID();
        newRoom.id = id;
        let addCommand = makeAddRoomCommand(id, newRoom);
        let finalCommand = null;
        if (!_shiftKeyIsDown) {
            let deleteCommand = makeDeleteRoomCommand(selection.selectedRoomId);
            finalCommand = buildMultiCommand([addCommand, deleteCommand]);
        } else {
            finalCommand = addCommand;
        }
        _undoList.push(finalCommand);
        finalCommand.do();
        _redoList = [];
        updateUndoRedoButtons();
    }
}

function makeAddRoomCommand(id, room){
  return new Command(
    deleteRoomAbsolute,
    {id},
    addRoomAbsolute,
    {id, room},
  );
}

function addRoomAbsolute({id, room}){
  let newPerms = dataStructureFactory.getPermsFromRoomPotential(room, dataStructures);

  metaroom.rooms[id] = room;
  metaroom.perms = metaroom.perms.concat(newPerms);
  fileHelper.fileModified();

  rebuildRedrawRooms();
}

function makeDeleteRoomCommand(id){
  let roomOriginal = dataStructures.metaroomDisk.rooms[id];
  let room = {
      id: roomOriginal.id,
      leftX: roomOriginal.leftX,
      rightX: roomOriginal.rightX,
      leftCeilingY: roomOriginal.leftCeilingY,
      rightCeilingY: roomOriginal.rightCeilingY,
      leftFloorY: roomOriginal.leftFloorY,
      rightFloorY: roomOriginal.rightFloorY
  }
  return new Command(
      addRoomAbsolute,
      {id, room},
      deleteRoomAbsolute,
      {id},
  );
}

function deleteRoomAbsolute({id}){
  delete dataStructures.metaroomDisk.rooms[id];
  dataStructures.metaroomDisk.perms =
      dataStructures.metaroomDisk.perms
          .filter((perm) =>
          {
            return (
              perm.rooms.a !== id
               && perm.rooms.b !== id
             );
          });
  fileHelper.fileModified();
  rebuildRedrawRooms();
}

function rebuildRedrawRooms() {
    let wallsOverreach = dataStructureFactory.getWallsFromRooms(dataStructures.metaroomDisk.rooms).filter(function(val) {return val});
    let doors = dataStructureFactory.getDoorsFromRooms(dataStructures.metaroomDisk.rooms, dataStructures.metaroomDisk.perms).filter(function(val) {return val});
    let walls = dataStructureFactory.subtractDoorsFromWalls(wallsOverreach, doors).filter(function(val) {return val});
    let points = dataStructureFactory.getPointsFromRooms(dataStructures.metaroomDisk.rooms);
    let pointsSortedX = Object.values(points);;
    pointsSortedX = pointsSortedX.sort((a, b) => a.x - b.x);
    let pointsSortedY = Object.values(points);;
    pointsSortedY = pointsSortedY.sort((a, b) => a.y - b.y);

    dataStructures = {
        metaroomDisk: metaroom,
        points: points,
        walls: walls,
        doors: doors,
        pointsSortedX: pointsSortedX,
        pointsSortedY: pointsSortedY
    };

    redrawRooms(roomCtx, pastiesCtx, doors.concat(walls), points, metaroom);
}

let blankRoom = {
    id: "",
    name: "",
    background: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rooms: {},
    perms: []
};

function loadMetaroom(canvasElements, canvasContexts, metaroomIn) {

    if (typeof metaroomIn === "string") {
        if (metaroomIn !== "") {
            metaroom = JSON.parse(metaroomIn);
        } else {
            metaroom = blankRoom;
        }
    } else if (metaroomIn) {
        metaroom = metaroomIn
    } else {
        metaroom = blankRoom;
    }

    canvasElements.background.width =  metaroom.width;
    canvasElements.background.height =  metaroom.height;
    canvasContexts.background = setupCanvas(canvasElements.background, metaroom);

    canvasElements.room.width =  metaroom.width;
    canvasElements.room.height =  metaroom.height;
    canvasContexts.room = setupCanvas(canvasElements.room, metaroom);

    canvasContexts.room.lineWidth = 2;
    canvasElements.selection.width =  metaroom.width;
    canvasElements.selection.height =  metaroom.height;
    canvasContexts.selection = setupCanvas(canvasElements.selection, metaroom);

    canvasElements.pasties.width =  metaroom.width;
    canvasElements.pasties.height =  metaroom.height;
    canvasContexts.pasties = setupCanvas(canvasElements.pasties, metaroom);

    canvasElements.potential.width =  metaroom.width;
    canvasElements.potential.height =  metaroom.height;
    canvasContexts.potential = setupCanvas(canvasElements.potential, metaroom);

    canvasElements.sandwich.width =  metaroom.width;
    canvasElements.sandwich.height =  metaroom.height;
    canvasContexts.sandwich = setupCanvas(canvasElements.sandwich, metaroom);

    dataStructures = {
         metaroomDisk: metaroom
     };

    redrawMetaroom();
}

async function redrawMetaroom(){
    rebuildRedrawRooms();
    backgroundCtx.clearRect(0, 0, dataStructures.metaroomDisk.width, dataStructures.metaroomDisk.height);
    if (dataStructures.metaroomDisk.background) {
        let img = new Image;
        img.src = dataStructures.metaroomDisk.background;
        backgroundCtx.moveTo(0, 0);
        await img.decode();
        backgroundCtx.drawImage(img, 0, 0);
    }
}

async function redrawRooms(roomCtx, pastiesCtx, lines, points, metaroom){
    roomCtx.strokeWidth = 010;
    roomCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    pastiesCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    lines
        .forEach((line, i) => {
            if (line.permeability < 0) {
              roomCtx.strokeStyle = 'rgb(005, 170, 255)';
            } else if (line.permeability === 0) {
              roomCtx.strokeStyle = 'rgb(228, 000, 107)';
            } else if (line.permeability < 1) {
              roomCtx.strokeStyle = 'rgb(207, 140, 003)';
            } else if (line.permeability === 1) {
              roomCtx.strokeStyle = 'rgb(172, 255, 083)';
            }
            roomCtx.beginPath();
            roomCtx.moveTo(line.start.x, line.start.y);
            roomCtx.lineTo(line.end.x, line.end.y);
            roomCtx.stroke();
        });
    redrawPasties(pastiesCtx, points, metaroom);
    //redrawSelection();
}

const roomLineThickness = 2;

async function redrawPasties(pastiesCtx, points, metaroom){
    //console.log(points);
    //console.log(new Error().stack);
    pastiesCtx.fillStyle = 'rgb(255, 255, 255)';
    for (const key in points) {
      pastiesCtx.beginPath();
      pastiesCtx.arc(points[key].x, points[key].y, roomLineThickness, 0, 2 * Math.PI, true);
      pastiesCtx.fill();
    }
}

async function redrawSelection() {
    if (!metaroom) {
        return;
    }
    //console.log(dataStructures);
    let selection = selectionChecker.getSelectionHover();
    if (selection.selectedType === "") {
        selection = selectionChecker.getSelectionClick();
    }
    selectionHighlightCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    selectionRenderer.redrawSelection(selectionRainbowCtx, selectionHighlightCtx, dataStructures, selection);
    let potentialRoom = potentialFactory.getPotentialRoom
    (
        {
            dragging: {
              isDragging: isDragging,
              startDragging: startDragging,
              stopDragging: stopDragging
            },
            shiftKeyIsDown: shiftKeyIsDown
        },
        selection,
        dataStructures
    );
    redrawPotential(potentialRoom, dataStructures);
}

function redrawPotential(potentialRoom, dataStructures) {
    potentialCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    if (potentialRoom) {
        let doorsWalls = dataStructureFactory.getDoorsWallsPotentialFromRoomPotential(potentialRoom, dataStructures);
        let points = dataStructureFactory.getPointsFromRooms([potentialRoom]);

        redrawRooms(potentialCtx, potentialCtx, doorsWalls, points, dataStructures.metaroomDisk);
    }
}

setInterval(redrawSelection, 50);

newFile();