/// <reference path="./commonTypes.ts" />
/// <reference path="./commonFunctions.ts" />

const {common} = require('./commonFunctions.js');

function getCorner(room: Room, point: SimplePoint) {
    //0: top-left
    //1: top-right
    //2: bottom-right
    //3: bottom-left
    let cornerIndex = tryGetCorner(room, point);
    
    // assert(cornerIndex !== -1, `Couldn't find corresponding corner of room ${JSON.stringify(room)} to point ${JSON.stringify(point)}`);
    if(cornerIndex === -1) {
        console.error(`Couldn't find corresponding corner of room ${JSON.stringify(room)} to point ${JSON.stringify(point)}`);
        flashError();
    }
    return cornerIndex;
}

function tryGetCorner(room: Room, point: SimplePoint) {
    //0: top-left
    //1: top-right
    //2: bottom-right
    //3: bottom-left
    let cornerIndex = -1;
    if (room.leftX === point.x) {
        if (room.leftCeilingY === point.y) {
            cornerIndex = 0;
        } else if (room.leftFloorY === point.y) {
            cornerIndex = 3;
        }
    } else if (room.rightX === point.x) {
        if (room.rightCeilingY === point.y) {
            cornerIndex = 1;
        } else if (room.rightFloorY === point.y) {
            cornerIndex = 2;
        }
    }
    return cornerIndex;
}

function getSortedLine(
  aX: number, aY: number, bX: number, bY: number,
  permeability: number,
  roomKeys: string[]
) {
    let line = _getSortedLine(aX, aY, bX, bY);
    if (line) {
        return {
            permeability,
            start: line.start,
            end: line.end,
            roomKeys
        };
    }
    return null;
}

function getSortedDoor(
  aX: number, aY: number, bX: number, bY: number,
  permeability: number,
  roomKeys: string[]
) {
    // assert(roomKeys.length === 2, JSON.stringify(roomKeys));
    if (roomKeys.length !== 2) {
        console.error(`Room keys length is invalid. Expected 2; Actual: ${roomKeys.length}; Data: ${JSON.stringify(roomKeys)}`);
        flashError();
        return null;
    }
    let line = _getSortedLine(aX, aY, bX, bY);
    if (line) {
        return {
            id: common.getSortedId(roomKeys[0], roomKeys[1]),
            permeability,
            start: line.start,
            end: line.end,
            roomKeys
        };
    }
    return null;
}

function _getSortedLine(aX: number, aY: number, bX: number, bY: number) {
    if (aX < bX) {
        return {
            start: {
              x: aX,
              y: aY
            },
            end: {
              x: bX,
              y: bY
            }
        };
    } else if (aX > bX) {
        return {
            start: {
              x: bX,
              y: bY
            },
            end: {
              x: aX,
              y: aY
            }
        };
    } else {
        if (aY < bY) {
            return {
                start: {
                  x: aX,
                  y: aY
                },
                end: {
                  x: bX,
                  y: bY
                }
            };
        } else if (aY > bY) {
            return {
                start: {
                  x: bX,
                  y: bY
                },
                end: {
                  x: aX,
                  y: aY
                }
            };
        } else {
            return {
                start: {
                  x: aX,
                  y: aY
                },
                end: {
                  x: bX,
                  y: bY
                }
            };
        }
    }
}

function getRoomCeiling(room: Room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftCeilingY
      },
      slope: (room.leftCeilingY - room.rightCeilingY)/(room.leftX - room.rightX)
    };
}

function getRoomFloor(room: Room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftFloorY
      },
      slope: (room.leftFloorY - room.rightFloorY)/(room.leftX - room.rightX)
    };
}

function getSlope(a: SimplePoint, b: SimplePoint) {
    return {
      point: {
          x: a.x,
          y: a.y
      },
      slope: (a.y - b.y)/(a.x - b.x)
    };
}

function lineSegmentsIntersectAndCross(segmentA: SimpleLine, segmentB: SimpleLine) {
    let a1 = segmentA.start.y - segmentA.end.y;
    let b1 = segmentA.end.x - segmentA.start.x;
    let c1 = -b1 * segmentA.start.y + -a1 * segmentA.start.x;
    let a2 = segmentB.start.y - segmentB.end.y;
    let b2 = segmentB.end.x - segmentB.start.x;
    let c2 = -b2 * segmentB.start.y + -a2 * segmentB.start.x;

    let determinant = a1 * b2 - a2 * b1;

    if (determinant !== 0) {
        let xIntersection = (b1*c2 - b2*c1) / determinant;
        let yIntersection = (c1*a2 - c2*a1) / determinant;
        let intersection = {x: xIntersection, y: yIntersection};

        //check if xInterrsection is in range of line segments
        if (
            xIntersection >= segmentA.start.x
            && xIntersection <= segmentA.end.x
            && xIntersection >= segmentB.start.x
            && xIntersection <= segmentB.end.x
        ) {
            //check if yInterrsection is in range of line segments
            if (
                yIntersection >= Math.min(segmentA.start.y, segmentA.end.y)
                && yIntersection <= Math.max(segmentA.start.y, segmentA.end.y)
                && yIntersection >= Math.min(segmentB.start.y, segmentB.end.y)
                && yIntersection <= Math.max(segmentB.start.y, segmentB.end.y)
            ) {
                //check if intersection is not endpoint of line
                if (
                  !pointsEqual(intersection, segmentA.start)
                  && !pointsEqual(intersection, segmentA.end)
                  && !pointsEqual(intersection, segmentB.start)
                  && !pointsEqual(intersection, segmentB.end)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function pointsEqual(a: SimplePoint, b: SimplePoint) {
    return a.x === b.x && a.y === b.y;
}

function getCornerAngle(point: SimplePoint, room: Room) {
    let cornerIndex = getCorner(room, point);
    if (cornerIndex < 0) {
        return null;
    }
    let width = room.rightX-room.leftX;
    let ceilingYDiff = Math.abs(room.leftCeilingY-room.rightCeilingY);
    let floorYDiff = Math.abs(room.leftFloorY-room.rightFloorY);
    switch (cornerIndex) {
      case 0:
        if (room.leftCeilingY < room.rightCeilingY) {
            return {
              start: 0.75,
              end: 0.75 + Math.atan(width/ceilingYDiff)/(2*Math.PI)
            };
        } else {
            return {
              start: -0.25,
              end: Math.atan(ceilingYDiff/width)/(2*Math.PI)
            };
        }

      case 1:
        if (room.leftCeilingY < room.rightCeilingY) {
            return {
              start: 0.5 - Math.atan(ceilingYDiff/width)/(2*Math.PI),
              end: 0.75
            };
        } else {
            return {
              start: 0.75 - Math.atan(width/ceilingYDiff)/(2*Math.PI),
              end: 0.75
            };
        }

      case 2:
        if (room.leftFloorY > room.rightFloorY) {
            return {
              start: 0.25,
              end: 0.5 + Math.atan(floorYDiff/width)/(2*Math.PI)
            };
        } else {
            return {
              start: 0.25,
              end: 0.25 + Math.atan(width/floorYDiff)/(2*Math.PI)
            };
        }

      case 3:
        if (room.leftFloorY > room.rightFloorY) {
            return {
              start: 0.25 - Math.atan(width/floorYDiff)/(2*Math.PI),
              end: 0.25
            };
        } else {
            return {
              start: -Math.atan(floorYDiff/width)/(2*Math.PI),
              end: 0.25
            };
        }
    }
}

/**
 * Gets the intersection at x on a line.
 * If y is vertical, or x is on line start-x or end-x returns null
 * @param x
 * @param lineA
 */
function getYIntersect(x: number, lineA: SimpleLine): Nullable<SimplePoint> {
    const {start:aStart, end:aEnd} = lineA;
    
    
    const aMinX = Math.min(aStart.x, aEnd.x);
    const aMaxX = Math.max(aStart.x, aEnd.x);
    // Ensure x can actually intersect line
    if (x <= aMinX || x >= aMaxX) {
        return null;
    }
    // Get min/max X
    const aMinY = Math.min(aStart.y, aEnd.y);
    const aMaxY = Math.max(aStart.y, aEnd.y);
    
    // Line is vertical, so no intersection is possible
    if (aMinY == aMaxY) {
        return null;
    }
    
    // Line pad simply tries to make sure it will calculate if point is on the line
    const linePad = 1;
    
    // Create points for line B
    const bStart: SimplePoint = {
        x, y: aMinY - linePad
    }
    const bEnd: SimplePoint = {
        x,
        y: aMaxY + linePad
    }
    
    // Create line b for calculation
    // this line is a vertical line at x that is sure to
    const lineB = {
        start: bStart,
        end: bEnd,
    };
    return getIntersection(lineA, lineB);
}

function lineBoundsIntersect(lineA: SimpleLine, lineB: SimpleLine): boolean {
    
    const {start:aStart, end:aEnd} = lineA;
    const {start:bStart, end:bEnd} = lineB;
    
    // Ensure can intersect X
    const aMinX = Math.min(aStart.x, aEnd.x);
    const aMaxX = Math.max(aStart.x, aEnd.x);
    const bMinX = Math.min(bStart.x, bEnd.x);
    const bMaxX = Math.max(bStart.x, bEnd.x);
    if (aMaxX < bMinX || bMaxX < aMinX) {
        return false;
    }
    
    // Ensure can intersect Y
    const aMinY = Math.min(aStart.y, aEnd.y);
    const aMaxY = Math.max(aStart.y, aEnd.y);
    const bMinY = Math.min(bStart.y, bEnd.y);
    const bMaxY = Math.max(bStart.y, bEnd.y);
    
    return !(aMaxY < bMinY || bMaxY < aMinY);
}


/**
 * Checks if two lines are intersecting with error tolerance
 * @param lineA
 * @param lineB
 * @param errorTolerance the amount of overlap allowed by a point across the line
 */
function isIntersectingLines(
    lineA: SimpleLine,
    lineB: SimpleLine,
    errorTolerance?: number
) {
    
    if (errorTolerance == null) {
        errorTolerance = 0.1;
    }
    
    let {start:aStart, end:aEnd} = lineA;
    let {start:bStart, end:bEnd} = lineB;
    
    
    // Calculate if the bounds of the lines intersects
    // Bounds are rectangle made from min and max values without regards to where they are originally
    // Upper left = minX,minY; LowerRight = maxX,maxY
    if (!lineBoundsIntersect(lineA, lineB)) {
        return false;
    }
    
    const intersection = getIntersection(lineA, lineB);
    if (intersection == null) {
        return false;
    }
    
    const {slope:slopeA} = getSlope(aStart, aEnd);
    const {slope:slopeB} = getSlope(bStart, bEnd);
    
    const isEqual = (point: SimplePoint): boolean => {
        return pointsEqual(point, intersection);
    }
    
    // If point end is intersection, then points cannot be crossing
    if (isEqual(aStart) || isEqual(bStart) || isEqual(aEnd) || isEqual(bEnd)) {
        return false;
    }
    
    if (!isFinite(slopeA) && !isFinite(slopeB)) {
        return false;
    }
    
    const intersectionY = intersection.y;
    const ifInfinite = (infinite: SimpleLine, otherLine: SimpleLine) => {
        const infiniteStartX = infinite.start.x;
        const infiniteEndX = infinite.end.x;
        return (infiniteStartX !== otherLine.start.x) &&
            (infiniteStartX !== otherLine.end.x) &&
            (infiniteEndX !== otherLine.start.x) &&
            (infiniteEndX !== otherLine.end.x) &&
            Math.abs(infinite.start.y - intersectionY) > errorTolerance!! &&
            Math.abs(infinite.end.y - intersectionY) > errorTolerance!!;
        
    }
    
    if (!isFinite(slopeA)) {
        return isFinite(slopeB) && ifInfinite(lineA, lineB);
    } else if (!isFinite(slopeB)) {
        return isFinite(slopeA) && ifInfinite(lineB, lineA);
    } else {
        return Math.abs(slopeA - slopeB) > errorTolerance;
    }
}

/**
 * Gets
 * @param lineA
 * @param lineB
 */
export function getIntersection(
    lineA: SimpleLine,
    lineB: SimpleLine,
): Nullable<SimplePoint> {
    const {start:aStart, end:aEnd} = lineA;
    const {start:bStart, end:bEnd} = lineB;
    
    // Make sure lines can cross.
    if (!lineBoundsIntersect(lineA, lineB)) {
        return null;
    }
    
    // Check if none of the lines are of length 0
    if ((aStart.x === aEnd.x && aStart.y === aEnd.y) || (bStart.x === bEnd.x && bStart.y === bEnd.y)) {
        return null;
    }
    
    const denominator = ((bEnd.y - bStart.y) * (aEnd.x - aStart.x) - (bEnd.x - bStart.x) * (aEnd.y - aStart.y))
    
    // Lines are parallel
    if (denominator === 0) {
        return null;
    }
    
    let ua = ((bEnd.x - bStart.x) * (aStart.y - bStart.y) - (bEnd.y - bStart.y) * (aStart.x - bStart.x)) / denominator;
    let ub = ((aEnd.x - aStart.x) * (aStart.y - bStart.y) - (aEnd.y - aStart.y) * (aStart.x - bStart.x)) / denominator;
    
    
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }
    
    // Return an object with the x and y coordinates of the intersection
    let x = aStart.x + ua * (aEnd.x - aStart.x)
    let y = aStart.y + ua * (aEnd.y - aStart.y)
    if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return null;
    }
    return {x, y}
}

module.exports = {
    geometry: {
        getCorner,
        tryGetCorner,
        getSortedDoor,
        getSortedLine,
        getRoomCeiling,
        getRoomFloor,
        getSlope,
        pointsEqual,
        lineSegmentsIntersectAndCross,
        getCornerAngle,
        getIntersection,
        isIntersectingLines,
        getYIntersect,
    },
}
