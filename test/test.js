/* global Sheet, Channel, Measure, Note, NoteEffect, SheetManager */

function runTest(name, test, discription) {
  var wrapOut = $('<div>').addClass('wrap-out').appendTo('body');
  var title = $('<h1>').text(name).appendTo(wrapOut);
  if (discription) {
  	var discription = $('<p>').text(discription).appendTo(wrapOut);
  }
	var container = $('<div>').addClass('wrap').appendTo(wrapOut);
	var canvas = $("<canvas>").appendTo(container)[0];
	var success = true;
	try {
    test(canvas, container);
	} catch (e) {
	  wrapOut.append(
	    $('<p>').text(e.toString())
	  )
	  if (e.stack) {
	    wrapOut.append(
  	    $('<p>').text(e.stack.toString())
  	  )
	  }
	  console.error(e);
	  success = false;
	}
	if (success) {
	  wrapOut.append(
	    $('<p>').text('done - without error')
	  )
	}
}

function getSheet () {
	var sheet = Sheet([
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "1")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "1")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "1")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4)
		],"treble", "C"),
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "2")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "2")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "2")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4)
		], "treble", "G"),
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "3")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "3")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "3")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" }),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "k")])
			], 4, 4),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "k")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "k")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 3, 4),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "4")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "4")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "4")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 2, 4),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "5")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "5")]),
				Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', "5")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 2, 4)
		], "treble", "E")
	], 5);
	return sheet;
}

//test2
function createCanvas (canvas, container) {
	var container = $('<div>').appendTo('body').addClass('wrap');
	var canvas = $("<canvas>").appendTo(container)[0];
	
	canvas.width = 1;
	canvas.height = 1;
	return canvas;
}

function testSheet (canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	manager.drawSheet();
	console.log(manager)
}
function testSerialize(canvas, container) {
	var sheet = getSheet();
	
	// Serialize it
	sheet = sheet.toObject(canvas, container)
	console.log(sheet, JSON.stringify(sheet, 0, 4))
	console.log(sheet, JSON.stringify(sheet))
	// then Deserialize it
	sheet = Sheet.fromObject(sheet);
	console.log(sheet)
	
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	manager.drawSheet();
	console.log(manager)
}
function testBoundingBox(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	manager.drawSheet();
	console.log(manager, manager.getAllNoteBoundingBox())
	
  container = $(container);
	
	manager.getAllNoteBoundingBox().allStaves().reduce(function (i, j) {return i.concat(j)}, []).forEach(function (box) {
		
		container.append(
			$('<div>').addClass('box').css({
				left: box.x,
				top: box.y,
				height: box.h,
				width: box.w
			})
		)
	})
	
	manager.getAllStaveBoundingBox().allStaves().forEach(function (box) {
		
		container.append(
			$('<div>').addClass('box').css({
				left: box.x,
				top: box.y,
				height: box.h,
				width: box.w
			})
		)
	})
}
function testColor(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	
	manager.preDrawSheet();
	
	manager.setColor(0, 0, 0, 'red')
	manager.setColor(0, 0, 1, 'orange')
	manager.setColor(0, 0, 2, 'yellow')
	manager.setColor(0, 0, 3, 'green')
	manager.setColor(0, 0, 4, 'blue')
	manager.setColor(0, 0, 5, 'purple')
	manager.setColor(0, 0, 6, 'red')
	
	manager.renderSheet();
	
	console.log(manager)
	
}
function testEvent(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	
	manager.preDrawSheet();
	manager.renderSheet();
	
	manager.initEvent();
	
	console.log(manager)
	
	var textBoard = $('<pre>').appendTo(container).css('height', '400px').css('text-align', 'left');
	manager.on('mousemove', function (state) {
		textBoard.text(JSON.stringify({
			stave: state.stave.index,
			noteOn: state.note.on.index,
			notePre: state.note.between.pre.index,
			notePost: state.note.between.post.index
		}, 0, 4))
	})
	manager.on('click_stave', function (state) {
		var target;
		console.log('stave', state.stave.index);
		if (!state.note.on.index) {
			if (state.note.between.post.index) {
				target = state.note.between.post.index.concat([]);
			} else if (state.note.between.pre.index) {
				target = state.note.between.pre.index.concat([]);
				target[2] += 1
			} else {
				target = state.stave.index.concat([0]);
			}
			manager.insertNote(target, Note({ keys: ["db/4"], duration: "8d" }));
			try {
				manager.setSheet();
				manager.drawSheet();
			} catch (e) {
				console.error(e);
			}
		}
	})
	manager.on('click_note', function (state) {
		console.log('note', state.note.on.index);
		manager.setColor(state.note.on.index, 'blue');
		manager.renderSheet();
	})
	manager.on('hover_note', function (state) {
		console.log('note hover', state.stave.index);
		manager.setColor(state.note.on.index, 'red');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, 'black');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, 'black');
		manager.renderSheet();
	})
	manager.on('input_state_change', function(state, oldState) {
		console.log('input_state_change', oldState.stave.index);
		manager.renderSheet();
	})
}
function testMultiInsert(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	
	manager.preDrawSheet();
	manager.renderSheet();
	
	manager.initEvent();
	
	console.log(manager)
	
	var textBoard = $('<pre>').appendTo(container).css('height', '400px').css('text-align', 'left');
	manager.on('mousemove', function (state) {
		textBoard.text(JSON.stringify({
			stave: state.stave.index,
			noteOn: state.note.on.index,
			notePre: state.note.between.pre.index,
			notePost: state.note.between.post.index
		}, 0, 4))
	})
	manager.on('click_stave', function (state) {
		var target,
		    id = Math.random(),
		    tuplet = [
		      Note({ keys: ["c/4"], duration: "8" }, [NoteEffect('tuplet', id)]),
		      Note({ keys: ["c/4"], duration: "8r" }, [NoteEffect('tuplet', id)]),
		      Note({ keys: ["c/4"], duration: "8r" }, [NoteEffect('tuplet', id)])
		    ];
		
		console.log('stave', state.stave.index);
		if (!state.note.on.index) {
			if (state.note.between.post.index) {
				target = state.note.between.post.index.concat([]);
			} else if (state.note.between.pre.index) {
				target = state.note.between.pre.index.concat([]);
				target[2] += 1
			} else {
				target = state.stave.index.concat([0]);
			}
			manager.insertNote(target, tuplet);
			try {
				manager.setSheet();
				manager.drawSheet();
			} catch (e) {
				console.error(e);
			}
		}
	})
	manager.on('click_note', function (state) {
		console.log('note', state.note.on.index);
		manager.setColor(state.note.on.index, 'blue');
		manager.renderSheet();
	})
	manager.on('hover_note', function (state) {
		console.log('note hover', state.stave.index);
		manager.setColor(state.note.on.index, 'red');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, 'black');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, 'black');
		manager.renderSheet();
	})
	manager.on('input_state_change', function(state, oldState) {
		console.log('input_state_change', oldState.stave.index);
		manager.renderSheet();
	})
}

runTest('sheet drwing', testSheet);
runTest('serialize sheet', testSerialize);
runTest('get bounding box', testBoundingBox);
runTest('colored note', testColor);
runTest('insert single note', testEvent, "click anywhere on stave to insert a note");
runTest('insert tuplet', testMultiInsert, "click anywhere on stave to insert a tuplet");