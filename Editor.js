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

/* global Sheet, SheetManager */
;(function () {
  if (!location.pathname.match(/\/editor\/[A-Za-z0-9\-]+\/?/)) return;
  var sheetId,
      siteBase = window.location.protocol + "//" + window.location.host,
      sheetAPIPath = '/api/sheet/get/',
      revisionAPIPath = '/api/revision/get/';
  
  console.log('ready to fetch sheet!');
  sheetId = /\/editor\/([A-Za-z0-9\-]+)\/?/.exec(location.pathname)[1]
  console.log('sheet id is ' + sheetId);
  
  $.get(siteBase + sheetAPIPath + sheetId, function (ev) {
    console.log(ev);
    
    if (ev.level === 'error') {
      $('#edit').html('<h3>failed to get sheet due to reason: ' + ev.message + '</h3>');
      return
    }
    
    var sheet = ev.data;
    
    document.title = sheet.name;
    
    var selectedRevision = sheet.revisions[sheet.revisions.length - 1];
    var revisionId = selectedRevision._id;
    
    $.get(siteBase + revisionAPIPath + revisionId, function (ev) {
      console.log(ev);
      var revision = ev.data;
      
      var sheet = Sheet.fromObject(revision.data);
      console.log(sheet);
      
      var $canvas = $('<canvas>');
      
      var canvas  = $canvas[0];
          
    	var manager = new SheetManager(canvas);
    	
    	manager.setSheet(sheet, {cols: 3, width: 980});
    	
    	manager.drawSheet();
    	console.log(manager)
	    
	    var height = canvas.height, width = canvas.width;
	    
	    $('#edit').animate({
	      height: height + 'px',
	      width: width + 'px'
	    }, 500, function () {
	      $canvas.css('opacity', '0')
	      $(this).html('').append($canvas);
	      $canvas.animate({
	        opacity: 1
	      }, 500);
	    })
	    
      
    });
  });
  
}());


function handler(){

    $('.ui.sidebar').sidebar({ overlay: false }).sidebar('toggle');

}

$('.accordion')
  .accordion({
    selector: {
      trigger: '.title .icon'
    }
  })
;
