function lineSegmentComparison(lineA, lineB, lineASlice, lineABSlice, lineBSlice, modificationWasMadeToLineA, lineBHandled) {
    assert(
      lineA.start.x !== lineA.end.x ||
      lineA.start.y !== lineA.end.y,
      `LineA has 0 length\n${JSON.stringify(lineA)}`
    );

    assert(
      lineB.start.x !== lineB.end.x ||
      lineB.start.y !== lineB.end.y,
      `LineB has 0 length\n${JSON.stringify(lineB)}`
    );


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
                    lineBHandled();

                //lines touch, no overlap, lineA on top
                } else if (
                      lineAMaxY === lineBMinY
                ) {
                    lineASlice(lineA.start, lineA.end);
                    lineBSlice(lineB.start, lineB.end);
                    lineBHandled();

                //overlap with upper-lineA and lower-lineB tails
                } else if (
                    lineAMinY < lineBMinY
                    && lineBMinY < lineAMaxY
                    && lineAMaxY < lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);
                    modificationWasMadeToLineA();
                    lineBHandled();

                //overlap with lower-lineB tail
                } else if (
                  lineAMinY === lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY < lineBMaxY
                ) {
                    lineABSlice(lineA.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);
                    lineBHandled();

                //overlap with upper-lineB tail
                } else if (
                  lineAMinY > lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineA.end);
                    lineBHandled();

                //overlap with upper-lineB and lower-lineB tails
                } else if (
                  lineAMinY > lineBMinY
                  && lineBMinY < lineAMaxY
                  && lineAMaxY < lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineA.end);
                    lineBSlice(lineA.end, lineB.end);
                    lineBHandled();

                //overlap with no tails
                } else if (
                  lineAMinY === lineBMinY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineABSlice(lineA.start, lineA.end);
                    lineBHandled();

                //overlap with upper-lineA and lower-lineA tails
                } else if (
                  lineAMinY < lineBMinY
                  && lineAMaxY > lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);
                    modificationWasMadeToLineA();
                    lineBHandled();

                //overlap with lower-lineA tail
                } else if (
                  lineAMinY === lineBMinY
                  && lineAMaxY >lineBMaxY
                ) {
                    lineABSlice(lineB.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);
                    modificationWasMadeToLineA();
                    lineBHandled();

                //overlap with upper-lineA tail
                } else if (
                  lineAMinY < lineBMinY
                  && lineAMaxY === lineBMaxY
                ) {
                    lineASlice(lineA.start, lineB.start);
                    lineABSlice(lineB.start, lineB.end);
                    modificationWasMadeToLineA();
                    lineBHandled();

                //overlap with lower-lineA and upper-lineB tails
                } else if (
                  lineAMinY > lineBMinY
                  && lineAMinY < lineBMaxY
                  && lineAMaxY > lineBMaxY
                ) {
                    lineBSlice(lineB.start, lineA.start);
                    lineABSlice(lineA.start, lineB.end);
                    lineASlice(lineB.end, lineA.end);
                    modificationWasMadeToLineA();
                    lineBHandled();

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

            //on same slope
            let lineASlope = (lineA.end.y - lineA.start.y)/(lineA.end.x - lineA.start.x)
            let lineBSlope = (lineB.end.y - lineB.start.y)/(lineB.end.x - lineB.start.x)
            if (lineASlope === lineBSlope) {

                let lineSegmentsIntersect = false;

                //ensure we can safely compare these two points
                if (
                    lineA.end.x === lineB.start.x
                    && lineA.end.y === lineB.start.y
                ) {
                    //we cannont. Fortunately that tells us that:
                    lineSegmentsIntersect = true;
                } else {
                    let comparisonRun = lineA.end.x - lineB.start.x;
                    let comparisonRise = comparisonRun * lineASlope;
                    let comparisonIntersection = lineB.start.y + comparisonRise;
                    lineSegmentsIntersect = (comparisonIntersection === lineA.end.y);
                }


                //on same line
                if (lineSegmentsIntersect) {
                    //lines don't touch, lineA on left
                    if (
                      lineAMaxX < lineBMinX
                    ) {
                        lineASlice(lineA.start, lineA.end);
                        lineBSlice(lineB.start, lineB.end);
                        lineBHandled();

                    //lines touch, no overlap, lineA on left
                    } else if (
                          lineAMaxX === lineBMinX
                    ) {
                        lineASlice(lineA.start, lineA.end);
                        lineBSlice(lineB.start, lineB.end);
                        lineBHandled();

                    //overlap with left-lineA and right-lineB tails
                    } else if (
                        lineAMinX < lineBMinX
                        && lineBMinX < lineAMaxX
                        && lineAMaxX < lineBMaxX
                    ) {
                        lineASlice(lineA.start, lineB.start);
                        lineABSlice(lineB.start, lineA.end);
                        lineBSlice(lineA.end, lineB.end);
                        modificationWasMadeToLineA();
                        lineBHandled();

                    //overlap with right-lineB tail
                    } else if (
                      lineAMinX === lineBMinX
                      && lineBMinX < lineAMaxX
                      && lineAMaxX < lineBMaxX

                    ) {
                        lineABSlice(lineA.start, lineA.end);
                        lineBSlice(lineA.end, lineB.end);
                        lineBHandled();

                    //overlap with left-lineB tail
                    } else if (
                      lineAMinX > lineBMinX
                      && lineBMinX < lineAMaxX
                      && lineAMaxX === lineBMaxX
                    ) {
                        lineBSlice(lineB.start, lineA.start);
                        lineABSlice(lineA.start, lineA.end);
                        lineBHandled();

                    //overlap with left-lineB and right-lineB tails
                    } else if (
                      lineAMinX > lineBMinX
                      && lineBMinX < lineAMaxX
                      && lineAMaxX < lineBMaxX
                    ) {
                        lineBSlice(lineB.start, lineA.start);
                        lineABSlice(lineA.start, lineA.end);
                        lineBSlice(lineA.end, lineB.end);
                        modificationWasMadeToLineA();

                    //overlap with no tails
                    } else if (
                      lineAMinX === lineBMinX
                      && lineAMaxX === lineBMaxX
                    ) {
                        lineABSlice(lineA.start, lineA.end);
                        lineBHandled();

                    //overlap with left-lineA and right-lineA tails
                    } else if (
                      lineAMinX < lineBMinX
                      && lineAMaxX > lineBMaxX
                    ) {
                        lineASlice(lineA.start, lineB.start);
                        lineABSlice(lineB.start, lineB.end);
                        lineASlice(lineB.end, lineA.end);
                        modificationWasMadeToLineA();
                        lineBHandled();

                    //overlap with right-lineA tail
                    } else if (
                      lineAMinX === lineBMinX
                      && lineAMaxX >lineBMaxX
                    ) {
                        lineABSlice(lineB.start, lineB.end);
                        lineASlice(lineB.end, lineA.end);
                        modificationWasMadeToLineA();
                        lineBHandled();

                    //overlap with left-lineA tail
                    } else if (
                      lineAMinX < lineBMinX
                      && lineAMaxX === lineBMaxX
                    ) {
                        lineASlice(lineA.start, lineB.start);
                        lineABSlice(lineB.start, lineB.end);
                        modificationWasMadeToLineA();
                        lineBHandled();

                    //overlap with right-lineA and left-lineB tails
                    } else if (
                      lineAMinX > lineBMinX
                      && lineAMinX < lineBMaxX
                      && lineAMaxX > lineBMaxX
                    ) {
                        lineBSlice(lineB.start, lineA.start);
                        lineABSlice(lineA.start, lineB.end);
                        lineASlice(lineB.end, lineA.end);
                        modificationWasMadeToLineA();
                        lineBHandled();

                    //lines touch, lineA on right
                    } else if (
                      lineAMinX === lineBMaxX
                    ) {
                        lineBSlice(lineB.start, lineB.end);
                        lineASlice(lineA.start, lineA.end);
                        lineBHandled();

                    //lines don't touch, lineA on right
                    } else if (
                      lineAMinX > lineBMaxX
                    ) {
                        lineBSlice(lineB.start, lineB.end);
                        lineASlice(lineA.start, lineA.end);
                        lineBHandled();

                    } else {
                        console.log("wtf?");
                        console.log(lineA);
                        console.log(lineB);
                    }
                } else {
                    lineASlice(lineA.start, lineA.end);
                    lineBSlice(lineB.start, lineB.end);

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
     }
}

module.exports = {
    lineSegmentComparison: lineSegmentComparison
}
