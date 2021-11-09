const crypto = require('crypto');

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

function getSortedRoomFromDimensions(leftX, rightX, leftYA, rightYA, leftYB, rightYB) {

    return {
        id: null,
        leftX: leftX,
        rightX: rightX,
        leftCeilingY: Math.min(leftYA, leftYB),
        rightCeilingY: Math.min(rightYA, rightYB),
        leftFloorY: Math.max(leftYA, leftYB),
        rightFloorY: Math.max(rightYA, rightYB)
    };
}

function getPermsFromRoomPotential(roomPotential, dataStructures) {
    let perms = [];
    let sides = getWallsFromRoom(roomPotential);
    for (let i = 0; i < sides.length; i++) {
        //console.log("\n\n\n\n");
        //console.log(`side: ${i}`);
        let side = sides[i];

        for (const key in dataStructures.metaroomDisk.rooms) {

            let wallsWithId = getWallsFromRoom(dataStructures.metaroomDisk.rooms[key])
                .map(
                  (possibleWall, ii) => {
                      return {
                        id: key,
                        wall: possibleWall
                      };
                  }
                );

            for (let k=0; k < wallsWithId.length; k++) {
                let wallWithId = wallsWithId[k];

                lineSegmentComparison(
                  side,
                  wallWithId.wall,
                  () => {},
                  () => {
                    perms = perms.concat(
                        {
                            rooms:
                            {
                                a: wallWithId.id,
                                b: roomPotential.id,
                            },
                            "permeability": 1.0
                        }
                    );
                  },
                  () => {},
                  () => {},
                  () => {}
                )
            }
        }
    }
    return perms;
}

function getDoorsWallsPotentialFromRoomPotential(roomPotential, dataStructuresActual) {
    let wallsSimple = getWallsFromRooms([roomPotential]).filter(function(val) {return val});
    let doorsWalls = slicePotentialRoomIntoPotentialLinesFromActualWalls(wallsSimple, dataStructuresActual.walls);
    return doorsWalls;
}

function slicePotentialRoomIntoPotentialLinesFromActualWalls(sidesPotential, wallsActual){
    let linesPotential = [];
    for (let i=0; i<sidesPotential.length; i++ ){
        let sidePotential = sidesPotential[i];
        let lineSegmentsNew = slicePotentialSideIntoPotentialLinesFromActualWalls(sidePotential, wallsActual).segments;
        assert(!lineSegmentsNew.changed);
        //console.log(wallSegments);
        linesPotential = linesPotential.concat(lineSegmentsNew.filter(function(val) {return val !== null}));
    }
    return linesPotential;
}

function slicePotentialSideIntoPotentialLinesFromActualWalls(defendingSegment, attackingSegmentsIn){
    assert(defendingSegment, `${JSON.stringify(defendingSegment)}`)
    assert(
      defendingSegment.start.x !== defendingSegment.end.x ||
      defendingSegment.start.y !== defendingSegment.end.y,
      `DefendingSegment has 0 length\n${JSON.stringify(defendingSegment)}`
    );
    let attackingSegments = [...attackingSegmentsIn];

    let newDefendingSegments1 = [defendingSegment];
    let defendingSegmentChanged = false;
    let attackingSegment = attackingSegments.pop();
    if (!attackingSegment) {
        return {segments: [defendingSegment], changed: false};
    }
    do {
        assert(
          attackingSegment.start.x !== attackingSegment.end.x ||
          attackingSegment.start.y !== attackingSegment.end.y,
          `AttackingSegment has 0 length\n${JSON.stringify(attackingSegment)}`
        );

        let newDefendingSegments2 = [];
        let thisDefendingSegmement = newDefendingSegments1.pop()
        while (thisDefendingSegmement) {
            lineSegmentComparison(
                thisDefendingSegmement,
                attackingSegment,
                (start, end) => {
                    let newSegment = geometry.getSortedDoor(start.x, start.y, end.x, end.y, thisDefendingSegmement.permeability, thisDefendingSegmement.roomKeys);
                    newDefendingSegments2 = [...newDefendingSegments2, newSegment];
                },
                (start, end) => {
                    let newSegment = geometry.getSortedDoor(start.x, start.y, end.x, end.y, 1.0, [...thisDefendingSegmement.roomKeys, ...attackingSegment.roomKeys]);
                    newDefendingSegments2 = [...newDefendingSegments2, newSegment];
                    defendingSegmentChanged = true;
                },
                () => {},
                () => {},
                () => {}
            );
            thisDefendingSegmement = newDefendingSegments1.pop();
        }
        newDefendingSegments1 = [...newDefendingSegments2];
        attackingSegment = attackingSegments.pop();
    } while (attackingSegment);
    return {segments: newDefendingSegments1, changed: defendingSegmentChanged};
}




function getDoorsFromRooms(rooms, perms) {
  let doors = [];
  for (const perm of perms) {
      //console.log(perm);
  //perms.forEach((perm, i) => {
      let roomA = rooms[perm.rooms.a];
      let roomB = rooms[perm.rooms.b];

      //console.log(rooms);
      //console.log(perms);

      //First check the more performant opeeration: vertical doors

      if (roomA.leftX === roomB.rightX) {

          let middleTwo = getMiddleTwo(roomA.leftCeilingY, roomA.leftFloorY, roomB.rightCeilingY, roomB.rightFloorY);

          doors.push(
              geometry.getSortedDoor(
                  roomA.leftX, middleTwo.high,
                  roomA.leftX, middleTwo.low,
                  perm.permeability,
                  [perm.rooms.a, perm.rooms.b]
              )
          );
          continue;
      }
      if (roomA.rightX === roomB.leftX) {

        let middleTwo = getMiddleTwo(roomA.rightCeilingY, roomA.rightFloorY, roomB.leftCeilingY, roomB.leftFloorY);

        doors.push(
            geometry.getSortedDoor(
                roomB.leftX, middleTwo.high,
                roomB.leftX, middleTwo.low,
                perm.permeability,
                [perm.rooms.a, perm.rooms.b]
            )
        );
        continue;

      }

      //Now check the less performant operation: horizontal floors/ceilings which can be slopped
      let roomALineTop = geometry.getRoomCeiling(roomA);

      let roomALineBottom = geometry.getRoomFloor(roomA);


      let roomBLineTop = geometry.getRoomCeiling(roomB);

      let roomBLineBottom = geometry.getRoomFloor(roomB);

      if (getIntersectsFromFour(roomALineBottom, roomB)) {
          let ourPoints = getMiddleTwoPointsConsideredHoizontally(
              {x: roomA.leftX, y: roomA.leftFloorY},
              {x: roomA.rightX, y: roomA.rightFloorY},
              {x: roomB.leftX, y: roomB.leftCeilingY},
              {x: roomB.rightX, y: roomB.rightCeilingY}
          );
          doors.push(
              geometry.getSortedDoor(
                  ourPoints.high.x, ourPoints.high.y,
                  ourPoints.low.x, ourPoints.low.y,
                  perm.permeability,
                  [perm.rooms.a, perm.rooms.b]
              )
          );
          continue;
      }
      if (getIntersectsFromFour(roomBLineBottom, roomA)) {
          let ourPoints = getMiddleTwoPointsConsideredHoizontally(
              {x: roomA.leftX, y: roomA.leftCeilingY},
              {x: roomA.rightX, y: roomA.rightCeilingY},
              {x: roomB.leftX, y: roomB.leftFloorY},
              {x: roomB.rightX, y: roomB.rightFloorY}
          );
          doors.push(
              geometry.getSortedDoor(
                  ourPoints.high.x, ourPoints.high.y,
                  ourPoints.low.x, ourPoints.low.y,
                  perm.permeability,
                  [perm.rooms.a, perm.rooms.b]
              )
          );
          continue;
      }
      console.log(`Rooms don't actually touch...:\n${JSON.stringify(perm)}\nA: ${JSON.stringify(roomA)}\nB: ${JSON.stringify(roomB)}\n\n`);
      console.log(new Error().stack);
  }
  //console.log(doors);
  return doors;
}

function getMiddleTwo(one, two, three, four){
    let sorted = [one, two, three, four];
    sorted.sort();
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

function getMiddleTwoPointsConsideredHoizontally(one, two, three, four){
    let sorted = [one, two, three, four];
    sorted.sort((a, b) => {return a.x - b.x});
    return {
        high: sorted[2],
        low: sorted[1]
    }
}

function getPointOne(room){
    return {x: room.leftX, y: room.leftCeilingY};
}

function getPointTwo(room){
    return {x: room.leftX, y: room.leftFloorY};
}

function getPointThree(room){
    return {x: room.rightX, y: room.rightFloorY};
}

function getPointFour(room){
    return {x: room.rightX, y: room.rightCeilingY};
}

function getIntersectsFromFour(line, room){
    return (getIntersectsFromOne(line, getPointOne(room)))
      ?? (getIntersectsFromOne(line, getPointTwo(room)))
      ?? (getIntersectsFromOne(line, getPointThree(room)))
      ?? (getIntersectsFromOne(line, getPointFour(room)));
}

function getIntersectsFromOne(line, point){
    if (((point.x - line.point.x) * -(line.slope) + line.point.y) === point.y) {
        return point;
    }
    return null;
}

function subtractSegmentsFromSegments(defendingSegments, attackingSegments){
    assert(defendingSegments, `Instead of UUID, found ${defendingSegments}`);
    let newDefendingSegments1 = [];
    for (let i=0; i<defendingSegments.length; i++ ){
        let defendingSegment = defendingSegments[i];
        let newDefendingSegments2 = subtractSegmentsFromSegment(defendingSegment, attackingSegments).segments;
        assert(!newDefendingSegments2.changed);
        newDefendingSegments1 = newDefendingSegments1.concat(newDefendingSegments2.filter(function(val) {return val !== null}));
    }
    return newDefendingSegments1;
}

function subtractSegmentsFromSegment(defendingSegment, attackingSegmentsIn){
    assert(defendingSegment, `${JSON.stringify(defendingSegment)}`)
    assert(
      defendingSegment.start.x !== defendingSegment.end.x ||
      defendingSegment.start.y !== defendingSegment.end.y,
      `DefendingSegment has 0 length\n${JSON.stringify(defendingSegment)}`
    );
    let attackingSegments = [...attackingSegmentsIn];

    let newDefendingSegments1 = [defendingSegment];
    let defendingSegmentChanged = false;
    let attackingSegment = attackingSegments.pop();
    if (!attackingSegment) {
        return {segments: [defendingSegment], changed: false};
    }
    do {
        assert(
          attackingSegment.start.x !== attackingSegment.end.x ||
          attackingSegment.start.y !== attackingSegment.end.y,
          `AttackingSegment has 0 length\n${JSON.stringify(attackingSegment)}`
        );

        let newDefendingSegments2 = [];
        let thisDefendingSegmement = newDefendingSegments1.pop()
        while (thisDefendingSegmement) {
            lineSegmentComparison(
                thisDefendingSegmement,
                attackingSegment,
                (start, end) => {
                    let newSegment = geometry.getSortedDoor(start.x, start.y, end.x, end.y, -1, thisDefendingSegmement.roomKeys);
                    let newSegmments = subtractSegmentsFromSegment(newSegment, attackingSegments);
                    newDefendingSegments2 = [...newDefendingSegments2, ...newSegmments.segments];
                },
                () => {
                    defendingSegmentChanged = true;
                },
                () => {},
                () => {},
                () => {}
            );
            thisDefendingSegmement = newDefendingSegments1.pop();
        }
        newDefendingSegments1 = [...newDefendingSegments2];
        attackingSegment = attackingSegments.pop();
    } while (attackingSegment);
    return {segments: newDefendingSegments1, changed: defendingSegmentChanged};
}

/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

function buildInsertPoint(points, roomKey, x, y) {
    let id = "" + x + "-" + y;
    if (!points[id]) {
        let roomKeys = [];
        points[id] = {id, x, y, roomKeys};
    }
    points[id].roomKeys.push(roomKey);
}

function getPointsFromRooms(rooms) {
    let points = Object();
    for (const key in rooms) {
        buildInsertPoint(points, key, rooms[key].leftX, rooms[key].leftCeilingY);
        buildInsertPoint(points, key, rooms[key].rightX, rooms[key].rightCeilingY);
        buildInsertPoint(points, key, rooms[key].rightX, rooms[key].rightFloorY);
        buildInsertPoint(points, key, rooms[key].leftX, rooms[key].leftFloorY);
    }
    return points;
}

function getWallsFromRooms(rooms) {
  let doors = [];
  for (const key in rooms) {
      doors = doors.concat(getWallsFromRoom(rooms[key]));
  }
  return doors;
}

function getWallsFromRoom(room) {
    let doors = [];

    doors.push(
        geometry.getSortedDoor(
            room.leftX, room.leftCeilingY,
            room.rightX, room.rightCeilingY,
            -1,
            [room.id]
        )
    );
    doors.push(
      geometry.getSortedDoor(
            room.rightX, room.rightCeilingY,
            room.rightX, room.rightFloorY,
            -1,
            [room.id]
        )
    );
    doors.push(
        geometry.getSortedDoor(
            room.rightX, room.rightFloorY,
            room.leftX, room.leftFloorY,
            -1,
            [room.id]
        )
    );
    doors.push(
        geometry.getSortedDoor(
            room.leftX, room.leftFloorY,
            room.leftX, room.leftCeilingY,
            -1,
            [room.id]
        )
    );

    return doors;
}

module.exports = {
    dataStructureFactory: {
        getWallsFromRooms,
        getWallsFromRoom,
        getDoorsFromRooms,
        getPointsFromRooms,
        subtractSegmentsFromSegments,
        getDoorsWallsPotentialFromRoomPotential,
        getPermsFromRoomPotential,
        getSortedRoomFromDimensions
    }
}
