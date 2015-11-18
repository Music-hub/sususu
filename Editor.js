$('.menu .item').tab();

function myFunction(id){
    
    var btn = document.getElementById(id);
    /*var color = btn.style.backgroundColor.substring(1,7);
    var btn_color = parseInt("0x" + color   ,16);
    var gray      = parseInt("0x" + "DDDDDD",16);
    
    if(btn_color == gray){
        btn.style.backgroundColor="#FFFFFF";
        
    }
    else{
        btn.style.backgroundColor="#DDDDDD";
        
    }*/
    
    return btn;
}

$(document).ready(function() {
  var $toggle  = $('.ui.toggle.button');
  //var btn = document.getElementById(myFunction);
  var text = myFunction.innerHTML;    
  $toggle.state({
      text: {
        inactive : text,
        active   : text
      }
  });
});


