//$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard, remote } = require('electron');
const dialog = remote.dialog;
const fs = require('fs');
//const path = require("path");
const WIN = remote.getCurrentWindow();

const { metaroom } = require('./dollhouse.js');

let metaroomWalls = [];
let metaroomDoors = [];
let metaroomPoints = [];

let currentFile = null;
let currentFileNeedsSaving = false;
let backgroundCanvasElement = document.getElementById('backgroundCanvas');
let selectionCanvasElement = document.getElementById('selectionCanvas');
let roomCanvasElement = document.getElementById('roomCanvas');
let backgroundCtx = setupCanvas(backgroundCanvasElement, backgroundCanvasElement.getBoundingClientRect());
let selectionCtx = setupCanvas(selectionCanvasElement, selectionCanvasElement.getBoundingClientRect());
let roomCtx = setupCanvas(roomCanvasElement, roomCanvasElement.getBoundingClientRect());

let topCanvasElement = roomCanvasElement;
topCanvasElement.onmousedown=handleMouseDown;
topCanvasElement.onmousemove=handleMouseMove;
topCanvasElement.onmouseup=handleMouseUp;
topCanvasElement.onmouseout=handleMouseOut;


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

function getSortedDoor(aX, aY, bX, bY, perm) {
    let line = getSortedLine(aX, aY, bX, bY);
    if (line) {
        return {
            permeability: perm,
            start: line.start,
            end: line.end
        }
    }
    return null;
}

function getSortedLine(aX, aY, bX, bY) {
    let aSum = aX + aY;
    let bSum = bX + bY;
    if (aSum < bSum) {
        return {
            start: {
              x: aX,
              y: aY
            },
            end: {
              x: bX,
              y: bY
            }
        };
    } else if (aSum > bSum) {
        return {
            start: {
              x: bX,
              y: bY
            },
            end: {
              x: aX,
              y: aY
            }
        };
    } else {
        if (aX < bX) {
            return {
                start: {
                  x: aX,
                  y: aY
                },
                end: {
                  x: bX,
                  y: bY
                }
            };
        } else if (aX > bX) {
            return {
                start: {
                  x: bX,
                  y: bY
                },
                end: {
                  x: aX,
                  y: aY
                }
            };
        } else {
            return null;
        }
    }
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

function getSlope(a, b) {
    return {
      point: {
          x: a.x,
          y: a.y
      },
      slope: (a.y - b.y)/(a.x - b.x)
    };
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
      //console.log(perm);
  //perms.forEach((perm, i) => {
      let roomA = rooms[perm.rooms.a];
      let roomB = rooms[perm.rooms.b];

      //console.log(rooms);
      //console.log(perms);

      //First check the more performant opeeration: vertical doors

      if (roomA.leftX === roomB.rightX) {

          let middleTwo = getMiddleTwo(roomA.leftCeilingY, roomA.leftFloorY, roomB.rightCeilingY, roomB.rightFloorY);

          doors.push(
              getSortedDoor(
                  roomA.leftX, middleTwo.high,
                  roomA.leftX, middleTwo.low,
                  perm.permeability
              )
          );
          continue;
      }
      if (roomA.rightX === roomB.leftX) {

        let middleTwo = getMiddleTwo(roomA.rightCeilingY, roomA.rightFloorY, roomB.leftCeilingY, roomB.leftFloorY);

        doors.push(
            getSortedDoor(
                roomB.leftX, middleTwo.high,
                roomB.leftX, middleTwo.low,
                perm.permeability
            )
        );
        continue;

      }

      //Now check the less performant operation: horizontal floors/ceilings which can be slopped
      let roomALineTop = getRoomCeiling(roomA);

      let roomALineBottom = getRoomFloor(roomA);


      let roomBLineTop = getRoomCeiling(roomB);

      let roomBLineBottom = getRoomFloor(roomB);

      //console.log(roomBLineBottom);

      /*if (getIntersectsFromFour(roomALineTop, roomB) || getIntersectsFromFour(roomBLineBottom, roomA)) {
          let ourPoints = getMiddleTwoPointsConsideredHoizontally(
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
          let ourPoints = getMiddleTwoPointsConsideredHoizontally(
              {x: roomA.leftX, y: roomA.leftFloorY},
              {x: roomA.rightX, y: roomA.rightFloorY},
              {x: roomB.leftX, y: roomB.leftCeilingY},
              {x: roomB.rightX, y: roomB.rightCeilingY}
          );
          doors.push(
              getSortedDoor(
                  ourPoints.high.x, ourPoints.high.y,
                  ourPoints.low.x, ourPoints.low.y,
                  perm.permeability
              )
          );
          continue;
      }
      console.log("wtf");
  }
  //console.log(doors);
  return doors;
}

function getMiddleTwo(one, two, three, four){
    let sorted = [one, two, three, four];
    sorted.sort();
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

function getMiddleTwoPointsConsideredHoizontally(one, two, three, four){
    let sorted = [one, two, three, four];
    sorted.sort((a, b) => {return a.x - b.x});
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

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

function subtractDoorsFromWalls(wallsOverreach, doors){
    let walls = [];
    for (let i=0; i<wallsOverreach.length; i++ ){
        let wall = wallsOverreach[i];
        let wallSegments = subtractDoorsFromWall(wall, doors).segments;
        assert(!wallSegments.changed);
        //console.log(wallSegments);
        walls = walls.concat(wallSegments.filter(function(val) {return val !== null}));
    }
    return walls;
}

function subtractDoorsFromWall(wall, doors){
    let walls = [];
    let wallMinX = Math.min(wall.start.x, wall.end.x);
    let wallMaxX = Math.max(wall.start.x, wall.end.x);
    let wallMinY = Math.min(wall.start.y, wall.end.y);
    let wallMaxY = Math.max(wall.start.y, wall.end.y);
    let wallHandled = false;
    let wallChanged = false;
    for (let j=0; j < doors.length; j++) {
        let door = doors[j];
        let doorsToPassDown =  doors.filter(function(val) {return (
          val.start.x !== door.start.x
          ||val.start.y !== door.start.y
          ||val.end.x !== door.end.x
          ||val.end.y !== door.end.y
        )});
        let doorMinX = Math.min(door.start.x, door.end.x);
        let doorMaxX = Math.max(door.start.x, door.end.x);
        let doorMinY = Math.min(door.start.y, door.end.y);
        let doorMaxY = Math.max(door.start.y, door.end.y);

        //vertical wall
        if (wallMinX === wallMaxX) {

            //vertical door
            if (doorMinX === doorMaxX) {

                //on same axis
                if (door.start.x === wall.start.x) {

                    //there is overlap
                    if (
                      doorMaxY >= wallMinY
                      && doorMinY <= wallMaxY
                    ) {
                        wallHandled = true;

                        //well, "overlap"
                        if (
                            doorMaxY === wallMinY
                            || doorMinY === wallMaxY
                        ) {
                            let newSegmentA = wall;
                            let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);

                        //overlap with upper-left and lower-right tails
                        } else if (
                            doorMinY < wallMinY
                        ) {
                                let newSegmentA = getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                                let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                wallChanged = true;
                                walls = walls.concat(newSegmmentsA);

                        //overlap with lower-right tail
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY < wallMaxY
                        ) {
                            let newSegmentA = getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                            let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                            wallChanged = true;
                            walls = walls.concat(newSegmmentsA);

                        //overlap with upper-right and lower-right tails
                        } else if (
                            doorMinY > wallMinY
                            && doorMaxY < wallMaxY
                        ) {
                            let newSegmentA = getSortedDoor(door.start.x, wallMinY, door.start.x, doorMinY, -1);
                            let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);
                            let newSegmentB = getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                            let newSegmmentsB = recurseSubtrationUntilNoChange(newSegmentB, doorsToPassDown);
                            walls = walls.concat(newSegmmentsB);
                            wallChanged = true;

                        //overlap with no tails
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with upper-left and lower-left tails
                        } else if (
                            doorMinY < wallMinY
                            && doorMaxY > wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with upper-left tail
                        } else if (
                            doorMinY < wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with lower-left tail
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY > wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();


                        //overlap with upper-right tail
                        } else if (
                            doorMinY > wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            let newSegmentA = getSortedDoor(door.start.x, wallMinY, door.start.x, doorMinY, -1);
                            let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);
                            wallChanged = true;

                        } else {
                            console.log("wtf?");
                            console.log(wall);
                            console.log(door);
                        }
                        break;
                    }
                }
            }
            //not a match
        }
        //horizontal wall
        else {

            //horizontal door
            if (doorMinX !== doorMaxX) {

                //on same slope
                let wallSlope = (wall.end.y - wall.start.y)/(wall.end.x - wall.start.x)
                let doorSlope = (door.end.y - door.start.y)/(door.end.x - door.start.x)
                if (wallSlope === doorSlope) {


                    let lineSegmentsIntersect = false;

                    //ensure we can safely compare these two points
                    if (
                        wall.end.x === door.start.x
                        && wall.end.y === door.start.y
                    ) {
                        //we cannont. Fortunately that tells us that:
                        lineSegmentsIntersect = true;
                    } else {
                        let comparisonRun = wall.end.x - door.start.x;
                        let comparisonRise = comparisonRun * wallSlope;
                        let comparisonIntersection = door.start.y + comparisonRise;
                        lineSegmentsIntersect = (comparisonIntersection === wall.end.y);
                    }


                    //on same line
                    if (lineSegmentsIntersect) {

                        //there is overlap
                        if (
                          doorMaxX >= wallMinX
                          && doorMinX <= wallMaxX
                        ) {
                            wallHandled = true;

                            //well, "overlap"
                            if (
                                doorMaxX === wallMinX
                                || doorMinX === wallMaxX
                            ) {
                                let newSegmentA = wall;
                                let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);

                            //overlap with upper-left and lower-right tails
                            } else if (
                                doorMinX < wallMinX
                            ) {
                                    let newSegmentA = getSortedDoor(door.end.x, door.end.y, wall.end.x, wall.end.y, -1);
                                    let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                    wallChanged = true;
                                    walls = walls.concat(newSegmmentsA);

                            //overlap with lower-right tail
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX < wallMaxX
                            ) {
                                let newSegmentA = getSortedDoor(door.end.x, door.end.y, wall.end.x, wall.end.y, -1);
                                let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                wallChanged = true;
                                walls = walls.concat(newSegmmentsA);

                            //overlap with upper-right and lower-right tails
                            } else if (
                                doorMinX > wallMinX
                                && doorMaxX < wallMaxX
                            ) {
                                let newSegmentA = getSortedDoor(wall.start.x, wall.start.y, door.start.x, door.start.y, -1);
                                let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);
                                let newSegmentB = getSortedDoor(door.end.x, wall.start.y, wall.end.x, wall.end.y, -1);
                                let newSegmmentsB = recurseSubtrationUntilNoChange(newSegmentB, doorsToPassDown);
                                walls = walls.concat(newSegmmentsB);
                                wallChanged = true;

                            //overlap with no tails
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with upper-left and lower-left tails
                            } else if (
                                doorMinX < wallMinX
                                && doorMaxX > wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with upper-left tail
                            } else if (
                                doorMinX < wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with lower-left tail
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX > wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();


                            //overlap with upper-right tail
                            } else if (
                                doorMinX > wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                let newSegmentA = getSortedDoor(wall.start.x, wall.start.y, door.start.x, door.start.y, -1);
                                let newSegmmentsA = recurseSubtrationUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);
                                wallChanged = true;

                            } else {
                                console.log("wtf?");
                                console.log(wall);
                                console.log(door);
                            }
                            break;
                        }
                    }
                }

            }
            //not a match
        }
    }
    if (!wallHandled) {
        //console.log("lazy pos");
        walls.push(wall);
    }
    return {segments: walls, changed: wallChanged};
}

function recurseSubtrationUntilNoChange(wall, doors) {
    if (wall) {
        let newWalls1 = subtractDoorsFromWall(wall, doors);
        if (newWalls1.changed) {
            let newWalls2 = [];
            for(let i = 0; i < newWalls1.segments.length; i++) {
                newWalls2.push(recurseSubtrationUntilNoChange(newWalls1.segments[i], doors));
            }
            assert(newWalls2.length <= 1, `newWalls2.length: ${newWalls2.length}`);
            return newWalls2[0];
        } else {
            return newWalls1.segments;
        }
    } else {
        return [];
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

function getPointsFromRooms(rooms) {
    let points = new Set();
    rooms.forEach((room, i) => {
        points.add(
            {
                x: rooms[i].leftX,
                y: rooms[i].leftCeilingY
            }
        );
        points.add(
            {
                x: rooms[i].rightX,
                y: rooms[i].rightCeilingY
            }
        );
        points.add(
            {
                x: rooms[i].rightX,
                y: rooms[i].rightFloorY
            }
        );
        points.add(
            {
                x: rooms[i].leftX,
                y: rooms[i].leftFloorY
            }
        );
    });
    return Array.from(points);
}

function getWallsFromRooms(rooms) {
  let doors = [];
  rooms.forEach((room, i) => {

    doors.push(
        getSortedDoor(
            room.leftX, room.leftCeilingY,
            room.rightX, room.rightCeilingY,
            -1
        )
    );
    doors.push(
        getSortedDoor(
            room.rightX, room.rightCeilingY,
            room.rightX, room.rightFloorY,
            -1
        )
    );
    doors.push(
        getSortedDoor(
            room.rightX, room.rightFloorY,
            room.leftX, room.leftFloorY,
            -1
        )
    );
    doors.push(
        getSortedDoor(
            room.leftX, room.leftFloorY,
            room.leftX, room.leftCeilingY,
            -1
        )
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





function handleMouseDown(e){
    //console.log(e);
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    startX=parseInt(e.offsetX);
    startY=parseInt(e.offsetY);

    checkSelection(startX, startY);
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

//room
//door
//wall
//corner
//point
let selectedType = ""
let selectedRoomId = -1
let selectedId = -1;

function checkSelection(x, y){
    if (selectedType === "room") {
        selectedRoomId = selectedId;
    } else {
        selectedRoomId = -1;
    }
    selectedType = ""
    selectedId = -1;
    if (selectedType === "") {
        checkPointSelection(x, y);
    }
    if (selectedType === "") {
        checkLineSelection(x, y);
    }
    if (selectedType === "") {
        checkRoomSelection(x, y);
    }
    //redrawSelection();
}

function checkPointSelection(x, y){
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("--------");
    for(let i=0; i<metaroomPoints.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickOnPoint(x, y, metaroomPoints[i])){
            //console.log(metaroomPoints[i]);
            if (selectedRoomId === -1){
                selectedType = "point";
            } else {
                selectedType = "corner";
                /*let seletedRoom = metaroom.rooms[selectedRoomId];
                if (x === seletedRoom.leftX) {
                    if (y === seletedRoom.leftCeilingY) {
                        selectedId = 0;
                    } else {
                        assert(y === seletedRoom.leftFLoorY);
                        selectedId = 3;
                    }
                } else {
                    assert(x === seletedRoom.rightX);
                    if (y === seletedRoom.rightCeilingY) {
                        selectedId = 1;
                    } else {
                        assert(y === seletedRoom.rightFloorY);
                        selectedId = 2;
                    }
                }*/
            }
            selectedId = i;
            break;
        }
    }
}

function checkLineSelection(x, y){
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("--------");
    for(let i=0; i<metaroomWalls.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickOnLine(x, y, metaroomWalls[i])){
            selectedType = "wall";
            selectedId = i;
            break;
        }
    }
    //console.log("--------");
    for(let i=0; i<metaroomDoors.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickOnLine(x, y, metaroomDoors[i])){
            selectedType = "door";
            selectedId = i;
            break;
        }
    }
}

function checkRoomSelection(x, y){
    //console.log("\n\n\n\n\n\n\n\n\n\n\n");
    //console.log("--------");
    for(let i=0; i<metaroom.rooms.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickInRoom(x, y, metaroom.rooms[i])){
            selectedType = "room";
            selectedId = i;
            break;
        }
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

let selectionCheckMargin = 6;

function isClickOnPoint(mx, my, point){
    //console.log(metaroomPoints);
    if (mx <= point.x - selectionCheckMargin) {
        return false;
    }
    //console.log((mx >= room.rightX));
    if (mx >= point.x + selectionCheckMargin) {
        return false;
    }
    if (my <= point.y - selectionCheckMargin) {
        return false;
    }
    //console.log((mx >= room.rightX));
    if (my >= point.y + selectionCheckMargin) {
        return false;
    }
    return true;
}

function isClickOnLine(mx, my, line){


    if (mx <= Math.min(line.start.x, line.end.x) - selectionCheckMargin) {
        return false;
    }
    if (mx >= Math.max(line.start.x, line.end.x) + selectionCheckMargin) {
        return false;
    }
    if (my <= Math.min(line.start.y, line.end.y) - selectionCheckMargin) {
        return false;
    }
    if (my >= Math.max(line.start.y, line.end.y) + selectionCheckMargin) {
        return false;
    }
    if (line.start.x == line.end.x) {
        return true;
    } else if (line.start.y == line.end.y) {
        return true;
    } else {
        let slope = getSlope(line.start, line.end);
        if (((mx - slope.point.x) * (slope.slope) + slope.point.y) >= my + selectionCheckMargin) {
            return false;
        }
        if (((mx - slope.point.x) * (slope.slope) + slope.point.y) <= my - selectionCheckMargin) {
            return false;
        }
        return true;
    }
}

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
    if (((mx - floor.point.x) * (floor.slope) + floor.point.y) <= my) {
        return false;
    }
    return true;
}

function loadMetaroom(){

    let metaroomWallsOverreach = getWallsFromRooms(metaroom.rooms).filter(function(val) {return val});
    metaroomDoors = getDoorsFromRooms(metaroom.rooms, metaroom.perms).filter(function(val) {return val});
    metaroomWalls = subtractDoorsFromWalls(metaroomWallsOverreach, metaroomDoors).filter(function(val) {return val});
    //console.log(metaroomDoors);
    //console.log(metaroomWalls);
    metaroomDoors = [];
    //metaroomWalls = [];
    metaroomPoints = getPointsFromRooms(metaroom.rooms);


    backgroundCanvasElement.width =  metaroom.width;
    backgroundCanvasElement.height =  metaroom.height;
    backgroundCtx = setupCanvas(backgroundCanvasElement, metaroom);
    roomCanvasElement.width =  metaroom.width;
    roomCanvasElement.height =  metaroom.height;
    roomCtx = setupCanvas(roomCanvasElement, metaroom);
    selectionCanvasElement.width =  metaroom.width;
    selectionCanvasElement.height =  metaroom.height;
    selectionCtx = setupCanvas(selectionCanvasElement, metaroom);
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

      //redrawSelection();
}

//gay pride! That's right fuckers
//red     RGB 228 003 003
//orange  RGB 255 140 000
//yellow  RGB 255 237 000
//green   RGB 000 128 038
//blue    RGB 000 077 255
//purple  RGB 117 007 135

const red = {
  red: 228,
  green: 003,
  blue: 003
}

const orange = {
  red: 255,
  green: 140,
  blue: 000
}

const yellow = {
  red: 255,
  green: 237,
  blue: 000
}

const green = {
  red: 000,
  green: 128,
  blue: 038
}

const blue = {
  red: 000,
  green: 077,
  blue: 255
}

const purple = {
  red: 117,
  green: 007,
  blue: 135
}

const selctionSquareWidth = selectionCheckMargin * 4/3;

function drawSelectionSquare(x, y) {
    //console.log(x);
    //console.log(y);
    selectionCtx.lineWidth = "1.5";
    selectionCtx.strokeStyle = "white";
    selectionCtx.fillStyle = "black";
    selectionCtx.beginPath();
    selectionCtx.rect(x-selctionSquareWidth/2, y-selctionSquareWidth/2, selctionSquareWidth, selctionSquareWidth);
    selectionCtx.fill();
    selectionCtx.stroke();
    drawSelectionCircle(x, y, 0.0, 1.0);
}

const selctionCircleWidth = selectionCheckMargin * 2;
const selectionCircleRotationsPerSecond = 3/4;

function drawSelectionCircle(x, y, thetaFull0, thetaFull1) {
    let time = new Date();
    selectionCtx.lineWidth = "2.5";

    let resolution =  6*5;

    for (let i=0; i < resolution; i++) {

        let thetaSection0Discrete = i/resolution;
        let thetaSection1Discrete = thetaSection0Discrete + 1/resolution;

        if (thetaSection1Discrete < thetaFull0) {
            continue;
        }
        if (thetaSection0Discrete > thetaFull1) {
            continue;
        }

        let thetaSection0Continuous = Math.max(thetaSection0Discrete, thetaFull0);
        let thetaSection1Continuous = Math.min(thetaSection1Discrete, thetaFull1);

        let percentageActual = i/resolution;

        let milisecondsAfteFrame = ((time.getSeconds()*1000 + time.getMilliseconds())%(1000/selectionCircleRotationsPerSecond));
        let percentageAfterFrameStart = milisecondsAfteFrame / (1000/selectionCircleRotationsPerSecond);

        let percentageAnimation = (1.0 + percentageActual - percentageAfterFrameStart) % 1.0;
        let percentage = percentageAnimation;
        let mod = (percentage) % (1.0000001/6.0);

        let twoColorGradientPercentage = mod * 6;

        let color = null;
        if (percentage <= 1/6) {
            color = colorPercentage(twoColorGradientPercentage, red, orange);
        } else if (percentage <= 2/6) {
            color = colorPercentage(twoColorGradientPercentage, orange, yellow);
        } else if (percentage <= 3/6) {
            color = colorPercentage(twoColorGradientPercentage, yellow, green);
        } else if (percentage <= 4/6) {
            color = colorPercentage(twoColorGradientPercentage, green, blue);
        } else if (percentage <= 5/6) {
            color = colorPercentage(twoColorGradientPercentage, blue, purple);
        } else if (percentage <= 6/6) {
            color = colorPercentage(twoColorGradientPercentage, purple, red);
        }

        drawSelectionCirclePortion(x, y, thetaSection0Continuous, thetaSection1Continuous, `rgb(${Math.floor(color.red)}, ${Math.floor(color.green)}, ${Math.floor(color.blue)})`)
    }
}

function colorPercentage(percentage, colorA, colorB) {
    let newRed = (1.0-percentage)*colorA.red + percentage*colorB.red;
    let newGreen = (1.0-percentage)*colorA.green + percentage*colorB.green;
    let newBlue = (1.0-percentage)*colorA.blue + percentage*colorB.blue;

    return {
      red: newRed,
      green: newGreen,
      blue: newBlue
    }
}

function drawSelectionCirclePortion(x, y, theta0, theta1, color) {
    selectionCtx.strokeStyle = color;
    selectionCtx.beginPath();
    selectionCtx.arc(x, y, selctionCircleWidth, theta0 * 2 * Math.PI, theta1 * 2 * Math.PI);
    selectionCtx.stroke();
}

const selectionLineWidth = selectionCheckMargin;

function drawSelectionLine(selected) {
    let dashLength = selectionCheckMargin / 4;

    let rise = selected.end.y - selected.start.y;
    let run = selected.end.x - selected.start.x;
    let lineLength = Math.sqrt(rise*rise+run*run);

    let dashCountFractional = lineLength / dashLength;
    let dashCountRemainder = dashCountFractional - Math.floor(dashCountFractional);
    let dashCountWhole = Math.ceil(dashCountFractional);

    let time = new Date();
    let milisecondsAfteFrame = ((time.getSeconds()*1000 + time.getMilliseconds())%(1000/selectionCircleRotationsPerSecond*2));
    let percentageAfterFrameStart = milisecondsAfteFrame / (1000/selectionCircleRotationsPerSecond);
    //console.log(percentageAfterFrameStart);

    let begniningNegative = -1.0/dashCountFractional-1.0 - (1000/selectionCircleRotationsPerSecond*2);
    //console.log("\n\n\n\n\n\n\n\n");
    for (let i=begniningNegative; i < dashCountWhole; i++) {
        let startPercent = (i+percentageAfterFrameStart) / dashCountFractional;
        let stopPercent = startPercent + 1.0/dashCountFractional;
        if (startPercent > 1.0) {
            continue;
        }
        if (stopPercent < 0.0 ) {
          continue;
        }
        let startPercentActual = Math.max(startPercent, 0.0);
        let stopPercentActual = Math.min(stopPercent, 1.0);
        //console.log(`${i} ${startPercentActual} ${stopPercentActual}`)
        let colorIndex = i-begniningNegative;
        let percentageActual = colorIndex/dashCountFractional;

        let percentageAnimation = (1.0 + percentageActual - percentageAfterFrameStart) % 1.0;
        let percentage = percentageAnimation;
        let mod = (percentage) % (1.0000001/6.0);

        let twoColorGradientPercentage = mod * 6;

        let color = null;
        if (percentage <= 1/6) {
            color = colorPercentage(twoColorGradientPercentage, red, orange);
        } else if (percentage <= 2/6) {
            color = colorPercentage(twoColorGradientPercentage, orange, yellow);
        } else if (percentage <= 3/6) {
            color = colorPercentage(twoColorGradientPercentage, yellow, green);
        } else if (percentage <= 4/6) {
            color = colorPercentage(twoColorGradientPercentage, green, blue);
        } else if (percentage <= 5/6) {
            color = colorPercentage(twoColorGradientPercentage, blue, purple);
        } else if (percentage <= 6/6) {
            color = colorPercentage(twoColorGradientPercentage, purple, red);
        }

        drawSeclectionLineSegment(
          selected.start,
          rise,
          run,
          lineLength,
          startPercentActual,
          stopPercentActual,
          `rgb(${Math.floor(color.red)}, ${Math.floor(color.green)}, ${Math.floor(color.blue)})`
        )
    }

}

function drawSeclectionLineSegment(lineStart, lineRise, lineRun, lineLength, startPercent, stopPercent, lineColor) {

    let percentageAverage = (startPercent + stopPercent)/2;
    let distancePercentFromEnd = 0.5 - Math.abs(0.5 - percentageAverage);
    let distanceActualFromEnd = distancePercentFromEnd * lineLength;

    let lineWidth = 0;
    if (distanceActualFromEnd >= selectionLineWidth) {
        lineWidth = selectionLineWidth;
    } else {
        let dist =  1 - distanceActualFromEnd/selectionLineWidth;
        lineWidth = Math.sqrt(1 - dist * dist) * selectionLineWidth;
    }

    drawSeclectionLineSegmentAtWidth(
      lineStart,
      lineRise,
      lineRun,
      startPercent,
      stopPercent,
      lineWidth,
      lineColor
    )
}

function drawSeclectionLineSegmentAtWidth(lineStart, lineRise, lineRun, startPercent, stopPercent, lineWidth, lineColor) {
    //console.log(`${startPercent} ${stopPercent}`)

    selectionCtx.lineWidth = lineWidth;
    selectionCtx.strokeStyle = lineColor;
    selectionCtx.beginPath();
    selectionCtx.moveTo(lineStart.x + lineRun*startPercent, lineStart.y + lineRise*startPercent);
    selectionCtx.lineTo(lineStart.x + lineRun*stopPercent, lineStart.y + lineRise*stopPercent);
    selectionCtx.stroke();
}

function drawSelectionRoom(selected) {
    let time = new Date();
    let pattern = document.createElement('canvas');
    pattern.width = 40;
    pattern.height = 40;
    let pctx = pattern.getContext('2d');

    let color1 = "#0000"
    let color2 = "rgb(005, 170, 255)";
    let numberOfStripes = 24;
    for (let i=0; i < numberOfStripes*5; i++){
        let thickness = 40 / numberOfStripes;
        pctx.beginPath();


        let color = null;
        let aplaha = 255;
        let rainbowIndex = Math.floor(i/4);
        let rainbowMod = rainbowIndex % 6;
        if (i%4 !== 0) {
            color = {
                red: 0,
                green: 0,
                blue: 0
            }
            aplaha = 0;
        } else  if (rainbowMod == 0) {
            color = red;
        } else  if (rainbowMod == 1) {
            color = orange;
        } else  if (rainbowMod == 2) {
            color = yellow;
        } else  if (rainbowMod == 3) {
            color = green;
        } else  if (rainbowMod == 4) {
            color = blue;
        } else {
            color = purple;
        }

        pctx.strokeStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${aplaha})`;
        pctx.lineWidth = thickness/1.5;

        let milisecondsAfteFrame = ((time.getSeconds()*1000 + time.getMilliseconds())%(1000/selectionCircleRotationsPerSecond));
        let percentageAfterFrameStart = milisecondsAfteFrame / (1000/selectionCircleRotationsPerSecond);

        let animationOffset = 40*percentageAfterFrameStart;
        let lineAdustment = i*thickness + thickness/2 + animationOffset
        pctx.moveTo(-5, -45 + lineAdustment);
        pctx.lineTo(145, -195 + lineAdustment);
        pctx.stroke();
    }

    let patternStyle = selectionCtx.createPattern(pattern, "repeat");

    selectionCtx.fillStyle = patternStyle;
    selectionCtx.beginPath();
    selectionCtx.moveTo(selected.leftX, selected.leftCeilingY);
    selectionCtx.lineTo(selected.rightX, selected.rightCeilingY);
    selectionCtx.lineTo(selected.rightX, selected.rightFloorY);
    selectionCtx.lineTo(selected.leftX, selected.leftFloorY);
    selectionCtx.closePath();
    selectionCtx.fill();
}

async function wildSelection(){

    /*for (let i=0; i < metaroomPoints.length; i++){
        let selected = metaroomPoints[i];
        drawSelectionSquare(selected.x, selected.y);
    }*/

    for (let i=0; i < metaroomDoors.length; i++){
        let selected = metaroomDoors[i];
        drawSelectionLine(selected);
    }

    for (let i=0; i < metaroomWalls.length; i++){
        let selected = metaroomWalls[i];
        drawSelectionLine(selected);
    }

    /*for (let i=0; i < metaroom.rooms.length; i++){
        let selected = metaroom.rooms[i];
        drawSelectionRoom(selected);
    }*/
}

//room
//door
//wall
//corner
//point
async function redrawSelection(){
    selectionCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    //wildSelection();
//  return;
    //console.log(selectedType);
    //console.log((selectedId));
    if (selectedType === "point" || selectedType === "corner") {
        let selected = metaroomPoints[selectedId];
        drawSelectionSquare(selected.x, selected.y);
    } else if (selectedType === "door" || selectedType === "wall") {
        let selected = null;
        if (selectedType === "door") {
            selected = metaroomDoors[selectedId];
        } else {
            selected = metaroomWalls[selectedId];
        }
        drawSelectionLine(selected);
    } else if (selectedType === "room") {
        drawSelectionRoom(metaroom.rooms[selectedId]);
    }
}



loadMetaroom();

setInterval(redrawSelection, 50);
