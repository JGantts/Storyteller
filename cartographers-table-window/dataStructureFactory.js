/*
leftX: 100,
rightX: 200,
leftCeilingY: 250,
rightCeilingY: 250,
leftFloorY: 300,
rightFloorY: 300,
*/

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
                  perm.permeability
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
                perm.permeability
            )
        );
        continue;

      }

      //Now check the less performant operation: horizontal floors/ceilings which can be slopped
      let roomALineTop = geometry.getRoomCeiling(roomA);

      let roomALineBottom = geometry.getRoomFloor(roomA);


      let roomBLineTop = geometry.getRoomCeiling(roomB);

      let roomBLineBottom = geometry.getRoomFloor(roomB);

      //console.log(roomBLineBottom);

      /*if (getIntersectsFromFour(roomALineTop, roomB) || getIntersectsFromFour(roomBLineBottom, roomA)) {
          let ourPoints = getMiddleTwoPointsConsideredHoizontally(
              {x: roomA.leftX, y: roomA.leftCeilingY},
              {x: roomA.rightX, y: roomA.rightCeilingY},
              {x: roomB.leftX, y: roomB.leftFLoorY},
              {x: roomB.rightX, y: roomB.rightFloorY}
          );
          doors.push(
            {
              permeability: perm.permeability,
              start: ourPoints.high,
              end: ourPoints.low
            }
          );
          continue;
      }*/

    //  if (getIntersectsFromFour(roomALineBottom, roomB) || getIntersectsFromFour(roomBLineTop, roomA)) {
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
                  perm.permeability
              )
          );
          continue;
      }
      console.log("wtf");
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

function subtractDoorsFromWalls(wallsOverreach, doors){
    let walls = [];
    for (let i=0; i<wallsOverreach.length; i++ ){
        let wall = wallsOverreach[i];
        let wallSegments = subtractDoorsFromWall(wall, doors).segments;
        assert(!wallSegments.changed);
        //console.log(wallSegments);
        walls = walls.concat(wallSegments.filter(function(val) {return val !== null}));
    }
    return walls;
}

function subtractDoorsFromWall(wall, doors){
    let walls = [];
    let wallMinX = Math.min(wall.start.x, wall.end.x);
    let wallMaxX = Math.max(wall.start.x, wall.end.x);
    let wallMinY = Math.min(wall.start.y, wall.end.y);
    let wallMaxY = Math.max(wall.start.y, wall.end.y);
    let wallHandled = false;
    let wallChanged = false;
    for (let j=0; j < doors.length; j++) {
        let door = doors[j];
        let doorsToPassDown =  doors.filter(function(val) {return (
          val.start.x !== door.start.x
          ||val.start.y !== door.start.y
          ||val.end.x !== door.end.x
          ||val.end.y !== door.end.y
        )});
        let doorMinX = Math.min(door.start.x, door.end.x);
        let doorMaxX = Math.max(door.start.x, door.end.x);
        let doorMinY = Math.min(door.start.y, door.end.y);
        let doorMaxY = Math.max(door.start.y, door.end.y);

        //vertical wall
        if (wallMinX === wallMaxX) {

            //vertical door
            if (doorMinX === doorMaxX) {

                //on same axis
                if (door.start.x === wall.start.x) {

                    //there is overlap
                    if (
                      doorMaxY >= wallMinY
                      && doorMinY <= wallMaxY
                    ) {
                        wallHandled = true;

                        //well, "overlap"
                        if (
                            doorMaxY === wallMinY
                            || doorMinY === wallMaxY
                        ) {
                            let newSegmentA = wall;
                            let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);

                        //overlap with upper-left and lower-right tails
                        } else if (
                            doorMinY < wallMinY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                wallChanged = true;
                                walls = walls.concat(newSegmmentsA);

                        //overlap with lower-right tail
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY < wallMaxY
                        ) {
                            let newSegmentA = geometry.getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                            let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                            wallChanged = true;
                            walls = walls.concat(newSegmmentsA);

                        //overlap with upper-right and lower-right tails
                        } else if (
                            doorMinY > wallMinY
                            && doorMaxY < wallMaxY
                        ) {
                            let newSegmentA = geometry.getSortedDoor(door.start.x, wallMinY, door.start.x, doorMinY, -1);
                            let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);
                            let newSegmentB = geometry.getSortedDoor(door.start.x, doorMaxY, door.start.x, wallMaxY, -1);
                            let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, doorsToPassDown);
                            walls = walls.concat(newSegmmentsB);
                            wallChanged = true;

                        //overlap with no tails
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with upper-left and lower-left tails
                        } else if (
                            doorMinY < wallMinY
                            && doorMaxY > wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with upper-left tail
                        } else if (
                            doorMinY < wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();

                        //overlap with lower-left tail
                        } else if (
                            doorMinY === wallMinY
                            && doorMaxY > wallMaxY
                        ) {
                            wallChanged = true;
                            Function.prototype();


                        //overlap with upper-right tail
                        } else if (
                            doorMinY > wallMinY
                            && doorMaxY === wallMaxY
                        ) {
                            let newSegmentA = geometry.getSortedDoor(door.start.x, wallMinY, door.start.x, doorMinY, -1);
                            let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                            walls = walls.concat(newSegmmentsA);
                            wallChanged = true;

                        } else {
                            console.log("wtf?");
                            console.log(wall);
                            console.log(door);
                        }
                        break;
                    }
                }
            }
            //not a match
        }
        //horizontal wall
        else {

            //horizontal door
            if (doorMinX !== doorMaxX) {

                //on same slope
                let wallSlope = (wall.end.y - wall.start.y)/(wall.end.x - wall.start.x)
                let doorSlope = (door.end.y - door.start.y)/(door.end.x - door.start.x)
                if (wallSlope === doorSlope) {


                    let lineSegmentsIntersect = false;

                    //ensure we can safely compare these two points
                    if (
                        wall.end.x === door.start.x
                        && wall.end.y === door.start.y
                    ) {
                        //we cannont. Fortunately that tells us that:
                        lineSegmentsIntersect = true;
                    } else {
                        let comparisonRun = wall.end.x - door.start.x;
                        let comparisonRise = comparisonRun * wallSlope;
                        let comparisonIntersection = door.start.y + comparisonRise;
                        lineSegmentsIntersect = (comparisonIntersection === wall.end.y);
                    }


                    //on same line
                    if (lineSegmentsIntersect) {

                        //there is overlap
                        if (
                          doorMaxX >= wallMinX
                          && doorMinX <= wallMaxX
                        ) {
                            wallHandled = true;

                            //well, "overlap"
                            if (
                                doorMaxX === wallMinX
                                || doorMinX === wallMaxX
                            ) {
                                let newSegmentA = wall;
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);

                            //overlap with left-door and right-wall tails
                            } else if (
                                doorMinX < wallMinX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(door.end.x, door.end.y, wall.end.x, wall.end.y, -1);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                    wallChanged = true;
                                    walls = walls.concat(newSegmmentsA);

                            //overlap with right-wall tail
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX < wallMaxX
                            ) {
                                let newSegmentA = geometry.getSortedDoor(door.end.x, door.end.y, wall.end.x, wall.end.y, -1);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                wallChanged = true;
                                walls = walls.concat(newSegmmentsA);

                            //overlap with left- and right-wall tails
                            } else if (
                                doorMinX > wallMinX
                                && doorMaxX < wallMaxX
                            ) {
                                let newSegmentA = geometry.getSortedDoor(wall.start.x, wall.start.y, door.start.x, door.start.y, -1);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);
                                let newSegmentB = geometry.getSortedDoor(door.end.x, door.end.y, wall.end.x, wall.end.y, -1);
                                let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, doorsToPassDown);
                                walls = walls.concat(newSegmmentsB);
                                wallChanged = true;

                            //overlap with no tails
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with left- and right-door tails
                            } else if (
                                doorMinX < wallMinX
                                && doorMaxX > wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with left-door tail
                            } else if (
                                doorMinX < wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();

                            //overlap with right-door tail
                            } else if (
                                doorMinX === wallMinX
                                && doorMaxX > wallMaxX
                            ) {
                                wallChanged = true;
                                Function.prototype();


                            //overlap with left-wall tail
                            } else if (
                                doorMinX > wallMinX
                                && doorMaxX === wallMaxX
                            ) {
                                let newSegmentA = geometry.getSortedDoor(wall.start.x, wall.start.y, door.start.x, door.start.y, -1);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, doorsToPassDown);
                                walls = walls.concat(newSegmmentsA);
                                wallChanged = true;

                            } else {
                                console.log("wtf?");
                                console.log(wall);
                                console.log(door);
                            }
                            break;
                        }
                    }
                }

            }
            //not a match
        }
    }
    if (!wallHandled) {
        //console.log("lazy pos");
        walls.push(wall);
    }
    return {segments: walls, changed: wallChanged};
}

function recurseSubtractionUntilNoChange(wall, doors) {
    if (wall) {
        let newWalls1 = subtractDoorsFromWall(wall, doors);
        if (newWalls1.changed) {
            let newWalls2 = [];
            for(let i = 0; i < newWalls1.segments.length; i++) {
                newWalls2.push(recurseSubtractionUntilNoChange(newWalls1.segments[i], doors));
            }
            assert(newWalls2.length <= 1, `newWalls2.length: ${newWalls2.length}`);
            return newWalls2[0];
        } else {
            return newWalls1.segments;
        }
    } else {
        return [];
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

function getPointsFromRooms(rooms) {
    let points = [];
    rooms.forEach((room, i) => {
        points.push(
            {
                x: rooms[i].leftX,
                y: rooms[i].leftCeilingY
            }
        );
        points.push(
            {
                x: rooms[i].rightX,
                y: rooms[i].rightCeilingY
            }
        );
        points.push(
            {
                x: rooms[i].rightX,
                y: rooms[i].rightFloorY
            }
        );
        points.push(
            {
                x: rooms[i].leftX,
                y: rooms[i].leftFloorY
            }
        );
    });

    let filteredPoints = points.filter((point1, i1, arr) => {
          let weAreTheFirst = true;
          points.forEach((point2, i2) => {
              if (
                point1.x === point2.x
                && point1.y === point2.y
                && i1 > i2
              ) {
                  weAreTheFirst = false;
              }
          });
          return weAreTheFirst;
     });

    return Array.from(filteredPoints);
}

function getWallsFromRooms(rooms) {
  let doors = [];
  rooms.forEach((room, i) => {

    doors.push(
        geometry.getSortedDoor(
            room.leftX, room.leftCeilingY,
            room.rightX, room.rightCeilingY,
            -1
        )
    );
    doors.push(
      geometry.getSortedDoor(
            room.rightX, room.rightCeilingY,
            room.rightX, room.rightFloorY,
            -1
        )
    );
    doors.push(
        geometry.getSortedDoor(
            room.rightX, room.rightFloorY,
            room.leftX, room.leftFloorY,
            -1
        )
    );
    doors.push(
        geometry.getSortedDoor(
            room.leftX, room.leftFloorY,
            room.leftX, room.leftCeilingY,
            -1
        )
    );

  });
  return doors;
}

module.exports = {
    dataStructureFactory: {
        getWallsFromRooms: getWallsFromRooms,
        getDoorsFromRooms: getDoorsFromRooms,
        getPointsFromRooms: getPointsFromRooms,
        subtractDoorsFromWalls: subtractDoorsFromWalls

    }
}
