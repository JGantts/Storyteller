async function redrawPotential(startPoint, endPoint, dataStructures, selected) {
    potentialCtx.clearRect(0, 0, metaroom.width, metaroom.height);
    if (isDragging) {
        if (selected.selectedType === "point" || selected.selectedType === "corner") {
          if (shiftKeyIsDown) {
              redrawPotentialFromPoints(startPoint, endPoint, dataStructures, selected);
          }
        } else if (selected.selectedType === "door") {
            Function.prototype();

        } else if (selected.selectedType === "wall") {
            if (shiftKeyIsDown) {
                redrawPotentialFromWall(startPoint, endPoint, dataStructures, selected);
            }

        } else if (selected.selectedType === "room") {
            Function.prototype();
        } else {
            if (shiftKeyIsDown) {
                redrawPotentialFromPoints(startPoint, endPoint, dataStructures, selected);
            }
        }
    }
}

async function redrawPotentialFromWall(startPoint, endPoint, dataStructures, selected) {
    let selectedLine = dataStructures.walls[selected.selectedId];
    let linesPoints =  getPotentiaLinesPointsFromWall(startPoint, endPoint, dataStructures, selectedLine);

    redrawPotentialRoom(linesPoints, dataStructures);
}

async function redrawPotentialFromPoints(startPoint, endPoint, dataStructures) {
    let linesPoints =  getPotentiaLinesPointsFromPoints(startPoint, endPoint, dataStructures);

    redrawPotentialRoom(linesPoints, dataStructures);
}

function redrawPotentialRoom(room, dataStructures) {

    let doorsWalls = dataStructureFactory.getDoorsWallsPotentialFromRoomPotential(room, dataStructures);
    let points = dataStructureFactory.getPointsFromRooms([room]);

    redrawRooms(potentialCtx, potentialCtx, doorsWalls, points, dataStructures.metaroomDisk);
}

module.exports = {
    potentialRenderer: {
        redrawPotentialRoom: redrawPotentialRoom
    }
}
