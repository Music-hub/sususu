// methods to modify the sheet
;(function (manager) {
  var fn = manager.fn
  /*
   * methods for modify the sheet
   */
  // add a note at specified `index: Number[]`
  fn.addNote = function insertNote(index, note) {
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
  		this.emit('error', e);
  		return false;
  	}
  }
  // remove a note at specified `index: Number[]`
  fn.removeNote = function removeNote(index) {
  	var measure, sheet =this.sheet;
  	try {
  		measure = sheet.tracks[index[0]].measures[index[1]];
  		if (measure.notes.length <= index[2]) return false;
  		measure.notes.splice(index[2], 1);
  		return true;
  	} catch (e) {
  		this.emit('error', e);
  		return false;
  	}
  }
  // called after a new track is inserted or removed, fill measures with correct length, and make time signature the same with orignal one.
  fn._fixTrack = function _fixTrack(operation, index, count) {
  	var i;
  	var sheet = this.sheet;
  	var measureCount = sheet.getMeasureCount();
  	if (operation === 'add') {
  		var oldTrack = index === 0 ? this.sheet.tracks[index + count] : this.sheet.tracks[0];
  		sheet.setMeasureLength(measureCount);
  		var newTracks = this.sheet.tracks.slice(index, index + count);
  		
  		for (i = 0; i < measureCount; i++) {
  			newTracks.forEach(function (track) {
  				track.measures[i].info.numBeats = oldTrack.measures[i].info.numBeats;
  	 			track.measures[i].info.beatValue = oldTrack.measures[i].info.beatValue;
  			})
  		}
  	}
  	var affectedState = TrackChange(operation, index, count);
  	this.reloadEffectSets();
  	console.log('current state', this)
  	this.options.effectProcessor.track.validate(this, this.sheet, this.trackEffectList, true, affectedState);
  	this.options.effectProcessor.measure.validate(this, this.sheet, this.measureEffectList, true, affectedState);
  	this.options.effectProcessor.note.validate(this, this.sheet, this.noteEffectList, true, affectedState);
  }
  // add a new track
  fn.addTrack = function addTrack(index, track) {
  	var sheet =this.sheet;
  	try {
  		if (!Array.isArray(track)) track = [track];
  		[].splice.apply(sheet.tracks, [index, 0].concat(track));
  		this._fixTrack('add', index, track.length);
  		return true;
  	} catch (e) {
  		this.emit('error', e);
  		return false;
  	}
  }
  // remove the track, also fix the effects if neccesery.
  fn.removeTrack = function addTrack(index, count) {
  	var temp, sheet = this.sheet;
  	count = count || 1;
  	try {
  		temp = sheet.tracks.splice(index, count);
  		this._fixTrack('remove', index, count);
  		return temp;
  	} catch (e) {
  		this.emit('error', e);
  		return false;
  	}
  }
  // setMeasureLength
  fn.setMeasureLength = function addTrack(length) {
  	return this.sheet.setMeasureLength(length);
  }
} (SheetManager));

