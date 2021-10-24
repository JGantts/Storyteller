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
    console.log(sides);
    for (let i = 0; i < sides.length; i++) {
        //console.log("\n\n\n\n");
        //console.log(`side: ${i}`);
        let side = sides[i];
        let sideMinX = Math.min(side.start.x, side.end.x);
        let sideMaxX = Math.max(side.start.x, side.end.x);
        let sideMinY = Math.min(side.start.y, side.end.y);
        let sideMaxY = Math.max(side.start.y, side.end.y);
        let sideHandled = false;

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
                /*.filter(
                    (possibleWall) => {
                        for (let ii = 0; ii < dataStructures.walls.length; ii++) {
                            let actualWall = dataStructures.walls[ii];
                            if (
                              possibleWall.wall.start.x === actualWall.start.x
                              && possibleWall.wall.start.y === actualWall.start.y
                              && possibleWall.wall.end.x === actualWall.end.x
                              && possibleWall.wall.end.y === actualWall.end.y
                            ) {
                                return true;
                            }
                        }
                        return false;
                    }
                );*/
            //console.log(wallsWithId);


            for (let k=0; k < wallsWithId.length; k++) {
                let wallWithId = wallsWithId[k];
                /*if (wallWithId.id === 4) {
                    console.log(side, wallWithId);
                }*/
                let wallMinX = Math.min(wallWithId.wall.start.x, wallWithId.wall.end.x);
                let wallMaxX = Math.max(wallWithId.wall.start.x, wallWithId.wall.end.x);
                let wallMinY = Math.min(wallWithId.wall.start.y, wallWithId.wall.end.y);
                let wallMaxY = Math.max(wallWithId.wall.start.y, wallWithId.wall.end.y);

                //vertical side
                if (sideMinX === sideMaxX) {

                    //vertical wall
                    if (wallMinX === wallMaxX) {

                        //on same axis
                        if (wallWithId.wall.start.x === side.start.x) {

                            //there is overlap
                            if (
                              wallMaxY >= sideMinY
                              && wallMinY <= sideMaxY
                            ) {
                                sideHandled = true;

                                //console.log(side, wallWithId);

                                //well, "overlap"
                                if (
                                    wallMaxY === sideMinY
                                    || wallMinY === sideMaxY
                                ) {
                                    //console.log("-9");
                                    Function.prototype();

                                //overlap with upper-left and lower-right tails
                                } else if (
                                    wallMinY < sideMinY
                                ) {
                                    //console.log("-8");
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
                                //overlap with lower-right tail
                                } else if (
                                    wallMinY === sideMinY
                                    && wallMaxY < sideMaxY
                                ) {
                                    //console.log("-7");
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

                                //overlap with upper-right and lower-right tails
                                } else if (
                                    wallMinY > sideMinY
                                    && wallMaxY < sideMaxY
                                ) {
                                    //console.log("-6");
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

                                //overlap with no tails
                                } else if (
                                    wallMinY === sideMinY
                                    && wallMaxY === sideMaxY
                                ) {
                                    //console.log("-5");
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

                                //overlap with upper-left and lower-left tails
                                } else if (
                                    wallMinY < sideMinY
                                    && wallMaxY > sideMaxY
                                ) {
                                    //console.log("-4");
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

                                //overlap with upper-left tail
                                } else if (
                                    wallMinY < sideMinY
                                    && wallMaxY === sideMaxY
                                ) {
                                    //console.log("-3");
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
                                //overlap with lower-left tail
                                } else if (
                                    wallMinY === sideMinY
                                    && wallMaxY > sideMaxY
                                ) {
                                    //console.log("-2");
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

                                //overlap with upper-right tail
                                } else if (
                                    wallMinY > sideMinY
                                    && wallMaxY === sideMaxY
                                ) {
                                    //console.log("-1");
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

                                } else {
                                    console.log("wtf?");
                                    console.log(side);
                                    console.log(wall);
                                }
                                break;
                            }
                        }
                    }
                    //not a match

                //horizontal side
                } else {

                    //horizontal wall
                    if (wallMinX !== wallMaxX) {

                        //on same slope
                        let sideSlope = (side.end.y - side.start.y)/(side.end.x - side.start.x);
                        let wallSlope = (wallWithId.wall.end.y - wallWithId.wall.start.y)/(wallWithId.wall.end.x - wallWithId.wall.start.x);
                        if (sideSlope === wallSlope) {


                            let lineSegmentsIntersect = false;

                            //ensure we can safely compare these two points
                            if (
                                side.end.x === wallWithId.wall.start.x
                                && side.end.y === wallWithId.wall.start.y
                            ) {
                                //we cannont. Fortunately that tells us that:
                                lineSegmentsIntersect = true;
                            } else {
                                let comparisonRun = side.end.x - wallWithId.wall.start.x;
                                let comparisonRise = comparisonRun * sideSlope;
                                let comparisonIntersection = wallWithId.wall.start.y + comparisonRise;
                                lineSegmentsIntersect = (comparisonIntersection === side.end.y);
                            }


                            //on same line
                            if (lineSegmentsIntersect) {

                                //there is overlap
                                if (
                                  wallMaxX >= sideMinX
                                  && wallMinX <= sideMaxX
                                ) {
                                    sideHandled = true;

                                    //console.log(side, wallWithId);

                                    //well, "overlap"
                                    if (
                                        wallMaxX === sideMinX
                                        || wallMinX === sideMaxX
                                    ) {
                                        //console.log("1");
                                        Function.prototype();

                                    //overlap with left-wall and right-side tails
                                    } else if (
                                        wallMinX < sideMinX
                                    ) {
                                        //console.log("2");
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

                                    //overlap with right-side tail
                                    } else if (
                                        wallMinX === sideMinX
                                        && wallMaxX < sideMaxX
                                    ) {
                                        //console.log("3");
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

                                    //overlap with left- and right-side tails
                                    } else if (
                                        wallMinX > sideMinX
                                        && wallMaxX < sideMaxX
                                    ) {
                                        //console.log("4");
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

                                    //overlap with no tails
                                    } else if (
                                        wallMinX === sideMinX
                                        && wallMaxX === sideMaxX
                                    ) {
                                        //console.log("5");
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

                                    //overlap with left- and right-wall tails
                                    } else if (
                                        wallMinX < sideMinX
                                        && wallMaxX > sideMaxX
                                    ) {
                                        //console.log("6");
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

                                    //overlap with left-wall tail
                                    } else if (
                                        wallMinX < sideMinX
                                        && wallMaxX === sideMaxX
                                    ) {
                                        //console.log("7");
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

                                    //overlap with right-wall tail
                                    } else if (
                                        wallMinX === sideMinX
                                        && wallMaxX > sideMaxX
                                    ) {
                                        //console.log("8");
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
                                        //console.log(perms);


                                    //overlap with left-side tail
                                    } else if (
                                        wallMinX > sideMinX
                                        && wallMaxX === sideMaxX
                                    ) {
                                        //console.log("9");
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

                                    } else {
                                        console.log("wtf?");
                                        console.log(side);
                                        console.log(wall);
                                    }
                                    break;
                                }
                            }
                        }

                    }
                    //not a match
                }
            }
        }

        if (!sideHandled) {
        Function.prototype();
            //console.log("lazy pos");{
                //console.log("lazy pos");

            //perms.push(side);
        }
    }
    console.log(perms);
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
        let lineSegmentsNew = slicePotentialSideIntoPotentialLinesFromActualWall(sidePotential, wallsActual).segments;
        assert(!lineSegmentsNew.changed);
        //console.log(wallSegments);
        linesPotential = linesPotential.concat(lineSegmentsNew.filter(function(val) {return val !== null}));
    }
    return linesPotential;
}

function slicePotentialSideIntoPotentialLinesFromActualWall(side, walls){
    let lines = [];
    let sideMinX = Math.min(side.start.x, side.end.x);
    let sideMaxX = Math.max(side.start.x, side.end.x);
    let sideMinY = Math.min(side.start.y, side.end.y);
    let sideMaxY = Math.max(side.start.y, side.end.y);
    let sideHandled = false;
    let sideChanged = false;
    for (let j=0; j < walls.length; j++) {
        let wall = walls[j];
        let wallsToPassDown =  walls.filter(function(val) {return (
          val.start.x !== wall.start.x
          ||val.start.y !== wall.start.y
          ||val.end.x !== wall.end.x
          ||val.end.y !== wall.end.y
        )});
        let wallMinX = Math.min(wall.start.x, wall.end.x);
        let wallMaxX = Math.max(wall.start.x, wall.end.x);
        let wallMinY = Math.min(wall.start.y, wall.end.y);
        let wallMaxY = Math.max(wall.start.y, wall.end.y);

        //vertical side
        if (sideMinX === sideMaxX) {

            //vertical wall
            if (wallMinX === wallMaxX) {

                //on same axis
                if (wall.start.x === side.start.x) {

                    //there is overlap
                    if (
                      wallMaxY >= sideMinY
                      && wallMinY <= sideMaxY
                    ) {
                        sideHandled = true;

                        //well, "overlap"
                        if (
                            wallMaxY === sideMinY
                            || wallMinY === sideMaxY
                        ) {
                            let newSegmentA = side;
                            let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                            lines = lines.concat(newSegmmentsA);

                        //overlap with upper-left and lower-right tails
                        } else if (
                            wallMinY < sideMinY
                        ) {
                                let newSegmentB = geometry.getSortedDoor(side.start.x, side.start.y, wall.end.x, wall.end.y, 1.0);
                                let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                lines = lines.concat(newSegmmentsB);

                                let newSegmentC = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                let newSegmmentsC = recurseSubtractionUntilNoChange(newSegmentC, wallsToPassDown);
                                lines = lines.concat(newSegmmentsC);

                                sideChanged = true;

                        //overlap with lower-right tail
                        } else if (
                            wallMinY === sideMinY
                            && wallMaxY < sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.end.x, wall.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                let newSegmentB = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                lines = lines.concat(newSegmmentsB);

                                sideChanged = true;

                        //overlap with upper-right and lower-right tails
                        } else if (
                            wallMinY > sideMinY
                            && wallMaxY < sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.start.x, wall.start.y, side.permeability);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                let newSegmentB = geometry.getSortedDoor(wall.start.x, wall.start.y, wall.end.x, wall.end.y, 1.0);
                                let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                lines = lines.concat(newSegmmentsB);

                                let newSegmentC = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                let newSegmmentsC = recurseSubtractionUntilNoChange(newSegmentC, wallsToPassDown);
                                lines = lines.concat(newSegmmentsC);

                                sideChanged = true;

                        //overlap with no tails
                        } else if (
                            wallMinY === sideMinY
                            && wallMaxY === sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(wall.start.x, wall.start.y, wall.end.x, wall.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                sideChanged = true;

                        //overlap with upper-left and lower-left tails
                        } else if (
                            wallMinY < sideMinY
                            && wallMaxY > sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                sideChanged = true;

                        //overlap with upper-left tail
                        } else if (
                            wallMinY < sideMinY
                            && wallMaxY === sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                sideChanged = true;

                        //overlap with lower-left tail
                        } else if (
                            wallMinY === sideMinY
                            && wallMaxY > sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                sideChanged = true;


                        //overlap with upper-right tail
                        } else if (
                            wallMinY > sideMinY
                            && wallMaxY === sideMaxY
                        ) {
                                let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                                sideChanged = true;

                        } else {
                            console.log("wtf?");
                            console.log(side);
                            console.log(wall);
                        }
                        break;
                    }
                }
            }
            //not a match

        //horizontal side
        } else {

            //horizontal wall
            if (wallMinX !== wallMaxX) {

                //on same slope
                let sideSlope = (side.end.y - side.start.y)/(side.end.x - side.start.x)
                let wallSlope = (wall.end.y - wall.start.y)/(wall.end.x - wall.start.x)
                if (sideSlope === wallSlope) {


                    let lineSegmentsIntersect = false;

                    //ensure we can safely compare these two points
                    if (
                        side.end.x === wall.start.x
                        && side.end.y === wall.start.y
                    ) {
                        //we cannont. Fortunately that tells us that:
                        lineSegmentsIntersect = true;
                    } else {
                        let comparisonRun = side.end.x - wall.start.x;
                        let comparisonRise = comparisonRun * sideSlope;
                        let comparisonIntersection = wall.start.y + comparisonRise;
                        lineSegmentsIntersect = (comparisonIntersection === side.end.y);
                    }


                    //on same line
                    if (lineSegmentsIntersect) {

                        //there is overlap
                        if (
                          wallMaxX >= sideMinX
                          && wallMinX <= sideMaxX
                        ) {
                            sideHandled = true;

                            //well, "overlap"
                            if (
                                wallMaxX === sideMinX
                                || wallMinX === sideMaxX
                            ) {
                                let newSegmentA = side;
                                let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                lines = lines.concat(newSegmmentsA);

                            //overlap with left-wall and right-side tails
                            } else if (
                                wallMinX < sideMinX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.end.x, wall.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    let newSegmentB = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                    let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsB);

                                    sideChanged = true;

                            //overlap with right-side tail
                            } else if (
                                wallMinX === sideMinX
                                && wallMaxX < sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.end.x, wall.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    let newSegmentB = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                    let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsB);
                                    sideChanged = true;

                            //overlap with left- and right-side tails
                            } else if (
                                wallMinX > sideMinX
                                && wallMaxX < sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.start.x, wall.start.y, side.permeability);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    let newSegmentB = geometry.getSortedDoor(wall.start.x, wall.start.y, wall.end.x, wall.end.y, 1.0);
                                    let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsB);

                                    let newSegmentC = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                    let newSegmmentsC = recurseSubtractionUntilNoChange(newSegmentC, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsC);

                                    sideChanged = true;

                            //overlap with no tails
                            } else if (
                                wallMinX === sideMinX
                                && wallMaxX === sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(wall.start.x, wall.start.y, wall.end.x, wall.end.y, 1.0);
                                    let newSegmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmentsA);

                                    sideChanged = true;

                            //overlap with left- and right-wall tails
                            } else if (
                                wallMinX < sideMinX
                                && wallMaxX > sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    sideChanged = true;

                            //overlap with left-wall tail
                            } else if (
                                wallMinX < sideMinX
                                && wallMaxX === sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    sideChanged = true;

                            //overlap with right-wall tail
                            } else if (
                                wallMinX === sideMinX
                                && wallMaxX > sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, side.end.x, side.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    sideChanged = true;


                            //overlap with left-side tail
                            } else if (
                                wallMinX > sideMinX
                                && wallMaxX === sideMaxX
                            ) {
                                    let newSegmentA = geometry.getSortedDoor(side.start.x, side.start.y, wall.end.x, wall.end.y, 1.0);
                                    let newSegmmentsA = recurseSubtractionUntilNoChange(newSegmentA, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsA);

                                    let newSegmentB = geometry.getSortedDoor(wall.end.x, wall.end.y, side.end.x, side.end.y, side.permeability);
                                    let newSegmmentsB = recurseSubtractionUntilNoChange(newSegmentB, wallsToPassDown);
                                    lines = lines.concat(newSegmmentsB);

                                    sideChanged = true;

                            } else {
                                console.log("wtf?");
                                console.log(side);
                                console.log(wall);
                            }
                            break;
                        }
                    }
                }
            }
            //not a match
        }
    }
    if (!sideHandled) {
        //console.log("lazy pos");
        lines.push(side);
    }
    return {segments: lines, changed: sideChanged};
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
                  perm.permeability
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
    //console.log(wall);
    //console.log(doors);
    if (wall) {
        let newWalls1 = subtractDoorsFromWall(wall, doors);
        if (newWalls1.changed) {
            let newWalls2 = [];
            for(let i = 0; i < newWalls1.segments.length; i++) {
                newWalls2.push(recurseSubtractionUntilNoChange(newWalls1.segments[i], doors));
            }
            //console.log(newWalls1);
            if (newWalls2.length === 0) {
                return [];
            } else if (newWalls2.length === 1) {
                return newWalls2[0];
            } else {
                assert(false, `newWalls2.length: ${newWalls2.length}\n${JSON.stringify(newWalls2)}`);
            }
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

function buildPoint(x, y) {
  return {
      id: "" + x + "-" + y,
      x: x,
      y: y
  };
}

function getPointsFromRooms(rooms) {
    let points = Object();
    for (const key in rooms) {
        let point = buildPoint(rooms[key].leftX, rooms[key].leftCeilingY)
        points[point.id] = point;

        point = buildPoint(rooms[key].rightX, rooms[key].rightCeilingY)
        points[point.id] = point;

        point = buildPoint(rooms[key].rightX, rooms[key].rightFloorY)
        points[point.id] = point;

        point = buildPoint(rooms[key].leftX, rooms[key].leftFloorY)
        points[point.id] = point;
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

    return doors;
}

module.exports = {
    dataStructureFactory: {
        getWallsFromRooms: getWallsFromRooms,
        getDoorsFromRooms: getDoorsFromRooms,
        getPointsFromRooms: getPointsFromRooms,
        subtractDoorsFromWalls: subtractDoorsFromWalls,
        getDoorsWallsPotentialFromRoomPotential: getDoorsWallsPotentialFromRoomPotential,
        getPermsFromRoomPotential: getPermsFromRoomPotential,
        getSortedRoomFromDimensions: getSortedRoomFromDimensions
    }
}
