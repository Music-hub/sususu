/* global Sheet, Channel, Measure, Note, Effect, SheetManager */
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

var count = 0;
function runTest(name, test, discription) {
	console.log("============== " + name + "==============");
	var id = "test" + count;
	count++;
	var menuRow = $('<tr>').append(
		$('<td>').append(
			$('<a>').attr('href', '#' + id).text(name)
		)
	).appendTo('#test-list');
  var wrapOut = $('<div>').addClass('wrap-out').appendTo('body').attr('id', id);
  var title = $('<h1>').text(name).appendTo(wrapOut);
  if (discription) {
  	var discription = $('<p>').text(discription).appendTo(wrapOut);
  }
	var container = $('<div>').addClass('wrap').appendTo(wrapOut);
	var canvas = $("<canvas>").appendTo(container)[0];
	var success = true;
	
	var start = Date.now();
	
	try {
    test(canvas, container);
	} catch (e) {
	  wrapOut.append(
	    $('<p>').text(e.toString())
	  )
	  if (e.stack) {
	    wrapOut.append(
  	    $('<p>').text(e.stack.toString()).css('white-space', 'pre-wrap')
  	  )
	  menuRow.append(
			$('<td>').text('failed: ' + e.toString())
		)
	  }
	  console.error(e);
	  success = false;
	}
	if (success) {
		var time = (Date.now() - start);
	  wrapOut.append(
	    $('<p>').text('done - without error - ' + time + "ms")
	  )
	  menuRow.append(
			$('<td>').text('success: ' + time + "ms")
		)
	}
  wrapOut.append(
    $('<a>').text('Back to Top').attr('href', '#top')
  )
}

function getSheet () {
	var sheet = Sheet([
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "1")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "1"), Effect('tie', "1", [0])]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "1"), Effect('tie', "1", [0])]),
				Note({ keys: ["db/4"], duration: "8d" }, [Effect('style', null, "red")]),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4, null, null, null, [
				Effect('text', null, {text: "1nd", position: "ABOVE", options: {shift_y: -10}}),
				Effect('text', null, {text: "2nd", position: "ABOVE", options: {shift_y: 10}}),
			]),
			Measure([], 3, 4),
			Measure([], 4, 4, null, null, null, [
				Effect('stave_connector', "5", {type: "BOLD_DOUBLE_LEFT", text: "aaaa", onEnd: false, all: true, begBarType: 'REPEAT_BEGIN', endBarType: 'REPEAT_END'})
			])
		],"treble", "C", [
			Effect('stave_connector', "2", {type: "BRACKET", text: "violin", onEnd: false, all: false}),
			Effect('stave_connector', "3", {type: "BOLD_DOUBLE_RIGHT", onEnd: true, all: false})
		]),
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "2")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "2")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "2")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4),
			Measure([
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" }, [Effect('tie', "3", [0, 2])]),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" }, [Effect('tie', "3", [0, 1])])
			], 3, 4, null, null, null, [
				Effect('stave_connector', "1", {type: "BRACE", text: "piano", onEnd: false, all: false})
			]),
			Measure([], 4, 4, null, null, null, [
				Effect('stave_connector', "5", {type: "BOLD_DOUBLE_LEFT", text: "aaaa", onEnd: false, all: true, begBarType: 'REPEAT_BEGIN', endBarType: 'REPEAT_END'})
			])
		], "treble", "Cb", [
			Effect('stave_connector', "1", {type: "BRACE", text: "piano", onEnd: false, all: false})
		]),
		Channel([
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "3")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "3")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "3")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" }),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "k"), Effect('tie', "2", [0])])
			], 4, 4),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "k"), Effect('tie', "2", [0])]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "k")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 3, 4, null, null, null, [
				Effect('stave_connector', "1", {type: "BRACE", text: "piano", onEnd: false, all: false})
			]),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "4")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "4")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "4")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4, null, null, null, [
				Effect('stave_connector', "5", {type: "BOLD_DOUBLE_LEFT", text: "aaaa", onEnd: false, all: true, begBarType: 'REPEAT_BEGIN', endBarType: 'REPEAT_END'})
			]),
			Measure([
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "5")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "5")]),
				Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', "5")]),
				Note({ keys: ["db/4"], duration: "8d" }),
				Note({ keys: ["bb/4"], duration: "16" }),
				Note({ keys: ["b/4"], duration: "qr" }),
				Note({ keys: ["c##/4", "e/4", "g/4"], duration: "q" })
			], 4, 4)
		], "treble", "E", [
			Effect('stave_connector', "1", {type: "BRACE", text: "piano", onEnd: false, all: false}),
			Effect('stave_connector', "3", {type: "BOLD_DOUBLE_RIGHT", onEnd: true, all: false})
		])
	], 5);
	return sheet;
}

function testSheet (canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	
	manager.drawSheet();
	console.log(manager)
}
function testSheet2 (canvas, container) {
	var sheet = getSheet();
	sheet.setMeasureLength(40);
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 4, width: 800, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 100,	extraHeadStaveWidth: 120});
	
	manager.drawSheet();
	console.log(manager)
}
function testSheetMobile (canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 1, width: 320});
	
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
	var textBoard = $('<pre>').appendTo(container).css('height', '400px').css('text-align', 'left');
	textBoard.text(JSON.stringify(sheet, 0, 4));
	
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
			line: state.stave.lineNumber,
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
			manager.addNote(target, Note({ keys: ["db/4"], duration: "8d" }));
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
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, '');
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
		      Note({ keys: ["c/4"], duration: "8" }, [Effect('tuplet', id)]),
		      Note({ keys: ["c/4"], duration: "8r" }, [Effect('tuplet', id)]),
		      Note({ keys: ["c/4"], duration: "8r" }, [Effect('tuplet', id)])
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
			manager.addNote(target, tuplet);
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
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('input_state_change', function(state, oldState) {
		console.log('input_state_change', oldState.stave.index);
		manager.renderSheet();
	})
}
function testRemoveNote(canvas, container) {
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
	manager.on('click_note', function (state) {
		console.log('note', state.note.on.index);
		manager.removeNote(state.note.on.index);
		manager.setSheet();
		manager.drawSheet();
	})
	manager.on('hover_note', function (state) {
		console.log('note hover', state.stave.index);
		manager.setColor(state.note.on.index, 'red');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('leave_note', function (state, oldState) {
		console.log('note leave', oldState.stave.index);
		manager.setColor(oldState.note.on.index, '');
		manager.renderSheet();
	})
	manager.on('input_state_change', function(state, oldState) {
		console.log('input_state_change', oldState.stave.index);
		manager.renderSheet();
	})
}

function testInsertTrack(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.addTrack(0, new Channel([], "bass", "Eb"));
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testInsertTrack2(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.addTrack(1, [
		new Channel([], "bass", "Eb"),
		new Channel([], "treble", "D")
	]);
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testRemoveTrack(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.removeTrack(0, 1);
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testRemoveTrack2(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.removeTrack(1, 2);
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testChangeMeasureLength(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.setMeasureLength(6);
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testChangeMeasureLength2(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.setMeasureLength(4);
	manager.setSheet();
	manager.drawSheet();
	console.log(manager)
}
function testAddEffect(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	var tie = new Effect('tie', Math.random(), [0]);
	var staveConnector = new Effect('stave_connector', Math.random(), {type: "BRACKET", text: "violin", onEnd: false, all: false});
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.addEffect([0, 0, 0], tie);
	manager.addEffect([0, 0, 2], tie);
	manager.addEffect([0, 2], staveConnector);
	manager.addEffect([1, 2], staveConnector);
	manager.addEffect([2], staveConnector);
	manager.setSheet()
	manager.drawSheet();
	console.log(manager)
}
function testRemoveEffect(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.removeEffect([0, 0, 1], 'tie');
	manager.removeEffect([0, 0, 2], 'tie');
	manager.removeEffect([1, 1], 'stave_connector');
	manager.removeEffect([2, 1], 'stave_connector');
	manager.removeEffect([0], 'stave_connector');
	manager.setSheet()
	manager.drawSheet();
	console.log(manager)
}
function testAddUniqueEffects(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var staveConnector = new Effect('stave_connector', Math.random(), {type: "BRACKET", text: "violin", onEnd: false, all: false});
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.addUniqueEffect([1], staveConnector);
	manager.addUniqueEffect([2], staveConnector);
	manager.setSheet()
	manager.drawSheet();
	console.log(manager)
}
function testGetEffects(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var textBoard = $('<pre>').appendTo(container).css('height', '400px').css('text-align', 'left');
	var result = "";
	var staveConnector = new Effect('stave_connector', Math.random(), {type: "BRACKET", text: "violin", onEnd: false, all: false});
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	
	result += JSON.stringify(manager.getEffect([0]), null, 2) + '\r\n';
	result += JSON.stringify(manager.getEffect([0, 0]), null, 2) + '\r\n';
	result += JSON.stringify(manager.getEffect([0, 0, 1]), null, 2) + '\r\n';
	textBoard.text(result);
	manager.drawSheet();
	console.log(manager)
}
function testConnector(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var result = "";
	var staveConnector = new Effect('stave_connector', Math.random(), {type: "BRACKET", text: "violin", onEnd: false, all: false});
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	
	var effect = Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_LEFT",
		all: true, 
		begBarType: 'REPEAT_BEGIN', 
		endBarType: null
	})
	var effect2 = Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_RIGHT",
		all: true, 
		begBarType: null, 
		endBarType: 'REPEAT_END'
	})
	var effect3 = Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_LEFT",
		all: true, 
		begBarType: 'REPEAT_BEGIN', 
		endBarType: null
	})
	manager.addEffect([0,3], effect);
	manager.addEffect([0,3], effect2);
	manager.addEffect([1,3], effect);
	manager.addEffect([1,3], effect2);
	manager.addEffect([2,3], effect);
	manager.addEffect([2,3], effect2);
	
	manager.addEffect([0,4], effect3);
	manager.addEffect([1,4], effect3);
	manager.addEffect([2,4], effect3);
	
	manager.removeEffect([0], 'stave_connector');
	manager.removeEffect([1], 'stave_connector');
	manager.removeEffect([2], 'stave_connector');
	manager.setSheet();
	
	manager.drawSheet();
	console.log(manager)
}
function testGetEffects(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var result = "";
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.drawSheet();
	assert(Array.isArray(manager.getEffectSet(1)));
	assert(Array.isArray(manager.getEffectSet(2)));
	assert(Array.isArray(manager.getEffectSet(3)));
	assert(manager.findWithEffect(1, 'stave_connector').length > 0);
	assert(manager.findWithEffect(1, 'fdgfxdgg').length === 0);
	assert(manager.findWithEffect(2, 'stave_connector').length > 0);
	assert(manager.findWithEffect(2, 'fdgfxdgg').length === 0);
	assert(manager.findWithEffect(3, 'tie').length > 0);
	assert(manager.findWithEffect(2, 'fdgfxdgg').length === 0);
	$(container).hide();
}
function testGetSheet(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var result = "";
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.drawSheet();
	assert(manager.getSheet() != null);
	console.log(manager.getSheet(), JSON.stringify(manager.getSheet().toObject()).length);
	$(container).hide();
}
function testLineNumber(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	
	manager.setSheet(sheet, {cols: 3, width: 1000});
	
	
	manager.preDrawSheet();
	manager.renderSheet();
	
	manager.initEvent();
	
	console.log(manager)
	
	var textBoard = $('<pre>').appendTo(container).css('height', '400px').css('text-align', 'left');
	manager.on('mousemove', function (state) {
		var keySignature, lineNumber, clef, pitch;
		if (state.stave.index) {
			keySignature = manager.sheet.tracks[state.stave.index[0]].info.keySignature;
			clef = manager.sheet.tracks[state.stave.index[0]].info.clef;
			lineNumber = state.stave.lineNumber;
			pitch = manager.getPitch(lineNumber, clef, keySignature);
		}
		textBoard.text(JSON.stringify({
			pitch: pitch,
			line: state.stave.lineNumber,
			stave: state.stave.index,
			noteOn: state.note.on.index,
			notePre: state.note.between.pre.index,
			notePost: state.note.between.post.index
		}, 0, 4))
	})
	
	manager.on('click_note', function (state) {
		console.log('note', state.note.on.index);
		manager.removeNote(state.note.on.index);
		manager.setSheet();
		manager.drawSheet();
	})
	manager.on('click_stave', function (state) {
		var target, note;
		var keySignature, lineNumber, clef, pitch;
		console.log('stave', state.stave.index);
		if (!state.note.on.index) {
			keySignature = manager.sheet.tracks[state.stave.index[0]].info.keySignature;
			clef = manager.sheet.tracks[state.stave.index[0]].info.clef;
			lineNumber = state.stave.lineNumber;
			pitch = manager.getPitch(lineNumber, clef, keySignature);
			note = Note({ keys: [pitch.pitch + '/' + pitch.octave], duration: "8" })
			if (state.note.between.post.index) {
				target = state.note.between.post.index.concat([]);
			} else if (state.note.between.pre.index) {
				target = state.note.between.pre.index.concat([]);
				target[2] += 1
			} else {
				target = state.stave.index.concat([0]);
			}
			manager.addNote(target, note);
			try {
				manager.setSheet();
				manager.drawSheet();
			} catch (e) {
				console.error(e);
			}
		}
	})
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
}
function testGetAndSetMeasure(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var result = "";
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	var measure = manager.getMeasure([0, 0]);
	assert(measure != null);
	manager.setMeasure([0, 1], measure);
	manager.setMeasure([1, 2], measure);
	manager.drawSheet();
}
function testGetAndSetMetaData(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	var info = manager.getInfo([0]);
	assert(info != null);
	manager.setInfo([1], info);
	manager.setInfo([2], info);
	manager.drawSheet();
}
function testEditEvents(canvas, container) {
	var sheet = getSheet();
	var manager = new SheetManager(canvas);
	var index = null;
	var result = null;
	var clearTemp = function () {
		index = null;
		result = null;
	}
	var validateLayoutUpdate = function () {
		console.log(index, result);
		assert(index === null && (result instanceof Sheet));
		clearTemp()
	}
	var validateMeasureUpdate = function () {
		console.log(index, result);
		assert(index.length === 2 && (result instanceof Measure));
		clearTemp()
	}
	var validateMetaUpdate = function () {
		console.log(index, result);
		assert(index.length === 1 && ('object' === typeof result));
		clearTemp()
	}
	var validateNoUpdate = function () {
		console.log(index, result);
		assert(index === null && result === null);
		clearTemp()
	}
	manager.on('layout_update', function (sheet) {
		result = sheet;
	})
	manager.on('measure_update', function (i, measure) {
		index = i;
		result = measure;
	})
	manager.on('meta_update', function (i, info) {
		index = i;
		result = info;
	})
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	
	manager.addNote([0, 1], new Note({keys: ["c/4"], duration: "8" }));
	manager.drawSheet();
	validateMeasureUpdate();
	
	manager.removeNote([0, 0, 0]);
	manager.drawSheet();
	validateMeasureUpdate();
	
	manager.removeTrack(0, 1);
	manager.setSheet();
	manager.drawSheet();
	validateLayoutUpdate();
	
	manager.setMeasureLength(4);
	manager.setSheet();
	manager.drawSheet();
	validateLayoutUpdate();
	
	manager.setMeasureLength(6);
	manager.setSheet();
	manager.drawSheet();
	validateLayoutUpdate();
	
	var temp;
	temp = manager.getMeasure([0, 0]);
	manager.setMeasure([0, 1], temp, true);
	validateNoUpdate();
	
	manager.setMeasure([0, 2], temp);
	validateMeasureUpdate();
	
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	var info = manager.getInfo([0]);
	
	manager.setInfo([1], info, true);
	validateNoUpdate();
	manager.setInfo([1], info);
	validateMetaUpdate();
	
	manager.drawSheet();
}
function testVlota(canvas, container) {
	var sheet = new Sheet([
		Channel([], "treble", "C")
	], 6);
	
	var manager = new SheetManager(canvas);
	var index = null;
	var result = null;
	manager.setSheet(sheet, {cols: 3, width: 1000, paddingLeft: 40, paddingFirstLine: 80, lineHeight: 130});
	manager.setMeasureLength(6);
	manager.setMeasureLength(6);
	manager.addTrack(0, new Channel([], "bass", "Eb"));
	manager.setSheet();
	
	var volta = new Effect('volta', Math.random(), {type: "BEGIN", text: 1});
	manager.addUniqueEffect([0, 1], volta);
	manager.addUniqueEffect([1, 1], volta);
	var volta = new Effect('volta', Math.random(), {type: "MID"});
	manager.addUniqueEffect([0, 2], volta);
	manager.addUniqueEffect([1, 2], volta);
	var volta = new Effect('volta', Math.random(), {type: "END"});
	manager.addUniqueEffect([0, 3], volta);
	manager.addUniqueEffect([1, 3], volta);
	var volta = new Effect('volta', Math.random(), {type: "BEGIN_END", text: 2});
	manager.addUniqueEffect([0, 4], volta);
	manager.addUniqueEffect([1, 4], volta);
	var staveConnector = new Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_LEFT", 
		onEnd: false, 
		all: true,
		begBarType: 'REPEAT_BEGIN', 
		endBarType: null});
	manager.addUniqueEffect([0, 0], staveConnector);
	manager.addUniqueEffect([1, 0], staveConnector);
	var staveConnector = new Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_RIGHT", 
		onEnd: true, 
		all: true,
		begBarType: null, 
		endBarType: 'REPEAT_END'});
	manager.addUniqueEffect([0, 3], staveConnector);
	manager.addUniqueEffect([1, 3], staveConnector);
	var staveConnector = new Effect('stave_connector', Math.random(), {
		type: "BOLD_DOUBLE_RIGHT", 
		onEnd: true, 
		all: true,
		begBarType: null, 
		endBarType: 'REPEAT_END'});
	manager.addUniqueEffect([0, 4], staveConnector);
	manager.addUniqueEffect([1, 4], staveConnector);

	/*
	var volta2 = new Effect('volta', Math.random(), {type: "END"});
	manager.addUniqueEffect([1, 2], volta2);*/

	
	manager.drawSheet();
}

runTest('sheet draw', testSheet)
runTest('another sheet draw', testSheet2);
runTest('sheet draw - mobile layout', testSheetMobile);

runTest('serialize sheet', testSerialize);
runTest('get bounding box', testBoundingBox);
runTest('colored note', testColor);
runTest('insert single note', testEvent, "click anywhere on stave to insert a note");
runTest('insert tuplet', testMultiInsert, "click anywhere on stave to insert a tuplet");
runTest('remove note', testRemoveNote, "click on a note to remove it");
runTest('insert a new track at index 0', testInsertTrack);
runTest('insert two new tracks at index 1', testInsertTrack2);
runTest('remove first track', testRemoveTrack);
runTest('remove second and third track', testRemoveTrack2);
runTest('change measure count to 6', testChangeMeasureLength);
runTest('change measure count to 4', testChangeMeasureLength2);
runTest('test add effect', testAddEffect);
runTest('test remove effect', testRemoveEffect);
runTest('test add unique effect', testAddUniqueEffects);
runTest('test get effects', testGetEffects);
runTest('test connector', testConnector);
runTest('test find and get effect', testGetEffects);
runTest('test get sheet', testGetSheet);
runTest('test get line number', testLineNumber);
runTest('test get and set measure', testGetAndSetMeasure);
runTest('test get and set metadata', testGetAndSetMetaData);
runTest('test edit events', testEditEvents);
runTest('test volta', testVlota);
