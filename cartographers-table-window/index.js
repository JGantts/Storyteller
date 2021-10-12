$.getScript('../engine-api/CAOS.js');
const assert = require('assert');
const { clipboard, remote } = require('electron')
const dialog = remote.dialog;
const fs = require('fs');
//const path = require("path");
const WIN = remote.getCurrentWindow();

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


//X_LEFT
//X_RIGHT
//Y_LEFT_CEILING
//Y_RIGHT_CEILING
//Y_LEFT_FLOOR
//Y_RIGHT_FLOOR

let metarooms = [
  {
    id: 'ed230242fd94c9504eef2f0f435aeb8d638a1e49',
    name: 'Dollhouse',
    //background: 'https://eemfoo.org/ccarchive/Other/Assets/Moe/Background%20Images/Hydrocea/massivepreview.png',
    background: 'https://eemfoo.org/ccarchive/Other/Assets/Moe/Background%20Images/Hydrocea/hydrocea5.jpg',
    x: 0,
    y: 0,
    width: 7000,
    height: 2500,
    rooms: [
      {
        leftX: 100,
        rightX: 200,
        leftCeilingY: 100,
        rightCeilingY: 80,
        leftFloorY: 200,
        rightFloorY: 220,
      },
      {
        leftX: 200,
        rightX: 300,
        leftCeilingY: 80,
        rightCeilingY: 100,
        leftFloorY: 220,
        rightFloorY: 200,
      },
      {
        leftX: 200,
        rightX: 300,
        leftCeilingY: 220,
        rightCeilingY: 200,
        leftFloorY: 300,
        rightFloorY: 300,
      },
      {
        leftX: 100,
        rightX: 200,
        leftCeilingY: 250,
        rightCeilingY: 250,
        leftFloorY: 300,
        rightFloorY: 300,
      }
    ]
  }
];

let doors = [
    {
        "permeability": -1.0,
        "start": {
            "x": 100,
            "y": 100
        },
        "end": {
            "x": 200,
            "y": 80
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 100,
            "y": 200
        },
        "end": {
            "x": 100,
            "y": 100
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 100,
            "y": 250
        },
        "end": {
            "x": 200,
            "y": 250
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 100,
            "y": 300
        },
        "end": {
            "x": 100,
            "y": 250
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 200,
            "y": 80
        },
        "end": {
            "x": 300,
            "y": 100
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 200,
            "y": 220
        },
        "end": {
            "x": 100,
            "y": 200
        }
    },
    {
        "permeability": 1.0,
        "start": {
            "x": 200,
            "y": 220
        },
        "end": {
            "x": 200,
            "y": 80
        }
    },
    {
        "permeability": 0.5,
        "start": {
            "x": 200,
            "y": 220
        },
        "end": {
            "x": 300,
            "y": 200
        }
    },
    {
        "permeability": 0.0,
        "start": {
            "x": 200,
            "y": 250
        },
        "end": {
            "x": 200,
            "y": 300
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 200,
            "y": 300
        },
        "end": {
            "x": 100,
            "y": 300
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 300,
            "y": 100
        },
        "end": {
            "x": 300,
            "y": 200
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 300,
            "y": 200
        },
        "end": {
            "x": 300,
            "y": 300
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 300,
            "y": 300
        },
        "end": {
            "x": 200,
            "y": 300
        }
    },
    {
        "permeability": -1.0,
        "start": {
            "x": 200,
            "y": 220
        },
        "end": {
            "x": 200,
            "y": 250
        }
    }
];


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

function perm() {
    let random = Math.random();
    if (random < 0.25) {
        return -1;
    } else if (random < 0.5) {
        return 0;
    } else if (random < 0.75) {
        return 0.5;
    } else if (random < 1) {
        return 1.0;
    }
}

function getDoorsFromRooms(rooms) {
  let doors = [];
  rooms.forEach((room, i) => {
    doors.push(
      {
        permeability: perm(),
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
        permeability: perm(),
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
        permeability: perm(),
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
        permeability: perm(),
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
  ctx = setupCanvas(canvasElement, metarooms[0]);
  canvasElement.width =  metarooms[0].width;
  canvasElement.height =  metarooms[0].height;
  /*doors = getDoorsFromRooms(metarooms[0].rooms)
    .sort((one, two) => {
      if (one.start.x < two.start.x) return -1;
      if (one.start.x > two.start.x) return 1;
      if (one.start.y < two.start.y) return -1;
      if (one.start.y > two.start.y) return 1;
      if (one.end.x < two.end.x) return -1;
      if (one.end.x > two.end.x) return 1;
      if (one.end.y < two.end.y) return -1;
      if (one.end.y > two.end.y) return 1;
      return 0;
     });
  console.log(JSON.stringify(doors, null, 4));*/
  var img = new Image;
  img.src = metarooms[0].background;
  ctx.moveTo(0, 0);
  await img.decode();
  ctx.drawImage(img, 0, 0);
  ctx.lineWidth = 2;
  doors
    //.flatMap(x => [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x])
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
  /*if (currentFileNeedsSaving){
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
    SetCaretPositionWithin(codeElement, 0);
    insertText(fileContents.replace(/(?:\r\n|\r|\n)/g, '\n'));
    currentFileNeedsSaving = false;
    updateTitle();
    _undoList = [];
    _redoList = [];
    updateUndoRedoButtons();
  }catch (err){
    console.log(err);
    throw err;
  }*/
}

async function saveFile(){
  /*if (!currentFileNeedsSaving){
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
    await fs.writeFileSync(currentFile, GetVisibleTextInElement(codeElement), 'utf-8');
    if (currentFileNeedsSaving){
      currentFileNeedsSaving = false;
      updateTitle();
    }
    return true;
  }catch (err){
    console.log(err);
    throw err;
  }*/
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
    updateUndoRedoButtons();
  }else{
    let deleteCommand = makeDeleteTextCommand(caretPosition.start, caretPosition.end - caretPosition.start);
    let insertCommand = makeInsertTextCommand(caretPosition.start, text);
    let multiCommand = buildMultiCommand([deleteCommand, insertCommand])
    _undoList.push(multiCommand);
    multiCommand.do();
    _redoList = [];
    updateUndoRedoButtons();
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

function insertTextAbsolute({startIndex, text}){
  let codeText = GetVisibleTextInElement(codeElement);
  let newCodeText =
    codeText.substring(0, startIndex)
      + text
      + codeText.substring(startIndex, codeText.length);
  CheckCode(codeElement, newCodeText, startIndex+text.length);
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









// save relevant information about shapes drawn on the canvas
var shapes=[];
// define one circle and save it in the shapes[] array
shapes.push( {x:30, y:30, radius:15, color:'blue'} );
// define one rectangle and save it in the shapes[] array
shapes.push( {x:100, y:-1, width:75, height:35, color:'red'} );

// drag related vars
var isDragging=false;
var startX,startY;

// hold the index of the shape being dragged (if any)
var selectedShapeIndex;

// draw the shapes on the canvas
drawAll();

// listen for mouse events
canvas.onmousedown=handleMouseDown;
canvas.onmousemove=handleMouseMove;
canvas.onmouseup=handleMouseUp;
canvas.onmouseout=handleMouseOut;

// given mouse X & Y (mx & my) and shape object
// return true/false whether mouse is inside the shape
function isMouseInShape(mx,my,shape){
    if(shape.radius){
        // this is a circle
        var dx=mx-shape.x;
        var dy=my-shape.y;
        // math test to see if mouse is inside circle
        if(dx*dx+dy*dy<shape.radius*shape.radius){
            // yes, mouse is inside this circle
            return(true);
        }
    }else if(shape.width){
        // this is a rectangle
        var rLeft=shape.x;
        var rRight=shape.x+shape.width;
        var rTop=shape.y;
        var rBott=shape.y+shape.height;
        // math test to see if mouse is inside rectangle
        if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
            return(true);
        }
    }
    // the mouse isn't in any of the shapes
    return(false);
}

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX=parseInt(e.clientX-offsetX);
    startY=parseInt(e.clientY-offsetY);
    // test mouse position against all shapes
    // post result if mouse is in a shape
    for(var i=0;i<shapes.length;i++){
        if(isMouseInShape(startX,startY,shapes[i])){
            // the mouse is inside this shape
            // select this shape
            selectedShapeIndex=i;
            // set the isDragging flag
            isDragging=true;
            // and return (==stop looking for
            //     further shapes under the mouse)
            return;
        }
    }
}

function handleMouseUp(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseOut(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseMove(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);
    // how far has the mouse dragged from its previous mousemove position?
    var dx=mouseX-startX;
    var dy=mouseY-startY;
    // move the selected shape by the drag distance
    var selectedShape=shapes[selectedShapeIndex];
    selectedShape.x+=dx;
    selectedShape.y+=dy;
    // clear the canvas and redraw all shapes
    drawAll();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
}

// clear the canvas and
// redraw all shapes in their current positions
function drawAll(){
    ctx.clearRect(0,0,cw,ch);
    for(var i=0;i<shapes.length;i++){
        var shape=shapes[i];
        if(shape.radius){
            // it's a circle
            ctx.beginPath();
            ctx.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
            ctx.fillStyle=shape.color;
            ctx.fill();
        }else if(shape.width){
            // it's a rectangle
            ctx.fillStyle=shape.color;
            ctx.fillRect(shape.x,shape.y,shape.width,shape.height);
        }
    }
}