document.querySelector('#creatureMoniker').innerHTML = window.creatureMoniker;

document.querySelector('#creatureImage').src = 'https://lemurware.tech/api/v1/creatures/' + window.creatureMoniker +'/image'

var xhttpName = new XMLHttpRequest();
xhttpName.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var nameData = JSON.parse(this.responseText);
    document.querySelector('#creatureName').innerHTML = nameData.name;
  }
};
xhttpName.open('GET', 'https://lemurware.tech/api/v1/creatures/' + window.creatureMoniker + '/name', true);
xhttpName.send();
/*
var xhttpName = new XMLHttpRequest();
xhttpName.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var data = JSON.parse(this.responseText);

    function addDataToTbody(creatureGrid, data) {
      data.slice(0, 10).forEach((rowData, rowDataIndex) => {

        var nameImageTemplate = document.querySelector('#mytemplate')

        var nameImagePlacement = document.importNode(nameImageTemplate.content, true);

        // set
        nameImagePlacement.querySelector('#creatureImage').src =
          'https://lemurware.tech/api/v1/creatures/' + rowData.moniker +'/image'
        nameImagePlacement.querySelector('#creatureName').textContent =
          rowData.name
        nameImagePlacement.querySelector('#creatureLink').addEventListener("click", function(){
          window.creatureMoniker = rowData.moniker;
          $("#main").load("creature-page/creature-page.html");
        });

        creatureGrid.appendChild(nameImagePlacement)
      })
    }

    var creatureGrid = document.querySelector("#creatureGrid")

    addDataToTbody(creatureGrid, data);

  }
};
xhttpName.open("GET", "https://lemurware.tech/api/v1/creatures/", true);
xhttpName.send();
*/
