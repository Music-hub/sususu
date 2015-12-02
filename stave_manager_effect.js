// methods to modify effects on the sheet
/* global SheetManager */
;(function (manager) {
    var fn = manager.fn;
  /*
   * note, measure, track effect related method
   */
  /* 
   * manually reload effect sets without reformat effect sets after effect is modfied.
   * items field will be null since the layout haven't reload, match the layout isn't possible here
   */
  fn.reloadEffectSets = function reloadEffectSets() {
  	(function () {
  		var i, j, k, notes, note, index, effect,
  		    self = this,
  		    tracks = this.sheet.tracks.length,
  		    measures = this.sheet.tracks[0].measures.length,
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
  								items: null
  							})
  							return;
  						}
  						if (!effectMap[i + "-" + effect.type + '-' + effect.id]) {
  							effect = {
  								type: effect.type,
  								id: effect.id,
  								datas: [effect.data],
  								indexes: [index],
  								items: null
  							};
  							effectMap[i + "-" + effect.type + '-' + effect.id] = effect;
  							effectList.push(effect);
  						} else {
  							effectMap[i + "-" + effect.type + '-' + effect.id].datas.push(effect.data)
  							effectMap[i + "-" + effect.type + '-' + effect.id].indexes.push(index)
  						}
  					})
  				}
  			}
  		}
  		console.log(effectMap, effectList)
  		this.noteEffectList = effectList;
  	}).apply(this);
  	(function () {
  		var i, effectMap = {}, effectList = [], track, index,
  		    self = this,
  		    tracks = this.sheet.tracks.length;
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
  						items: null
  					});
  					return;
  				}
  				if (!effectMap[effect.type + '-' + effect.id]) {
  					effectMap[effect.type + '-' + effect.id] = {
  						type: effect.type,
  						id: effect.id,
  						datas: [effect.data],
  						indexes: [index],
  						items: null
  					};
  					effectList.push(effectMap[effect.type + '-' + effect.id]);
  				} else {
  					effectMap[effect.type + '-' + effect.id].datas.push(effect.data);
  					effectMap[effect.type + '-' + effect.id].indexes.push(index);
  				}
  			})
  		}
  		this.trackEffectList = effectList;
  	}).apply(this);
  	(function () {
  		var i, j, k, notes, note, index, effect,
  		    self = this,
  		    tracks = this.sheet.tracks.length,
  		    measures = this.sheet.tracks[0].measures.length,
  		    effectMap = {}, 
  		    effectList = [];
  		
  		for (i = 0; i < tracks; i++) {
  			for (j = 0; j < measures; j++) {
  				var measure = this.sheet.tracks[i].measures[j];
  				index = [i, j]
  				measure.info.effects.forEach(function (effect) {
  					if (!effect.id) {
  						effectList.push({
  							type: effect.type,
  							id: null,
  							datas: [effect.data],
  							indexes: [index],
  							items: null
  						})
  						return;
  					}
  					if (!effectMap[effect.type + '-' + effect.id]) {
  						effect = {
  							type: effect.type,
  							id: effect.id,
  							datas: [effect.data],
  							indexes: [index],
  							items: null
  						};
  						effectMap[effect.type + '-' + effect.id] = effect;
  						effectList.push(effect);
  					} else {
  						effectMap[effect.type + '-' + effect.id].datas.push(effect.data)
  						effectMap[effect.type + '-' + effect.id].indexes.push(index)
  					}
  				});
  			}
  		}
  		console.log(effectMap, effectList)
  		this.measureEffectList = effectList;
  	}).apply(this);
  }
  /*
   * index: length 1 ~ 3 array of Number or "*"
   * effect: effect instance to be set
   */
  fn.addEffect = function addEffect(index, effect) {
  	if (index.length === 3) return this.addNoteEffect(index, effect);
  	if (index.length === 2) return this.addMeasureEffect(index, effect);
  	if (index.length === 1) return this.addTrackEffect(index, effect);
  	this.emit('error', new Error('unknown index: ' + JSON.stringify(index)));
  	return false;
  }
  fn.addNoteEffect = function addNoteEffect(index, effect) {
  	try {
  		this.sheet.tracks[index[0]].measures[index[1]].notes[index[2]].info.effects.push(effect);
  	} catch (e) {
  		this.emit('error', new Error('error addNoteEffect: ' + e.toString()));
  	}
  }
  fn.addMeasureEffect = function addMeasureEffect(index, effect) {
  	try {
  		this.sheet.tracks[index[0]].measures[index[1]].info.effects.push(effect);
  	} catch (e) {
  		this.emit('error', new Error('error addNoteEffect: ' + e.toString()));
  	}
  }
  fn.addTrackEffect = function addTrackEffect(index, effect) {
  	try {
  		this.sheet.tracks[index[0]].info.effects.push(effect);
  	} catch (e) {
  		this.emit('error', new Error('error addNoteEffect: ' + e.toString()));
  	}
  }
  // effect: either a String of Effect type or Effect instance
  fn.removeEffect = function removeEffect(index, effect, id) {
  	if (index.length === 3) return this.removeNoteEffect(index, effect, id);
  	if (index.length === 2) return this.removeMeasureEffect(index, effect, id);
  	if (index.length === 1) return this.removeTrackEffect(index, effect, id);
  	this.emit('error', new Error('unknown index: ' + JSON.stringify(index)));
  	return false;
  }
  fn.removeNoteEffect = function removeNoteEffect(index, effect, id) {
  	try {
  		var effectList = this.sheet.tracks[index[0]].measures[index[1]].notes[index[2]].info.effects;
  		var i;
  		id = id || null;
  		if ('object' === typeof effect) {
  			id = effect.id;
  			effect = effect.tpye;
  		}
  		for (i = effectList.length - 1; i >= 0; i--) {
  			if (effectList[i].type === effect && (id == null || effectList[i].id === id)) {
  				effectList.splice(i, 1);
  			}
  		}
  	} catch (e) {
  		this.emit('error', new Error('error removeNoteEffect: ' + e.toString()));
  	}
  }
  fn.removeMeasureEffect = function removeMeasureEffect(index, effect, id) {
  	try {
  		var effectList = this.sheet.tracks[index[0]].measures[index[1]].info.effects;
  		var i;
  		id = id || null;
  		if ('object' === typeof effect) {
  			id = effect.id;
  			effect = effect.tpye;
  		}
  		for (i = effectList.length - 1; i >= 0; i--) {
  			if (effectList[i].type === effect && (id == null || effectList[i].id === id)) {
  				effectList.splice(i, 1);
  			}
  		}
  	} catch (e) {
  		this.emit('error', new Error('error removeNoteEffect: ' + e.toString()));
  	}
  }
  fn.removeTrackEffect = function removeTrackEffect(index, effect, id) {
  	try {
  		var effectList = this.sheet.tracks[index[0]].info.effects;
  		var i;
  		id = id || null;
  		if ('object' === typeof effect) {
  			id = effect.id;
  			effect = effect.tpye;
  		}
  		for (i = effectList.length - 1; i >= 0; i--) {
  			if (effectList[i].type === effect && (id == null || effectList[i].id === id)) {
  				effectList.splice(i, 1);
  			}
  		}
  	} catch (e) {
  		this.emit('error', new Error('error removeNoteEffect: ' + e.toString()));
  	}
  }
  // same as addEffect, but remove old effect if there is already effect in same type.
  fn.addUniqueEffect = function addUniqueEffect(index, effect) {
  	this.removeEffect(index, effect.type);
  	this.addEffect(index, effect);
  }
  fn.getEffect = function getEffect(index) {
  	try {
  		switch (index.length) {
  			case 3: return this.sheet.tracks[index[0]].measures[index[1]].notes[index[2]].info.effects
  			case 2: return this.sheet.tracks[index[0]].measures[index[1]].info.effects
  			case 1: return this.sheet.tracks[index[0]].info.effects
  			default:
  				this.emit('error', new Error('unknown index: ' + JSON.stringify(index)));
  		}
  	} catch (e) {
  		this.emit('error', e);
  	}
  	return false;
  }
  /*
   * method to search item with effect (or also with id)
   * Number indexDepth: search in where, 1 for track, 2 for measure, 3 for note
   * returns [effectSet]
   */
  fn.findWithEffect = function findWithEffect(indexDepth, type, id) {
    var allSets, results = [];
    switch (indexDepth) {
      case 1: allSets = this.trackEffectList; break;
      case 2: allSets = this.measureEffectList; break;
      case 3: allSets = this.noteEffectList; break;
      default:
        this.emit('error', new Error('unknown index depth: ' + indexDepth));
        return null
    }
    return allSets.filter(function (set) {
      if (set.type !== type) return false;
      if (id != null && set.id !== id) return false;
      return true;
    })
  }
  fn.getEffectSet = function findWithEffect(indexDepth) {
    var allSets, results = [];
    switch (indexDepth) {
      case 1: allSets = this.trackEffectList; break;
      case 2: allSets = this.measureEffectList; break;
      case 3: allSets = this.noteEffectList; break;
      default: 
        this.emit('error', new Error('unknown index depth: ' + indexDepth));
        return null
    }
    return allSets;
  }
} (SheetManager));