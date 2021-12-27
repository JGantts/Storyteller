$(async function(){
  let creaturesResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/')
  if (creaturesResponse.ok){
    let creaturesData = await creaturesResponse.json();
    let creatureGrid = document.querySelector("#creatureGrid")
    creaturesData.slice(0, 10).forEach((rowData, rowDataIndex) => {

      var nameImageTemplate = document.querySelector('#mytemplate')

      let nameImagePlacement = document.importNode(nameImageTemplate.content, true);

      nameImagePlacement.querySelector('#creatureImage').src =
        'https://gantt42.com/api/v1/storyteller/creatures/' + rowData.moniker + '/image';

      (async function(creatureNamePlacement){
        let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + rowData.moniker +'/name')
        if (nameResponse.ok){
          let nameData = await nameResponse.json();
          creatureNamePlacement.textContent = nameData.name;
        }else{
          alert("HTTP-Error: " + response.status);
        }
      }(nameImagePlacement.querySelector('#creatureName')));

      nameImagePlacement.querySelector('#creatureLink').addEventListener("click", function(){
        window.creatureMoniker = rowData.moniker;
        $("#main").load("creature-page/creature-page.html");
      });

      creatureGrid.appendChild(nameImagePlacement)
    })
  }else{
    alert("HTTP-Error: " + creaturesResponse.status);
  }
});

function monikerKeyPress(e) {
    if(e.keyCode === 13){
        e.preventDefault();
        var x = document.getElementById("moniker-search");
        window.creatureMoniker = x.value;
        $("#main").load("creature-page/creature-page.html");
    }
}
