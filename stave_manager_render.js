// main logic to format and render the sheet
/* global SheetManager, Vex */
;(function (manager) {
  var fn = manager.fn;
  // create vexflow notes based on the note data from the sheet
  fn.createNote = function createNote() {
  	var i, j, k, track, measure, noteStruct, notes,
  	    tracks = this.voiceTable.tracks,
  	    measures = this.voiceTable.measures;
  	var self = this;
  	
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
  				
  				if (noteStruct.duration.match(/^(w|h|q|\d+)d*r$/)) {
  				  
  				  var fakePitch;
  				  // override position of silent note;
  				  
  				  var duration = (/^(w|h|q|\d+)d*r$/).exec(noteStruct.duration)[1];
  				  var line = 3;
  				  switch (duration) {
  				    case "1":
  				    case "w":
  				      line = 6
  				      break;
  				    case "2":
  				    case "h":
  				      line = 4
  				      break;
  				    case "4":
  				    case "q":
  				      line = 4
  				      break;
  				    case "8":
  				      line = 5
  				      break;
  				    case "16":
  				      line = 5
  				      break;
  				    case "32":
  				      line = 5
  				      break;
  				  }
  				  fakePitch = self.getPitch(line, noteStruct.clef, "C");
  				  noteStruct.keys = [fakePitch.pitch + "/" + fakePitch.octave];
  				}
  				
  				vfNote = new Vex.Flow.StaveNote(noteStruct);
  				vfNote.originalData = note;
  				return vfNote;
  			})
  			this.noteTable.staveByTrack(i, j, notes);
  		}
  	}
  	//console.log(this.noteTable);
  }
  
  // collect the note as a set, save it, call effect processor to process effect
  fn.processNoteEffect = function processNoteEffect() {
  	var i, j, k, notes, note, index, effect,
  	    self = this,
  	    tracks = this.noteTable.tracks,
  	    measures = this.noteTable.measures,
  	    effectMap = {}, 
  	    effectList = [];
  	
  	for (i = 0; i < tracks; i++) {
  		for (j = 0; j < measures; j++) {
  			notes = this.sheet.tracks[i].measures[j].notes;
  			for (k = 0; k < notes.length; k++) {
  				index = [i, j, k];
  				note = notes[k];
  				// console.log(note, index);
  				note.info.effects.forEach(function (effect) {
  					if (!effect.id) {
  						effectList.push({
  							type: effect.type,
  							id: null,
  							datas: [effect.data],
  							indexes: [index],
  							items: [self.noteTable.staveByTrack(i, j)[k]]
  						})
  						return;
  					}
  					if (!effectMap[i + "-" + effect.type + '-' + effect.id]) {
  						effect = {
  							type: effect.type,
  							id: effect.id,
  							datas: [effect.data],
  							indexes: [index],
  							items: [self.noteTable.staveByTrack(i, j)[k]]
  						};
  						effectMap[i + "-" + effect.type + '-' + effect.id] = effect;
  						effectList.push(effect);
  					} else {
  						effectMap[i + "-" + effect.type + '-' + effect.id].datas.push(effect.data)
  						effectMap[i + "-" + effect.type + '-' + effect.id].indexes.push(index)
  						effectMap[i + "-" + effect.type + '-' + effect.id].items.push(self.noteTable.staveByTrack(i, j)[k])
  					}
  				})
  			}
  		}
  	}
  	console.log(effectMap, effectList)
  	this.noteEffectList = effectList;
  	this.options.effectProcessor.note.preFormat(this, this.sheet, effectList);
  }
  // create vexflow voice based on the vexflow notes
  fn.createVoice = function createVoice() {
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
  
  // add dot based on length property
  fn.addDot = function addDot() {
  	this.noteTable.allStaves().reduce(function (all, c) {
  		return all.concat(c)
  	}, []).forEach(function (note) {
  		var dots = note.dots
  		while (dots-- > 0) {
  			note.addDotToAll()
  		}
  	})
  }
  // add accidentals based on sounf modifiers
  fn.addAccidental = function addAccidental() {
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
  // add beams based on notes
  fn.addBeam = function addBeam() {
  	var self = this;
  	this.voiceTable.allStaves().forEach(function (voice) {
  		var beams = Vex.Flow.Beam.applyAndGetBeams(voice);
  		self.noteDrawables = self.noteDrawables.concat(beams);
  	})
  	// 
  }
  // format the notes, make the notes layout be able to accessed from program
  fn.alignNote = function alignNote() {
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
  		voices = voices.filter(function (voice) {
  			return voice.tickables.length !== 0;
  		})
  		// not voice need to be handeld
  		if (!voices.length) continue;
  		
  		// use the longest voice to fulfill the stave length
  		voices = voices.sort(function (voiceA, voiceB) {
  			return voiceA.getTicksUsed().value() > voiceB.getTicksUsed().value() ? -1 : 1;
  		})
  		
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
  /*
   * since the note with beam only has stem after the the `postFormat` of `Beam` 
   * got called, so we must trigger it to ensure we has stem since we need this
   * to colorlize the note.
   */
  fn.postNoteFormat = function postFormat() {
  	var i, j, voice, stave,
  	    self = this,
  	    tracks = this.voiceTable.tracks,
  	    measures = this.voiceTable.measures;
  	
  	// the beam need this to got call before it could generate stem
  	for (i = 0; i < tracks; i++) {
  		for (j = 0; j < measures; j++) {
  			voice = this.voiceTable.staveByTrack(i, j);
  			stave = this.staveTable.staveByTrack(i, j);
  			//console.log(i, j, voice, stave);
  			voice.setStave(stave);
  			voice.preFormat();
  		}
  	}
  	
  	this.noteDrawables.forEach(function (drawable) {
  		// console.log(drawable, drawable instanceof Vex.Flow.Beam);
  		if (!(drawable instanceof Vex.Flow.Beam)) return;
  		drawable.setContext(self.ctx);
  		if (drawable.postFormat) {
  			drawable.postFormat();
  		}
  	})
  	this.options.effectProcessor.note.postFormat(this, this.sheet, this.noteEffectList);
  }
  
  // draw the note parts
  fn.drawNote = function drawNote() {
  	var i, j, voice, stave,
  	    self = this,
  	    tracks = this.voiceTable.tracks,
  	    measures = this.voiceTable.measures;
  	for (i = 0; i < tracks; i++) {
  		for (j = 0; j < measures; j++) {
  			voice = this.voiceTable.staveByTrack(i, j);
  			stave = this.staveTable.staveByTrack(i, j);
  			//console.log(i, j, voice, stave);
  			/* if (self.firstDraw) {
  				voice.draw(this.ctx, stave);
  			} else { */
  				voice.draw(this.ctx);
  			/* } */
  		}
  	}
  	self.firstDraw = false;
  	
  	this.noteDrawables.forEach(function (drawable) {
  		drawable.setContext(self.ctx).draw()
  	})
  }
  
  // create vexflow stave based on the measure data from the sheet
  fn.createStave = function createStave() {
  	var i, j, stave, col, row,
  	    tracks = this.sheet.getChannelCount(),
  	    measures = this.sheet.getMeasureCount();
  	
  	for (i = 0; i < tracks; i++) {
  		for (j = 0; j < measures; j++) {
  			col = this.staveTable.toColume(i, j).col;
  			row = this.staveTable.toColume(i, j).row;
  			if (j === 0) {
  				stave = new Vex.Flow.Stave(
  					this.options.paddingFirstLine, 
  					this.options.paddingTop + row * this.options.lineHeight, 
  					this.data.staveWidth - (this.options.paddingFirstLine - this.options.paddingLeft) + this.options.extraHeadStaveWidth
  				);
  				this.staveTable.staveByTrack(i, j, stave);
  				continue;
  			}
  			if (col === 0) {
  				stave = new Vex.Flow.Stave(
  					this.options.paddingLeft + col * this.data.staveWidth, 
  					this.options.paddingTop + row * this.options.lineHeight, 
  					this.data.staveWidth + this.options.extraHeadStaveWidth
  				);
  				this.staveTable.staveByTrack(i, j, stave);
  				continue;
  			}
  			stave = new Vex.Flow.Stave(
  				this.options.paddingLeft + col * this.data.staveWidth + this.options.extraHeadStaveWidth, 
  				this.options.paddingTop + row * this.options.lineHeight, 
  				this.data.staveWidth
  			);
  			
  			this.staveTable.staveByTrack(i, j, stave);
  		}
  	}
  	
  }
  // collect the track with same effect as a set, save it, call effect processor to process effect
  fn.addStaveTrackEffect = function addStaveTrackEffect() {
  	var i, effectMap = {}, effectList = [], track, index,
  	    self = this,
  	    tracks = this.staveTable.tracks;
  	for (i = 0; i < tracks; i++) {
  		index = [i];
  		track = this.sheet.tracks[i];
  		track.info.effects.forEach(function (effect) {
  			if (!effect.id) {
  				effectList.push({
  					type: effect.type,
  					id: null,
  					datas: [effect.data],
  					indexes: [index],
  					items: [self.staveTable.staveByTrack(i, '*')]
  				});
  				return;
  			}
  			if (!effectMap[effect.type + '-' + effect.id]) {
  				effectMap[effect.type + '-' + effect.id] = {
  					type: effect.type,
  					id: null,
  					datas: [effect.data],
  					indexes: [index],
  					items: [self.staveTable.staveByTrack(i, '*')]
  				};
  				effectList.push(effectMap[effect.type + '-' + effect.id]);
  			} else {
  				effectMap[effect.type + '-' + effect.id].datas.push(effect.data);
  				effectMap[effect.type + '-' + effect.id].indexes.push(index);
  				effectMap[effect.type + '-' + effect.id].items.push(self.staveTable.staveByTrack(i, '*'));
  			}
  		})
  	}
  	this.trackEffectList = effectList;
  	this.options.effectProcessor.track.preFormat(this, this.sheet, effectList);
  }
  // collect the measure with same effect as a set, save it, call effect processor to process effect
  fn.addStaveMeasureEffect = function addStaveMeasureEffect() {
  	var effectMap = {}, effectList = [],
  	    self = this;
  	this.staveTable.forEachTrack(function (measureStave, index) {
  		var measure = self.sheet.tracks[index[0]].measures[index[1]];
  		measure.info.effects.forEach(function (effect) {
  			if (!effect.id) {
  				effectList.push({
  					type: effect.type,
  					id: null,
  					datas: [effect.data],
  					indexes: [index],
  					items: [measureStave]
  				});
  				return;
  			}
  			if (!effectMap[effect.type + '-' + effect.id]) {
  				effectMap[effect.type + '-' + effect.id] = {
  					type: effect.type,
  					id: effect.id,
  					datas: [effect.data],
  					indexes: [index],
  					items: [measureStave]
  				};
  				effectList.push(effectMap[effect.type + '-' + effect.id]);
  			} else {
  				effectMap[effect.type + '-' + effect.id].datas.push(effect.data);
  				effectMap[effect.type + '-' + effect.id].indexes.push(index);
  				effectMap[effect.type + '-' + effect.id].items.push(measureStave);
  			}
  		})
  	})
  	console.log(effectMap, effectList)
  	this.measureEffectList = effectList;
  	this.options.effectProcessor.measure.preFormat(this, this.sheet, effectList);
  }
  // add clefs to every staves at first col
  fn.addClef = function addClef() {
  	var i, stave, track,
  	    rows = this.staveTable.rows;
  	for (i = 0;i < rows; i++) {
  		stave = this.staveTable.staveByColume(0, i);
  		//console.log(this.staveTable.toTrack(0, i));
  		track = this.sheet.tracks[this.staveTable.toTrack(0, i).track];
  		stave.addClef(track.info.clef);
  	}
  }
  // add KeySignature to every staves
  fn.addKeySignature = function addKeySignature() {
  	var i, stave, track, keySig,
  	    rows = this.staveTable.rows;
  	for (i = 0; i < rows; i++) {
  		stave = this.staveTable.staveByColume(0, i);
  		track = this.sheet.tracks[this.staveTable.toTrack(0, i).track];
  		
  		keySig = new Vex.Flow.KeySignature(track.info.keySignature);
  		keySig.addToStave(stave);
  	}
  }
  // add TimeSignature to first measure or where the TimeSignature changed
  fn.addTimeSignature = function addTimeSignature() {
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
  // add single line connector to start and end of every row to group the staves
  fn.addConnector = function addConnector() {
  	var i, j, stave, nextStave, connector, connector2, 
  	    tracks = this.staveTable.tracks,
  	    rows = this.staveTable.rows;
  	for (i = 0; i < rows; i += tracks) {
  		for (j = 0; j < tracks - 1; j++) {
  			stave = this.staveTable.staveByColume(0, i + j);
  			nextStave = this.staveTable.staveByColume(0, i + j + 1);
  			connector = new Vex.Flow.StaveConnector(stave, nextStave);
  			connector.setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
  			
  			connector.index = [j, i / tracks * this.staveTable.cols];
  			
  			this.staveDrawables.push(connector);
  			
  			var colEnd = (i >= rows - this.staveTable.tracks) ? 
  			    (this.staveTable.measures % this.staveTable.cols) - 1 : 
  			    this.staveTable.cols - 1;
  			
  			stave = this.staveTable.staveByColume(colEnd, i + j);
  			nextStave = this.staveTable.staveByColume(colEnd, i + j + 1);
  			connector2 = new Vex.Flow.StaveConnector(stave, nextStave);
  			connector2.setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);
  			
  			connector2.index = [j, i / tracks * this.staveTable.cols + colEnd];
  			
  			this.staveDrawables.push(connector2);
  		}
  	}
  }
  // call the event processor to proceed effect should be handled after the decoration finished
  fn.postStaveFormat = function postStaveFormat() {
  	this.options.effectProcessor.measure.postFormat(this, this.sheet, this.measureEffectList);
  	this.options.effectProcessor.track.postFormat(this, this.sheet, this.trackEffectList);
  }
  
  // draw the staves
  fn.drawStave = function drawStave() {
  	var self = this;
  	this.staveTable.allStaves().forEach(function (stave) {
  		stave.setContext(self.ctx).draw();
  	});
  	this.staveDrawables.forEach(function (drawable) {
  		drawable.setContext(self.ctx).draw();
  	});
  }

} (SheetManager));