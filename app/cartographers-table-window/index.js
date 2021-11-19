//$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard } = require('electron');
const fs = require('fs');
const crypto = require('crypto');
const path = require("path");

const { FileHelper } = require('../render-helpers/file-helper.js');

const { parseCaosForMetaroom } = require('./caos-to-metaroom-parser.js');
const { geometry } = require('./geometryHelper.js');
const { roomtypeRenderer } = require('./roomtype-renderer.js');
const { selectionRenderer } = require('./selectionRenderer.js');
const { selectionChecker } = require('./selectionChecker.js');
const { dataStructureFactory } = require('./dataStructureFactory.js');
const { potentialFactory } = require('./potentialFactory.js');
const { lineSegmentComparison } = require('./lineSegmentComparison.js');
const { updatePropertiesPanel } = require('./properties-panel-updater.js');

let zoom = 1;
let posX = 0;
let posY = 0;

let dataStructures = null;

let masterUiState = {
    keys: {
        shiftKeyIsDown: false,
        ctrlKeyIsDown: false,
    },

    dragging: {
        isMouseButtonDown: false,

        isDragging: false,
        whatDragging: "",
        idDragging: -1,

        startDragging: null,
        stopDragging: null,
    },

    state: {
        isViewingRoomType: false,
    },

    camera: {
        rezoom: false,
        reposition: false,
    }
};

let canvasHolder = document.getElementById('canvasHolder');

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

function getSelectionCheckMargin() {
    return 6/zoom;
}

function getSelectionSquareWidth() {
    return getSelectionCheckMargin() * 4/3;
}

function getRoomLineThickness() {
    return 2/zoom;
}

let fileHelper = new FileHelper(
    updateTitle,
    displayFiles,
    () => {
        return JSON.stringify(dataStructures.metaroomDisk);
    }
);

function getSelectionMultiplier() {
    return (masterUiState.keys.shiftKeyIsDown) ? 1.375 : 1;
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
    await fileHelper.newFile();
    updateBarButtons()
}

async function openFile() {
    await fileHelper.openCartFile();
    updateBarButtons()
}

async function saveFile() {
    await fileHelper.saveCartFile();
    updateBarButtons()
}

async function saveAs() {
    await fileHelper.saveCartFileAs();
    updateBarButtons()
}

async function closeFile() {
    await fileHelper.closeFile();
    updateBarButtons()
}

async function importFromCaos() {
    await fileHelper.openCaosFile();
    updateBarButtons()
}

let isViewingRoomType = false;
async function viewEditRoomType() {
    isViewingRoomType = !isViewingRoomType;
}

let canvasElements = {
    background: backgroundCanvasElement,
    selection: selectionRainbowCanvasElement,
    room: roomCanvasElement,
    pasties: pastiesCanvasElement,
    potential: potentialCanvasElement,
    sandwich: selectionHighlightCanvasElement
};
let canvasContexts = {
    background: backgroundCtx,
    selection: selectionRainbowCtx,
    room: roomCtx,
    pasties: pastiesCtx,
    potential: potentialCtx,
    sandwich: selectionHighlightCtx
};

function displayFiles(files) {
    if (!files) { return; }
    if (files.length === 0) { return; }
    zoom = 1.0;
    posX = 0;
    posY = 0;
    let file = files[0];
    //for(file in files) {
        let fileContents = null;
        switch (file.fileRef.type) {
          case ".cart":
            fileContents = file.contents;
            break;
          case ".cos":
            fileContents = parseCaosForMetaroom(file.contents);
            break;
          default:
            throw new Error(`Unknown file type: ${file.fileref}`);
        }

        loadMetaroom(
            canvasElements,
            canvasContexts,
            fileContents
        );
        updateTitle();
        _undoList = [];
        _redoList = [];
        updateBarButtons();
    //}
}

function updateTitle(){
  let title = '';
  let currentFileRef = fileHelper.getCurrentFileRef();
  if (currentFileRef){
    title += tileNameFromPath(currentFileRef.path) + ' ';
  }
  if (fileHelper.getCurrentFileNeedsSaving()) {
    title += '* '
  }else{
  }
  if (currentFileRef){
    title += '- ';
  }
  title += 'Cartographer\'s Table';
  document.title = title;
  updateBarButtons();
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
  ctx.translate(-posX, -posY);
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

function updateBarButtons(){
  let currentFile = fileHelper.getCurrentFileRef();
  if (!currentFile || !fileHelper.getCurrentFileNeedsSaving()) {
    $('#save-file-img').css('opacity','0.4')
  }else{
    $('#save-file-img').css('opacity','1')
  }
  if (!currentFile) {
    $('#save-as-img').css('opacity','0.4')
  }else{
    $('#save-as-img').css('opacity','1')
  }
  if (!currentFile) {
    $('#export-caos-img').css('opacity','0.4')
  }else{
    $('#export-caos-img').css('opacity','1')
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
  if (!currentFile) {
    $('#view-edit-room-type-img').css('opacity','0.4')
  }else{
    $('#view-edit-room-type-img').css('opacity','1')
  }
  if (!currentFile || zoom === 1) {
    $('#one-to-one-zoom-img').css('opacity','0.4')
  }else{
    $('#one-to-one-zoom-img').css('opacity','1')
  }
}

function oneToOneZoom() {
  zoom = 1;
  masterUiState.camera.rezoom = true;
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
  fileHelper.fileModified();
  rebuildRooms();
  redrawRooms(
    canvasContexts.room,
    canvasContexts.pasties,
    [...dataStructures.doors, ...dataStructures.walls],
    dataStructures.points,
    dataStructures.metaroomDisk);
  selectionChecker.resetSelection();
  updateBarButtons();
}

function redo(){
  let command = _redoList.pop();
  if (!command){
    return;
  }
  command.redo()
  _undoList.push(command);
  fileHelper.fileModified();
  rebuildRooms();
  redrawRooms(
    canvasContexts.room,
    canvasContexts.pasties,
    [...dataStructures.doors, ...dataStructures.walls],
    dataStructures.points,
    dataStructures.metaroomDisk);
  selectionChecker.resetSelection();
  updateBarButtons();
}

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
      case 'Backspace':
      case 'Delete':
        editingKeyDown(event);
        break;

      case 'Escape':
        selectionChecker.resetSelection();
        break;

      default:
        if (
          (event.keyCode >= 32 && event.keyCode <= 126)
          || event.keyCode >= 160
        ){
          insertText(event.key);
        } else {
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
  masterUiState.keys.shiftKeyIsDown = true;
}

function controlKeyDown(event){
  masterUiState.keys.ctrlKeyIsDown = true;
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
    let permsStorageCommand = makePermsStorageCommand([id]);
    let deleteCommand = makeDeleteRoomCommand(id);
    let finalCommand = buildMultiCommand([permsStorageCommand, deleteCommand]);
    _undoList.push(finalCommand);
    finalCommand.do();
    _redoList = [];
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
      canvasContexts.room,
      canvasContexts.pasties,
      [...dataStructures.doors, ...dataStructures.walls],
      dataStructures.points,
      dataStructures.metaroomDisk);
    selectionChecker.resetSelection();
    updateBarButtons();
}

function controlKeyUp(event){
    if (masterUiState.keys.ctrlKeyIsDown) {
        masterUiState.keys.ctrlKeyIsDown = false;

        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging = {
                isMouseButtonDown: false,

                isDragging: false,
                whatDragging: "",
                idDragging: -1,

                startDragging: null,
                stopDragging: null,
            }
        }
    }
}

function shiftKeyComboDown(event){
    if (event.key === "Shift") {
        masterUiState.keys.shiftKeyIsDown = true;
    }
}

function shiftKeyUp(event){
    if (masterUiState.keys.shiftKeyIsDown) {
        masterUiState.keys.shiftKeyIsDown = false;

        if (masterUiState.dragging.isDragging) {
            masterUiState.dragging = {
                isMouseButtonDown: false,

                isDragging: false,
                whatDragging: "",
                idDragging: -1,

                startDragging: null,
                stopDragging: null,
            }
        }
    }
}

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    masterUiState.dragging.isMouseButtonDown = true;
    startX=parseInt(e.offsetX)/zoom + posX;
    startY=parseInt(e.offsetY)/zoom + posY;

    selectionChecker.checkSelectionClick(startX, startY, dataStructures);
}

function handleMouseUp(e){
    e.preventDefault();
    e.stopPropagation();
    masterUiState.dragging.isMouseButtonDown = false;

    tryCreateRoom();

    masterUiState.dragging = {
        isMouseButtonDown: false,

        isDragging: false,
        whatDragging: "",
        idDragging: -1,

        startDragging: null,
        stopDragging: null,
    }
}

function handleMouseOut(e){
    masterUiState.keys.shiftKeyIsDown = false;
    // return if we're not dragging
    /*masterUiState.dragging.isMouseButtonDown = false;

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
  currX=parseInt(e.offsetX)/zoom + posX;
  currY=parseInt(e.offsetY)/zoom + posY;

  if (!dataStructures) {
      return;
  }

  if (!masterUiState.dragging.isDragging) {
      selectionChecker.checkSelectionHover(currX, currY, dataStructures);
  }

  /*console.log({
    isMouseButtonDown: masterUiState.dragging.isMouseButtonDown,
    isDragging: isDragging,
    "selected.selectedType": selected.selectedType,
  });*/

  if (masterUiState.dragging.isMouseButtonDown) {
      let selection = selectionChecker.getSelectionClick();
      if (!masterUiState.dragging.isDragging) {
          if (selection.selectedType === "wall"
            || selection.selectedType === "door"
          ) {
              masterUiState.dragging = {
                  isMouseButtonDown: true,

                  isDragging: true,
                  whatDragging: selection.selectedType,
                  idDragging: selection.selectedId,

                  startDragging: {x: currX, y: currY},
                  stopDragging: {x: currX, y: currY},
              }
          } else if (selection.selectedType === "point") {
              masterUiState.dragging = {
                  isMouseButtonDown: true,

                  isDragging: true,
                  whatDragging: selection.selectedType,
                  idDragging: selection.selectedId,

                  startDragging: dataStructures.points[selection.selectedId],
                  stopDragging: {x: currX, y: currY},
              }
          } else if (selection.selectedType === "corner") {
              masterUiState.dragging = {
                  isMouseButtonDown: true,

                  isDragging: true,
                  whatDragging: selection.selectedType,
                  idDragging: selection.selectedId,

                  startDragging: dataStructures.points[selection.selectedId],
                  stopDragging: {x: currX, y: currY},
              }
          } else if (selection.selectedType === "side") {
              masterUiState.dragging = {
                  isMouseButtonDown: true,

                  isDragging: true,
                  whatDragging: selection.selectedType,
                  idDragging: selection.selectedId,

                  startDragging: {x: currX, y: currY},
                  stopDragging: {x: currX, y: currY},
              }
          } else {
              masterUiState.dragging = {
                  isMouseButtonDown: true,

                  isDragging: true,
                  whatDragging: "cursor_point",
                  idDragging: null,

                  startDragging: {x: Math.round(currX), y: Math.round(currY)},
                  stopDragging: {x: currX, y: currY},
              }
          }
      }
      if (masterUiState.dragging.isDragging) {
          masterUiState.dragging.stopDragging = {x: currX, y: currY};
      }
  }


  //checkSelection(startX, startY);
}

function handleWheel(e) {
    e.preventDefault();

    if (e.ctrlKey) {
        zoom -= e.deltaY * 0.0025;
        zoom = Math.min(zoom, 2);
        zoom = Math.max(zoom, 0.1);
        masterUiState.camera.rezoom = true;
    } else {
        if (e.altKey) {
            posX += e.deltaY * 2;
        } else {
            posX += e.deltaX * 2;
            posY += e.deltaY * 2;
        }
        posX = Math.max(posX, 0);
        posX = Math.min(posX, dataStructures.metaroomDisk.width - canvasHolder.clientWidth);
        posY = Math.max(posY, 0);
        posY = Math.min(posY, dataStructures.metaroomDisk.height - canvasHolder.clientHeight);

        masterUiState.camera.reposition = true;
    }

}

function tryCreateRoom() {
    let selection = selectionChecker.getSelectionHover();
    if (selection.selectedType === "") {
        selection = selectionChecker.getSelectionClick();
    }
    let _shiftKeyIsDown = masterUiState.keys.shiftKeyIsDown;
    let _ctrlKeyIsDown = masterUiState.keys.ctrlKeyIsDown;
    let newRooms = potentialFactory.getPotentialRooms
    (
        masterUiState,
        selection,
        dataStructures
    );
    if (newRooms.length === 0) {
      return;
    }
    let commands = [];
    if (_shiftKeyIsDown || _ctrlKeyIsDown) {
        for (index in newRooms) {
            let room = newRooms[index];
            room.id = crypto.randomUUID();
            let addCommand = makeAddRoomCommand(room.id, room);
            commands.push(addCommand);
        }
    } else {
        let permsStorageCommand = makePermsStorageCommand(newRooms.map(newRoom => newRoom.id));
        commands.push(permsStorageCommand);
        for (index in newRooms) {
            let room = newRooms[index];
            let addCommand = makeAddRoomCommand(room.id, room);
            let deleteCommand = makeDeleteRoomCommand(room.id);
            commands.push(permsStorageCommand);
            commands.push(deleteCommand);
            commands.push(addCommand);
            commands.push(permsStorageCommand);
        }
        commands.push(permsStorageCommand);
    }
    let finalCommand = buildMultiCommand(commands);
    _undoList.push(finalCommand);
    finalCommand.do();fg
    _redoList = [];
    fileHelper.fileModified();
    rebuildRooms();
    redrawRooms(
      canvasContexts.room,
      canvasContexts.pasties,
      [...dataStructures.doors, ...dataStructures.walls],
      dataStructures.points,
      dataStructures.metaroomDisk);
    selectionChecker.resetSelection();
    updateBarButtons();
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
  assert(id && id !== "", `Instead of UUID, found ${id}`);
  assert(room, `Instead of room, found ${room}`);
  assert(room.leftX != room.rightX, `Instead of room, found ${JSON.stringify(room)}`);
  let newPerms = dataStructureFactory.getPermsFromRoomPotential(room, dataStructures);

  metaroom.rooms[id] = room;
  metaroom.perms = metaroom.perms.concat(newPerms);
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
      rightFloorY: roomOriginal.rightFloorY,
      roomType: roomOriginal.roomType,
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
}

function makePermsStorageCommand(ids){
    let toStore =
        dataStructures.metaroomDisk.perms
            .filter(perm =>
                ids.some(id =>
                    (id === perm.rooms.a
                        || id === perm.rooms.b)
                )
            )
    return new Command(
        permsStorageAbsolute,
        {toStore},
        permsStorageAbsolute,
        {toStore},
    );
}

function permsStorageAbsolute({toStore}){
    for (stored of toStore) {
        let existing = dataStructures.metaroomDisk.perms
            .filter(existingPermVal =>
                (existingPermVal.rooms.a === stored.rooms.a && existingPermVal.rooms.b === stored.rooms.b)
                || (existingPermVal.rooms.a === stored.rooms.b && existingPermVal.rooms.b === stored.rooms.a)
            )[0];
        if (existing) {
            existing.permeability = stored.permeability;
        }
    }
}

function rebuildRooms() {
    let wallsOverreach = dataStructureFactory.getWallsFromRooms(dataStructures.metaroomDisk.rooms).filter(function(val) {return val});
    //console.log(dataStructures.metaroomDisk.perms);
    let doors =
        dataStructureFactory
            .getDoorsFromRooms(dataStructures.metaroomDisk.rooms, dataStructures.metaroomDisk.perms)
            .filter(function(val) {return val})
            .filter(val => {return (
              val.start.x !== val.end.x ||
              val.start.y !== val.end.y
            );});
    let walls = dataStructureFactory.subtractSegmentsFromSegments(wallsOverreach, doors).filter(function(val) {return val});
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


    dataStructures = {
         metaroomDisk: metaroom
     };

   resizeCanvases();

   rebuildRooms();
   redrawMetaroom();
}

function resizeCanvases(){
    if (!dataStructures) {
        return;
    }

    let metaroom = dataStructures.metaroomDisk;

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
}

let imgPathRel = "";
let img = null;
async function redrawMetaroom(){
    redrawRooms(
        canvasContexts.room,
        canvasContexts.pasties,
        [...dataStructures.doors, ...dataStructures.walls],
        dataStructures.points,
        dataStructures.metaroomDisk);
    backgroundCtx.clearRect(0, 0, dataStructures.metaroomDisk.width, dataStructures.metaroomDisk.height);
    if (dataStructures.metaroomDisk.background) {
        if (!img || dataStructures.metaroomDisk.background !== imgPathRel) {
            img = new Image;
            imgPathRel = dataStructures.metaroomDisk.background;
            imgPathAbsolute = path.join(path.dirname(fileHelper.getCurrentFileRef().path), imgPathRel);

            switch (path.extname(imgPathAbsolute)) {
              case "blk":

                break;

              default:
                img.src = imgPathAbsolute;
                await img.decode();
                break;
            }
        }
        backgroundCtx.moveTo(0, 0);
        backgroundCtx.drawImage(img, 0, 0);
    }
}

async function redrawRooms(roomCtx, pastiesCtx, lines, points, metaroom){
    roomCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    pastiesCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    roomCtx.lineWidth = getRoomLineThickness();
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

async function redrawPasties(pastiesCtx, points, metaroom){
    //console.log(points);
    //console.log(new Error().stack);
    pastiesCtx.lineWidth = getRoomLineThickness();
    pastiesCtx.fillStyle = 'rgb(255, 255, 255)';
    for (const key in points) {
      pastiesCtx.beginPath();
      pastiesCtx.arc(points[key].x, points[key].y, getRoomLineThickness() * 1.5, 0, 2 * Math.PI, true);
      pastiesCtx.fill();
    }
}

let previousSelectionInstanceId = null;

let secondsPassed;
let oldTimestamp = "uninitialized";
let fps;

async function redrawSelection(timestamp) {
    if (!oldTimestamp) {
        oldTimestamp = timestamp;
        fps = 0;
    } else {
        secondsPassed = (timestamp - oldTimestamp) / 1000;
        oldTimestamp = timestamp;
        fps = Math.round(1 / secondsPassed);
    }
    console.log(fps)



    if (dataStructures?.metaroomDisk) {
        if (masterUiState.camera.rezoom
            || masterUiState.camera.reposition
        ) {
          masterUiState.camera.rezoom = false;
          masterUiState.camera.reposition = false;
          resizeCanvases();
          redrawMetaroom();
          updateBarButtons()
        }

        let selection = selectionChecker.getSelectionHover();
        if (selection.selectedType === "") {
            selection = selectionChecker.getSelectionClick();
        }

        if (previousSelectionInstanceId !== selection.selectionInstancedId
        || previousSelectionInstanceId === "uninitialized") {
            previousSelectionInstanceId = selection.selectionInstancedId;
            updatePropertiesPanel(
              document.getElementById("properties-panel"),
              selection,
              dataStructures);
        }

        if (isViewingRoomType) {
            selectionRainbowCtx.clearRect(0, 0, dataStructures.metaroomDisk.width, dataStructures.metaroomDisk.height);
            roomtypeRenderer.redrawRoomtypes(selectionRainbowCtx, dataStructures);
        } else {
            selectionHighlightCtx.clearRect(0, 0, dataStructures.metaroomDisk.width, dataStructures.metaroomDisk.height);
            selectionRenderer.redrawSelection(selectionRainbowCtx, selectionHighlightCtx, dataStructures, selection);
            let potentialRooms = potentialFactory.getPotentialRooms
            (
                masterUiState,
                selection,
                dataStructures
            );
            redrawPotential(potentialRooms, dataStructures);

            selection = selectionChecker.getSelectionClick();
        }
    }
    window.requestAnimationFrame(redrawSelection);
}

function redrawPotential(potentialRooms, dataStructures) {
    potentialCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    if (potentialRooms.length != 0) {
        let doorsWalls = [];
        for (potentialRoom of potentialRooms) {
            doorsWalls = doorsWalls.concat(dataStructureFactory.getDoorsWallsPotentialFromRoomPotential(potentialRoom, dataStructures));
        }
        let points = dataStructureFactory.getPointsFromRooms(potentialRooms);
        redrawRooms(potentialCtx, potentialCtx, doorsWalls, points, dataStructures.metaroomDisk);
    }
}

window.requestAnimationFrame(redrawSelection);

newFile();
