//gay pride! That's right fuckers
//red     RGB 228 003 003
//orange  RGB 255 140 000
//yellow  RGB 255 237 000
//green   RGB 000 128 038
//blue    RGB 000 077 255
//purple  RGB 117 007 135

let selectionCheckMargin = 6;
const selctionSquareWidth = selectionCheckMargin * 4/3;

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


function drawSelectionSquare(x, y) {
    //console.log(x);
    //console.log(y);
    selectionCtx.lineWidth = roomLineThickness;
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
    redrawPasties();
    selectionCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    //wildSelection();
//  return;
    //console.log(selectedType);
    //console.log((selectedId));
    if (selected.selectedType === "point" || selected.selectedType === "corner") {
        let selectedPoint = metaroomPoints[selected.selectedId];
        drawSelectionSquare(selectedPoint.x, selectedPoint.y);
    } else if (selected.selectedType === "door" || selected.selectedType === "wall") {
        let selectedSide = null;
        if (selected.selectedType === "door") {
            selectedSide = metaroomDoors[selected.selectedId];
        } else {
            selectedSide = metaroomWalls[selected.selectedId];
        }
        drawSelectionLine(selectedSide);
    } else if (selected.selectedType === "room") {
        drawSelectionRoom(metaroom.rooms[selected.selectedId]);
    }
}

module.exports = {
    selectionRenderer: {
        redrawSelection: redrawSelection
    }
}
