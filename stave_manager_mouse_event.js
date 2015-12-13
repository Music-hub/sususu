// methods to register and emit mouse(touch) events

/* global SheetManager */
;(function (manager) {
    var fn = manager.fn;
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
  fn.initEvent = function initEvent() {
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
  
  // reset the Input State
  fn._resetInputState = function _resetInputState() {
  	this.inputState = {
  		position: {
  			x: null,
  			y: null
  		},
  		stave: {
			  lineNumber: null,
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
  fn._arrayEqual = function _arrayEqual(a, b) {
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
  fn._changeState = function _changeState(state, noEvent) {
  	var stateChanged = false,
  	    oldState = this.inputState;
  	    
  	this.inputState = state;
  	var clonedState = JSON.parse(JSON.stringify(state));
  	
  	//console.log(oldState, state);
  	
  	if (noEvent) {
  		// noly update the status, but not fire events
  		return;
  	}
  	
  	if (!this._arrayEqual(oldState.stave.index, state.stave.index)) {
  		stateChanged = true;
  		if (oldState.stave.index !== null) {
  			this.emit('leave_stave', clonedState, oldState);
  		}
  		if (state.stave.index !== null) {
  			this.emit('hover_stave', clonedState, oldState);
  		}
  	}
  	if (!this._arrayEqual(oldState.note.on.index, state.note.on.index)) {
  		stateChanged = true;
  		if (oldState.note.on.index !== null) {
  			this.emit('leave_note', clonedState, oldState);
  		}
  		if (state.note.on.index !== null) {
  			this.emit('hover_note', clonedState, oldState);
  		}
  	}
  	
  	this.emit('mousemove', this.inputState);
  	if (stateChanged) {
  		this.emit('input_state_change', clonedState, oldState);
  	}
  };
  // given x, y, find the stave under that position
  fn._findStave = function _findStave(x, y) {
  	var i, j, box, lineNumber, stave,
  	    tracks = this.staveBoundingBoxs.tracks,
  	    measures = this.staveBoundingBoxs.measures;
  	
  	for (var i = 0; i < tracks; i++) {
  		for (var j = 0; j < measures; j++) {
  			box = this.staveBoundingBoxs.staveByTrack(i, j);
  			if (x >= box.x && 
  				y >= box.y &&
  				x <= box.x + box.w &&
  				y <= box.y + box.h) {
  				stave = this.staveTable.staveByTrack(i, j);
  				
  				lineNumber = Math.round(-(y - stave.getYForLine(4)) / stave.getSpacingBetweenLines() * 2);
  				
  				return {
  				  lineNumber: lineNumber,
  					index: [i, j],
  					// stave: this.staveTable.staveByTrack(i, j)
  				}
  			}
  		}
  	}
  	return {
  		index: null,
  		stave: null
  	}
  }
  
  // given staveState, x, y, find the note in staveState under that position
  fn._findNote = function _findNote(staveState, x, y) {
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
  	
  	if (!staveState.index) {
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
  			// result.between.pre.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
  		}
  		
  		// find the first on after the input position
  		if (x < box.x + box.w && !result.between.post.index) {
  			result.between.post.index = temp.concat([i]);
  			// result.between.post.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
  		}
  		
  		// find the one under the input position
  		if (x > box.x && x < box.x + box.w) {
  			result.on.index = temp.concat([i]);
  			// result.on.note = this.noteTable.staveByTrack(temp[0], temp[1])[i];
  		}
  	}
  	
  	return result;
  }
  
  // trigered when event made
  fn._onClick = function _onClick(x, y) {
  	var state = {};
  	state.position = {
  		x: x,
  		y: y
  	}
  	state.stave = this._findStave(x, y);
  	state.note = this._findNote(state.stave, x, y);
  	
  	this._changeState(state, true);
  	
  	if (this.inputState.note.on.index) {
  		this.emit('click_note', this.inputState)
  	}
  	if (this.inputState.stave.index) {
  		this.emit('click_stave', this.inputState)
  	}
  }
  fn._onMove = function _onMove(x, y) {
  	var state = {};
  	state.position = {
  		x: x,
  		y: y
  	}
  	state.stave = this._findStave(x, y);
  	state.note = this._findNote(state.stave, x, y);
  	
  	this._changeState(state);
  }
  fn._onLeave = function _onLeave() {
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
} (SheetManager));