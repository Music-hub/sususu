/*
 * tracks : [track]
 * track : {measures: [measure], info: {}}
 * measure : {notes: [note], info: {begBarType: STRING || null, endBarType: STRING || null}}
 * component : tuplet
 * tuplet : {type: "tuplet", notes: [note]}
 * note : {struct: vex_flow_note_struct, info: {effects: [effect]}}
 * effect : {id: id, type: String} # id is to used determine if effect should be group on multi note (eg. tuplet)
 */

function Sheet(tracks, measureCount) {
	if (!(this instanceof Sheet)) {
		return new Sheet(tracks, measureCount);
	}
	this.tracks = tracks || [];
	this.info = {};
	if (measureCount != null) {
		this.tracks.forEach(function (track) {
			track.fillMeasure(measureCount);
		})
	}
}
Sheet.prototype.getChannelCount = function getChannelCount() {
	return this.tracks.length;
};
Sheet.prototype.getMeasureCount = function getMeasureCount() {
	return Math.max.apply(null, this.tracks.map(function (track) {return track.measures.length}));
};
Sheet.prototype.toObject = function () {
	return {
		info: this.info,
		tracks: this.tracks.map(function (track) {return track.toObject()})
	}
}
Sheet.fromObject = function (obj) {
	var sheet;
	sheet = new Sheet(obj.tracks.map(function (track) {return Channel.fromObject(track)}));
	sheet.info = obj.info;
	return sheet;
}

function Channel(measures, clef,  keySignature) {
	if (!(this instanceof Channel)) {
		return new Channel (measures, clef, keySignature);
	}
	this.info = {
		keySignature : keySignature || "C",
		/*
		 * clef : "treble" | "bass" |....
		 */
		clef : clef || "treble"
	}
	this.measures = measures || [];
}
Channel.prototype.fillMeasure = function fillMeasure (num) {
	while (this.measures.length < num) {
		this.measures.push(
			this.measures[this.measures.length - 1].createNewMeasure()
		)
	}
};

Channel.prototype.toObject = function () {
	return {
		info: this.info,
		measures: this.measures.map(function (measure) {return measure.toObject()})
	}
}
Channel.fromObject = function (obj) {
	var channel;
	channel = new Channel(obj.measures.map(function (measure) {return Measure.fromObject(measure)}));
	channel.info = obj.info;
	return channel;
}

function Measure(notes, numBeats, beatValue, begBarType, endBarType, chord) {
	if (!(this instanceof Measure)) {
		return new Measure (notes, numBeats, beatValue, begBarType, endBarType, chord);
	}
	this.info = {
		begBarType : begBarType || null,
		endBarType : endBarType || null,
		numBeats : numBeats || 4,
		beatValue : beatValue || 4,
		chord : chord || null
	};
	this.notes = notes || [];
}
Measure.prototype.createNewMeasure = function createNewMeasure () {
	var i, newMeasure = new Measure();
	for (i in this.info) {
		if (this.info.hasOwnProperty(i)) {
			newMeasure.info[i] = this.info[i];
		}
	}
	return newMeasure;
};

Measure.prototype.toObject = function () {
	return {
		info: this.info,
		notes: this.notes.map(function (note) {return note.toObject()})
	}
}
Measure.fromObject = function (obj) {
	var measure;
	measure = new Measure(obj.notes.map(function (note) {return Note.fromObject(note)}));
	measure.info = obj.info;
	return measure;
}

function Note(struct, effects) {
	if (!(this instanceof Note)) {
		return new Note (struct, effects);
	}
	if (!(this instanceof Note)) {
		return new Note (struct, info);
	}
	this.struct = struct;
	this.info = {
		effects: effects || []
	};
}
Note.prototype.toObject = function () {
	return {
		struct: this.struct,
		info: this.info
	}
}
Note.fromObject = function (obj) {
	var note = new Note(obj.struct);
	note.info = obj.info;
	return note;
}


function NoteEffect(type, id, data) {
	if (!(this instanceof NoteEffect)) {
		return new NoteEffect (type, id, data);
	}
	this.id = id;
	this.type = type;
	this.data = data;
}
NoteEffect.processEffect = function processEffect(effectMap) {
	var id, effectSet, notes, drawables = [];
	if (effectMap.tuplet) {
		for (id in effectMap.tuplet) {
			if (effectMap.tuplet.hasOwnProperty(id)) {
				
				effectSet = effectMap.tuplet[id];
				notes = effectSet.notes;
				var tuplet = new Vex.Flow.Tuplet(notes);
				drawables.push(tuplet);
			}
		}
	}
	return drawables;
};

function MeasureManager (tracks, measures, cols) {
	var i;
	this.data = [];
	
	this.tracks = tracks;
	this.measures = measures;
	
	this.rows = Math.ceil(measures / cols) * tracks;
	this.cols = cols;
	this.tracks = tracks;
	
	for (i = 0; i < tracks; i++) {
		this.data[i] = [];
	}
}
MeasureManager.prototype.setColume = function setColume(cols) {
	this.cols = cols;
};
MeasureManager.prototype.staveByTrack =	 function staveByTrack(trackNum, measureNum, stave) {
	try  {
		if (!stave) return this.data[trackNum][measureNum]
		return this.data[trackNum][measureNum] = stave;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
MeasureManager.prototype.staveByColume = function staveByColume(col, row, stave) {
	try  {
		var trackNum = row % this.tracks;
		var measureNum = ((row / this.tracks)|0) * this.cols + col;
		
		//console.log(col, row, trackNum, measureNum);
		if (!stave) return this.data[trackNum][measureNum]
		return this.data[trackNum][measureNum] = stave;
	} catch (e) {
		console.error(e);
		throw e;
	}
};
MeasureManager.prototype.toTrack = function (col, row) {
	var trackNum = row % this.tracks;
	var measureNum = ((row / this.tracks)|0) * this.cols + col;
	return {
		track: trackNum,
		measure: measureNum
	}
}
MeasureManager.prototype.toColume = function (trackNum, measureNum) {
	var col = measureNum % this.cols;
	var row = ((measureNum / this.cols) | 0) * this.tracks + trackNum;
	return {
		col: col,
		row: row
	}
}
MeasureManager.prototype.allStaves = function allMeasures() {
	var measures = [];
	this.data.forEach(function (measure) {
		measures = measures.concat(measure);
	})
	return measures;
}

inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

function SheetManager (canvas, options)
{
	EventEmitter.call(this);
	
	this.canvas = canvas;
	
	this.options = null;
	this.renderer = null;
	this.ctx = null;
	this.sheet = null;
	this.data = {
		//auto generate field
		rows : 1,
		staveWidth : null
	};
	
	this._optionsDefault = {
		width : 700,
		lineHeight : 100,
		cols : 4,
		padding : 10
	}
	this.init(options);
}

inherits(SheetManager, EventEmitter);

SheetManager.prototype.mergeOptions = function mergeOptions(obj1,obj2){
	var obj3 = {};
	for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	return obj3;
}

SheetManager.prototype.init = function init(options) {
	options = options || {};
	this.options = this.options || {};
	this.options = this.mergeOptions(this._optionsDefault, this.options);
	this.options = this.mergeOptions(this.options, options);
	
	var height = this.data.rows * this.options.lineHeight + this.options.padding * 2;
	var width = this.options.width + this.options.padding * 2;
	
	this.data.staveWidth = Math.floor(this.options.width / this.options.cols);
	
	// drop current contents
	this.canvas.height = 1;
	this.canvas.width = 1;
	
	this.canvas.height = height;
	this.canvas.width = width;
	
	this.renderer = new Vex.Flow.Renderer(
		this.canvas,
		Vex.Flow.Renderer.Backends.CANVAS
	);
	
	this.ctx = this.renderer.getContext();
	
	this.noteDrawables = [];
	this.staveDrawables = [];
	
	this.noteTable = null;
	this.voiceTable = null;
	this.staveTable = null;
	this.firstDraw = true;
}


SheetManager.prototype.setSheet = function setSheet(sheet, options) {
	this.sheet = sheet || this.sheet;
	
	var tracks = this.sheet.getChannelCount(),
	    measures = this.sheet.getMeasureCount();
	
	this.init(options);
	this.data.rows = tracks * Math.ceil(measures / this.options.cols);
	this.init(options);
	
	
	this.noteTable = new MeasureManager (tracks, measures, this.options.cols);
	this.voiceTable = new MeasureManager (tracks, measures, this.options.cols);
	this.staveTable = new MeasureManager (tracks, measures, this.options.cols);
}

// format the sheet init all vex notes and stave
SheetManager.prototype.preDrawSheet = function preDrawSheet() {
	this.createStave();
	this.addClef();
	this.addKeySignature();
	this.addTimeSignature();
	this.addStaveEffect();
	this.addConnector();

	this.createNote();
	this.addNoteEffect();
	this.createVoice();
	this.addDot()
	this.addAccidental()
	this.addBeam();
	this.alignNote();
	
}

SheetManager.prototype._clearCanvas = function _clearCanvas() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}
// draw the sheet
SheetManager.prototype.renderSheet = function renderSheet() {
	this._clearCanvas();
	
	this.drawStave();
	
	this.drawNote();
	// recuaculate all note position if the layout chnaged
	if (this.eventInited === true) {
		this.noteBoundingBoxs = this.getAllNoteBoundingBox();
		this.staveBoundingBoxs = this.getAllStaveBoundingBox();
	}
}


SheetManager.prototype.drawSheet = function drawSheet() {
	this.preDrawSheet();
	this.renderSheet();
}

SheetManager.prototype.createNote = function createNote() {
	var i, j, k, track, measure, noteStruct, notes,
	    tracks = this.voiceTable.tracks,
	    measures = this.voiceTable.measures;
	
	for (i = 0; i < tracks; i++) {
		track = this.sheet.tracks[i];
		for (j = 0; j < measures; j++) {
			measure = this.sheet.tracks[i].measures[j];
			notes = measure.notes.map(function (note) {
				var vfNote, noteStruct = {};
				for (k in note.struct) {
					if (note.struct.hasOwnProperty(k)) {
						noteStruct[k] = note.struct[k]
					}
				}
				// note this to align correctly, but this doesn't belong to a note.
				noteStruct.clef = track.info.clef;
				vfNote = new Vex.Flow.StaveNote(noteStruct);
				vfNote.originalData = note;
				return vfNote;
			})
			this.noteTable.staveByTrack(i, j, notes);
		}
	}
	//console.log(this.noteTable);
}

SheetManager.prototype.addNoteEffect = function addNoteEffect() {
	var allEffect = {};
	this.noteTable.allStaves().reduce(function (current, self) {
		return current.concat(self);
	}, []).forEach(function (note) {
		note.originalData.info.effects.forEach(function (effect) {
			allEffect[effect.type] = allEffect[effect.type] || {};
			allEffect[effect.type][effect.id] = allEffect[effect.type][effect.id] || {notes: [], datas: []};
			allEffect[effect.type][effect.id].notes.push(note)
			if (effect.data) {
				allEffect[effect.type][effect.id].datas.push(effect.data);
			};
		})
	})
	this.noteDrawables = this.noteDrawables.concat(NoteEffect.processEffect(allEffect));
}
SheetManager.prototype.createVoice = function createVoice() {
	var i, j, notes, voice, measure,
	    tracks = this.noteTable.tracks,
	    measures = this.noteTable.measures;
	
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			measure = this.sheet.tracks[i].measures[j];
			notes = this.noteTable.staveByTrack(i, j);
			voice = new Vex.Flow.Voice({
				num_beats: measure.info.numBeats,
				beat_value:  measure.info.beatValue,
				resolution: Vex.Flow.RESOLUTION
			});
			// disable strict timing
			voice.setStrict(false);
			voice.addTickables(notes);
			this.voiceTable.staveByTrack(i, j, voice);
		}
	}
	//console.log(this.voiceTable);
}

SheetManager.prototype.addDot = function addDot() {
	this.noteTable.allStaves().reduce(function (all, c) {
		return all.concat(c)
	}, []).forEach(function (note) {
		var dots = note.dots
		while (dots-- > 0) {
			note.addDotToAll()
		}
	})
}
SheetManager.prototype.addAccidental = function addAccidental() {
	var i, j, voice, track,
	    tracks = this.voiceTable.tracks, 
	    measures = this.voiceTable.measures;
	
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			voice = this.voiceTable.staveByTrack(i, j);
			track = this.sheet.tracks[i];
			Vex.Flow.Accidental.applyAccidentals([voice], track.info.keySignature);
		}
	}
}
SheetManager.prototype.addBeam = function addBeam() {
	var self = this;
	this.voiceTable.allStaves().forEach(function (voice) {
		var beams = Vex.Flow.Beam.applyAndGetBeams(voice);
		self.noteDrawables = self.noteDrawables.concat(beams);
	})
	// 
}
SheetManager.prototype.alignNote = function alignNote() {
	var i, j, voices, staves, minX, width,
	    measures = this.voiceTable.measures,
	    tracks = this.voiceTable.tracks,
	    formatter = new Vex.Flow.Formatter();
	
	for (i = 0; i < measures; i++) {
		staves = [];
		voices = [];
		for (j = 0; j < tracks; j++) {
			voices.push(this.voiceTable.staveByTrack(j, i));
			staves.push(this.staveTable.staveByTrack(j, i));
		}
		minX = Math.max.apply(null, staves.map(function (stave) {return stave.getNoteStartX()}));
		staves.forEach(function (stave) {
			stave.setNoteStartX(minX);
		})
		// all stave should has the same width now...
		// make it int
		width = (staves[0].getNoteEndX() - staves[0].getNoteStartX() - 20) | 0;
		//console.log(staves, width)
		// this may fail since imcomplete voice may have different tick length
		try {
			formatter.format(voices, width, {align_rests: true});
		} catch (e) {
			voices.forEach(function (voice) {
				formatter.format([voice], width, {align_rests: true});
			})
		}
	}
}
SheetManager.prototype.drawNote = function drawNote() {
	var i, j, voice, stave,
	    self = this,
	    tracks = this.voiceTable.tracks,
	    measures = this.voiceTable.measures;
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			voice = this.voiceTable.staveByTrack(i, j);
			stave = this.staveTable.staveByTrack(i, j);
			//console.log(i, j, voice, stave);
			if (self.firstDraw) {
				voice.draw(this.ctx, stave);
			} else {
				voice.draw(this.ctx);
			}
		}
	}
	self.firstDraw = false;
	
	this.noteDrawables.forEach(function (drawable) {
		drawable.setContext(self.ctx).draw()
	})
}

SheetManager.prototype.createStave = function createStave() {
	var i, j, stave, col, row,
	    tracks = this.sheet.getChannelCount(),
	    measures = this.sheet.getMeasureCount();
	
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			col = this.staveTable.toColume(i, j).col;
			row = this.staveTable.toColume(i, j).row;
			
			stave = new Vex.Flow.Stave(
				this.options.padding + col * this.data.staveWidth, 
				this.options.padding + row * this.options.lineHeight, 
				this.data.staveWidth
			);
			
			this.staveTable.staveByTrack(i, j, stave);
		}
	}
	
}
SheetManager.prototype.addClef = function addClef() {
	var i, stave, track,
	    rows = this.staveTable.rows;
	for (i = 0;i < rows; i++) {
		stave = this.staveTable.staveByColume(0, i);
		//console.log(this.staveTable.toTrack(0, i));
		track = this.sheet.tracks[this.staveTable.toTrack(0, i).track];
		stave.addClef(track.info.clef);
	}
}
SheetManager.prototype.addKeySignature = function addKeySignature() {
	var i, stave, track, keySig,
	    rows = this.staveTable.rows;
	for (i = 0; i < rows; i++) {
		stave = this.staveTable.staveByColume(0, i);
		track = this.sheet.tracks[this.staveTable.toTrack(0, i).track];
		
		keySig = new Vex.Flow.KeySignature(track.info.keySignature);
		keySig.addToStave(stave);
	}
}
SheetManager.prototype.addTimeSignature = function addTimeSignature() {
	var i, j, prevMeasure, measure, stave,
	    tracks = this.staveTable.tracks,
	    measures = this.staveTable.measures;
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			prevMeasure = this.sheet.tracks[i].measures[j - 1];
			measure = this.sheet.tracks[i].measures[j];
			stave = this.staveTable.staveByTrack(i, j);
			if (!prevMeasure || 
				prevMeasure.info.numBeats !== measure.info.numBeats ||
				prevMeasure.info.beatValue !== measure.info.beatValue
			) 
			{
				stave.addTimeSignature(measure.info.numBeats + "/" + measure.info.beatValue);
			}
		}
	}
}
SheetManager.prototype.addStaveEffect = function addStaveEffect() {
	// TODO
}
SheetManager.prototype.addConnector = function addConnector() {
	var i, j, stave, nextStave, connector, connector2, 
	    tracks = this.staveTable.tracks,
	    rows = this.staveTable.rows;
	for (i = 0; i < rows; i += tracks) {
		for (j = 0; j < tracks - 1; j++) {
			stave = this.staveTable.staveByColume(0, i + j);
			nextStave = this.staveTable.staveByColume(0, i + j + 1);
			connector = new Vex.Flow.StaveConnector(stave, nextStave);
			connector.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
			this.staveDrawables.push(connector);
			
			var colEnd = (i >= rows - this.staveTable.tracks) ? 
			    (this.staveTable.measures % this.staveTable.cols) - 1 : 
			    this.staveTable.cols - 1;
			
			stave = this.staveTable.staveByColume(colEnd, i + j);
			nextStave = this.staveTable.staveByColume(colEnd, i + j + 1);
			connector2 = new Vex.Flow.StaveConnector(stave, nextStave);
			connector2.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);
			this.staveDrawables.push(connector2);
		}
	}
}
SheetManager.prototype.drawStave = function drawStave() {
	var self = this;
	this.staveTable.allStaves().forEach(function (stave) {
		stave.setContext(self.ctx).draw();
	});
	this.staveDrawables.forEach(function (drawable) {
		drawable.setContext(self.ctx).draw();
	});
}

SheetManager.prototype.getAllNoteBoundingBox = function getAllNoteBoundingBox() {
	var i, j, boxs,
	    tracks = this.noteTable.tracks,
	    measures = this.noteTable.measures,
	    boundingBoxTable =  new MeasureManager (tracks, measures, this.options.cols);
	
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			boxs = this.noteTable.staveByTrack(i, j).map(function (note) {
				return note.getBoundingBox();
			})
			boundingBoxTable.staveByTrack(i, j, boxs);
		}
	}
	
	return boundingBoxTable;
}
SheetManager.prototype.getAllStaveBoundingBox = function getAllStaveBoundingBox() {
	var i, j, boxs,
	    tracks = this.staveTable.tracks,
	    measures = this.staveTable.measures,
	    boundingBoxTable =  new MeasureManager (tracks, measures, this.options.cols);
	
	for (i = 0; i < tracks; i++) {
		for (j = 0; j < measures; j++) {
			box = this.staveTable.staveByTrack(i, j).getBoundingBox();
			box.setH(this.options.lineHeight)
			boundingBoxTable.staveByTrack(i, j, box);
		}
	}
	
	return boundingBoxTable;
}

SheetManager.prototype.setColor = function setColor(track, measure, note, color) {
	if (Array.isArray(track)) {
		color = measure;
		note = track[2];
		measure = track[1];
		track = track[0];
	}
	console.log('set color: ', track, measure, note)
	try {
		var staveNote = this.noteTable.staveByTrack(track, measure)[note];
	} catch (e) {
		return false;
	}
	if (!staveNote) return false;
	
	staveNote.setStyle({strokeStyle: color, fillStyle: color});
	
	return true;
}
SheetManager.prototype.insertNote = function insertNote(index, note) {
	var measure, sheet =this.sheet;
	try {
		if (!Array.isArray(note)) note = [note]
		measure = sheet.tracks[index[0]].measures[index[1]];
		if (measure.notes.length < index[2]) return false;
		if (measure.notes.length === index[2]) {
			measure.notes = measure.notes.concat(note);
			console.log(measure.notes);
			return true;
		}
		[].splice.apply(measure.notes, [index[2], 0].concat(note));
		console.log(measure.notes);
		return true;
	} catch (e) {
		console.error(e)
		return false;
	}
}
/*
 * Emits:
 *   hover_note
 *   leave_note
 *   hover_stave
 *   leave_stave
 *   click_note
 *   click_stave
 *   input_state_change
 *   mousemove
 * attach the event handler to the sheet view
 */
SheetManager.prototype.initEvent = function initEvent() {
	this.eventInited = true;
	this.noteBoundingBoxs = this.getAllNoteBoundingBox();
	this.staveBoundingBoxs = this.getAllStaveBoundingBox();
	this._resetInputState();
	var self = this;
	
	$(this.canvas).on('touchmove mousemove', function (e) {
		var xpos, ypos;
		if(e.offsetX==undefined) // this works for Firefox
		{
			xpos = e.pageX-$(self.canvas).offset().left;
			ypos = e.pageY-$(self.canvas).offset().top;
		}             
		else                     // works in Google Chrome
		{
			xpos = e.offsetX;
			ypos = e.offsetY;
		}
		self._onMove(xpos, ypos)
	});
	
	$(this.canvas).on('click', function (e) {
		var xpos, ypos;
		if(e.offsetX==undefined) // this works for Firefox
		{
			xpos = e.pageX-$(self.canvas).offset().left;
			ypos = e.pageY-$(self.canvas).offset().top;
		}             
		else                     // works in Google Chrome
		{
			xpos = e.offsetX;
			ypos = e.offsetY;
		}
		self._onClick(xpos, ypos)
	});
	
	$(this.canvas).on('mouseleave', function (e) {
		self._onLeave()
	});
};

SheetManager.prototype._resetInputState = function _resetInputState() {
	this.inputState = {
		position: {
			x: null,
			y: null
		},
		stave: {
			index: null,
			stave: null
		},
		note: {
			on: {
				index: null,
				note: null
			},
			between: {
				pre: {
					index: null,
					note: null
				},
				post: {
					index: null,
					note: null
				}
			}
		}
	}
};

// see http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
SheetManager.prototype._arrayEqual = function _arrayEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/*
 * update the input state and
 * diff the state, fire mousemove, hover, leave, state change event
 */
SheetManager.prototype._changeState = function _changeState(state, noEvent) {
	var stateChanged = false,
	    oldState = this.inputState;
	this.inputState = state;
	//console.log(oldState, state);
	
	if (noEvent) {
		// noly update the status, but not fire events
		return;
	}
	
	if (!this._arrayEqual(oldState.stave.index, state.stave.index)) {
		stateChanged = true;
		if (oldState.stave.index !== null) {
			this.emit('leave_stave', this.inputState, oldState);
		}
		if (state.stave.index !== null) {
			this.emit('hover_stave', this.inputState, oldState);
		}
	}
	if (!this._arrayEqual(oldState.note.on.index, state.note.on.index)) {
		stateChanged = true;
		if (oldState.note.on.index !== null) {
			this.emit('leave_note', this.inputState, oldState);
		}
		if (state.note.on.index !== null) {
			this.emit('hover_note', this.inputState, oldState);
		}
	}
	
	this.emit('mousemove', this.inputState);
	if (stateChanged) {
		this.emit('input_state_change', this.inputState, oldState);
	}
};
SheetManager.prototype._findStave = function _findStave(x, y) {
	var i, j, box,
	    tracks = this.staveBoundingBoxs.tracks,
	    measures = this.staveBoundingBoxs.measures;
	
	for (var i = 0; i < tracks; i++) {
		for (var j = 0; j < measures; j++) {
			box = this.staveBoundingBoxs.staveByTrack(i, j);
			
			if (x >= box.x && 
				y >= box.y &&
				x <= box.x + box.w &&
				y <= box.y + box.h) {
				return {
					index: [i, j],
					stave: this.staveTable.staveByTrack(i, j)
				}
			}
		}
	}
	return {
		index: null,
		stave: null
	}
}
SheetManager.prototype._findNote = function _findNote(staveState, x, y) {
	var i, boxs, box, temp,
			result = {
				on: {
					index: null,
					note: null
				},
				between: {
					pre: {
						index: null,
						note: null
					},
					post: {
						index: null,
						note: null
					}
				}
			};
	//console.log(staveState);
	
	if (!staveState.stave) {
		// it seems the input isn't on any stave
		return result;
	};
	temp = staveState.index;
	//console.log(temp);
	
	boxs = this.noteBoundingBoxs.staveByTrack(temp[0], temp[1]);
	//console.log(boxs);
	
	for (i = 0; i < boxs.length; i++) {
		box = boxs[i];
		//console.log(x, box.x, box.w)
		
		// find the last one before the input position
		if (x > box.x) {
			result.between.pre.index = temp.concat([i]);
			result.between.pre.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
		}
		
		// find the first on after the input position
		if (x < box.x + box.w && !result.between.post.note) {
			result.between.post.index = temp.concat([i]);
			result.between.post.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
		}
		
		// find the one under the input position
		if (x > box.x && x < box.x + box.w) {
			result.on.index = temp.concat([i]);
			result.on.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
		}
	}
	
	return result;
}
SheetManager.prototype._onClick = function _onClick(x, y) {
	var state = {};
	state.position = {
		x: x,
		y: y
	}
	state.stave = this._findStave(x, y);
	state.note = this._findNote(state.stave, x, y);
	
	this._changeState(state, true);
	
	if (this.inputState.note.on.note) {
		this.emit('click_note', this.inputState)
	}
	if (this.inputState.stave.stave) {
		this.emit('click_stave', this.inputState)
	}
}
SheetManager.prototype._onMove = function _onMove(x, y) {
	var state = {};
	state.position = {
		x: x,
		y: y
	}
	state.stave = this._findStave(x, y);
	state.note = this._findNote(state.stave, x, y);
	
	this._changeState(state);
}
SheetManager.prototype._onLeave = function _onLeave() {
	var state = {
		position: {
			x: null,
			y: null
		},
		stave: {
			index: null,
			stave: null
		},
		note: {
			on: {
				index: null,
				note: null
			},
			between: {
				pre: {
					index: null,
					note: null
				},
				post: {
					index: null,
					note: null
				}
			}
		}
	}
	
	this._changeState(state);
}

