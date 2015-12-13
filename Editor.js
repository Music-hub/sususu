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
    
    if (sheet.shortLink) {
      $('#short-link').val(sheet.shortLink)
      
      var qrcode = new QRCode(document.getElementById("short-link-qrcode"), {
          text: sheet.shortLink,
          width: 200,
          height: 200,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.M
      });
    }
    
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
	      $('#edit').css('height', 'auto');
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

function Selector (fulfill) {
  this.fulfill = fulfill;
  EventEmitter.call(this);
  this.selected = [];
}

inherits(Selector, EventEmitter);

Selector.prototype.isSelected = function (index) {
  var i, oldItem;
  for (i = this.selected.length - 1; i >= 0; i--) {
    oldItem = this.selected[i];
    if (JSON.stringify(index) === JSON.stringify(oldItem.index)) {
      return true
    }
  }
  return false;
}
Selector.prototype.addSelect = function (index, data) {
  var dup = false;
  this.selected.forEach(function (oldItem) {
    if (JSON.stringify(index) === JSON.stringify(oldItem.index)) {
      dup = true;
    }
  })
  if (dup) return;
  var item = {
    index : index,
    data : data
  }
  this.selected.push(item);
  this.emit('select', item);
  if (this.fulfill === this.selected.length) {
    this.emit('fulfill', this.selected);
  }
}

Selector.prototype.reSelectAll = function () {
  var i;
  for (i = this.selected.length - 1; i >= 0; i--) {
    this.emit('select', this.selected[i]);
  }
}
Selector.prototype.deSelect = function (index, noevent) {
  var itemIndex = -1;
  this.selected.forEach(function (oldItem, i) {
    if (JSON.stringify(index) === JSON.stringify(oldItem.index)) {
      itemIndex = i;
    }
  })
  if (itemIndex < 0) return;
  var removeed = this.selected[itemIndex];
  this.selected.splice(itemIndex, 1);
  if (!noevent) this.emit('deselect', removeed);
}

Selector.prototype.deSelectAll = function (noevent) {
  var i;
  for (i = this.selected.length - 1; i >= 0; i--) {
    this.deSelect(this.selected[i].index, noevent);
  }
}

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
  
  var oldDuration = "4";
  
  var currentDuration = "4";
  
  var noteSelectors = {
    removeNoteSelector : function (selector) {
      selector.on('fulfill', function (selected) {
        manager.removeNote(selected[0].index);
        selector.deSelectAll();
    		manager.setSheet();
    		manager.drawSheet();
      })
      return selector;
    } (new Selector(1)),
    addTupletSelector : function (selector) {
      selector.on('select', function (item) {
        manager.setColor(item.index, 'yellow');
		    manager.renderSheet();
      })
      selector.on('deselect', function (item) {
        manager.setColor(item.index, '');
		    manager.renderSheet();
      })
      selector.on('fulfill', function (selected) {
        console.log('add tuplet...');
        var tuplet = new Effect('tuplet', Math.random(), null);
        selected.forEach(function (item) {
          manager.addEffect(item.index, tuplet)
        })
        manager.setSheet();
        manager.drawSheet();
        selector.deSelectAll();
      })
      return selector;
    } (new Selector(3)),
    removeTupletSelector : function (selector) {
      selector.on('fulfill', function (selected) {
        var index = selected[0].index;
        var effects = manager.getEffect(index);
        for (var i = effects.length - 1; i >= 0; i++) {
          var effect = effects[i];
          if (effect.type === "tuplet") {
            var effectId = effect.id;
            var effectSet = manager.findWithEffect(3, 'tuplet', effectId);
            effectSet[0].indexes.forEach(function (index) {
              manager.removeEffect(index, 'tuplet', effectId);
            })
          }
        }
        selector.deSelectAll();
      });
      return selector;
    } (new Selector(1))
  };
  var currentNoteSelector = noteSelectors.removeNoteSelector;
  
  var staveSelectors = {
    addNoteSelector : function (selector) {
      selector.on('fulfill', function (selected) {
        var state = selected[0].data;
        var target, keySignature, index, clef, lineNumber, pitch, note;
        selector.deSelectAll();
        
        console.log(state);
        
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
    			
    			if (currentDuration.match(/r$/) && oldDuration) {
    			  currentDuration = oldDuration;
            $("button[data-role='duration']").removeClass('active');
            $("button[data-role='duration'][data-value='" + oldDuration + "']").addClass('active');
    			}
    		}
            
      })
      return selector;
    } (new Selector(1)),
  }
  var currentStaveSelector = staveSelectors.addNoteSelector;
  
  manager.initEvent();
	manager.on('hover_note', function (state) {
		console.log('note hover', state.stave.index);
		if (!currentNoteSelector.isSelected(state.note.on.index)) {
		  manager.setColor(state.note.on.index, 'blue');
		}
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		if (!currentNoteSelector.isSelected(oldState.note.on.index)) {
		  manager.setColor(oldState.note.on.index, '');
		}
		manager.renderSheet();
	})
	manager.on('click_stave', function (state) {
	  var index = state.stave.index.slice(0, 2);
		if(!currentStaveSelector.isSelected(index)) {
		  currentStaveSelector.addSelect(index, state)
		} else {
		  currentStaveSelector.deSelect(index);
		}
	})
	manager.on('click_note', function (state) {
		
		if(!currentNoteSelector.isSelected(state.note.on.index)) {
		  currentNoteSelector.addSelect(state.note.on.index, state)
		} else {
		  currentNoteSelector.deSelect(state.note.on.index);
		}
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
    currentNoteSelector.reSelectAll();
  })
  socket.on('measure_update', function (index, measure) {
    console.log('measure_update')
    measure = Measure.fromObject(measure);
    manager.setMeasure(index, measure, true);
    manager.setSheet();
    manager.drawSheet();
    currentNoteSelector.reSelectAll();
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
    if (!currentDuration.match(/r$/)) {
      oldDuration = currentDuration;
    }
    
  })
  
  $("button[data-role='note-action']").on('click', function () {
    $("button[data-role='note-action']").removeClass('active');
    $(this).addClass('active');
    var currentAction = $(this).attr('data-value');
    currentNoteSelector.deSelectAll();
    switch (currentAction) {
      case "remove-note":
        currentNoteSelector = noteSelectors.removeNoteSelector
        break;
      case "add-tuplet":
        currentNoteSelector = noteSelectors.addTupletSelector
        break;
      case "remove-tuplet":
        currentNoteSelector = noteSelectors.removeTupletSelector
        break;
        
    }
  })
  
  $("#track-add").click(function () {
    var currentCount = manager.getChannelCount();
    manager.addTrack(currentCount, new Channel([], 'treble', 'C'))
  })
  $("#track-remove").click(function () {
    var currentCount = manager.getChannelCount();
    if (currentCount === 1) return;
    manager.removeTrack(currentCount -1 , 1);
  })
  $("#measure-length-set").click(function () {
    var newLength = ~~$('#measure-length').val();
    if (isNaN(newLength)) return;
    if (newLength <= 0) return;
    manager.setMeasureLength(newLength);
  })
}