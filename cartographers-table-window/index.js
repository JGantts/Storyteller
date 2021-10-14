$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard, remote } = require('electron');
const dialog = remote.dialog;
const fs = require('fs');
//const path = require("path");
const WIN = remote.getCurrentWindow();

const { metaroom } = require('./dollhouse.js');

let currentFile = null;
let currentFileNeedsSaving = false;
let canvasElement = document.getElementById('myCanvas');
let ctx = setupCanvas(canvasElement, canvasElement.getBoundingClientRect());

canvasElement.onmousedown=handleMouseDown;
canvasElement.onmousemove=handleMouseMove;
canvasElement.onmouseup=handleMouseUp;
canvasElement.onmouseout=handleMouseOut;



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

function getRoomCeiling(room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftCeilingY
      },
      slope: (room.leftCeilingY - room.rightCeilingY)/(room.leftX - room.rightX)
    };
}

function getRoomFloor(room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftFloorY
      },
      slope: (room.leftFloorY - room.rightFloorY)/(room.leftX - room.rightX)
    };
}

function setupCanvas(canvas, rect) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  //var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  return ctx;
}

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

function getDoorsFromRooms(rooms, perms) {
  let doors = [];
  for (const perm of perms) {
      console.log(perm);
  //perms.forEach((perm, i) => {
      let roomA = rooms[perm.rooms.a];
      let roomB = rooms[perm.rooms.b];

      //console.log(rooms);
      //console.log(perms);

      //First check the more performant opeeration: vertical walls

      if (roomA.leftX === roomB.rightX) {

          let middleTwo = getMiddleTwo(roomA.leftCeilingY, roomA.leftFloorY, roomB.rightCeilingY, roomB.rightFloorY);

          doors.push(
            {
              permeability: perm.permeability,
              start: {
                x: roomA.leftX,
                y: middleTwo.high
              },
              end: {
                x: roomA.leftX,
                y: middleTwo.low
              }
            }
          );
          continue;
      }
      if (roomA.rightX === roomB.leftX) {

        let middleTwo = getMiddleTwo(roomA.rightCeilingY, roomA.rightFloorY, roomB.leftCeilingY, roomB.leftFloorY);

        doors.push(
          {
            permeability: perm.permeability,
            start: {
              x: roomB.leftX,
              y: middleTwo.high
            },
            end: {
              x: roomB.leftX,
              y: middleTwo.low
            }
          }
        );
        continue;

      }

      //Now check the less performant opeeration: horizontal floors/ceilings which can be slopped
      let roomALineTop = getRoomCeiling(roomA);

      let roomALineBottom = getRoomFloor(roomA);


      let roomBLineTop = getRoomCeiling(roomB);

      let roomBLineBottom = getRoomFloor(roomB);

      console.log(roomBLineBottom);

      /*if (getIntersectsFromFour(roomALineTop, roomB) || getIntersectsFromFour(roomBLineBottom, roomA)) {
          let ourPoints = getMiddleTwoPointsConsideredVertically(
              {x: roomA.leftX, y: roomA.leftCeilingY},
              {x: roomA.rightX, y: roomA.rightCeilingY},
              {x: roomB.leftX, y: roomB.leftFLoorY},
              {x: roomB.rightX, y: roomB.rightFloorY}
          );
          doors.push(
            {
              permeability: perm.permeability,
              start: ourPoints.high,
              end: ourPoints.low
            }
          );
          continue;
      }*/

    //  if (getIntersectsFromFour(roomALineBottom, roomB) || getIntersectsFromFour(roomBLineTop, roomA)) {
      if (getIntersectsFromFour(roomALineBottom, roomB)) {
          let ourPoints = getMiddleTwoPointsConsideredVertically(
              {x: roomA.leftX, y: roomA.leftFloorY},
              {x: roomA.rightX, y: roomA.rightFloorY},
              {x: roomB.leftX, y: roomB.leftCeilingY},
              {x: roomB.rightX, y: roomB.rightCeilingY}
          );
          doors.push(
            {
              permeability: perm.permeability,
              start: ourPoints.high,
              end: ourPoints.low
            }
          );
          continue;
      }
      console.log("wtf");
  }
  console.log(doors);
  return doors;
}

function getMiddleTwo(one, two, three, four){
    let sorted = [one, two, three, four];
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

function getMiddleTwoPointsConsideredVertically(one, two, three, four){
    let sorted = [one, two, three, four];
    sorted.sort((a, b) => {return a.y -b.y});
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

function getPointOne(room){
    return {x: room.leftX, y: room.leftCeilingY};
}

function getPointTwo(room){
    return {x: room.leftX, y: room.leftFloorY};
}

function getPointThree(room){
    return {x: room.rightX, y: room.rightFloorY};
}

function getPointFour(room){
    return {x: room.rightX, y: room.rightCeilingY};
}

function getIntersectsFromFour(line, room){
    return (getIntersectsFromOne(line, getPointOne(room)))
      ?? (getIntersectsFromOne(line, getPointTwo(room)))
      ?? (getIntersectsFromOne(line, getPointThree(room)))
      ?? (getIntersectsFromOne(line, getPointFour(room)));
}

function getIntersectsFromOne(line, point){
    if (((point.x - line.point.x) * -(line.slope) + line.point.y) === point.y) {
        return point;
    }
    return null;
}

function getWallsFromRooms(rooms) {
  let doors = [];
  rooms.forEach((room, i) => {
    doors.push(
      {
        permeability: -1,
        start: {
          x: room.leftX,
          y: room.leftCeilingY
        },
        end: {
          x: room.rightX,
          y: room.rightCeilingY
        }
      }
    );
    doors.push(
      {
        permeability: -1,
        start: {
          x: room.rightX,
          y: room.rightCeilingY
        },
        end: {
          x: room.rightX,
          y: room.rightFloorY
        }
      }
    );
    doors.push(
      {
        permeability: -1,
        start: {
          x: room.rightX,
          y: room.rightFloorY
        },
        end: {
          x: room.leftX,
          y: room.leftFloorY
        }
      }
    );
    doors.push(
      {
        permeability: -1,
        start: {
          x: room.leftX,
          y: room.leftFloorY
        },
        end: {
          x: room.leftX,
          y: room.leftCeilingY
        }
      }
    );
  });
  return doors;
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







// hold the index of the shape being dragged (if any)
var selectedShapeIndex;

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

// given mouse X & Y (mx & my) and shape object
// return true/false whether mouse is inside the shape
function isClickInRoom(mx, my, room){
    //console.log((mx <= room.leftX) );
    if (mx <= room.leftX) {
        return false;
    }
    //console.log((mx >= room.rightX));
    if (mx >= room.rightX) {
        return false;
    }
    let ceiling = getRoomCeiling(room);
    //console.log((((mx - ceiling.point.x) * -(ceiling.slope) + ceiling.point.y) >= my) );
    if (((mx - ceiling.point.x) * (ceiling.slope) + ceiling.point.y) >= my) {
        return false;
    }
    let floor = getRoomFloor(room);
    /*console.log((((mx - floor.point.x) * -(floor.slope) + floor.point.y) <= my) );
    console.log((((mx - floor.point.x) * -(floor.slope) + floor.point.y) - my) );
    console.log(mx);
    console.log(floor.point.x);
    console.log(floor.slope);
    console.log(floor.point.y);
    console.log(my);*/
    if (((mx - floor.point.x) * (floor.slope) + floor.point.y) <= my) {
        return false;
    }
    return true;
}

let selectedRoomId = -1;

function handleMouseDown(e){
    console.log(e);
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX=parseInt(e.offsetX);
    startY=parseInt(e.offsetY);
    // test mouse position against all shapes
    // post result if mouse is in a shape
    selectedRoomId = -1;
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("--------");
    for(var i=0; i<metaroom.rooms.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickInRoom(startX, startY, metaroom.rooms[i])){
            selectedRoomId = i;
            break;
        }
    }
    redrawMetaroom();
}

function handleMouseUp(e){

}

function handleMouseOut(e){
    // return if we're not dragging

}

function handleMouseMove(e){
  console.log(e);
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();
  // calculate the current mouse position
  startX=parseInt(e.offsetX);
  startY=parseInt(e.offsetY);
  // test mouse position against all shapes
  // post result if mouse is in a shape
  selectedRoomId = -1;
  //console.log("\n\n\n\n\n\n\n\n\n\n\n");
  //console.log("--------");
  for(var i=0; i<metaroom.rooms.length; i++){
      //console.log("\n\n");
      //console.log(i);
      if(isClickInRoom(startX, startY, metaroom.rooms[i])){
          selectedRoomId = i;
          break;
      }
  }
  redrawMetaroom();
}

async function redrawMetaroom(){
    ctx = setupCanvas(canvasElement, metaroom);
    canvasElement.width =  metaroom.width;
    canvasElement.height =  metaroom.height;
    var img = new Image;
    img.src = metaroom.background;
    ctx.moveTo(0, 0);
    await img.decode();
    ctx.drawImage(img, 0, 0);
    redrawRooms();
}

async function redrawRooms(){
    ctx.lineWidth = 2;
    getWallsFromRooms(metaroom.rooms).concat(getDoorsFromRooms(metaroom.rooms, metaroom.perms))
      .forEach((door, i) => {
        if (door.permeability < 0) {
          ctx.strokeStyle = '#33DDDD';
        } else if (door.permeability === 0) {
          ctx.strokeStyle = '#DD3333';
        } else if (door.permeability < 1) {
          ctx.strokeStyle = '#DDDD33';
        } else if (door.permeability === 1) {
          ctx.strokeStyle = '#33DD33';
        }
        ctx.beginPath();
        ctx.moveTo(door.start.x, door.start.y);
        ctx.lineTo(door.end.x, door.end.y);
        ctx.stroke();
      });

      if (selectedRoomId !== -1) {
          let room = metaroom.rooms[selectedRoomId];

          var pattern = document.createElement('canvas');
          pattern.width = 40;
          pattern.height = 40;
          var pctx = pattern.getContext('2d');

          pctx.beginPath();
          pctx.moveTo(0.0, 40.0);
          pctx.lineTo(26.9, 36.0);
          pctx.bezierCurveTo(31.7, 36.0, 36.0, 32.1, 36.0, 27.3);
          pctx.lineTo(40.0, 0.0);
          pctx.lineTo(11.8, 3.0);
          pctx.bezierCurveTo(7.0, 3.0, 3.0, 6.9, 3.0, 11.7);
          pctx.lineTo(0.0, 40.0);
          pctx.closePath();
          pctx.fillStyle = "rgb(188, 222, 178)";
          pctx.fill();
          pctx.lineWidth = 0.8;
          pctx.strokeStyle = "rgb(0, 156, 86)";
          pctx.lineJoin = "miter";
          pctx.miterLimit = 4.0;
          pctx.stroke();

          var pattern = ctx.createPattern(pattern, "repeat");

          ctx.fillStyle = pattern;
          ctx.beginPath();
          ctx.moveTo(room.leftX, room.leftCeilingY);
          ctx.lineTo(room.rightX, room.rightCeilingY);
          ctx.lineTo(room.rightX, room.rightFloorY);
          ctx.lineTo(room.leftX, room.leftFloorY);
          ctx.closePath();
          ctx.fill();
      }
}

redrawMetaroom();
