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
