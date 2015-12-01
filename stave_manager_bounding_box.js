// methods to find bounding boxs
/* global SheetManager, Vex */
;(function (manager) {
  var fn = manager.fn;
  // getter to get bounding box of objects
  fn.getAllNoteBoundingBox = function getAllNoteBoundingBox() {
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
  fn.getAllStaveBoundingBox = function getAllStaveBoundingBox() {
  	var i, j, box,
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
} (SheetManager));