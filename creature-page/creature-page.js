$(async function(){
  document.querySelector('#creatureMoniker').innerHTML = window.creatureMoniker;

  document.querySelector('#creatureImage').src = 'https://lemurware.tech/api/v1/creatures/' + window.creatureMoniker + '/image';

  let kinResponse = await fetch('https://lemurware.tech/api/v1/creatures/' + window.creatureMoniker + '/kin');
  if (kinResponse.ok){
    let kinData = await kinResponse.json();

    switch (kinData.conceptionEventType) {
      case 0:
        let conceptionEventTemplate = document.querySelector('#kin-parents-conceived')
        let conceptionEventPlacement = document.importNode(conceptionEventTemplate.content, true);

        conceptionEventPlacement.querySelector('#parent1Link').addEventListener("click", function(){
          window.creatureMoniker = kinData.parent1Moniker;
          $("#main").load("creature-page/creature-page.html");
        });

        conceptionEventPlacement.querySelector('#parent2Link').addEventListener("click", function(){
          window.creatureMoniker = kinData.parent2Moniker;
          $("#main").load("creature-page/creature-page.html");
        });

        (async function(parentNamePlacement){
          let nameResponse = await fetch('https://lemurware.tech/api/v1/creatures/' + kinData.parent1Moniker +'/name')
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            parentNamePlacement.textContent = nameData.name;
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(conceptionEventPlacement.querySelector('#parent1Name')));

        (async function(parentNamePlacement){
          let nameResponse = await fetch('https://lemurware.tech/api/v1/creatures/' + kinData.parent2Moniker +'/name')
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            parentNamePlacement.textContent = nameData.name;
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(conceptionEventPlacement.querySelector('#parent2Name')));

        document.querySelector("#creatureKinParent").appendChild(conceptionEventPlacement);

        break;

      default:

    }

  }else{
    alert("HTTP-Error: " + response.status);
  }
});
