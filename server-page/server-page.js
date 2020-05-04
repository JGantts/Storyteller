$(async function(){
  let creaturesResponse = await fetch('https://lemurware.tech/api/v1/creatures/')
  if (creaturesResponse.ok){
    let creaturesData = await creaturesResponse.json();
    let creatureGrid = document.querySelector("#creatureGrid")
    creaturesData.slice(0, 10).forEach((rowData, rowDataIndex) => {

      var nameImageTemplate = document.querySelector('#mytemplate')

      let nameImagePlacement = document.importNode(nameImageTemplate.content, true);

      nameImagePlacement.querySelector('#creatureImage').src =
        'https://lemurware.tech/api/v1/creatures/' + rowData.moniker + '/image';

      (async function(creatureNamePlacement){
        let nameResponse = await fetch('https://lemurware.tech/api/v1/creatures/' + rowData.moniker +'/name')
        if (nameResponse.ok){
          let nameData = await nameResponse.json();
          creatureNamePlacement.textContent = nameData.name;
        }else {
          alert("HTTP-Error: " + response.status);
        }
      }(nameImagePlacement.querySelector('#creatureName')));

      nameImagePlacement.querySelector('#creatureLink').addEventListener("click", function(){
        window.creatureMoniker = rowData.moniker;
        $("#main").load("creature-page/creature-page.html");
      });

      creatureGrid.appendChild(nameImagePlacement)
    })

    nameImagePlacement.querySelector('#creatureName').textContent = nameData.name;
  }else{
    alert("HTTP-Error: " + creaturesResponse.status);
  }
});
