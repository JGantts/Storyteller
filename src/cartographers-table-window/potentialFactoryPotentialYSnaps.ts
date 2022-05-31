import {isBetween, pointsEqual} from "./commonFunctions";
const {dataStructureFactory} = require('./dataStructureFactory.js');
const {geometry} = require('./geometryHelper.js');

/**
 * Gets any candidate lines to snap to, as well as lines to snap to that our other line point is on
 * @param startPoint
 * @param endPoint
 * @param dataStructures
 * @param tolerance
 */
function getCompanionsAndLineSnapCandidates(
    startPoint: SimplePoint,
    endPoint: SimplePoint,
    dataStructures: DataStructures,
    tolerance: number
): { companionSnapCandidates: { point: SimplePoint, line: SimpleLine }[], lineSnapCandidates: SimpleLine[] } {
    const lineSnapCandidates: SimpleLine[] = [];
    const companionSnapCandidates: { point: SimplePoint, line: SimpleLine }[] = [];
    
    // Add line and point to array if is within snap tolerance
    const addIf = (point: SimplePoint, line: SimpleLine, isCompanion: boolean) => {
        
        // Make sure point is inside horizontal line min/max x
        if (!isBetween(point.x, line.start.x, line.end.x, true)) {
            return false;
        }
        // Make sure y is near enough to bounds
        if (!isBetween(point.y, line.start.y - tolerance, line.end.y + tolerance, true)) {
            return false;
        }
        if (isCompanion) {
            companionSnapCandidates.push({
                point,
                line
            });
        } else {
            lineSnapCandidates.push(line);
        }
        return true;
    }
    
    const rooms = dataStructures.metaroomDisk!!.rooms
    
    // Loop through rooms grabbing ceilings and floors, and adding them as candidates
    for (const roomId in rooms) {
        const roomWalls = dataStructureFactory.getWallsFromRoom(rooms[roomId]);
        let companionPoint: Nullable<SimplePoint> = null;
        if (pointsEqual(roomWalls[0].start, startPoint)) {
            companionPoint = roomWalls[0].end;
        } else if (pointsEqual(roomWalls[0].end, startPoint)) {
            companionPoint = roomWalls[0].start;
        } else if (pointsEqual(roomWalls[2].start, startPoint)) {
            companionPoint = roomWalls[2].end;
        } else if (pointsEqual(roomWalls[2].end, startPoint)) {
            companionPoint = roomWalls[0].start
        }
        
        if (!addIf(endPoint, roomWalls[0], false) && companionPoint != null) {
            addIf(companionPoint, roomWalls[0], true)
        }
        
        if (!addIf(endPoint, roomWalls[2], false) && companionPoint != null) {
            addIf(companionPoint, roomWalls[2], true);
        }
    }
    
    return {
        companionSnapCandidates,
        lineSnapCandidates
    }
}


/**
 * Get snap to a line that the companion point is on, but this one is not.
 * Meant to match slope
 * @param thisPoint
 * @param companionPoint
 * @param line
 * @param tolerance
 */
function getYSnapFromCompanion(
    thisPoint: SimplePoint,
    companionPoint: SimplePoint,
    line: SimpleLine,
    tolerance: number
): Nullable<SimplePoint> {
    
    // This line is vertical, so cannot get companion snap which snaps along the y slop of the passed in line
    if (thisPoint.x == companionPoint.x) {
        return null;
    }
    
    const companionIntersect = geometry.getYIntersect(companionPoint.x, line);
    if (companionIntersect == null || Math.abs(companionIntersect.y - companionPoint.y) > tolerance) {
        return null;
    }
    
    let thisOnRight = thisPoint.x < line.end.x;
    let slope = (line.end.y - line.start.y) / (line.end.x - line.start.x);
    let linePoint = thisOnRight ? line.end : line.start;
    let xDistance = thisPoint.x - linePoint.x;
    let newY = (xDistance * slope) + linePoint.y;
    return {
        x: thisPoint.x,
        y: newY
    };
}

function getPointLineYSnap(
    thisPoint: SimplePoint,
    line: SimpleLine,
    tolerance: number
): Nullable<SimplePoint> {
    
    const yIntersection = geometry.getYIntersect(thisPoint.x, line, tolerance);
    if (yIntersection != null) {
        return yIntersection;
    }
    
    return null;
}

/**
 * Gets all potential snaps for a point moving on the y-axis, towards any nearby non-vertical walls
 * @param startPoint
 * @param endPoint
 * @param dataStructures
 * @param tolerance
 */
export function getPotentialYSnaps(
    startPoint: SimplePoint,
    endPoint: SimplePoint,
    dataStructures: DataStructures,
    tolerance: number
): number[] {
    const {companionSnapCandidates, lineSnapCandidates} = getCompanionsAndLineSnapCandidates(
        startPoint,
        endPoint,
        dataStructures,
        tolerance
    );
    
    const potentialYs: number[] = [];
    const adjustedPoint = {x: startPoint.x, y: endPoint.y};
    for (const companionPoint of companionSnapCandidates) {
        const tempPoint = getYSnapFromCompanion(
            adjustedPoint,
            companionPoint.point,
            companionPoint.line,
            tolerance
        );
        if (tempPoint != null) {
            potentialYs.push(tempPoint.y);
        }
    }
    for (const candidateLine of lineSnapCandidates) {
        const tempPoint = getPointLineYSnap(
            adjustedPoint,
            candidateLine,
            tolerance
        );
        if (tempPoint != null) {
            potentialYs.push(tempPoint.y);
        }
    }
    
    return potentialYs;
}


module.exports = {
    getPotentialYSnaps
}