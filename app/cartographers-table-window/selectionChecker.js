const assert = require('assert');
const crypto = require('crypto');

//room
//door
//wall
//side
//point
//corner
let selectedHover = {
  selectedType : "",
  selectedId: "",
  selectedRoomsIdsPartsIds: [],
  selectionInstancedId: null,
}

let selectedClick = {
  selectedType : "",
  selectedId: "",
  selectedRoomsIdsPartsIds: [],
  selectionInstancedId: null,
}

let selectionRoomtypeHover = {
  selectedType : "",
  selectedId: "",
  selectedRoomsIdsPartsIds: [],
  selectionInstancedId: null,
}

let selectionRoomtypeClick = {
  selectedType : "",
  selectedId: "",
  selectedRoomsIdsPartsIds: [],
  selectionInstancedId: null,
}

function checkSelectionHover(x, y, dataStructures ){
    let selected = checkSelection(x, y, dataStructures, true, true, false);
    selectedHover = selected;
}

function checkSelectionClick(x, y, dataStructures ){
    let selected = checkSelection(x, y, dataStructures, true, true, true);
    selectedClick = selected;
    if (selected.selectedType !== "") {
      selectedClick.selectionInstancedId = crypto.randomUUID();
    }
    selectedHover = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
}

function checkSelectionRoomtypeHover(x, y, dataStructures ){
  let selected = checkSelection(x, y, dataStructures, false, false, true);
  if (selected.selectedType !== "") {
    selected.selectionInstancedId = crypto.randomUUID();
  }
  selectionRoomtypeHover = selected;
}

function checkSelectionRoomtypeClick(x, y, dataStructures ){
    let selected = checkSelection(x, y, dataStructures, false, false, true);
    selectionRoomtypeClick = selected;
    if (selected.selectedType !== "") {
      selectionRoomtypeClick.selectionInstancedId = crypto.randomUUID();
    }
    selectionRoomtypeHover = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
}

function checkSelection(x, y, dataStructures, b_points, b_lines, b_rooms){
    assert(b_points || b_lines || b_rooms, "wut?")
    let selected = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
    if (b_points) {
        if (selected.selectedType === "") {
            selected = checkPointSelection(x, y, dataStructures);
        }
        if (selected.selectedType === "") {
            selected = checkCornerSelection(x, y, dataStructures);
        }
    }
    if (b_lines) {
        if (selected.selectedType === "") {
            selected = checkLineSelection(x, y, dataStructures);
        }
        if (selected.selectedType === "") {
            selected = checkSideSelection(x, y, dataStructures);
        }
    }
    if (b_rooms) {
        if (selected.selectedType === "") {
            selected = checkRoomSelection(x, y, dataStructures);
        }
    }
    return selected;
}


function checkPointSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
    for (const key in dataStructures.points) {
        let point = dataStructures.points[key];
        if(isClickOnPoint(x, y, point, getSelectionCheckMargin())){
            //console.log(metaroomPoints[i]);
            selected.selectedType = "point";
            selected.selectedId = dataStructures.points[key].id;
            for (const roomKey in dataStructures.metaroomDisk.rooms) {
                let room = dataStructures.metaroomDisk.rooms[roomKey];
                if (room.leftX===point.x && room.leftCeilingY===point.y) {
                    selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 0});
                } else if (room.leftX===point.x && room.leftFloorY===point.y) {
                    selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 3});
                } else if (room.rightX===point.x && room.rightCeilingY===point.y) {
                    selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 1});
                } else if (room.rightX===point.x && room.rightFloorY===point.y) {
                    selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 2});
                }
            }
            break;
        }
    }
    return selected;
}

function checkCornerSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
    for (const key in dataStructures.points) {
        if(isClickOnPoint(x, y, dataStructures.points[key], getSelectionCheckMargin()*2.5)){
            //console.log(metaroomPoints[i]);
            selected.selectedType = "corner";
            selected.selectedId = dataStructures.points[key].id;
            break;
        }
    }
    if (selected.selectedType !== "") {
        let roomSelection = checkRoomSelection(x, y, dataStructures);
        if (roomSelection.selectedType === "") {
            return {
              selectedType : "",
              selectedId: "",
              selectedRoomsIdsPartsIds: [],
              selectionInstancedId: null,
            }
        }
        let corner = geometry.tryGetCorner(dataStructures.metaroomDisk.rooms[roomSelection.selectedId], dataStructures.points[selected.selectedId]);
        if (corner === -1) {
            return {
              selectedType : "",
              selectedId: "",
              selectedRoomsIdsPartsIds: [],
              selectionInstancedId: null,
            }
        }
        selected.selectedRoomsIdsPartsIds = [{roomId: roomSelection.selectedId, partId: corner}];
    }
    return selected;
}

function checkLineSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
    let selectedLine = null;
    for (const key in dataStructures.walls) {
        if(isClickOnLine(x, y, dataStructures.walls[key], getSelectionCheckMargin())){
            selectedLine = dataStructures.walls[key];
            selected.selectedType = "wall";
            selected.selectedId = key;
            break;
        }
    }
    for (const key in dataStructures.doors) {
        if(isClickOnLine(x, y, dataStructures.doors[key], getSelectionCheckMargin())){
            selectedLine = dataStructures.doors[key];
            selected.selectedType = "door";
            selected.selectedId = key;
            break;
        }
    }
    if (selected.selectedType !== "") {
        for (const roomKey in dataStructures.metaroomDisk.rooms) {
            let room = dataStructures.metaroomDisk.rooms[roomKey];
            let roomSides = dataStructureFactory.getWallsFromRoom(room);
            if (selectedLine.start.x === selectedLine.end.x) {
                lineSegmentComparison(
                    selectedLine, roomSides[1],
                    () => {},
                    () => {
                        selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 1});
                    },
                    () => {});
                lineSegmentComparison(
                    selectedLine, roomSides[3],
                    () => {},
                    () => {
                        selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 3});
                    },
                    () => {});
            } else {
              lineSegmentComparison(
                  selectedLine, roomSides[0],
                  () => {},
                  () => {
                      selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 0});
                  },
                  () => {});
              lineSegmentComparison(
                  selectedLine, roomSides[2],
                  () => {},
                  () => {
                      selected.selectedRoomsIdsPartsIds.push({roomId: roomKey, partId: 2});
                  },
                  () => {});
            }
        }
    }
    return selected;
}

function checkSideSelection(x, y, dataStructures){
    let selected = {
        selectedType : "",
        selectedId: "",
        selectedRoomsIdsPartsIds: [],
        selectionInstancedId: null,
    }
    let selectedLine = null;
    let selectedRoom = null;
    for (const key in dataStructures.walls) {
        if(isClickOnLine(x, y, dataStructures.walls[key], getSelectionCheckMargin()*2.5)){
            selected.selectedType = "side";
            selected.selectedId = key;
            selectedLine = dataStructures.walls[key];
            break;
        }
    }
    if (selected.selectedType === "") {
        for (const key in dataStructures.doors) {
            if(isClickOnLine(x, y, dataStructures.doors[key], getSelectionCheckMargin()*2.5)){
                selected.selectedType = "side";
                selected.selectedId = key;
                selectedLine = dataStructures.doors[key];
                break;
            }
        }
    }
    if (selected.selectedType !== "") {
        let roomSelection = checkRoomSelection(x, y, dataStructures);
        if (roomSelection.selectedId === "") {
            return {
                selectedType : "",
                selectedId: "",
                selectedRoomsIdsPartsIds: [],
            }
        }
        let selectedRoom = dataStructures.metaroomDisk.rooms[roomSelection.selectedId];

        let sides = dataStructureFactory.getWallsFromRoom(selectedRoom);
        let intersectionSideIndex = -1;
        for (let i=0; i<4; i++) {
            lineSegmentComparison(
                selectedLine,
                sides[i],
                ()=>{},
                ()=>{
                    selected.selectedRoomsIdsPartsIds.push({roomId: roomSelection.selectedId, partId: i});
                },
                ()=>{}
            )
            if (intersectionSideIndex !== -1){
                break;
            }
        }
    }

    return selected;
}

function checkRoomSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
    for (const key in dataStructures.metaroomDisk.rooms) {
        if(isClickInRoom(x, y, dataStructures.metaroomDisk.rooms[key])){
            selected.selectedType = "room";
            selected.selectedId = key;
            break;
        }
    }
    return selected;
}

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

function isClickOnPoint(mx, my, point, selectionCheckMargin){
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

function isClickOnLine(mx, my, line, selectionCheckMargin){


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
        let slope = geometry.getSlope(line.start, line.end);
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
    let ceiling = geometry.getRoomCeiling(room);
    //console.log((((mx - ceiling.point.x) * -(ceiling.slope) + ceiling.point.y) >= my) );
    if (((mx - ceiling.point.x) * (ceiling.slope) + ceiling.point.y) >= my) {
        return false;
    }
    let floor = geometry.getRoomFloor(room);
    if (((mx - floor.point.x) * (floor.slope) + floor.point.y) <= my) {
        return false;
    }
    return true;
}

function resetSelection() {
    selectedHover = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }

    selectedClick = {
      selectedType : "",
      selectedId: "",
      selectedRoomsIdsPartsIds: [],
      selectionInstancedId: null,
    }
}

function getSelectionHover() {
    return selectedHover;
}

function getSelectionClick() {
    return selectedClick;
}

function getSelectionRoomtypeHover() {
    return selectionRoomtypeHover;
}

function getSelectionRoomtypeClick() {
    return selectionRoomtypeClick;
}

module.exports = {
    selectionChecker: {
        checkSelectionHover,
        checkSelectionClick,
        checkSelectionRoomtypeHover,
        checkSelectionRoomtypeClick,
        getSelectionHover,
        getSelectionClick,
        getSelectionRoomtypeHover,
        getSelectionRoomtypeClick,
        resetSelection,
    }
}
