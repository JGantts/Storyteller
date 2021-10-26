

function getSortedDoor(aX, aY, bX, bY, perm) {
    let line = getSortedLine(aX, aY, bX, bY);
    if (line) {
        return {
            permeability: perm,
            start: line.start,
            end: line.end
        }
    }
    return null;
}

function getSortedLine(aX, aY, bX, bY) {
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

function getRoomCeiling(room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftCeilingY
      },
      slope: (room.leftCeilingY - room.rightCeilingY)/(room.leftX - room.rightX)
    };
}

function getRoomFloor(room) {
    return {
      point: {
          x: room.leftX,
          y: room.leftFloorY
      },
      slope: (room.leftFloorY - room.rightFloorY)/(room.leftX - room.rightX)
    };
}

function getSlope(a, b) {
    return {
      point: {
          x: a.x,
          y: a.y
      },
      slope: (a.y - b.y)/(a.x - b.x)
    };
}

function lineSegmentsIntersectAndCross(segmentA, segmentB) {
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
                //check if intersection is endpoint of line
                if (
                  !geometry.pointsEqual(intersection, segmentA.start)
                  && !geometry.pointsEqual(intersection, segmentA.end)
                  && !geometry.pointsEqual(intersection, segmentB.start)
                  && !geometry.pointsEqual(intersection, segmentB.end)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
}

module.exports = {
    geometry: {
        getSortedDoor: getSortedDoor,
        getSortedLine: getSortedLine,
        getRoomCeiling: getRoomCeiling,
        getRoomFloor: getRoomFloor,
        getSlope: getSlope,
        pointsEqual: pointsEqual,
        lineSegmentsIntersectAndCross: lineSegmentsIntersectAndCross
    },
}
