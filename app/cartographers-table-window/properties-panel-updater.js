let propertiesTemplates = null;

function updatePropertiesPanel(panel, selection, dataStructures) {
  if (!propertiesTemplates) {
      propertiesTemplates = {
          metaroom: document.getElementById("properties-panel-metaroom"),
          room: document.getElementById("properties-panel-room"),
          door: document.getElementById("properties-panel-door"),
          wall: document.getElementById("properties-panel-wall"),
          side: document.getElementById("properties-panel-side"),
          point: document.getElementById("properties-panel-point"),
          corner: document.getElementById("properties-panel-corner"),
      }
  }

  let clone = null;
  switch (selection.selectedType) {
    case "":
      clone = propertiesTemplates.metaroom.content.firstElementChild.cloneNode(true);
      clone.querySelector("#property-id").innerHTML = dataStructures.metaroomDisk.id;
      clone.querySelector("#property-name").innerHTML = dataStructures.metaroomDisk.name;
      clone.querySelector("#property-x").innerHTML = dataStructures.metaroomDisk.x;
      clone.querySelector("#property-y").innerHTML = dataStructures.metaroomDisk.y;
      clone.querySelector("#property-width").innerHTML = dataStructures.metaroomDisk.width;
      clone.querySelector("#property-height").innerHTML = dataStructures.metaroomDisk.height;
      clone.querySelector("#property-background").innerHTML = dataStructures.metaroomDisk.background;
      clone.querySelector("#property-metaroom-music").value = dataStructures.metaroomDisk.music ?? "";
      break;


    case "room":
      clone = propertiesTemplates.room.content.firstElementChild.cloneNode(true);
      let room = dataStructures.metaroomDisk.rooms[selection.selectedId];
      clone.querySelector("#property-id").innerHTML = selection.selectedId;
      clone.querySelector("#property-top-left").innerHTML = room.leftCeilingY;
      clone.querySelector("#property-top-right").innerHTML = room.rightCeilingY;
      clone.querySelector("#property-left").innerHTML = room.leftX;
      clone.querySelector("#property-right").innerHTML = room.rightX;
      clone.querySelector("#property-bottom-left").innerHTML = room.leftFloorY;
      clone.querySelector("#property-bottom-right").innerHTML = room.rightFloorY;
      let roomTypeName = "";
      switch (room.roomType) {
        case -1:
          roomTypeName = "Please add a type to this room.";
          break;

        case 0:
          roomTypeName = "Atmosphere";
          break;

        case 1:
          roomTypeName = "Wooden Walkway";
          break;

        case 2:
          roomTypeName = "Concrete Walkway";
          break;

        case 3:
          roomTypeName = "Indoor Corridor";
          break;

        case 4:
          roomTypeName = "Outdoor Corridor";
          break;

        case 5:
          roomTypeName = "Normal Soil";
          break;

        case 6:
          roomTypeName = "Boggy Soil";
          break;

        case 7:
          roomTypeName = "Drained Soil";
          break;

        case 8:
          roomTypeName = "Fresh Water";
          break;

        case 9:
          roomTypeName = "Salt Water";
          break;

        case 10:
          roomTypeName = "Ettin Home";
          break;

      }
      clone.querySelector("#property-room-type").innerHTML = roomTypeName;
      clone.querySelector("#property-room-music").placeholder = dataStructures.metaroomDisk.music ?? "Music";
      clone.querySelector("#property-room-music").value = room.music ?? "";
      break;


    case "door":
      clone = propertiesTemplates.door.content.firstElementChild.cloneNode(true);
      let door = dataStructures.doorsDict[selection.selectedId];
      clone.querySelector("#property-start").innerHTML = `X: ${door.start.x} Y: ${door.start.y}`;
      clone.querySelector("#property-end").innerHTML = `X: ${door.end.x} Y: ${door.end.y}`;
      clone.querySelector("#property-permeability").value = door.permeability;
      break;


    case "wall":
      clone = propertiesTemplates.wall.content.firstElementChild.cloneNode(true);
      let wall = dataStructures.walls[selection.selectedId];
      clone.querySelector("#property-start").innerHTML = `X: ${wall.start.x} Y: ${wall.start.y}`;
      clone.querySelector("#property-end").innerHTML = `X: ${wall.end.x} Y: ${wall.end.y}`;
      break;


    case "side":
      clone = propertiesTemplates.side.content.firstElementChild.cloneNode(true);
      break;


    case "point":
      clone = propertiesTemplates.point.content.firstElementChild.cloneNode(true);
      let point = dataStructures.points[selection.selectedId];
      clone.querySelector("#property-location").innerHTML = `X: ${point.x} Y: ${point.y}`;
      break;


    case "corner":
      clone = propertiesTemplates.corner.content.firstElementChild.cloneNode(true);
      let corner = dataStructures.points[selection.selectedId];
      clone.querySelector("#property-location").innerHTML = `X: ${corner.x} Y: ${corner.y}`;
      break;

    default:
      assert(false, "lol, wut?");

  }

  panel.innerHTML = "";
  panel.appendChild(clone);
}

let = roomtypeTemplates = null;

let roomtypeNames = [
  "Atmosphere",
  "Wooden Walkway",
  "Concrete Walkway",
  "Indoor Corridor",
  "Outdoor Corridor",
  "Normal Soil",
  "Boggy Soil",
  "Drained Soil",
  "Fresh Water",
  "Salt Water",
  "Ettin",
];

function updateRoomtypePanel(panel, selection, dataStructures) {
  if (!roomtypeTemplates) {
      roomtypeTemplates = {
          current: document.getElementById("properties-panel-room"),
          editor: document.getElementById("roomtypes-panel-editor"),
          roomtype: document.getElementById("roomtypes-panel-roomtype-ca"),
      }
  }

  let currentClone = document.getElementById("roomtypes-panel-roomtype-ca-static");

  if (!currentClone) {
    let editorClone = roomtypeTemplates.editor.content.firstElementChild.cloneNode(true);
    currentClone = roomtypeTemplates.roomtype.content.firstElementChild.cloneNode(true);

    panel.innerHTML = "";
    panel.appendChild(editorClone);
    panel.appendChild(document.createElement("hr"));
    panel.appendChild(currentClone);
  }

  if (selection.selectedType !== "" && currentClone) {
      let roomtype = -1;
      switch (selection.selectedType) {
        case "room":
          let room = dataStructures.metaroomDisk.rooms[selection.selectedId];
          roomtype = room.roomType;
          break;

        case "roomtype":
          roomtype = selection.selectedId;
          break;

      }

      currentClone.querySelector("#title").innerHTML = roomtypeNames[roomtype];

      currentClone.querySelector("#ca-0-gain").innerHTML = roomtypeCa0GainRates[roomtype];
      currentClone.querySelector("#ca-0-loss").innerHTML = roomtypeCa0LossRates[roomtype];
      currentClone.querySelector("#ca-0-diff").innerHTML = roomtypeCa0DiffRates[roomtype];

      currentClone.querySelector("#ca-1-gain").innerHTML = roomtypeCa1GainRates[roomtype];
      currentClone.querySelector("#ca-1-loss").innerHTML = roomtypeCa1LossRates[roomtype];
      currentClone.querySelector("#ca-1-diff").innerHTML = roomtypeCa1DiffRates[roomtype];

      currentClone.querySelector("#ca-2-gain").innerHTML = roomtypeCa2GainRates[roomtype];
      currentClone.querySelector("#ca-2-loss").innerHTML = roomtypeCa2LossRates[roomtype];
      currentClone.querySelector("#ca-2-diff").innerHTML = roomtypeCa2DiffRates[roomtype];

      currentClone.querySelector("#ca-3-gain").innerHTML = roomtypeCa3GainRates[roomtype];
      currentClone.querySelector("#ca-3-loss").innerHTML = roomtypeCa3LossRates[roomtype];
      currentClone.querySelector("#ca-3-diff").innerHTML = roomtypeCa3DiffRates[roomtype];

      currentClone.querySelector("#ca-4-gain").innerHTML = roomtypeCa4GainRates[roomtype];
      currentClone.querySelector("#ca-4-loss").innerHTML = roomtypeCa4LossRates[roomtype];
      currentClone.querySelector("#ca-4-diff").innerHTML = roomtypeCa4DiffRates[roomtype];

      currentClone.querySelector("#ca-5-gain").innerHTML = roomtypeCa5GainRates[roomtype];
      currentClone.querySelector("#ca-5-loss").innerHTML = roomtypeCa5LossRates[roomtype];
      currentClone.querySelector("#ca-5-diff").innerHTML = roomtypeCa5DiffRates[roomtype];

      currentClone.querySelector("#ca-6-gain").innerHTML = roomtypeCa6GainRates[roomtype];
      currentClone.querySelector("#ca-6-loss").innerHTML = roomtypeCa6LossRates[roomtype];
      currentClone.querySelector("#ca-6-diff").innerHTML = roomtypeCa6DiffRates[roomtype];

      currentClone.querySelector("#ca-7-gain").innerHTML = roomtypeCa7GainRates[roomtype];
      currentClone.querySelector("#ca-7-loss").innerHTML = roomtypeCa7LossRates[roomtype];
      currentClone.querySelector("#ca-7-diff").innerHTML = roomtypeCa7DiffRates[roomtype];

      currentClone.querySelector("#ca-8-gain").innerHTML = roomtypeCa8GainRates[roomtype];
      currentClone.querySelector("#ca-8-loss").innerHTML = roomtypeCa8LossRates[roomtype];
      currentClone.querySelector("#ca-8-diff").innerHTML = roomtypeCa8DiffRates[roomtype];

      currentClone.querySelector("#ca-10-gain").innerHTML = roomtypeCa10GainRates[roomtype];
      currentClone.querySelector("#ca-10-loss").innerHTML = roomtypeCa10LossRates[roomtype];
      currentClone.querySelector("#ca-10-diff").innerHTML = roomtypeCa10DiffRates[roomtype];

      currentClone.querySelector("#ca-11-gain").innerHTML = roomtypeCa11GainRates[roomtype];
      currentClone.querySelector("#ca-11-loss").innerHTML = roomtypeCa11LossRates[roomtype];
      currentClone.querySelector("#ca-11-diff").innerHTML = roomtypeCa11DiffRates[roomtype];

      currentClone.querySelector("#ca-12-gain").innerHTML = roomtypeCa12GainRates[roomtype];
      currentClone.querySelector("#ca-12-loss").innerHTML = roomtypeCa12LossRates[roomtype];
      currentClone.querySelector("#ca-12-diff").innerHTML = roomtypeCa12DiffRates[roomtype];

      currentClone.querySelector("#ca-13-gain").innerHTML = roomtypeCa13GainRates[roomtype];
      currentClone.querySelector("#ca-13-loss").innerHTML = roomtypeCa13LossRates[roomtype];
      currentClone.querySelector("#ca-13-diff").innerHTML = roomtypeCa13DiffRates[roomtype];

      currentClone.querySelector("#ca-14-gain").innerHTML = roomtypeCa14GainRates[roomtype];
      currentClone.querySelector("#ca-14-loss").innerHTML = roomtypeCa14LossRates[roomtype];
      currentClone.querySelector("#ca-14-diff").innerHTML = roomtypeCa14DiffRates[roomtype];

      currentClone.querySelector("#ca-15-gain").innerHTML = roomtypeCa15GainRates[roomtype];
      currentClone.querySelector("#ca-15-loss").innerHTML = roomtypeCa15LossRates[roomtype];
      currentClone.querySelector("#ca-15-diff").innerHTML = roomtypeCa15DiffRates[roomtype];

      currentClone.querySelector("#ca-16-gain").innerHTML = roomtypeCa16GainRates[roomtype];
      currentClone.querySelector("#ca-16-loss").innerHTML = roomtypeCa16LossRates[roomtype];
      currentClone.querySelector("#ca-16-diff").innerHTML = roomtypeCa16DiffRates[roomtype];

      currentClone.querySelector("#ca-17-gain").innerHTML = roomtypeCa17GainRates[roomtype];
      currentClone.querySelector("#ca-17-loss").innerHTML = roomtypeCa17LossRates[roomtype];
      currentClone.querySelector("#ca-17-diff").innerHTML = roomtypeCa17DiffRates[roomtype];

      currentClone.querySelector("#ca-18-gain").innerHTML = roomtypeCa18GainRates[roomtype];
      currentClone.querySelector("#ca-18-loss").innerHTML = roomtypeCa18LossRates[roomtype];
      currentClone.querySelector("#ca-18-diff").innerHTML = roomtypeCa18DiffRates[roomtype];

    }
}

module.exports = {
    updatePropertiesPanel,
    updateRoomtypePanel,
}

let roomtypeCa0GainRates = [
  1.000000,
  0.000000,
  1.000000,
  0.000000,
  0.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  0.000000,
  0.000000,
];
let roomtypeCa0LossRates = [
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
];
let roomtypeCa0DiffRates = [
  1.000000,
  0.000000,
  1.000000,
  0.000000,
  0.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  0.000000,
  0.000000,
]

let roomtypeCa1GainRates = [
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
];
let roomtypeCa1LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa1DiffRates = [
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
];

let roomtypeCa2GainRates = [
  0.800000,
  0.600000,
  0.600000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.000000,
  0.000000,
  0.800000,
];
let roomtypeCa2LossRates = [
  0.010000,
  0.001000,
  0.001000,
  0.010000,
  0.010000,
  0.010000,
  0.010000,
  0.010000,
  0.000000,
  0.000000,
  0.010000,
];
let roomtypeCa2DiffRates = [
  0.700000,
  0.700000,
  0.700000,
  0.700000,
  0.700000,
  0.700000,
  0.700000,
  0.700000,
  0.000000,
  0.000000,
  0.700000,
];

let roomtypeCa3GainRates = [
  0.900000,
  0.300000,
  0.300000,
  0.300000,
  0.300000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  0.300000,
];
let roomtypeCa3LossRates = [
  0.050000,
  0.900000,
  0.900000,
  0.900000,
  0.900000,
  0.005000,
  0.001000,
  0.010000,
  0.000100,
  0.000100,
  0.900000,
];
let roomtypeCa3DiffRates = [
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
];

let roomtypeCa4GainRates = [
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  1.000000,
  1.000000,
  1.000000,
  0.000000,
  0.000000,
  0.000000,
];
let roomtypeCa4LossRates = [
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.001000,
  0.001000,
  0.001000,
  0.000000,
  0.000000,
  0.000000,
];
let roomtypeCa4DiffRates = [
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.000000,
  0.900000,
  0.900000,
  0.900000,
  0.000000,
  0.000000,
  0.000000,
];

let roomtypeCa5GainRates = [
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  0.900000,
  0.900000,
  1.000000,
];
let roomtypeCa5LossRates = [
  0.100000,
  0.500000,
  0.500000,
  0.500000,
  0.500000,
  0.500000,
  0.500000,
  0.500000,
  0.001000,
  0.001000,
  0.500000,
];
let roomtypeCa5DiffRates = [
  0.100000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
  1.000000,
];

let roomtypeCa6GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa6LossRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];
let roomtypeCa6DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa7GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa7LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa7DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa8GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa8LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa8DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa10GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa10LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa10DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa11GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa11LossRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa11DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa12GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa12LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa12DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa13GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa13LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa13DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];

let roomtypeCa14GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa14LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa14DiffRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];

let roomtypeCa15GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa15LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa15DiffRates = [
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
];

let roomtypeCa16GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.990000,
];
let roomtypeCa16LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa16DiffRates = [
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
];

let roomtypeCa17GainRates = [
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
  0.950000,
];
let roomtypeCa17LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa17DiffRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];

let roomtypeCa18GainRates = [
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.990000,
  0.400000,
  0.400000,
  0.400000,
  0.990000,
  0.990000,
  0.000000,
];
let roomtypeCa18LossRates = [
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
  0.001000,
];
let roomtypeCa18DiffRates = [
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
  0.800000,
];
