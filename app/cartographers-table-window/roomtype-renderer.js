//#6494aa
const skyblue = {
  red: 100,
  green: 148,
  blue: 170
}

//#3e92cc
const lightblue = {
  red: 62,
  green: 146,
  blue: 204
}

//#16324f
const darkblue = {
  red: 22,
  green: 50,
  blue: 79
}

//#9fc490
const lightgreen = {
  red: 159,
  green: 196,
  blue: 144
}

//#4cb963
const green = {
  red: 76,
  green: 185,
  blue: 99
}

//#157f1f
const darkgreen = {
  red: 21,
  green: 127,
  blue: 31
}

//#edebd7
const lightbrown = {
  red: 237,
  green: 235,
  blue: 215
}

//#423e37
const darkbrown = {
  red: 66,
  green: 62,
  blue: 55
}

//#b1b23c
const yellow = {
  red: 177,
  green: 178,
  blue: 60
}

//#a63d40
const burntorange = {
  red: 166,
  green: 61,
  blue: 64
}

//#000000
const black = {
  red: 0,
  green: 0,
  blue: 0
}


let images = null;

async function drawRoomtype(roomtypeCtx, selectedRoom) {
    if (!images) {
      images = {
          checkerboard: new Image,
          chevronRight: new Image,
          chevron: new Image,
          flatHor: new Image,
          flatVer: new Image,
          waveHor: new Image,
          waveVer: new Image,
      }

      images.checkerboard.src = "./other-images/checkerboard.svg";
      images.chevronRight.src = "./other-images/chevron-right.svg";
      images.chevron.src = "./other-images/chevron.svg";
      images.flatHor.src = "./other-images/flat-hor.svg";
      images.flatVer.src = "./other-images/flat-ver.svg";
      images.waveHor.src = "./other-images/wave-hor.svg";
      images.waveVer.src = "./other-images/wave-ver.svg";


      images.checkerboard.width = 80;
      images.checkerboard.height = 80;
      images.chevronRight.width = 80;
      images.chevronRight.height = 80;
      images.chevron.width = 80;
      images.chevron.height = 80;
      images.flatHor.width = 80;
      images.flatHor.height = 80;
      images.flatVer.width = 80;
      images.flatVer.height = 80;
      images.waveHor.width = 80;
      images.waveHor.height = 80;
      images.waveVer.width = 80;
      images.waveVer.height = 80;

      await images.checkerboard.decode();
      await images.chevronRight.decode();
      await images.chevron.decode();
      await images.flatHor.decode();
      await images.flatVer.decode();
      await images.waveHor.decode();
      await images.waveVer.decode();
    }

    let img = null;
    let color = null;

    switch (selectedRoom.roomType) {
      case 0:   //atmosphere
        img = images.waveVer;
        color = skyblue;
        break;

      case 1:   //wooden walkway
        img = images.flatVer;
        color = lightbrown;
        break;

      case 2:   //concrete walkway
        img = images.flatHor;
        color = yellow;
        break;

      case 3:   //indoor corridor
        img = images.flatHor;
        color = burntorange;
        break;

      case 4:   //outdoor concrete
        img = images.flatVer;
        color = darkbrown;
        break;

      case 5:   //normal soil
        img = images.chevronRight;
        color = green;
        break;

      case 6:   //boggy soil
        img = images.chevron;
        color = darkgreen;
        break;

      case 7:   //drained soil
        img = images.chevron;
        color = lightgreen;
        break;

      case 8:   //fresh water
        img = images.waveHor;
        color = lightblue;
        break;

      case 9:   //salt water
        img = images.waveHor;
        color = darkblue;
        break;

      case 10:  //ettin home
        img = images.checkerboard;
        color = black;
        break;
    }

    let tempCanvas = document.createElement("canvas");
    let tCtx = tempCanvas.getContext("2d");
    tempCanvas.width = img.width * zooomSettle;
    tempCanvas.height = img.width * zooomSettle;

    tCtx.drawImage(img, 0, 0, img.width * zooomSettle, img.width * zooomSettle);
    tCtx.globalCompositeOperation = 'source-in';
    tCtx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${100})`;;
    tCtx.fillRect(0, 0, img.width * zooomSettle * 2, img.width * zooomSettle * 2);

    let patternStyle = roomtypeCtx.createPattern(tempCanvas, "repeat");
    if (!patternStyle) {
      return;
    }
    patternStyle.width = img.width * zooomSettle;
    patternStyle.height = img.width * zooomSettle;

    roomtypeCtx.fillStyle = patternStyle;
    roomtypeCtx.beginPath();
    roomtypeCtx.moveTo(selectedRoom.leftX - posX, selectedRoom.leftCeilingY - posY);
    roomtypeCtx.lineTo(selectedRoom.rightX - posX, selectedRoom.rightCeilingY - posY);
    roomtypeCtx.lineTo(selectedRoom.rightX - posX, selectedRoom.rightFloorY - posY);
    roomtypeCtx.lineTo(selectedRoom.leftX - posX, selectedRoom.leftFloorY - posY);
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
