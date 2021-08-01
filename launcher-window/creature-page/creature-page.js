$(async function(){
  document.querySelector('#creatureMoniker').innerHTML = window.creatureMoniker;

  document.querySelector('#creatureImage').src = 'https://gantt42.com/api/v1/storyteller/creatures/' + window.creatureMoniker + '/image';

  (async function(creatureNamePlacement){
    let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + window.creatureMoniker +'/name')
    if (nameResponse.ok){
      let nameData = await nameResponse.json();
      creatureNamePlacement.textContent = nameData.name;
    }else{
      alert("HTTP-Error: " + response.status);
    }
  }(document.querySelector('#creatureName')));

  let kinResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + window.creatureMoniker + '/kin');
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
          let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent1Moniker +'/name')
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            parentNamePlacement.textContent = '🠖' + nameData.name;
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(conceptionEventPlacement.querySelector('#parent1Name')));

        (async function(parentNamePlacement){
          let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent2Moniker +'/name')
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            parentNamePlacement.textContent = '🠖' + nameData.name;
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(conceptionEventPlacement.querySelector('#parent2Name')));

        document.querySelector("#creatureKinParent").appendChild(conceptionEventPlacement);

        break;

      default:

    }

    if(kinData.children.length > 0){
      document.querySelector("#creatureKinChildrenLabel").style.display="block";
      let childrenContainer = document.querySelector("#creatureKinChildrenContainer")
      kinData.children.slice(0, 10).forEach((childData, childDataIndex) => {
        var childTemplate = document.querySelector('#kin-child');

        let childPlacement = document.importNode(childTemplate.content, true);

        childPlacement.querySelector('#childLink').addEventListener("click", function(){
          window.creatureMoniker = childData.moniker;
          $("#main").load("creature-page/creature-page.html");
        });

        (async function(childNamePlacement){
          let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + childData.moniker +'/name');
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            childNamePlacement.textContent = '🠖' + nameData.name;
            if(childDataIndex < kinData.children.length - 1){
              childNamePlacement.textContent += ", ";
            }
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(childPlacement.querySelector('#childName')));

        childrenContainer.appendChild(childPlacement)
      });

    }

  }else{
    alert("HTTP-Error: " + response.status);
  }
});
