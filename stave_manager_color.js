// methods to change note colors
;(function (manager) {
  var fn = manager.fn
  // change the note colors, must call `renderSheet` again after change finished to make it redraw.
  fn.setColor = function setColor(track, measure, note, color) {
  	if (Array.isArray(track)) {
  		color = measure;
  		note = track[2];
  		measure = track[1];
  		track = track[0];
  	}
  	// console.log('set color: ', track, measure, note)
  	try {
  		var staveNote = this.noteTable.staveByTrack(track, measure)[note];
  	} catch (e) {
  		return false;
  	}
  	if (!staveNote) return false;
  	
  	staveNote.setStyle({strokeStyle: color, fillStyle: color});
  	
  	return true;
  }
} (SheetManager));
