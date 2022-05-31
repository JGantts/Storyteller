import {flashError} from "./flashError";
import {getMinMax, pointsEqual} from "./commonFunctions";

const {dataStructureFactory} = require('./dataStructureFactory.js');
const {geometry} = require('./geometryHelper.js');
const {selectionChecker} = require("./selectionChecker");
const { getPotentialYSnaps } = require('./potentialFactoryPotentialYSnaps.js');

function getPotentialRoomFromLine(startPoint: SimplePoint, endPoint: SimplePoint, dataStructures: DataStructures, line: Door) {
    // Vertical
    if (line.start.x === line.end.x) {
        let deltaX = endPoint.x - startPoint.x;
        
        if (Math.abs(deltaX) < 5) {
            return null;
        }
        
        let xToConsider = line.start.x + deltaX;
        
        let closestPointsX = -1;
        for (let i = 0; i < dataStructures.pointsSortedX.length; i++) {
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
                roomType: 0,
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
                roomType: 0,
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
        for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
            if (
                Math.abs(dataStructures.pointsSortedY[i].y - yToConsiderA)
                < Math.abs(closestPointAsY - yToConsiderA)
            ) {
                closestPointAsY = dataStructures.pointsSortedY[i].y;
            }
        }
        
        let closestPointBsY = -1;
        for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
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

function getPotentialRoomFromPoints(
    startPoint: SimplePoint,
    endPoint: SimplePoint,
    dataStructures: DataStructures,
    snapToYToLine: boolean = false
): Nullable<Room> {
    
    let deltaX = endPoint.x - startPoint.x;
    let deltaY = endPoint.y - startPoint.y;
    
    if (Math.abs(deltaY) < 5 && Math.abs(deltaX) < 5) {
        return null;
    }
    
    let xToConsider = endPoint.x;
    
    let closestPointsX = -1;
    
    for (let i = 0; i < dataStructures.pointsSortedX.length; i++) {
        if (
            Math.abs(dataStructures.pointsSortedX[i].x - xToConsider)
            < Math.abs(closestPointsX - xToConsider)
        ) {
            closestPointsX = dataStructures.pointsSortedX[i].x;
        }
    }
    
    let xToUse;
    if (Math.abs(xToConsider - closestPointsX) < 5) {
        xToUse = closestPointsX;
    } else {
        xToUse = xToConsider;
    }
    
    
    let yToConsider = endPoint.y;
    
    let closestPointsY = -1;
    for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
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
    
    xToUse = Math.round(xToUse);
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

function getPotentialRoomFromYChange(
    startPoint: SimplePoint,
    endPoint: SimplePoint,
    dataStructures: DataStructures,
    room: Room,
    yTolerance: number = 6
): Nullable<Room> {
    let deltaY = endPoint.y - startPoint.y;
    
    if (Math.abs(deltaY) < 5) {
        return null;
    }
    
    const yToConsider = endPoint.y;
    
    let closestPointsY = Number.MAX_VALUE;
    
    // Calculate tolerance with regard to zoom
    let tolerance = zoom > 1 ? yTolerance * zoom : yTolerance;
    
    // Find best match for vertical snap to point
    for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
        const potentialPoint = dataStructures.pointsSortedY[i];
        const isPointNearbyX = Math.abs(potentialPoint.x - endPoint.x) < 3 ||
            room.leftX == potentialPoint.x ||
            room.rightX == potentialPoint.x;
        if (isPointNearbyX && Math.abs(potentialPoint.y - yToConsider) < Math.abs(closestPointsY - yToConsider)) {
            closestPointsY = dataStructures.pointsSortedY[i].y;
        }
    }
    
    // Add all potential points to diagonal ySnap targets
    const potentialYs = getPotentialYSnaps(startPoint, endPoint, dataStructures, tolerance);
    
    // Add ySnap to point option if near enough
    if (Math.abs(yToConsider - closestPointsY) < tolerance) {
        potentialYs.push(closestPointsY);
    }
    
    let yToUse: number;
    
    // If only one potential y use it
    if (potentialYs.length === 1) {
        closestPointsY = potentialYs[0];
    } else  if (potentialYs.length > 1) {
        // Find best match amongst all potential yS
        closestPointsY = Number.MAX_VALUE;
        for (const potentialY of potentialYs) {
            if (
                Math.abs(potentialY - yToConsider) < Math.abs(closestPointsY - yToConsider)
            ) {
                closestPointsY = potentialY
            }
        }
    }
    
    // Use closest Y if close enough or cursor Y if not
    if (Math.abs(yToConsider - closestPointsY) < tolerance) {
        yToUse = closestPointsY;
    } else {
        yToUse = yToConsider;
    }
    
    // Round point for use in map
    yToUse = Math.round(yToUse);
    
    // Replace y for corner
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
            }
        
    }
    return null;
}

function getPotentialRoomFromSide(startPoint: SimplePoint, endPoint: SimplePoint, dataStructures: DataStructures, selectedRoom: Room, selectedSide: number): Nullable<Room> {
    let room = selectedRoom;
    let side = dataStructureFactory.getWallsFromRoom(room)[selectedSide];
    // assert(selectedSide !== -1)
    if (selectedSide === -1) {
        console.error(`cannot get potential room for invalid side: ${selectedSide}`);
        flashError();
        return null;
    }
    if (selectedSide === 0 || selectedSide == 2) {
        let deltaY = endPoint.y - startPoint.y;
        
        if (Math.abs(deltaY) < 5) {
            return null;
        }
        
        let yToConsiderA = side.start.y + deltaY;
        let yToConsiderB = side.end.y + deltaY;
        const horizontal = yToConsiderA == yToConsiderB;
        let closestPointAsY = -1;
        for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
            const potentialPoint = dataStructures.pointsSortedY[i];
            if (
                Math.abs(potentialPoint.y - yToConsiderA)
                < Math.abs(closestPointAsY - yToConsiderA)
            ) {
                closestPointAsY = potentialPoint.y;
            }
        }
        
        let closestPointBsY = -1;
        for (let i = 0; i < dataStructures.pointsSortedY.length; i++) {
            const potentialPoint = dataStructures.pointsSortedY[i];
            if (
                Math.abs(potentialPoint.y - yToConsiderB)
                < Math.abs(closestPointBsY - yToConsiderB)
            ) {
                closestPointBsY = potentialPoint.y;
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
        for (let i = 0; i < dataStructures.pointsSortedX.length; i++) {
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
                return  {
                    id: room.id,
                    leftX: xToUse,
                    rightX: room.rightX,
                    leftCeilingY: room.leftCeilingY,
                    rightCeilingY: room.rightCeilingY,
                    leftFloorY: room.leftFloorY,
                    rightFloorY: room.rightFloorY
                };
        }
        
    }
}


/**
 * Check if a single point lays within room
 * @param roomPoint
 * @param room
 * @param checkBounds
 */
function pointInRoom(roomPoint: SimplePoint, room: Room|SimplePoint[], checkBounds: boolean): boolean {
    const roomPoints:SimplePoint[] = Array.isArray(room) ? room : Object.values(dataStructureFactory.getPointsFromRoom(room));
    if (checkBounds) {
        const {min, max} = dataStructureFactory.getRoomBounds(room);
        if ( roomPoint.x <= min.x || roomPoint.x >= max.x || roomPoint.y < min.y || roomPoint.y > max.y ) {
            return false;
        }
    }
    
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
    if (roomPoints.length < 4) {
        return true;
    }
    let inside: boolean = false;
    for ( let i = 0, j = 3; i < 4 ; j = i++ ) {
        const otherI = roomPoints[i];
        if (otherI == null) {
            console.error(`Room point is null at ${i}; Points: `, roomPoints);
            return false;
        }
        const otherJ = roomPoints[j];
        if (
            (otherI.y > roomPoint.y) != (otherJ.y > roomPoint.y) &&
            roomPoint.x < ((otherJ.x - otherI.x) * (roomPoint.y - otherI.y) / (otherJ.y - otherI.y) + otherI.x)
        ) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Checks all room points against all other room polygons
 * @param { Room } room
 * @param { Point[] }points
 */
function pointsInRoom(room: Room, points: {[id:string]: Point}) {
    const {min:boundsMin, max: boundsMax} = dataStructureFactory.getRoomBounds(room);
    const roomPoints: Point[] = Object.values(dataStructureFactory.getPointsFromRoom(room));
    if (roomPoints?.length !== 4) {
        console.error("Failed to get room points as array. Object.values() returned: ", roomPoints);
        return false;
    }
    for (const point of Object.values(points)) {
        if (point.roomKeys.indexOf(room.id) >= 0) {
            continue;
        }
        if (point.x <= boundsMin.x || point.x >= boundsMax.x || point.y <= boundsMin.y || point.y >= boundsMax.y) {
            return false;
        }
        if (pointInRoom(point, roomPoints, false)) {
            return true;
        }
    }
}

/**
 * Checks all room points against all other room polygons
 * @param room
 * @param rooms
 */
function roomPointsInRooms(room: Room, rooms: Room[]) {
    const otherRooms = rooms.filter((otherRoom) => room.id != otherRoom.id);
    const points = dataStructureFactory.getPointsFromRoom(room);
    for (const otherRoom of otherRooms) {
        const {min:boundsMin, max: boundsMax} = dataStructureFactory.getRoomBounds(otherRoom);
        for (const pointKey in points) {
            const point = points[pointKey];
            if (point.x <= boundsMin.x || point.x >= boundsMax.x || point.y <= boundsMin.y || point.y >= boundsMax.y) {
                return false;
            }
            if (pointInRoom(point, otherRoom, false)) {
                return true;
            }
        }
    }
}

/**
 * Checks potential room
 * @param potentialRooms
 * @param tolerance
 */
function potentialRoomLinesOverlap(potentialRooms: Room[], tolerance: number): boolean {
    const lines: Door[] = dataStructureFactory.getWallsFromRooms(potentialRooms);
    
    // Check all potential rooms for overlap with each other
    for (const room of potentialRooms) {
        const roomLines: Door[] = lines.filter(line => line.roomKeys.indexOf(room.id) >= 0);
        const otherRoomLines: Door[] = lines.filter(line => line.roomKeys.indexOf(room.id) < 0);
        
        // Check this rooms lines with all the other lines
        for (const roomLine of roomLines) {
            for (const otherLine of otherRoomLines) {
                if (geometry.isIntersectingLines(otherLine, roomLine, tolerance)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function potentialRoomsOverlap(room: Room, potentialRooms: Room[], overlapTolerance: number = 1.0): boolean {
    if (potentialRoomLinesOverlap(potentialRooms, overlapTolerance)) {
        return true;
    }
    for (const potentialRoom of potentialRooms) {
        if (room.id == potentialRoom.id) {
            continue;
        }
        if (roomPointsInRooms(room, potentialRooms)) {
            return true;
        }
    }
    return false;
}

function roomOverlapsOrCausesTooSmallDoor(
    room: Nullable<Room>,
    dataStructures: DataStructures,
    idsToDelete?: Room[],
    overlapTolerance: number = 1,
) {
    if (!room) {
        return false;
    }
    if (room.leftX >= room.rightX
    || room.leftCeilingY >= room. leftFloorY
    || room.rightCeilingY >= room.rightFloorY) {
      return true;
    }
    
    
    //check if this potentialRoom contains any existing points.
    if (pointsInRoom(room, dataStructures.points)) {
        return true;
    }
    
    let lines = dataStructureFactory.getWallsFromRoom(room);
    
    //check if potentialRoom overlaps exactly any existing room sides
    //    such that rooms are overlapping, not adjacent.
    //    exclude all rooms which we're modifying.
    for (const roomKey in dataStructures.metaroomDisk!!.rooms) {
        if (idsToDelete?.some(idToDelete => roomKey === idToDelete.id)) {
            continue;
        }
        let linesExisting = dataStructureFactory.getWallsFromRoom(dataStructures.metaroomDisk!!.rooms[roomKey]);
        for (let i = 0; i < 4; i++) {
            let shouldReturnTrue = false;
            lineSegmentComparison(
                lines[i],
                linesExisting[i],
                () => {},
                () => { shouldReturnTrue = shouldReturnTrue || true; },
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
            if (geometry.isIntersectingLines(potentialLine, existingLine, overlapTolerance, true)) {
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

function getPotentialRooms(masterUiState: MasterUiState, selection: MapSelection, dataStructures: DataStructures): Room[] {
    let rooms: Room[] = [];
    if (masterUiState.dragging.isDragging) {
        if (masterUiState.keys.shiftKeyIsDown) {
            if (masterUiState.dragging.whatDragging === "point") {
                let room = getPotentialRoomFromPoints(
                    masterUiState.dragging.startDragging!!,
                    masterUiState.dragging.stopDragging!!,
                    dataStructures,
                );
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
                    masterUiState.dragging.startDragging!!,
                    masterUiState.dragging.stopDragging!!,
                    dataStructures,
                );
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                    rooms = [room];
                }
            }
            
        } else if (masterUiState.keys.ctrlKeyIsDown) {
            if (masterUiState.dragging.whatDragging === "point"
                || masterUiState.dragging.whatDragging === "corner") {
                let room = getPotentialRoomFromPoints(
                    masterUiState.dragging.startDragging!!,
                    masterUiState.dragging.stopDragging!!,
                    dataStructures,
                );
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures)) {
                    rooms = [room];
                }
                
            } else if (masterUiState.dragging.whatDragging === "door") {
                Function.prototype();
                
            } else if (masterUiState.dragging.whatDragging === "wall") {
                let selectedLine = dataStructures.walls[selection.selectedId];
                let room = getPotentialRoomFromLine(masterUiState.dragging.startDragging!!, masterUiState.dragging.stopDragging!!, dataStructures, selectedLine);
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
                let newRooms: Room[] = [];
                for (const index in selection.selectedRoomsIdsPartsIds) {
                    let roomIdPartId = selection.selectedRoomsIdsPartsIds[index];
                    let id = roomIdPartId.roomId;
                    let selectedRoom = dataStructures.metaroomDisk!!.rooms[id];
                    let room = getPotentialRoomFromYChange(
                        masterUiState.dragging.startDragging!!,
                        masterUiState.dragging.stopDragging!!,
                        dataStructures,
                        selectedRoom
                    );
                    if (room) {
                        newRooms.push(room);
                    }
                }
                for (const newRoom of newRooms) {
                    if (newRoom && !roomOverlapsOrCausesTooSmallDoor(newRoom, dataStructures, newRooms)) {
                        rooms.push(newRoom);
                    }
                }
                
            } else if (masterUiState.dragging.whatDragging === "corner") {
                // assert(selection.selectedRoomsIdsPartsIds.length === 1,
                //     `Size was not 1: ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`);
                if (selection.selectedRoomsIdsPartsIds.length !== 1) {
                    console.error(`Selected room id size was not 1 when dragging corner; ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`);
                    selectionChecker.resetSelection();
                    flashError();
                    return [];
                }
                let roomIdPartId = selection.selectedRoomsIdsPartsIds[0];
                let id = roomIdPartId.roomId;
                let selectedRoom = dataStructures.metaroomDisk!!.rooms[id];
                let room = getPotentialRoomFromYChange(
                    masterUiState.dragging.startDragging!!,
                    masterUiState.dragging.stopDragging!!,
                    dataStructures,
                    selectedRoom
                );
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures, [selectedRoom])) {
                    rooms = [room];
                }
                
            } else if (masterUiState.dragging.whatDragging === "door"
                || masterUiState.dragging.whatDragging === "wall"
            ) {
                let newRooms: Room[] = [];
                for (const index in selection.selectedRoomsIdsPartsIds) {
                    let selectedRoomIdPartId = selection.selectedRoomsIdsPartsIds[index];
                    let id = selectedRoomIdPartId.roomId;
                    let selectedRoom = dataStructures.metaroomDisk!!.rooms[id];
                    let selectedSide = selectedRoomIdPartId.partId;
                    let room = getPotentialRoomFromSide(masterUiState.dragging.startDragging!!, masterUiState.dragging.stopDragging!!, dataStructures, selectedRoom, selectedSide);
                    if (room) {
                        newRooms.push(room);
                    }
                }
                for (const newRoom of newRooms) {
                    if (newRoom && !roomOverlapsOrCausesTooSmallDoor(newRoom, dataStructures, newRooms)) {
                        rooms.push(newRoom);
                    }
                }
                
            } else if (masterUiState.dragging.whatDragging === "room") {
                Function.prototype();
                
                
            } else if (masterUiState.dragging.whatDragging === "side") {
                // assert(selection.selectedRoomsIdsPartsIds.length === 1,
                //     `Size was not 1: ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`)
                if (selection.selectedRoomsIdsPartsIds.length !== 1) {
                    console.error(`Selected room ids was not 1 when dragging side: ${JSON.stringify(selection.selectedRoomsIdsPartsIds)}`);
                    selectionChecker.resetSelection();
                    flashError();
                    return [];
                }
                let roomIdPartId = selection.selectedRoomsIdsPartsIds[0];
                let id = roomIdPartId.roomId;
                let selectedRoom = dataStructures.metaroomDisk!!.rooms[id];
                let selectedSide = roomIdPartId.partId;
                let room = getPotentialRoomFromSide(masterUiState.dragging.startDragging!!, masterUiState.dragging.stopDragging!!, dataStructures, selectedRoom, selectedSide);
                if (room && !roomOverlapsOrCausesTooSmallDoor(room, dataStructures, [selectedRoom])) {
                    rooms = [room];
                }
                
            } else {
                Function.prototype();
            }
        }
    }
    
    // Ensure rooms are not self intersecting
    if (rooms.length > 1) {
        for (const room of rooms) {
            if (potentialRoomsOverlap(room, rooms)) {
                return [];
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
