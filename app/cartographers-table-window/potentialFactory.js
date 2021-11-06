function getPotentialRoomFromLine(startPoint, endPoint, dataStructures, line) {
  // Vertical
  if (line.start.x === line.end.x) {
      let deltaX = endPoint.x - startPoint.x;

      if (Math.abs(deltaX) < 5) {
          return null;
      }

      let xToConsider = line.start.x + deltaX;

      let closestPointsX = -1;
      for (let i=0; i<dataStructures.pointsSortedX.length; i++) {
          if (
            Math.abs(dataStructures.pointsSortedX[i].x - xToConsider)
            < Math.abs(closestPointsX - xToConsider)
          ) {
              closestPointsX = dataStructures.pointsSortedX[i].x;
          }
      }

      let xToUse = -1;
      if (Math.abs(xToConsider - closestPointsX) < 5) {
          xToUse = closestPointsX;
      } else {
          xToUse = xToConsider;
      }

      if (deltaX > 0) {
          return {
              id: null,
              leftX: line.start.x,
              rightX: xToUse,
              leftCeilingY: line.start.y,
              rightCeilingY: line.start.y,
              leftFloorY: line.end.y,
              rightFloorY: line.end.y,
          };
      } else {
          return {
              id: null,
              leftX: xToUse,
              rightX: line.start.x,
              leftCeilingY: line.start.y,
              rightCeilingY: line.start.y,
              leftFloorY: line.end.y,
              rightFloorY: line.end.y,
          };
      }
  // Horizontal
  } else {
      let deltaY = endPoint.y - startPoint.y;

      if (Math.abs(deltaY) < 5) {
          return null;
      }

      let yToConsiderA = line.start.y + deltaY;
      let yToConsiderB = line.end.y + deltaY;

      let closestPointAsY = -1;
      for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
          if (
            Math.abs(dataStructures.pointsSortedY[i].y - yToConsiderA)
            < Math.abs(closestPointAsY - yToConsiderA)
          ) {
              closestPointAsY = dataStructures.pointsSortedY[i].y;
          }
      }

      let closestPointBsY = -1;
      for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
          if (
            Math.abs(dataStructures.pointsSortedY[i].y - yToConsiderB)
            < Math.abs(closestPointBsY - yToConsiderB)
          ) {
              closestPointBsY = dataStructures.pointsSortedY[i].y;
          }
      }

      let deltaYToUse = -1;
      if (Math.abs(yToConsiderA - closestPointAsY) < 5) {
          deltaYToUse = closestPointAsY - line.start.y;
      } else if (Math.abs(yToConsiderB - closestPointBsY) < 5) {
          deltaYToUse = closestPointBsY - line.end.y;
      } else {
          deltaYToUse = deltaY;
      }

      return (dataStructureFactory.getSortedRoomFromDimensions(
          line.start.x, line.end.x,
          line.start.y, line.end.y,
          line.start.y + deltaYToUse, line.end.y + deltaYToUse
      ));
  }
}

function getPotentialRoomFromPoints(startPoint, endPoint, dataStructures) {

      let deltaX = endPoint.x - startPoint.x;

      if (Math.abs(deltaX) < 5) {
          return null;
      }

      let deltaY = endPoint.y - startPoint.y;

      if (Math.abs(deltaY) < 5) {
          return null;
      }



      let xToConsider = endPoint.x;

      let closestPointsX = -1;
      for (let i=0; i<dataStructures.pointsSortedX.length; i++) {
          if (
            Math.abs(dataStructures.pointsSortedX[i].x - xToConsider)
            < Math.abs(closestPointsX - xToConsider)
          ) {
              closestPointsX = dataStructures.pointsSortedX[i].x;
          }
      }

      let xToUse = -1;
      if (Math.abs(xToConsider - closestPointsX) < 5) {
          xToUse = closestPointsX;
      } else {
          xToUse = xToConsider;
      }


      let yToConsider = endPoint.y;

      let closestPointsY = -1;
      for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
          if (
            Math.abs(dataStructures.pointsSortedY[i].y - yToConsider)
            < Math.abs(closestPointsY - yToConsider)
          ) {
              closestPointsY = dataStructures.pointsSortedY[i].y;
          }
      }

      let yToUse = -1;
      if (Math.abs(yToConsider - closestPointsY) < 5) {
          yToUse = closestPointsY;
      } else {
          yToUse = yToConsider;
      }


      if (deltaX > 0) {
          return (dataStructureFactory.getSortedRoomFromDimensions(
              startPoint.x, xToUse,
              startPoint.y, startPoint.y,
              yToUse, yToUse
          ));
      } else {
        return (dataStructureFactory.getSortedRoomFromDimensions(
            xToUse, startPoint.x,
            startPoint.y, startPoint.y,
            yToUse, yToUse
        ));
      }

}

function getPotentialRoomFromYChange(startPoint, endPoint, dataStructures, room) {
    let deltaY = endPoint.y - startPoint.y;

    if (Math.abs(deltaY) < 5) {
        return null;
    }

    let yToConsider = endPoint.y;

    let closestPointsY = -1;
    for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
        if (
          Math.abs(dataStructures.pointsSortedY[i].y - yToConsider)
          < Math.abs(closestPointsY - yToConsider)
        ) {
            closestPointsY = dataStructures.pointsSortedY[i].y;
        }
    }

    let yToUse = -1;
    if (Math.abs(yToConsider - closestPointsY) < 5) {
        yToUse = closestPointsY;
    } else {
        yToUse = yToConsider;
    }

    let cornerIndex = geometry.getCorner(room, startPoint);

    switch (cornerIndex) {
      case 0:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: yToUse,
            rightCeilingY: room.rightCeilingY,
            leftFloorY: room.leftFloorY,
            rightFloorY: room.rightFloorY
        };

      case 1:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: yToUse,
            leftFloorY: room.leftFloorY,
            rightFloorY: room.rightFloorY
        };

      case 2:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: room.rightCeilingY,
            leftFloorY: room.leftFloorY,
            rightFloorY: yToUse
        };

      case 3:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: room.rightCeilingY,
            leftFloorY: yToUse,
            rightFloorY: room.rightFloorY
      };

    }
}

function getPotentialRoomFromSide(startPoint, endPoint, dataStructures, selectedRoom, selectedSide) {
    let room = selectedRoom;
    let side = dataStructureFactory.getWallsFromRoom(room)[selectedSide];
    assert(selectedSide !== -1)
    if (selectedSide === 0 || selectedSide == 2) {
        let deltaY = endPoint.y - startPoint.y;

        if (Math.abs(deltaY) < 5) {
            console.log("here");
            return null;
        }

        let yToConsiderA = side.start.y + deltaY;
        let yToConsiderB = side.end.y + deltaY;

        let closestPointAsY = -1;
        for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
            if (
              Math.abs(dataStructures.pointsSortedY[i].y - yToConsiderA)
              < Math.abs(closestPointAsY - yToConsiderA)
            ) {
                closestPointAsY = dataStructures.pointsSortedY[i].y;
            }
        }

        let closestPointBsY = -1;
        for (let i=0; i<dataStructures.pointsSortedY.length; i++) {
            if (
              Math.abs(dataStructures.pointsSortedY[i].y - yToConsiderB)
              < Math.abs(closestPointBsY - yToConsiderB)
            ) {
                closestPointBsY = dataStructures.pointsSortedY[i].y;
            }
        }

        let deltaYToUse = -1;
        if (Math.abs(yToConsiderA - closestPointAsY) < 5) {
            deltaYToUse = closestPointAsY - line.start.y;
        } else if (Math.abs(yToConsiderB - closestPointBsY) < 5) {
            deltaYToUse = closestPointBsY - line.end.y;
        } else {
            deltaYToUse = deltaY;
        }

        switch (selectedSide) {
          case 0:
            return {
                id: room.id,
                leftX: room.leftX,
                rightX: room.rightX,
                leftCeilingY: room.leftCeilingY + deltaYToUse,
                rightCeilingY: room.rightCeilingY + deltaYToUse,
                leftFloorY: room.leftFloorY,
                rightFloorY: room.rightFloorY
            };

          case 2:
            return {
                id: room.id,
                leftX: room.leftX,
                rightX: room.rightX,
                leftCeilingY: room.leftCeilingY,
                rightCeilingY: room.rightCeilingY,
                leftFloorY: room.leftFloorY + deltaYToUse,
                rightFloorY: room.rightFloorY + deltaYToUse
            };
        }

    } else {
        let deltaX = endPoint.x - startPoint.x;
        if (Math.abs(deltaX) < 5) {
            return null;
        }
        let xToConsider = endPoint.x;
        let closestPointsX = -1;
        for (let i=0; i<dataStructures.pointsSortedX.length; i++) {
            if (
              Math.abs(dataStructures.pointsSortedX[i].x - xToConsider)
              < Math.abs(closestPointsX - xToConsider)
            ) {
                closestPointsX = dataStructures.pointsSortedX[i].x;
            }
        }
        let xToUse = -1;
        if (Math.abs(xToConsider - closestPointsX) < 5) {
            xToUse = closestPointsX;
        } else {
            xToUse = xToConsider;
        }
        switch (selectedSide) {
          case 1:
            return {
                id: room.id,
                leftX: room.leftX,
                rightX: xToUse,
                leftCeilingY: room.leftCeilingY,
                rightCeilingY: room.rightCeilingY,
                leftFloorY: room.leftFloorY,
                rightFloorY: room.rightFloorY
            };

          case 3:
            let toReturn = {
                id: room.id,
                leftX: xToUse,
                rightX: room.rightX,
                leftCeilingY: room.leftCeilingY,
                rightCeilingY: room.rightCeilingY,
                leftFloorY: room.leftFloorY,
                rightFloorY: room.rightFloorY
            };
            return toReturn;
        }

    }
}

function roomOverlaps(room, dataStructures, toExclude) {
    if (!room) {
        return false;
    }
    let lines = dataStructureFactory.getWallsFromRoom(room);
    //check if this potentialRoom contains any existing points
    for (const pointKey in dataStructures.points) {
        let point = dataStructures.points[pointKey];
        if (point.x <= room.leftX) {
            continue;
        }
        if (point.x >= room.rightX) {
            continue;
        }
        let ceiling = lines[0];
        ceiling.slope = (ceiling.end.y - ceiling.start.y)/(ceiling.end.x - ceiling.start.x);
        if (((point.x - ceiling.start.x) * (ceiling.slope) + ceiling.start.y) >= point.y) {
            continue;
        }
        let floor = lines[2];
        floor.slope = (floor.end.y - floor.start.y)/(floor.end.x - floor.start.x);
        if (((point.x - floor.start.x) * (floor.slope) + floor.start.y) <= point.y) {
            continue;
        }
        return true;
    }
    //check if potentialRoom overlaps exactly any existing room sides
    //  such that rooms are overlapping, not adjacent
    for (const roomKey in dataStructures.metaroomDisk.rooms) {
        if (roomKey === toExclude.id){
            continue;
        }
        let linesExisting = dataStructureFactory.getWallsFromRoom(dataStructures.metaroomDisk.rooms[roomKey]);
        for (let i=0; i<4; i++) {
            let shouldReturnTrue = false;
            lineSegmentComparison(
              lines[i],
              linesExisting[i],
              () => {},
              () => {shouldReturnTrue = true;},
              () => {},
              () => {},
              () => {}
            );//(lineA, lineB, lineASlice, lineABSlice, lineBSlice, modificationWasMade, handled)
            if (shouldReturnTrue) {
                return true;
            }
        }
    }
    if (!toExclude) {
        //check if any potentialLine crosses any existing line
        for (const potentialLine of lines) {
            for (const existingLine of dataStructures.walls.concat(dataStructures.doors)) {
                if (geometry.lineSegmentsIntersectAndCross(potentialLine, existingLine)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function getPotentialRooms(ui, selection, dataStructures) {
    let rooms = [];
    if (ui.dragging.isDragging) {
        if (ui.shiftKeyIsDown) {
            if (selection.selectedType === "point") {
                let room = [getPotentialRoomFromPoints(
                  ui.dragging.startDragging,
                  ui.dragging.stopDragging,
                  dataStructures,
                )];
                if (room && !roomOverlaps(room, dataStructures)) {
                    rooms = [room];
                }


            } else if (selection.selectedType === "corner") {
                Function.prototype();

            } else if (selection.selectedType === "door") {
                Function.prototype();

            } else if (selection.selectedType === "wall") {
                let selectedLine = dataStructures.walls[selection.selectedId];
                let room = getPotentialRoomFromLine(ui.dragging.startDragging, ui.dragging.stopDragging, dataStructures, selectedLine);
                if (room && !roomOverlaps(room, dataStructures)) {
                    rooms = [room];
                }

            } else if (selection.selectedType === "room") {
                Function.prototype();


            } else if (selection.selectedType === "side") {
                Function.prototype();

            } else {
                let room = getPotentialRoomFromPoints(
                  ui.dragging.startDragging,
                  ui.dragging.stopDragging,
                  dataStructures,
                );
                if (room && !roomOverlaps(room, dataStructures)) {
                    rooms = [room];
                }
            }
        } else {
            if (selection.selectedType === "point") {
              for (index in selection.selectedRoomsIds) {
                  let id = selection.selectedRoomsIds[index];
                  let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                  let room = getPotentialRoomFromYChange(
                    ui.dragging.startDragging,
                    ui.dragging.stopDragging,
                    dataStructures,
                    selectedRoom
                  );
                  if (room && !roomOverlaps(room, dataStructures, selectedRoom)) {
                      rooms.push(room);
                  }
              }

            } else if (selection.selectedType === "corner") {
              assert(selection.selectedRoomsIds.length === 1,
                  `Size was not 1: ${JSON.stringify(selection.selectedRoomsIds)}`)
              let id = selection.selectedRoomsIds[0];
              let selectedRoom = dataStructures.metaroomDisk.rooms[id];
              let room = getPotentialRoomFromYChange(
                ui.dragging.startDragging,
                ui.dragging.stopDragging,
                dataStructures,
                selectedRoom
              );
              if (room && !roomOverlaps(room, dataStructures, selectedRoom)) {
                  rooms = [room];
              }

            } else if (selection.selectedType === "door"
                || selection.selectedType === "wall"
            ) {
                for (index in selection.selectedRoomsIds) {
                    let id = selection.selectedRoomsIds[index];
                    let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                    let selectedSide = selection.selctedRoomPartsIds[index];
                    let room = getPotentialRoomFromSide(ui.dragging.startDragging, ui.dragging.stopDragging, dataStructures, selectedRoom, selectedSide);
                    if (room && !roomOverlaps(room, dataStructures, selectedRoom)) {
                        rooms.push(room);
                    }
                }


            } else if (selection.selectedType === "room") {
                Function.prototype();


            } else if (selection.selectedType === "side") {
                assert(selection.selectedRoomsIds.length === 1,
                    `Size was not 1: ${JSON.stringify(selection.selectedRoomsIds)}`)
                let id = selection.selectedRoomsIds[0];
                let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                let selectedSide = selection.selctedRoomPartsIds[0];
                let room = getPotentialRoomFromSide(ui.dragging.startDragging, ui.dragging.stopDragging, dataStructures, selectedRoom, selectedSide);
                if (room && !roomOverlaps(room, dataStructures, selectedRoom)) {
                    rooms = [room];
                }

            } else {
                Function.prototype();
            }
        }
    }
    return rooms;
}

module.exports = {
    potentialFactory: {
        getPotentialRooms
    }
}
