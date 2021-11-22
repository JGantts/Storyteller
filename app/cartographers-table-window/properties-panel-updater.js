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
      break;


    case "door":
      clone = propertiesTemplates.door.content.firstElementChild.cloneNode(true);
      let door = dataStructures.doors[selection.selectedId];
      clone.querySelector("#property-start").innerHTML = `X: ${door.start.x} Y: ${door.start.y}`;
      clone.querySelector("#property-end").innerHTML = `X: ${door.end.x} Y: ${door.end.y}`;
      clone.querySelector("#property-permeability").innerHTML = door.permeability*100;
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
      assert("false", "lol, wut?");

  }

  panel.innerHTML = "";
  panel.appendChild(clone);
}

let = roomtypeTemplates = null;

function updateRoomtypePanel(panel, selection, dataStructures) {
  if (!roomtypeTemplates) {
      roomtypeTemplates = {
          key: document.getElementById("roomtypes-panel-key"),
          current: document.getElementById("roomtypes-panel-current"),
      }
  }
  let keyClone = roomtypeTemplates.key.content.firstElementChild.cloneNode(true);
  let currentClone = roomtypeTemplates.current.content.firstElementChild.cloneNode(true);

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

  panel.innerHTML = "";
  panel.appendChild(keyClone);
  panel.appendChild(currentClone);
}

module.exports = {
    updatePropertiesPanel
}
