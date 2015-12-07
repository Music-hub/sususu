$('.menu .item').tab();

function handler(){

    $('.ui.sidebar').sidebar({ overlay: false }).sidebar('toggle');

}

$('.accordion')
  .accordion({
    selector: {
      trigger: '.title'
    }
  })
;


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
    	
    	manager.setSheet(sheet, {cols: 3, width: 920});
    	
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
	    
	    startEditor(manager, sheetId);
      
    });
  });
  
}());


$('#clone').click(function () {
  if (!location.pathname.match(/\/editor\/[A-Za-z0-9\-]+\/?/)) return;
  var sheetId = /\/editor\/([A-Za-z0-9\-]+)\/?/.exec(location.pathname)[1];
  var cloneApi = "/api/sheet/clone/"
  $.get(cloneApi + sheetId, function (ev) {
    if (ev.level === "success") {
      location.href = "/editor/" + ev.data._id;
    }
  })
})

function startEditor(manager, sheetId) {
  var currentDuration = "4";
  
  manager.initEvent();
	manager.on('hover_note', function (state) {
		console.log('note hover', state.stave.index);
		manager.setColor(state.note.on.index, 'blue');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('click_stave', function (state) {
		var target, note;
		var keySignature, lineNumber, clef, pitch, index;
		console.log('stave', state.stave.index);
		if (!state.note.on.index) {
		  index = [state.stave.index[0]]
			keySignature = manager.getInfo(index).keySignature;
			clef = manager.getInfo(index).clef;
			lineNumber = state.stave.lineNumber;
			pitch = manager.getPitch(lineNumber, clef, keySignature);
			note = Note({ keys: [pitch.pitch + '/' + pitch.octave], duration: currentDuration})
			if (state.note.between.post.index) {
				target = state.note.between.post.index.concat([]);
			} else if (state.note.between.pre.index) {
				target = state.note.between.pre.index.concat([]);
				target[2] += 1
			} else {
				target = state.stave.index.concat([0]);
			}
			manager.addNote(target, note);
			manager.setSheet();
			manager.drawSheet();
		}
	})
	manager.on('click_note', function (state) {
		console.log('note', state.note.on.index);
		manager.removeNote(state.note.on.index);
		manager.setSheet();
		manager.drawSheet();
	})
	
  var socket = io('/sheet');
  socket.emit('join', sheetId);
  
  manager.on('layout_update', function (sheet) {
    socket.emit('layout_update', sheet.toObject());
  })
  manager.on('measure_update', function (index, measure) {
    socket.emit('measure_update', index, measure.toObject());
  })
  manager.on('meta_update', function (index, info) {
    socket.emit('meta_update', index, info);
  })
  
  socket.on('layout_update', function (sheet) {
    console.log('layout_update')
    sheet = Sheet.fromObject(sheet);
    manager.setSheet(sheet);
    manager.drawSheet();
  })
  socket.on('measure_update', function (index, measure) {
    console.log('measure_update')
    measure = Measure.fromObject(measure);
    manager.setMeasure(index, measure, true);
    manager.setSheet();
    manager.drawSheet();
  })
  socket.on('meta_update', function (index, info) {
    console.log('meta_update')
    manager.setInfo(index, info, true);
    manager.setSheet();
    manager.drawSheet();
  })
  
  $("button[data-role='duration']").on('click', function () {
    $("button[data-role='duration']").removeClass('active');
    $(this).addClass('active');
    currentDuration = $(this).attr('data-value');
  })
}