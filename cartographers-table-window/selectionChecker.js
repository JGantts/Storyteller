//room
//door
//wall
//corner
//point
let selected = {
  selectedType :"",
  selectedRoomId: -1,
  selectedId: -1
}

function checkSelection(x, y){
    if (selected.selectedType === "room") {
        selected.selectedRoomId = selected.selectedId;
    } else {
        selected.selectedRoomId = -1;
    }
    selected.selectedType = ""
    selected.selectedId = -1;
    if (selected.selectedType === "") {
        checkPointSelection(x, y);
    }
    if (selected.selectedType === "") {
        checkLineSelection(x, y);
    }
    if (selected.selectedType === "") {
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
            if (selected.selectedRoomId === -1){
                selected.selectedType = "point";
            } else {
                selected.selectedType = "corner";
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
            selected.selectedId = i;
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
            selected.selectedType = "wall";
            selected.selectedId = i;
            break;
        }
    }
    //console.log("--------");
    for(let i=0; i<metaroomDoors.length; i++){
        //console.log("\n\n");
        //console.log(i);
        if(isClickOnLine(x, y, metaroomDoors[i])){
            selected.selectedType = "door";
            selected.selectedId = i;
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
            selected.selectedType = "room";
            selected.selectedId = i;
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

module.exports = {
    selected: selected,
    selectionChecker: {
        checkSelection: checkSelection
    }
}
