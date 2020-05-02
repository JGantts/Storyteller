function loadServerPage(){
  $("#main").load("server-page/server-page.html");
}

function loadLocalPage(){
  $("#main").load("local-page/local-page.html");
}

$(function(){
  loadServerPage();
});
