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
const selectionCircleRotationsPerSecond = 3/4;


function drawRoomtype(roomtypeCtx, selectedRoom) {
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
        pctx.lineWidth = getRoomLineThickness() * getSelectionMultiplier()*getSelectionMultiplier()/1.5;

        let milisecondsAfteFrame = ((time.getSeconds()*1000 + time.getMilliseconds())%(1000/selectionCircleRotationsPerSecond));
        let percentageAfterFrameStart = milisecondsAfteFrame / (1000/selectionCircleRotationsPerSecond);

        let animationOffset = 40*percentageAfterFrameStart;
        let lineAdustment = i*thickness + thickness/2 + animationOffset
        pctx.moveTo(-5, -45 + lineAdustment);
        pctx.lineTo(145, -195 + lineAdustment);
        pctx.stroke();
    }

    let patternStyle = selectionRainbowCtx.createPattern(pattern, "repeat");

    roomtypeCtx.fillStyle = patternStyle;
    roomtypeCtx.beginPath();
    roomtypeCtx.moveTo(selectedRoom.leftX, selectedRoom.leftCeilingY);
    roomtypeCtx.lineTo(selectedRoom.rightX, selectedRoom.rightCeilingY);
    roomtypeCtx.lineTo(selectedRoom.rightX, selectedRoom.rightFloorY);
    roomtypeCtx.lineTo(selectedRoom.leftX, selectedRoom.leftFloorY);
    roomtypeCtx.closePath();
    roomtypeCtx.fill();
}

async function redrawRoomtypes(roomtypeCtx, dataStructures){
    for (roomKey in dataStructures.metaroomDisk.rooms) {
        drawRoomtype(roomtypeCtx, dataStructures.metaroomDisk.rooms[roomKey]);
    }
}

module.exports = {
    roomtypeRenderer: {
        redrawRoomtypes
    }
}
