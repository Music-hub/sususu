// methods to change note colors
/* global SheetManager */
;(function (manager) {
  var fn = manager.fn
  // change the note colors, must call `renderSheet` again after change finished to make it redraw.
  fn.setColor = function setColor(track, measure, note, color, asDefault) {
  	if (Array.isArray(track)) {
  	  asDefault = note;
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
  	
  	if (color && ('string' === typeof color)) {
  	  color = {strokeStyle: color, fillStyle: color};
  	}
  	if (color) {
  	  if (asDefault) {
  	    staveNote.defaultStyle = color;
  	  }
  	  staveNote.setStyle(color);
  	} else {
  	  if (staveNote.defaultStyle) {
  	    staveNote.setStyle(staveNote.defaultStyle);
  	  } else {
  	    staveNote.setStyle({strokeStyle: 'black', fillStyle: 'black'});
  	  }
  	}
  	
  	return true;
  }
} (SheetManager));
