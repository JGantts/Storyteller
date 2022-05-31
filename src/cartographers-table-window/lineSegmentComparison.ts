/// <reference path="./commonTypes.ts" />

const assert = require('assert');
const { flashError } = require('./flashError');
const { getIntersection } = require('./geometryHelper.js').geometry;
type LineSlice = (
  start: SimplePoint,
  end: SimplePoint,
) => void

function lineSegmentComparison(
  lineA: SimpleLine,
  lineB: SimpleLine,
  lineASlice: LineSlice,
  lineABSlice: LineSlice,
  lineBSlice: LineSlice,
  tolerance: number = 4.0
) {
    
    // assert(
    //   lineA.start.x !== lineA.end.x ||
    //   lineA.start.y !== lineA.end.y,
    //   `LineA has 0 length\n${JSON.stringify(lineA)}`
    // );
    if (
        lineA.start.x === lineA.end.x &&
        lineA.start.y === lineA.end.y
    ) {
        console.error(`LineA has 0 length\n${JSON.stringify(lineA)}`);
        flashError();
        return;
    }

    // assert(
    //   lineB.start.x !== lineB.end.x ||
    //   lineB.start.y !== lineB.end.y,
    //   `LineB has 0 length\n${JSON.stringify(lineB)}`
    // );
    if (
        lineB.start.x === lineB.end.x &&
        lineB.start.y === lineB.end.y
    ) {
        console.error(`LineB has 0 length\n${JSON.stringify(lineB)}`);
        flashError();
        return;
    }

    let lineAMinX = Math.min(lineA.start.x, lineA.end.x);
    let lineAMaxX = Math.max(lineA.start.x, lineA.end.x);
    let lineAMinY = Math.min(lineA.start.y, lineA.end.y);
    let lineAMaxY = Math.max(lineA.start.y, lineA.end.y);

    let lineBMinX = Math.min(lineB.start.x, lineB.end.x);
    let lineBMaxX = Math.max(lineB.start.x, lineB.end.x);
    let lineBMinY = Math.min(lineB.start.y, lineB.end.y);
    let lineBMaxY = Math.max(lineB.start.y, lineB.end.y);
    
    //vertical lineA
    if (lineAMinX === lineAMaxX) {

        //vertical lineB
        if (lineBMinX === lineBMaxX) {

            //on same axis
            if (lineB.start.x === lineA.start.x) {

                //lines don't touch, lineA on top
                if (
                  lineBMinY > lineAMaxY
                ) {
                    lineASlice(lineA.start, lineA.end);
                    lineBSlice(lineB.start, lineB.end);

                //lines touch, no overlap, lineA on top
                } else if (
                      lineAMaxY === lineBMinY
                ) {
                    lineASlice(lineA.start, lineA.end);
                    lineBSlice(lineB.start, lineB.end);

                //overlap with upper-lineA and lower-lineB tails
                } else if (
                    lineAMinY < lineBMinY
                    && lineBMinY < lineAMaxY
                    && lineAMaxY < lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);

                //overlap with lower-lineB tail
                } else if (
                  lineAMinY === lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY < lineBMaxY
                ) {
                    lineABSlice(lineA.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);

                //overlap with upper-lineB tail
                } else if (
                  lineAMinY > lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineA.end);

                //overlap with upper-lineB and lower-lineB tails
                } else if (
                  lineAMinY > lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY < lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);

                //overlap with no tails
                } else if (
                  lineAMinY === lineBMinY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineABSlice(lineA.start, lineA.end);

                //overlap with upper-lineA and lower-lineA tails
                } else if (
                  lineAMinY < lineBMinY
                  && lineAMaxY > lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);

                //overlap with lower-lineA tail
                } else if (
                  lineAMinY === lineBMinY
                  && lineAMaxY >lineBMaxY
                ) {
                    lineABSlice(lineB.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);

                //overlap with upper-lineA tail
                } else if (
                  lineAMinY < lineBMinY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineB.end);

                //overlap with lower-lineA and upper-lineB tails
                } else if (
                  lineAMinY > lineBMinY
                  && lineAMinY < lineBMaxY
                  && lineAMaxY > lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);

                //lines touch, lineA on bottom
                } else if (
                  lineAMinY === lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineB.end);
                    lineASlice(lineA.start, lineA.end);


                //lines don't touch, lineA on bottom
                } else if (
                  lineAMinY > lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineB.end);
                    lineASlice(lineA.start, lineA.end);

                } else {
                    console.log("wtf?");
                    console.log(lineA);
                    console.log(lineB);
                }
            } else {
                lineASlice(lineA.start, lineA.end);
                lineBSlice(lineB.start, lineB.end);

            }
        //not a match
        } else {
            lineASlice(lineA.start, lineA.end);
            lineBSlice(lineB.start, lineB.end);

        }
    //horizontal lineA
    } else {

        //horizontal lineB
        if (lineBMinX !== lineBMaxX) {
            //
            // //on same slope
            // let lineASlope = (lineA.end.y - lineA.start.y)/(lineA.end.x - lineA.start.x)
            // let lineBSlope = (lineB.end.y - lineB.start.y)/(lineB.end.x - lineB.start.x)
            // if (lineASlope === lineBSlope) {
            //
            //     let lineSegmentsIntersect = false;
            //
            //     //ensure we can safely compare these two points
            //     if (
            //         lineA.end.x === lineB.start.x
            //         && lineA.end.y === lineB.start.y
            //     ) {
            //         //we cannot. Fortunately that tells us that:
            //         lineSegmentsIntersect = true;
            //     } else {
            //         let comparisonRun = lineA.end.x - lineB.start.x;
            //         let comparisonRise = comparisonRun * lineASlope;
            //         let comparisonIntersection = lineB.start.y + comparisonRise;
            //         lineSegmentsIntersect = (comparisonIntersection === lineA.end.y);
            //     }
            //
            //
            //     //on same line
            //     if (lineSegmentsIntersect) {
            //         //lines don't touch, lineA on left
            //         if (
            //           lineAMaxX < lineBMinX
            //         ) {
            //             lineASlice(lineA.start, lineA.end);
            //             lineBSlice(lineB.start, lineB.end);
            //
            //         //lines touch, no overlap, lineA on left
            //         } else if (
            //               lineAMaxX === lineBMinX
            //         ) {
            //             lineASlice(lineA.start, lineA.end);
            //             lineBSlice(lineB.start, lineB.end);
            //
            //         //overlap with left-lineA and right-lineB tails
            //         } else if (
            //             lineAMinX < lineBMinX
            //             && lineBMinX < lineAMaxX
            //             && lineAMaxX < lineBMaxX
            //         ) {
            //             lineASlice(lineA.start, lineB.start);
            //             lineABSlice(lineB.start, lineA.end);
            //             lineBSlice(lineA.end, lineB.end);
            //
            //         //overlap with right-lineB tail
            //         } else if (
            //           lineAMinX === lineBMinX
            //           && lineBMinX < lineAMaxX
            //           && lineAMaxX < lineBMaxX
            //
            //         ) {
            //             lineABSlice(lineA.start, lineA.end);
            //             lineBSlice(lineA.end, lineB.end);
            //
            //         //overlap with left-lineB tail
            //         } else if (
            //           lineAMinX > lineBMinX
            //           && lineBMinX < lineAMaxX
            //           && lineAMaxX === lineBMaxX
            //         ) {
            //             lineBSlice(lineB.start, lineA.start);
            //             lineABSlice(lineA.start, lineA.end);
            //
            //         //overlap with left-lineB and right-lineB tails
            //         } else if (
            //           lineAMinX > lineBMinX
            //           && lineBMinX < lineAMaxX
            //           && lineAMaxX < lineBMaxX
            //         ) {
            //             lineBSlice(lineB.start, lineA.start);
            //             lineABSlice(lineA.start, lineA.end);
            //             lineBSlice(lineA.end, lineB.end);
            //
            //         //overlap with no tails
            //         } else if (
            //           lineAMinX === lineBMinX
            //           && lineAMaxX === lineBMaxX
            //         ) {
            //             lineABSlice(lineA.start, lineA.end);
            //
            //         //overlap with left-lineA and right-lineA tails
            //         } else if (
            //           lineAMinX < lineBMinX
            //           && lineAMaxX > lineBMaxX
            //         ) {
            //             lineASlice(lineA.start, lineB.start);
            //             lineABSlice(lineB.start, lineB.end);
            //             lineASlice(lineB.end, lineA.end);
            //
            //         //overlap with right-lineA tail
            //         } else if (
            //           lineAMinX === lineBMinX
            //           && lineAMaxX >lineBMaxX
            //         ) {
            //             lineABSlice(lineB.start, lineB.end);
            //             lineASlice(lineB.end, lineA.end);
            //
            //         //overlap with left-lineA tail
            //         } else if (
            //           lineAMinX < lineBMinX
            //           && lineAMaxX === lineBMaxX
            //         ) {
            //             lineASlice(lineA.start, lineB.start);
            //             lineABSlice(lineB.start, lineB.end);
            //
            //         //overlap with right-lineA and left-lineB tails
            //         } else if (
            //           lineAMinX > lineBMinX
            //           && lineAMinX < lineBMaxX
            //           && lineAMaxX > lineBMaxX
            //         ) {
            //             lineBSlice(lineB.start, lineA.start);
            //             lineABSlice(lineA.start, lineB.end);
            //             lineASlice(lineB.end, lineA.end);
            //
            //         //lines touch, lineA on right
            //         } else if (
            //           lineAMinX === lineBMaxX
            //         ) {
            //             lineBSlice(lineB.start, lineB.end);
            //             lineASlice(lineA.start, lineA.end);
            //
            //         //lines don't touch, lineA on right
            //         } else if (
            //           lineAMinX > lineBMaxX
            //         ) {
            //             lineBSlice(lineB.start, lineB.end);
            //             lineASlice(lineA.start, lineA.end);
            //
            //         } else {
            //             console.log("wtf?");
            //             console.log(lineA);
            //             console.log(lineB);
            //         }
            //     } else {
            //         lineASlice(lineA.start, lineA.end);
            //         lineBSlice(lineB.start, lineB.end);
            //
            //     }
            // } else {
            //     lineASlice(lineA.start, lineA.end);
            //     lineBSlice(lineB.start, lineB.end);
            //
            // }
            
            // Get overlap
            const overlap = getOverlappingLineSegment(lineA, lineB, tolerance);
            
            // Determines whether to completely slice both lines
            let sliceSelf = false
            
            // If no overlap, slice both lines
            if (overlap == null) {
                sliceSelf = true;
            } else {
                // Destructure start and end of lines
                const {start, end} = overlap;
                const {x:startX, y:startY} = start;
                const {x:endX, y:endY} = end;
                
                // Make sure that overlap has length
                if (startX != endX || startY != endY) {
                    if (lineAMinX < startX) {
                        lineASlice(lineA.start, start);
                    }
                    if (lineAMaxX > endX) {
                        lineASlice(end, lineA.end);
                    }
                    if (lineBMinX < startX) {
                        lineBSlice(lineB.start, start);
                    }
                    if (lineBMaxX > endX) {
                        lineBSlice(end, lineB.end);
                    }
                    lineABSlice(start, end);
                } else {
                    // Slice both lines as overlap has no length
                    sliceSelf = true;
                }
            }
            if (sliceSelf) {
                lineASlice(lineA.start, lineA.end);
                lineBSlice(lineB.start, lineB.end);
            }
        //not a match
        } else {
              lineASlice(lineA.start, lineA.end);
              lineBSlice(lineB.start, lineB.end);
        }
     }
}




function getOverlappingLineSegment(
    lineA: SimpleLine,
    lineB: SimpleLine,
    yError: number = 1,
    slopeError: number = 1,
): Nullable<SimpleLine> {
    
    
    let lineAMinX = Math.min(lineA.start.x, lineA.end.x);
    let lineAMaxX = Math.max(lineA.start.x, lineA.end.x);
    let lineAMinY = Math.min(lineA.start.y, lineA.end.y);
    let lineAMaxY = Math.max(lineA.start.y, lineA.end.y);
    
    let lineBMinX = Math.min(lineB.start.x, lineB.end.x);
    let lineBMaxX = Math.max(lineB.start.x, lineB.end.x);
    let lineBMinY = Math.min(lineB.start.y, lineB.end.y);
    let lineBMaxY = Math.max(lineB.start.y, lineB.end.y);
    
    if (lineAMinX >= lineBMaxX ||
        lineBMinX >= lineAMaxX ||
        lineAMinY > lineBMaxY ||
        lineBMinY > lineAMaxY
    ) {
        return null;
    }
    
    let aSlope = (lineA.end.y - lineA.start.y) / (lineA.end.x - lineA.start.x);
    if (!isFinite(aSlope)) {
        return null;
    }
    let bSlope = (lineB.end.y - lineB.start.y) / (lineB.end.x - lineB.start.x);
    if (!isFinite(bSlope)) {
        return null;
    }
    
    const minX = Math.max(lineAMinX, lineBMinX);
    const maxX = Math.min(lineAMaxX, lineBMaxX);
    
    if (Math.abs(aSlope - bSlope) > slopeError) {
        return null;
    }
    
    // If min/max are the same, it means one line ends on the other lines start.
    // Lines cannot overlap. Method should have returned before this line
    if (minX == maxX) {
        return null;
    }
    
    if (minX > maxX) {
        console.error("Min max values are backwards");
        return null;
    }
    
    // Slope is mostly horizontal
    if (Math.abs(aSlope) < 0.01) {
        const averageLineAY = (lineAMinY + lineAMaxY) / 2.0;
        const averageLineBY = (lineBMinY + lineBMaxY) / 2.0;
        if (Math.abs(averageLineAY - averageLineBY) > yError) {
            return null;
        }
        let {start: minA, end: maxA} = lineA;
        if (minA.x > maxA.x) {
            const temp = maxA;
            maxA = minA;
            minA = temp;
        }
        let {start: minB, end: maxB} = lineB;
        if (minB.x > maxB.x) {
            const temp = maxB;
            maxB = minB;
            minB = temp;
        }
        let startY = (minA.x > minB.x) ? minA.y : minB.y;
        let endY = (maxA.x > maxB.x) ? maxB.y : maxA.y;
    
        return {
            start: {x: minX, y: startY},
            end: {x: maxX, y: endY}
        }
    }
    
    
    let start = {x: minX, y: Math.min(lineAMinY, lineBMinY)};
    let end = {x: minX, y: Math.max(lineAMaxY, lineBMaxY)};
    let line = {start: start, end: end};
    const aIntersectStart = getIntersection(lineA, line, yError);
    if (aIntersectStart == null) {
        return null;
    }
    const bIntersectStart = getIntersection(lineB, line, yError);
    if (bIntersectStart == null) {
        return null;
    }
    if (Math.abs(aIntersectStart.y - bIntersectStart.y) > yError) {
        return null;
    }
    
    
    start = {x: maxX, y: Math.min(lineAMinY, lineBMinY)};
    end = {x: maxX, y: Math.max(lineAMaxY, lineBMaxY)};
    line = {start: start, end: end};
    const aIntersectEnd = getIntersection(lineA, line, yError);
    if (aIntersectEnd == null) {
        return null;
    }
    const bIntersectEnd = getIntersection(lineB, line, yError);
    if (bIntersectEnd == null) {
        return null;
    }
    if (Math.abs(aIntersectEnd.y - bIntersectEnd.y) > yError) {
        return null;
    }
    return {
        start: aIntersectStart,
        end: aIntersectEnd
    }
}


module.exports = {
    lineSegmentComparison: lineSegmentComparison,
    getOverlappingLineSegment
}
