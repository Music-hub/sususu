$('#add_chord,#phone_add_chord').on('click', function(){
    
    $('.ui.modal').modal('show');
                 
});

/*$('.ui.modal').modal({

    onVisible: function(){
      window.alert('Edit your chord!');
    }

});*/

$('#root .item').on('click',function(){

    
    $('#root .item').removeClass('active');
    $(this).addClass('active');
    
    setvalue();

});

$('#sharp_drop .item').on('click',function(){

    
    $('#sharp_drop .item').removeClass('active');
    $(this).addClass('active');
    
    setvalue();
});

$('#guide .item').on('click',function(){
    
    
    $('#guide .item').removeClass('active');
    $(this).addClass('active'); 
    
    setvalue();
});

$('#tension .item').on('click',function(){

    $('#tension .item').removeClass('active');
    $(this).addClass('active'); 
    
    setvalue();
});

function setvalue(){

    var root,sharp_drop,guide,temp,temp1,tension;
    root = $('#root .active.item').text().trim();
    temp1 = $('#sharp_drop .active.item').text().trim();
    guide =$('#guide .active.item').text().trim();
    temp = $('#tension .active.item').text().trim();
    
    if(temp == "none")
        tension = "";
    else
        tension = temp;
    
    if(temp1 == "none")
        sharp_drop = "";
    else
        sharp_drop = temp1;
    
    $('#chord_show').text(root+sharp_drop+guide+tension);

    return root+sharp_drop+guide+tension;
}

$('#modal_button_add').on('click',function(){

    //var but_num = $("button[data-role='chord']").size(); //chord button 數量
    
    result = setvalue();
    
    $('#chord_pool').prepend('<div class="chord_container">'+
                             '<button class="circular ui icon button" id="remove">'+
                             '<i class="small remove circle icon"></i>'+
                             '</button>'+
                             '<button class="ui button" data-role="chord">'+
                             result+
                             '</button>'+
                             '</div>');
    
    $('#phone_chord_pool').prepend('<div class="chord_container">'+
                             '<button class="circular ui icon button" id="remove">'+
                             '<i class="small remove circle icon"></i>'+
                             '</button>'+
                             '<button class="ui button" data-role="chord">'+
                             result+
                             '</button>'+
                             '</div>'); 
});

$('#modal_button_cancel').on('click',function(){

    $('.ui.modal').modal('hide');

});


$('#chord_pool').on('click','.chord_container #remove',function(){
    
    //$(this).parent().remove(); // not this
    var chord = $(this).next().text(); //the element after clicked element
    
    $("button:contains('"+chord+"')").parent().remove();
});

$('#phone_chord_pool').on('click','.chord_container #remove',function(){
    
    //$(this).parent().remove();
    var chord = $(this).next().text();
    $("button:contains('"+chord+"')").parent().remove();
});

$('.tabular.menu .item').tab();

$('.accordion').accordion({
    
    exclusive: false,
    selector: {
      trigger: '.title'
    }
});

$('.ui.dropdown').dropdown();

$('.ui.setting.item').on('click',function(){

    $('.ui.sidebar').sidebar('toggle');

});

/*
$('#new-rev').on('focus', function (e) {
  e.preventDefault();
  e.stopPropagation();
});*/
/*
$('#new-rev').on('click', function (e) {
  $('.ui.dropdown')
    .dropdown()
  ;
 $(this).find('input').focus();
})*/

$('#create-new-sheet').click(function () {
  var createSheetApiPath = "/api/sheet/create/";
  var editorPath = "/editor/";
  
	var sheet = Sheet([
		Channel([], "treble", "C")
	], 4);
	$.post(
	  createSheetApiPath,
	  {
	    data: JSON.stringify(sheet.toObject()),
	    name: "A new Sheet"
	  },
	  function (ev) {
	    if (ev.level === "error") return alert('error: ' + ev.message);
	    var sheetId = ev.data._id;
	    location.href = editorPath + sheetId;
	  }
  )
	
	
})

function shortText(str, maxLength) {
  maxLength = maxLength || 15;
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 7) + "..." + str.slice(str.length - 4, str.length);
}

function showRevisionList (list) {
  list = list.slice(0);
  var i;
  var templete = 
  ' <div class="item revision">' +
    '<i class="dropdown icon"></i>'+
    '<span class="text">revision 1</span>'+
    '<div class="menu">'+
      '<div class="item" data-action="reverse">reverse to this version</div>'+
      '<div class="item" data-action="show">show</div>'+
    '</div>'+
  '</div>';
  
  $('#revision-list').find('.item.revision').remove();
  var selectedRevision = $('#revision-list').attr('data-selected-revision');
  if (selectedRevision === "__live__") {
    selectedRevision = list[list.length - 1]._id;
  }
  var item;
  for (i = 0; i < list.length; i++) {
    item = $(templete);
    item.find('.text').text(shortText(list[i].comment.message, 24));
    
    if (selectedRevision === list[i]._id) {
      item.find('.text').css('color', 'blue')
    }
    
    item.attr('data-revision-id', list[i]._id);
    if (i == list.length - 1) {
      item.find('.text').text("(latest) " + shortText(list[i].comment.message, 15));
      item.find('.menu .item[data-action=reverse]').remove();
    }
    item.insertAfter('.item.new-revision-wrap');
  }
}

function throttle (fn, delay) {
  var id = null;
  var newFunc = function newFunc() {
    clearTimeout(id);
    id = setTimeout(fn, delay);
  }
  return newFunc;
}

function getCurrentSheetLayout () {
  var prop = {}
  var windowSize = $(window).width();
  var containerWidth;
  containerWidth = $ ('#edit').width();
  if (windowSize < 700) {
    prop.cols = 1;
    prop.padding = 10
    prop.width = containerWidth - 20;
    return prop;
  }
  if (windowSize > 700) {
    prop.cols = Math.floor(windowSize / 400);
    prop.padding = 20;
    prop.width = containerWidth - 40;
    return prop;
  }
}

/* global Sheet, SheetManager */
;(function () {
  if (!location.pathname.match(/\/editor\/[A-Za-z0-9\-]+\/?/)) return;
  $('.overlay').hide();
  
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
    
    var sheetInfo = ev.data;
    
    document.title = sheetInfo.name;
    
    var selectedRevision = sheetInfo.revisions[sheetInfo.revisions.length - 1];
    var revisionId = selectedRevision._id;
    
    if (sheetInfo.shortLink) {
      $('#short-link').val(sheetInfo.shortLink)
      $('#short-link-mobile').val(sheetInfo.shortLink)
      
      var qrcode = new QRCode(document.getElementById("short-link-qrcode"), {
          text: sheetInfo.shortLink,
          width: 200,
          height: 200,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.M
      });
      var qrcode = new QRCode(document.getElementById("short-link-qrcode-mobile"), {
          text: sheetInfo.shortLink,
          width: 200,
          height: 200,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.M
      });
    }
    
    showRevisionList(sheetInfo.revisions);
    
    $.get(siteBase + revisionAPIPath + revisionId, function (ev) {
      console.log(ev);
      var revision = ev.data;
      
      var sheet = Sheet.fromObject(revision.data);
      console.log(sheet);
      
      var $canvas = $('<canvas>');
      
      var canvas  = $canvas[0];
          
    	var manager = new SheetManager(canvas);
    	
    	manager.setSheet(sheet, getCurrentSheetLayout());
    	
    	manager.drawSheet();
    	console.log(manager)
	    
	    var height = canvas.height, width = canvas.width;
	    
	    $('#edit').animate({
	      height: height + 'px',
	      width: width + 'px'
	    }, 500, function () {
	      $('#edit').css({
  	      width: ''
  	    });
  	    
	      $('#edit').css('height', 'auto');
	      $canvas.css('opacity', '0')
	      $(this).html('').append($canvas);
	      $canvas.animate({
	        opacity: 1
	      }, 500);
	    })
	    
	    $(window).on('resize', throttle(function () {
    	  manager.setSheet('', getCurrentSheetLayout());
    	  manager.drawSheet();
    	  
  	    var height = canvas.height, width = canvas.width;
  	    
  	    $('#edit').animate({
  	      height: height + 'px',
  	      width: width + 'px'
  	    }, 500, function () {
  	      $('#edit').css({
    	      width: ''
    	    });
  	    });
	    }, 500))
	    
	    startEditor(manager, sheetId, sheetInfo);
      
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

function startEditor(manager, sheetId, sheetInfo) {
  
  var isLive = true;
  
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
    if (!isLive) return;
	  var index = state.stave.index.slice(0, 2);
		if(!currentStaveSelector.isSelected(index)) {
		  currentStaveSelector.addSelect(index, state)
		} else {
		  currentStaveSelector.deSelect(index);
		}
	})
	manager.on('click_note', function (state) {
    if (!isLive) return;
		
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
    if (!isLive) return;
    
    console.log('layout_update')
    sheet = Sheet.fromObject(sheet);
    manager.setSheet(sheet);
    manager.drawSheet();
    currentNoteSelector.reSelectAll();
  })
  socket.on('measure_update', function (index, measure) {
    if (!isLive) return;
    
    console.log('measure_update')
    measure = Measure.fromObject(measure);
    manager.setMeasure(index, measure, true);
    manager.setSheet();
    manager.drawSheet();
    currentNoteSelector.reSelectAll();
  })
  socket.on('meta_update', function (index, info) {
    if (!isLive) return;
    
    console.log('meta_update')
    manager.setInfo(index, info, true);
    manager.setSheet();
    manager.drawSheet();
  })
  socket.on('sheet_info_update', function (newSheetInfo) {
    console.log(newSheetInfo);
    sheetInfo = newSheetInfo;
    showRevisionList(newSheetInfo.revisions);
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
  
  $(".track-add").click(function () {
    var currentCount = manager.getChannelCount();
    manager.addTrack(currentCount, new Channel([], 'treble', 'C'))
  })
  $(".track-remove").click(function () {
    var currentCount = manager.getChannelCount();
    if (currentCount === 1) return;
    manager.removeTrack(currentCount -1 , 1);
  })
  $(".measure-length-set").click(function () {
    var newLength = ~~$('.measure-length:visible').val();
    $('.measure-length').val(newLength);
    
    if (isNaN(newLength)) return;
    if (newLength <= 0) return;
    manager.setMeasureLength(newLength);
  })
  
  $('#new-rev').on('keydown', function (e) {
    if(e.keyCode == 13){
      createRevision();
    }
  })
  $('#new-rev').parent().find('i').click(createRevision);
  
  function createRevision () {
    var revisionApiPath = '/api/sheet/revision/';
    var comment = $('#new-rev').val();
    if (!comment) return;
    $('#new-rev').val('');
    
    $.post(
      revisionApiPath + sheetId,
      {
        comment: comment
      },
      function (ev) {
        if (ev.level === 'error') return alert(ev.message);
      }
    )
  }
  
  $('#revision-list').on('click', '.revision .item', function () {
    // alert($(this).attr('data-action'));
    // alert($(this).parents('.revision').attr('data-revision-id'));
    var action = $(this).attr('data-action');
    var revisionId = $(this).parents('.revision').attr('data-revision-id');
    
    switch(action) {
      case 'show':
        toggleRevision(revisionId);
        break;
      case 'reverse':
        revertToRevision(revisionId);
        break;
    }
  })
  
  function toggleRevision (revisionId) {
    isLive = sheetInfo.revisions[sheetInfo.revisions.length - 1]._id === revisionId;
    
    if (isLive) {
      $('#revision-list').attr('data-selected-revision', '__live__');
    } else {
      $('#revision-list').attr('data-selected-revision', revisionId);
    }
    // alert(isLive);
    showRevisionList(sheetInfo.revisions);
    
    // alert(isLive);
    var revisionGetPath = '/api/revision/get/';
    $.get(
      revisionGetPath + revisionId,
      function (ev) {
        if (ev.level === 'error') return alert(ev.message);
        var sheet = ev.data.data;
        manager.setSheet(Sheet.fromObject(sheet));
        manager.drawSheet();
      }
    )
  }
  function revertToRevision (revisionId) {
    var revertApi = '/api/sheet/reverse/'
    $.post(
      revertApi + sheetId,
      {
        revision: revisionId
      },
      function (ev) {
        console.log(ev);
        if (ev.level === 'error') return alert(ev.message);
      }
    )
  }
  
  $('.play').click(function () {
    // test only
    var bpm = $('.play-bpm:visible').val();
    bpm = parseInt(bpm, 10);
    if (isNaN(bpm) || bpm <= 0) {
      bpm = 140;
    }
    playSheet(manager, bpm);
  })
  
  loadSoundFontList(manager);
  
  manager.on('post-all-format', function () {
    loadSoundFontList(manager);
  })
}
var loadSoundFontList = function () {
  /* global MIDI */
  var templete = $('.sound-list .sound').detach();
  templete.css('display', 'block');
  templete.find('*').unbind();
  templete.find('.menu').empty();
  for (var sound in MIDI.GM.byName) {
    var option = $('<div class="item">')
    option.attr('data-value', sound)
    option.text(MIDI.GM.byName[sound].instrument)
    templete.find('.menu').append(option);
  }
  
  
  return function(sheetManager) {
    $('.sound-list').empty()
    $('.sound-list').each(function () {
      var tracks = sheetManager.getChannelCount();
      var item;
      var i;
      for (i = 0; i < tracks; i++) {
        item = templete.clone();
        item.find('.track-id').text('Track ' + (i + 1));
        item.appendTo($(this));
        item.find('.ui.dropdown').dropdown();
      }
    })
  }
}();
function playSheet(sheet, bpm, soundFontList) {
  var sounds = $('.sound-list:visible .sound').find('input').map(function (i ,item) {
    var _ = $(item);
    return _.val();
  })
  var a = new SoundManager;
  a.loadSound(sounds);
  a.on('load', function () {
    a.playSheet(sheet, bpm);
  })
  a.on('noteon', function (data, time) {
    console.log('noteon', data, time);
    sheet.setColor(data.index, 'red');
    sheet.renderSheet();
  });
  a.on('noteoff', function (data, time) {
    console.log('noteoff', data, time);
    sheet.setColor(data.index, '');
    sheet.renderSheet();
  });
}