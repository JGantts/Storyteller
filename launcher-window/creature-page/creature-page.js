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
        let conceptionConceptionTemplate = document.querySelector('#kin-parents-conceived')
        let conceptionConceptionPlacement = document.importNode(conceptionConceptionTemplate.content, true);

        conceptionConceptionPlacement.querySelector('#parent1Link').addEventListener("click", function(){
          window.creatureMoniker = kinData.parent1Moniker;
          $("#main").load("creature-page/creature-page.html");
        });

        conceptionConceptionPlacement.querySelector('#parent2Link').addEventListener("click", function(){
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
        }(conceptionConceptionPlacement.querySelector('#parent1Name')));

        (async function(parentNamePlacement){
          let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent2Moniker +'/name')
          if (nameResponse.ok){
            let nameData = await nameResponse.json();
            parentNamePlacement.textContent = '🠖' + nameData.name;
          }else{
            alert("HTTP-Error: " + response.status);
          }
        }(conceptionConceptionPlacement.querySelector('#parent2Name')));

        document.querySelector("#creatureKinParent").appendChild(conceptionConceptionPlacement);

        break;


        case 1:
          let splicedConceptionTemplate = document.querySelector('#kin-parents-spliced')
          let splicedConceptionPlacement = document.importNode(splicedConceptionTemplate.content, true);

          conceptionConceptionPlacement.querySelector('#parent1Link').addEventListener("click", function(){
            window.creatureMoniker = kinData.parent1Moniker;
            $("#main").load("creature-page/creature-page.html");
          });

          conceptionConceptionPlacement.querySelector('#parent2Link').addEventListener("click", function(){
            window.creatureMoniker = kinData.parent2Moniker;
            $("#main").load("creature-page/creature-page.html");
          });

          (async function(parentNamePlacement){
            let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent1Moniker +'/name')
            if (nameResponse.ok){
              let nameData = await nameResponse.json();
              parentNamePlacement.textContent = '🠖' + nameData.name;
            }else{
              alert("HTTP-Error: " + nameResponse.status);
            }
          }(splicedConceptionPlacement.querySelector('#parent1Name')));

          (async function(parentNamePlacement){
            let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent2Moniker +'/name')
            if (nameResponse.ok){
              let nameData = await nameResponse.json();
              parentNamePlacement.textContent = '🠖' + nameData.name;
            }else{
              alert("HTTP-Error: " + nameResponse.status);
            }
          }(splicedConceptionPlacement.querySelector('#parent2Name')));

          document.querySelector("#creatureKinParent").appendChild(splicedConceptionPlacement);

          break;


          case 2:
            let engineeredConceptionTemplate = document.querySelector('#kin-parents-engineered')
            let engineeredConceptionPlacement = document.importNode(engineeredConceptionTemplate.content, true);

            engineeredConceptionPlacement.querySelector('#parent2Moniker').textContent = kinData.parent2Moniker

            document.querySelector("#creatureKinParent").appendChild(engineeredConceptionPlacement);

            break;


            case 14:
              let clonedConceptionTemplate = document.querySelector('#kin-parents-cloned')
              let clonedConceptionPlacement = document.importNode(engineeredConceptionTemplate.content, true);

              clonedConceptionPlacement.querySelector('#parent1Link').addEventListener("click", function(){
                window.creatureMoniker = kinData.parent1Moniker;
                $("#main").load("creature-page/creature-page.html");
              });

              (async function(parentNamePlacement){
                let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + kinData.parent1Moniker +'/name')
                if (nameResponse.ok){
                  let nameData = await nameResponse.json();
                  parentNamePlacement.textContent = '🠖' + nameData.name;
                }else{
                  alert("HTTP-Error: " + nameResponse.status);
                }
              }(splicedConceptionPlacement.querySelector('#parent1Name')));

              document.querySelector("#creatureKinParent").appendChild(clonedConceptionPlacement);

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
            alert("HTTP-Error: " + nameResponse.status);
          }
        }(childPlacement.querySelector('#childName')));

        childrenContainer.appendChild(childPlacement)
      });

    }

  }else{
    alert("HTTP-Error: " + kinResponse.status);
  }

  let eventsResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + window.creatureMoniker + '/events');
  if (eventsResponse.ok){
    let eventsData = await eventsResponse.json();

    if (eventsData.length > 0) {
      let eventsContainer = document.querySelector("#creatureEventsContainer")
      eventsData.forEach((eventData, eventDataIndex) => {

        let eventTemplate = document.querySelector('#event-default')
        let eventPlacement = document.importNode(eventTemplate.content, true);

        let imageSrc = 'https://gantt42.com/api/v1/storyteller/creatures/' + window.creatureMoniker + '/events/' + eventData.eventNumber + '/image';
        (async function(imagePlacement){
          let imageResponse = await fetch(
            imageSrc,
            { method: 'HEAD' }
          );
          if (imageResponse.ok){
            imagePlacement.src = imageSrc
          } else {
            imagePlacement.remove();
          }
        }(eventPlacement.querySelector('#eventImage')));

        (async function(eventDescriptionPlacement){
          let eventDescription = "";
          switch (eventData.histEventType) {
            case 0:
              let name1Conceived = await getName(eventData.moniker1);
              let name2Conceived = await getName(eventData.moniker2);
              eventDescription = "Conceived by " + name1Conceived + " and " + name2Conceived + ".";
              break;

            case 1:
              let name1Spliced = await getName(eventData.moniker1);
              let name2Spliced = await getName(eventData.moniker2);
              eventDescription = "Spliced from " + name1Spliced + " and " + name2Spliced + ".";
              break;

            case 2:
              eventDescription = "Engineered from " + eventData.moniker2 + ".";
              break;

            case 3:
              eventDescription = "Born in " + eventData.worldName + ".";
              break;

            case 4:
              let age = "";
              switch (eventData.lifeStage) {
                case -1:
                  age = "unborn";
                  break;
                case 0:
                  age = "baby";
                  break;
                case 1:
                  age = "child";
                  break;
                case 2:
                  age = "adolescent";
                  break;
                case 3:
                  age = "youth";
                  break;
                case 4:
                  age = "adult";
                  break;
                case 5:
                  age = "old";
                  break;
                case 6:
                  age = "ancient";
                  break;
                case 7:
                  age = "dead";
                  break;
                default :
                  age = "undead";
                  break;
              }
              eventDescription = "Became " + age + ".";
              break;

            case 5:
              eventDescription = "Exported from " + eventData.worldName + ".";
              break;

            case 6:
              eventDescription = "Imported into " + eventData.worldName + ".";
              break;

            case 7:
              eventDescription = "Died.";
              break;

            case 8:
              let name1BecamePregnant = await getName(eventData.moniker1);
              let name2BecamePregnant = await getName(eventData.moniker2);
              eventDescription = "Became pregnant by " + name2BecamePregnant + " with " + name1BecamePregnant + ".";
              break;

            case 9:
              let name1Impregnated = await getName(eventData.moniker1);
              let name2Impregnated = await getName(eventData.moniker2);
              eventDescription = "Impregnated " + name2Impregnated + " with " + name1Impregnated  + ".";
              break;

            case 10:
              let name1ChildBorn = await getName(eventData.moniker1);
              let name2ChildBorn = await getName(eventData.moniker2);
              eventDescription = "Child, " + name1ChildBorn + " of " + name2ChildBorn + ", born.";
              break;

            case 11:
              let name1LaidByMother = await getName(eventData.moniker1);
              eventDescription = "Laid by " + name1LaidByMother + ".";
              break;

            case 12:
              let name1Laid = await getName(eventData.moniker1);
              eventDescription = "Laid " + name1Laid + " as an egg.";
              break;

            case 13:
              eventDescription = "Photographed.";
              break;

            case 14:
              let name1Cloned = await getName(eventData.moniker1);s
              eventDescription = "Cloned from " + name1Cloned + ".";
              break;

            case 15:
              let name1CloneSource = await getName(eventData.moniker1);
              eventDescription = "Clone source for " + name1CloneSource + ".";
              break;

            case 16:
              eventDescription = "Warped out of " + eventData.worldName + ".";
              break;

            case 17:
              eventDescription = "Warped in to " + eventData.worldName + ".";
              break;
          }
          eventDescriptionPlacement.textContent = eventDescription;
        }(eventPlacement.querySelector('#eventDescription')));

        let age = secondsToHm(eventData.tickAge/20);
        if (age === "") {
          eventPlacement.querySelector('#eventTickAge').remove();
        } else {
          eventPlacement.querySelector('#eventTickAge').textContent = "Age: " + secondsToHm(eventData.tickAge/20);
        }
        eventPlacement.querySelector('#eventTimeUTC').textContent = unixTimeToWallClockTime(eventData.timeUTC);

        document.querySelector("#creatureEventsContainer").appendChild(eventPlacement);
      });
    }

  }else{
    alert("HTTP-Error: " + eventsResponse.status);
  }


});


async function getName(moniker){
  let nameResponse = await fetch('https://gantt42.com/api/v1/storyteller/creatures/' + moniker +'/name');
  if (nameResponse.ok){
    let nameData = await nameResponse.json();
    return nameData.name;
  }else{
    alert("HTTP-Error: " + nameResponse.status);
    return "Unnamed"
  }
}

function secondsToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
    return hDisplay + mDisplay;
}

function unixTimeToWallClockTime(unixTime) {
  var date = new Date(unixTime * 1000);
  return date.toLocaleString(
      "en-GB",
      {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
}
