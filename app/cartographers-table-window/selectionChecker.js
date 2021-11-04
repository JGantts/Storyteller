//room
//door
//wall
//corner
//point
let selectedHover = {
  selectedType : "",
  selectedRoomId: "",
  selectedId: ""
}

let selectedClick = {
  selectedType : "",
  selectedRoomId: "",
  selectedId: ""
}

function checkSelectionHover(x, y, dataStructures ){
    if (selectedClick.selectedType !== "") {
        return;
    }
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
    if (selected.selectedType === "") {
        selected = checkPointSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkCornerSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkLineSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkRoomSelection(x, y, dataStructures);
    }
    selectedHover = selected;
}

function checkSelectionClick(x, y, dataStructures ){
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
    if (selected.selectedType === "") {
        selected = checkPointSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkCornerSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkLineSelection(x, y, dataStructures);
    }
    if (selected.selectedType === "") {
        selected = checkRoomSelection(x, y, dataStructures);
    }
    selectedClick = selected;
    selectedHover = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
}

function checkPointSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
    for (const key in dataStructures.points) {
        if(isClickOnPoint(x, y, dataStructures.points[key], selectionCheckMargin)){
            //console.log(metaroomPoints[i]);
            if (selected.selectedRoomId === ""){
                selected.selectedType = "point";
            } else {
                selected.selectedType = "corner";
            }
            selected.selectedId = dataStructures.points[key].id;
            break;
        }
    }
    return selected;
}

function checkCornerSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
    for (const key in dataStructures.points) {
        if(isClickOnPoint(x, y, dataStructures.points[key], selectionCheckMargin*2)){
            //console.log(metaroomPoints[i]);
            selected.selectedType = "corner";
            selected.selectedId = dataStructures.points[key].id;
            break;
        }
    }
    if (selected.selectedType !== "") {
        let roomSelection = checkRoomSelection(x, y, dataStructures);
        selected.selectedRoomId = roomSelection.selectedId;
        console.log(selected);
    }
    return selected;
}

function checkLineSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
    for (const key in dataStructures.walls) {
        if(isClickOnLine(x, y, dataStructures.walls[key])){
            selected.selectedType = "wall";
            selected.selectedId = key;
            break;
        }
    }
    for (const key in dataStructures.doors) {
        if(isClickOnLine(x, y, dataStructures.doors[key])){
            selected.selectedType = "door";
            selected.selectedId = key;
            break;
        }
    }
    return selected;
}

function checkRoomSelection(x, y, dataStructures){
    let selected = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
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
      selectedRoomId: "",
      selectedId: ""
    }

    selectedClick = {
      selectedType : "",
      selectedRoomId: "",
      selectedId: ""
    }
}

function getSelectionHover() {
    return selectedHover;
}

function getSelectionClick() {
    return selectedClick;
}

module.exports = {
    selectionChecker: {
        checkSelectionHover,
        checkSelectionClick,
        getSelectionHover,
        getSelectionClick,
        resetSelection
    }
}
