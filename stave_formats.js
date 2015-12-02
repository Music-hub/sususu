// data formats only

function TrackChange(op, index, affectedCount) {
	if (!(this instanceof TrackChange)) {
		return new TrackChange(op, index, affectedCount)
	}
	if (0 > (['add', 'remove']).indexOf(op)) throw new Error('unknown operation: ' + op);
	this.op = op;
	this.index = index;
	this.count = affectedCount;
}

// represent a music sheet
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
Sheet.prototype.setMeasureLength = function setMeasureLength(measureCount) {
	if (measureCount != null) {
		this.tracks.forEach(function (track) {
			track.fillMeasure(measureCount);
		})
	}
};
// create a shadow object of this sheet, modify this actully cause edit on the original sheet.
Sheet.prototype.toShadowObject = function toShadowObject() {
	return {
		info: this.info,
		tracks: this.tracks.map(function (track) {return track.toShadowObject()})
	}
}
// create a safe object by deep copy the object from toShadowObject()
Sheet.prototype.toObject = function toObject() {
	return JSON.parse(JSON.stringify(this.toShadowObject()))
}
// unserialize the object to Sheet
Sheet.fromObject = function fromObject(obj) {
	var sheet;
	sheet = new Sheet(obj.tracks.map(function (track) {return Channel.fromObject(track)}));
	sheet.info = obj.info || {};
	sheet.info.effects = sheet.info.effects || [];
	return sheet;
}
Sheet.prototype.clone = function clone () {
	return Sheet.fromObject(this.toObject());
}

// represent a single track in a sheet, a sheet can have more than one sheet
function Channel(measures, clef,  keySignature, effects) {
	if (!(this instanceof Channel)) {
		return new Channel (measures, clef, keySignature, effects);
	}
	this.info = {
		keySignature : keySignature || "C",
		/*
		 * clef : "treble" | "bass" |....
		 */
		clef : clef || "treble",
		effects: effects || [],
	}
	this.measures = measures || [];
}
Channel.prototype.createNewChannel = function createNewMeasure () {
	var i, newChannel = new Channel([]);
	newChannel.info = JSON.parse(JSON.stringify(this.info));
	return newChannel;
};
Channel.prototype.fillMeasure = function fillMeasure (num) {
	if (this.measures.length === 0) {
		this.measures.push(new Measure([], 4, 4));
	}
	while (this.measures.length < num) {
		this.measures.push(
			this.measures[this.measures.length - 1].createNewMeasure()
		)
	}
	if (this.measures.length > num) {
		this.measures = this.measures.slice(0, num);
	}
};
// create a shadow object of this Channel, modify this actully cause edit on the original Channel.
Channel.prototype.toShadowObject = function toShadowObject() {
	return {
		info: this.info,
		measures: this.measures.map(function (measure) {return measure.toShadowObject()})
	}
}
// create a safe object by deep copy the object from toShadowObject()
Channel.prototype.toObject = function toObject() {
	return JSON.parse(JSON.stringify(this.toShadowObject()))
}
// unserialize the object to Channel
Channel.fromObject = function fromObject(obj) {
	var channel;
	channel = new Channel(obj.measures.map(function (measure) {return Measure.fromObject(measure)}));
	channel.info = obj.info || {};
	channel.info.effects = channel.info.effects || [];
	return channel;
}
Channel.prototype.clone = function clone() {
	return Channel.fromObject(this.toObject());
}

// represent a single measure in a track, a track can have more than one measure
function Measure(notes, numBeats, beatValue, begBarType, endBarType, chord, effects) {
	if (!(this instanceof Measure)) {
		return new Measure (notes, numBeats, beatValue, begBarType, endBarType, chord, effects);
	}
	this.info = {
		begBarType : begBarType || null,
		endBarType : endBarType || null,
		numBeats : numBeats || 4,
		beatValue : beatValue || 4,
		chord : chord || null,
		effects : effects || []
	};
	this.notes = notes || [];
}
Measure.prototype.createNewMeasure = function createNewMeasure() {
	var i, newMeasure = new Measure();
	newMeasure.info = JSON.parse(JSON.stringify(this.info));
	newMeasure.info.effects = [];
	return newMeasure;
};
// create a shadow object of this Measure, modify this actully cause edit on the original Measure.
Measure.prototype.toShadowObject = function toShadowObject() {
	return {
		info: this.info,
		notes: this.notes.map(function (note) {return note.toShadowObject()})
	}
}
// create a safe object by deep copy the object from toShadowObject()
Measure.prototype.toObject = function toObject() {
	return JSON.parse(JSON.stringify(this.toShadowObject()))
}
// unserialize the object to Measure
Measure.fromObject = function fromObject(obj) {
	var measure;
	measure = new Measure(obj.notes.map(function (note) {return Note.fromObject(note)}));
	measure.info = obj.info || {};
	measure.info.effects = measure.info.effects || [];
	return measure;
}
Measure.prototype.clone = function clone() {
	return Measure.fromObject(this.toObject());
}

// represent a single note in a measure, a measure can have more than one note
function Note(struct, effects) {
	if (!(this instanceof Note)) {
		return new Note (struct, effects);
	}
	if (!(this instanceof Note)) {
		return new Note (struct, effects);
	}
	this.struct = struct;
	this.info = {
		effects: effects || []
	};
}
// create a shadow object of this Note, modify this actully cause edit on the original Note.
Note.prototype.toShadowObject = function toShadowObject() {
	return {
		struct: this.struct,
		info: this.info
	}
}
// create a safe object by deep copy the object from toShadowObject()
Note.prototype.toObject = function toObject() {
	return JSON.parse(JSON.stringify(this.toShadowObject()))
}
// unserialize the object to Note
Note.fromObject = function fromObject(obj) {
	var note = new Note(obj.struct);
	note.info = obj.info || {};
	note.info.effects = note.info.effects || [];
	return note;
}
Note.prototype.clone = function clone() {
	return Note.fromObject(this.toObject());
}


// a data structure that implements both track/measure and colume/row based getter and setter of music sheets.
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
	var i, results = [];
	if (('number' === typeof trackNum) && ('number' === typeof measureNum)) {
		try  {
			if (!stave) return this.data[trackNum][measureNum]
			return this.data[trackNum][measureNum] = stave;
		} catch (e) {
			console.error(e);
			throw e;
		}
	} else if (trackNum === "*" || measureNum === "*") {
		try {
			if (measureNum === "*") {
				for (i = 0; i < this.measures; i++) {
					results.push(this.staveByTrack(trackNum, i));
				}
				return results;
			}
			if (trackNum === "*") {
				for (i = 0; i < this.tracks; i++) {
					results.push(this.staveByTrack(i, measureNum));
				}
				return results;
			}
		} catch (e) {
			console.error(e);
			throw e;
		}
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

MeasureManager.prototype.forEachTrack = function forEachTrack(cb) {
	var i, j, index, item;
	for (i = 0; i < this.tracks; i++) {
		for (j = 0; j < this.measures; j++) {
			index = [i, j];
			item = this.staveByTrack(i, j);
			cb.call(item, item, index);
		}
	}
};
