function loadSettingsPage(clicked){
  $("#main").load("settings-page/settings-page.html");
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(' active', '');
  document.getElementById(clicked).className += ' active';
}

function loadLocalPage(clicked){
  $("#main").load("local-page/local-page.html");
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(' active', '');
  document.getElementById(clicked).className += ' active';
}

function loadServerPage(clicked){
  $("#main").load("server-page/server-page.html");
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(' active', '');
  document.getElementById(clicked).className += ' active';
}

function loadEemFooPage(clicked){
  $("#main").load("eem-foo-page/eem-foo-page.htm");
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(' active', '');
  document.getElementById(clicked).className += ' active';
}

function loadDevToolsPage(clicked){
  $("#main").load("dev-tools-page/dev-tools-page.html");
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(' active', '');
  document.getElementById(clicked).className += ' active';
}

$(function(){
  loadLocalPage('nav-btn-local');
});
