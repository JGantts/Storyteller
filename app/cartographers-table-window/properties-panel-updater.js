let templates = null;

function updatePropertiesPanel(panel, selection, dataStructures) {
  if (!templates) {
      templates = {
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
      clone = templates.metaroom.content.firstElementChild.cloneNode(true);
      clone.querySelector("#property-id").innerHTML = dataStructures.metaroomDisk.id;
      break;


    case "room":
      clone = templates.room.content.firstElementChild.cloneNode(true);
      let room = dataStructures.metaroomDisk.rooms[selection.selectedId];
      clone.querySelector("#property-id").innerHTML = selection.selectedId;
      clone.querySelector("#property-top-left").innerHTML = room.leftCeilingY;
      clone.querySelector("#property-top-right").innerHTML = room.rightCeilingY;
      clone.querySelector("#property-left").innerHTML = room.leftX;
      clone.querySelector("#property-right").innerHTML = room.rightX;
      clone.querySelector("#property-bottom-left").innerHTML = room.leftFloorY;
      clone.querySelector("#property-bottom-right").innerHTML = room.rightFloorY;

      break;


    case "door":
      clone = templates.door.content.firstElementChild.cloneNode(true);
      break;


    case "wall":
      clone = templates.wall.content.firstElementChild.cloneNode(true);
      break;


    case "side":
      clone = templates.side.content.firstElementChild.cloneNode(true);
      break;


    case "point":
      clone = templates.point.content.firstElementChild.cloneNode(true);
      break;


    case "corner":
      clone = templates.corner.content.firstElementChild.cloneNode(true);
      break;

    default:
      assert("false", "lol, wut?");

  }

  panel.innerHTML = "";
  panel.appendChild(clone);
}

module.exports = {
    updatePropertiesPanel
}
