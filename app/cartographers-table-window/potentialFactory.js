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
          xToUse =
          xToConsider;
      }
      xToUse = Math.round(xToUse);

      if (deltaX > 0) {
          return {
              id: null,
              leftX: line.start.x,
              rightX: xToUse,
              leftCeilingY: line.start.y,
              rightCeilingY: line.start.y,
              leftFloorY: line.end.y,
              rightFloorY: line.end.y,
              roomType: -1,
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
              roomType: -1,
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
      deltaYToUse = Math.round(deltaYToUse);

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
      xToUse = Math.round(xToUse);


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
      yToUse = Math.round(yToUse);


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
    yToUse = Math.round(yToUse);

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
            rightFloorY: room.rightFloorY,
            roomType: room.roomType,
        };

      case 1:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: yToUse,
            leftFloorY: room.leftFloorY,
            rightFloorY: room.rightFloorY,
            roomType: room.roomType,
        };

      case 2:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: room.rightCeilingY,
            leftFloorY: room.leftFloorY,
            rightFloorY: yToUse,
            roomType: room.roomType,
        };

      case 3:
        return {
            id: room.id,
            leftX: room.leftX,
            rightX: room.rightX,
            leftCeilingY: room.leftCeilingY,
            rightCeilingY: room.rightCeilingY,
            leftFloorY: yToUse,
            rightFloorY: room.rightFloorY,
            roomType: room.roomType,
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
            deltaYToUse = closestPointAsY - side.start.y;
        } else if (Math.abs(yToConsiderB - closestPointBsY) < 5) {
            deltaYToUse = closestPointBsY - side.end.y;
        } else {
            deltaYToUse = deltaY;
        }
        deltaYToUse = Math.round(deltaYToUse);

        switch (selectedSide) {
          case 0:
            return {
                id: room.id,
                leftX: room.leftX,
                rightX: room.rightX,
                leftCeilingY: room.leftCeilingY + deltaYToUse,
                rightCeilingY: room.rightCeilingY + deltaYToUse,
                leftFloorY: room.leftFloorY,
                rightFloorY: room.rightFloorY,
                roomType: room.roomType,
            };

          case 2:
            return {
                id: room.id,
                leftX: room.leftX,
                rightX: room.rightX,
                leftCeilingY: room.leftCeilingY,
                rightCeilingY: room.rightCeilingY,
                leftFloorY: room.leftFloorY + deltaYToUse,
                rightFloorY: room.rightFloorY + deltaYToUse,
                roomType: room.roomType,
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
        xToUse = Math.round(xToUse);

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

function roomOverlapsOrCausesTooSmallDoor(room, dataStructures, idsToDelete) {
    if (!room) {
        return false;
    }
    if (room.leftX >= room.rightX
    || room.leftCeilingY >= room. leftFloorY
    || room.rightCeilingY >= room.rightFloorY) {
      return true;
    }

    let lines = dataStructureFactory.getWallsFromRoom(room);

    //check if this potentialRoom contains any existing points.
    //    exclude all points which exist only on rooms which we're modifying.
    for (const pointKey in dataStructures.points) {
        let point = dataStructures.points[pointKey];
        if (point.roomKeys.every(key => idsToDelete?.some(idToDelete => idToDelete.id === key))) {
            continue;
        }
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
    //    such that rooms are overlapping, not adjacent.
    //    exclude all rooms which we're modifying.
    for (const roomKey in dataStructures.metaroomDisk.rooms) {
        if (idsToDelete?.some(idToDelete => roomKey === idToDelete.id)) {
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
              () => {}
            );//(lineA, lineB, lineASlice, lineABSlice, lineBSlice, modificationWasMade, handled)
            if (shouldReturnTrue) {
                return true;
            }
        }
    }

    //check if any potentialLine crosses any existing line
    //    exclude all lines which exist only on rooms we're modifying
    for (const potentialLine of lines) {
        for (const existingLine of dataStructures.walls.concat(dataStructures.doorsArray)) {
            if (existingLine.roomKeys.every(roomKey => idsToDelete?.some(idToDelete => idToDelete.id === roomKey))) {
                continue;
            }
            if (geometry.lineSegmentsIntersectAndCross(potentialLine, existingLine)) {
                return true;
            }
        }
    }

    //check all doors/walls to for ones 5 units or smaller
    for (const potentialLine of lines) {
        if (Math.abs(potentialLine.start.x - potentialLine.end.x) >= 5) {
            continue;
        }
        if (Math.abs(potentialLine.start.y - potentialLine.end.y) >= 5) {
            continue;
        }
        return true;
    }

    return false;
}

function getPotentialRooms(masterUiState, selection, dataStructures) {
    let rooms = [];
    if (masterUiState.dragging.isDragging) {
        if (masterUiState.keys.shiftKeyIsDown) {
            if (masterUiState.dragging.whatDragging === "point") {
                let room = [getPotentialRoomFromPoints(
                  masterUiState.dragging.startDragging,
                  masterUiState.dragging.stopDragging,
                  dataStructures,
                )];
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                    rooms = [room];
                }

            } else if (masterUiState.dragging.whatDragging === "corner") {
                Function.prototype();

            } else if (masterUiState.dragging.whatDragging === "door") {
                Function.prototype();

            } else if (masterUiState.dragging.whatDragging === "wall") {
                Function.prototype();

            } else if (masterUiState.dragging.whatDragging === "room") {
                Function.prototype();

            } else if (masterUiState.dragging.whatDragging === "side") {
                Function.prototype();

            } else {
                let room = getPotentialRoomFromPoints(
                  masterUiState.dragging.startDragging,
                  masterUiState.dragging.stopDragging,
                  dataStructures,
                );
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                    rooms = [room];
                }
            }

        } else if (masterUiState.keys.ctrlKeyIsDown) {
          if (masterUiState.dragging.whatDragging === "point"
            || masterUiState.dragging.whatDragging === "corner") {
              let room = [getPotentialRoomFromPoints(
                masterUiState.dragging.startDragging,
                masterUiState.dragging.stopDragging,
                dataStructures,
              )];
              if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                  rooms = [room];
              }

          } else if (masterUiState.dragging.whatDragging === "door") {
              Function.prototype();

          } else if (masterUiState.dragging.whatDragging === "wall") {
              let selectedLine = dataStructures.walls[selection.selectedId];
              let room = getPotentialRoomFromLine(masterUiState.dragging.startDragging, masterUiState.dragging.stopDragging, dataStructures, selectedLine);
              if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                  rooms = [room];
              }

          } else if (masterUiState.dragging.whatDragging === "room") {
              Function.prototype();


          } else if (masterUiState.dragging.whatDragging === "side") {
              Function.prototype();

          } else {
              Function.prototype();
          }
        } else {
            if (masterUiState.dragging.whatDragging === "point") {
              let newRooms = [];
              for (index in selection.selectedRoomsIdsPartsIds) {
                  let roomIdPartId = selection.selectedRoomsIdsPartsIds[index];
                  let id = roomIdPartId.roomId;
                  let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                  let room = getPotentialRoomFromYChange(
                    masterUiState.dragging.startDragging,
                    masterUiState.dragging.stopDragging,
                    dataStructures,
                    selectedRoom
                  );
                  newRooms.push(room);
              }
              for (newRoom of newRooms) {
                  if (newRoom && !roomOverlapsOrCausesTooSmallDoor(newRoom, dataStructures, newRooms)) {
                      rooms.push(newRoom);
                  }
              }

            } else if (masterUiState.dragging.whatDragging === "corner") {
              assert(selection.selectedRoomsIdsPartsIds.length === 1,
                  `Size was not 1: ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`);
              let roomIdPartId = selection.selectedRoomsIdsPartsIds[0];
              let id = roomIdPartId.roomId;
              let selectedRoom = dataStructures.metaroomDisk.rooms[id];
              let room = getPotentialRoomFromYChange(
                masterUiState.dragging.startDragging,
                masterUiState.dragging.stopDragging,
                dataStructures,
                selectedRoom
              );
              if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures, [selectedRoom])) {
                  rooms = [room];
              }

            } else if (masterUiState.dragging.whatDragging === "door"
                || masterUiState.dragging.whatDragging === "wall"
            ) {
                let newRooms = [];
                for (index in selection.selectedRoomsIdsPartsIds) {
                    let selectedRoomIdPartId = selection.selectedRoomsIdsPartsIds[index];
                    let id = selectedRoomIdPartId.roomId;
                    let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                    let selectedSide = selectedRoomIdPartId.partId;
                    let room = getPotentialRoomFromSide(masterUiState.dragging.startDragging, masterUiState.dragging.stopDragging, dataStructures, selectedRoom, selectedSide);
                    newRooms.push(room);
                }
                for (newRoom of newRooms) {
                    if (newRoom && !roomOverlapsOrCausesTooSmallDoor(newRoom, dataStructures, newRooms)) {
                        rooms.push(newRoom);
                    }
                }

            } else if (masterUiState.dragging.whatDragging === "room") {
                Function.prototype();


            } else if (masterUiState.dragging.whatDragging === "side") {
                assert(selection.selectedRoomsIdsPartsIds.length === 1,
                    `Size was not 1: ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`)
                let roomIdPartId = selection.selectedRoomsIdsPartsIds[0];
                let id = roomIdPartId.roomId;
                let selectedRoom = dataStructures.metaroomDisk.rooms[id];
                let selectedSide = roomIdPartId.partId;
                let room = getPotentialRoomFromSide(masterUiState.dragging.startDragging, masterUiState.dragging.stopDragging, dataStructures, selectedRoom, selectedSide);
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures, [selectedRoom])) {
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
