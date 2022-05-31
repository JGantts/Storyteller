type Nullable<T> = T | undefined | null;

type SimplePoint = {x: number; y: number}

type SimpleLine = {start: SimplePoint; end: SimplePoint}

type ViewingRoomTypeState = {
  isViewingPalette: boolean;
  isEditingRoomtype: false | { pickedRoomtype: number };
}



type MasterUiState = {
  keys: {
      shiftKeyIsDown: boolean;
      ctrlKeyIsDown: boolean;
      spacebarIsDown: boolean;
  },

  dragging: {
      isMouseButtonDown: boolean;

      isDragging: boolean;
      whatDragging: string;
      idDragging?: number;

      startDragging?: SimplePoint;
      stopDragging?: SimplePoint;
  };

  state: {
      isViewingRoomType:
        false | ViewingRoomTypeState;
  };

  camera: {
      redraw: boolean;
      rezoom: boolean;
      reposition: boolean;
  }
}

type Point = {
  id: string;
  x: number;
  y: number;
  roomKeys: string[];
}

type Room = {
  id: string;
  leftX: number;
  rightX: number;
  leftCeilingY: number;
  rightCeilingY: number;
  leftFloorY: number;
  rightFloorY: number;
  roomType?: number;
  music?: string;
}

type Perm = {
  id: string;
  rooms: {
    a: string;
    b: string;
  };
  permeability: number;
}

type Metaroom = {
  id: string;
  name: string;
  background: string;
  music: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rooms: { [key: string]: Room };
  perms: { [key: string]: Perm };
}

type DataStructures = {
    metaroomDisk?: Metaroom;
    backgroundFileAbsoluteWorking?: string;
    points: { [key: string]: Point };
    walls: Door[];
    doorsDict: { [key: string]: Door };
    doorsArray: Door[];
    pointsSortedX: Point[];
    pointsSortedY: Point[];
};


type DoorData = {
    permeability: number;
    start: SimplePoint;
    end: SimplePoint;
    roomKeys: string[]
}
type Door = {
  id: string;
} & DoorData;

type Wall = {
  id: string;
  roomKeys: string[];
  start: SimplePoint;
  end: SimplePoint;
};

type MapSelection = {
    selectedType: string,
    selectedId: string|number|any,
    selectedRoomsIdsPartsIds: SelectedPart[],
    selectionInstancedId: null,
}

type SelectedPart = {
    roomId: string,
    partId: number
}

type PossiblyChangedDoors = {
    segments: DoorData[];
    changed: boolean;
}

// Global variables defined in StoryTellers index.ts
declare let zooomSettle: number;
declare let zoom: number;
declare let posX: number;
declare let posY: number;
declare function getRoomLineThickness(): number;


// BLK worker/parser types
type BlkData = HTMLImageElement|ImageData;
type BlkCallback = (image: ImageData | HTMLImageElement) => void;

/**
 * Support variables used by main process associated with a specific browser window.
 */
type BrowserData = {
    requestToClose?: Nullable<boolean>;
}