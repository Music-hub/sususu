// Effect handle and generate

/* global EventEmitter, inherits, Vex */

// a convenient class to generate a effect stature of either sheet, track, measure, note
function Effect(type, id, data) {
	if (!(this instanceof Effect)) {
		return new Effect (type, id, data);
	}
	this.id = id;
	this.type = type;
	this.data = data;
}

// a class to handle effect of some item, ex: text of stave, stave connectors and tuplets.
function EffectProcessor () {
	EventEmitter.call(this);
}
inherits(EffectProcessor, EventEmitter);

/*
 * SheetManager sheetManager: instance  of the manager handling the sheet
 * Sheet sheet: the sheet instance
 * effectSet {
 *   type,
 *   id,
 *   indexes,
 *   items,
 *   datas
 * }[]
 * String type: effect type
 * String if: id of effect set
 * Number[][] indexes: indexes of item needed to be processed
 * Object[] items: items need to be processed, ie: track, stave, measure
 * Any[] datas: contain data associate with effect
 */

// called before `voice` got generated
EffectProcessor.prototype.preFormat = function processEffect(sheetManager, sheet, effectSets) {
	var self = this;
	effectSets.forEach(function (set) {
		self.emit('preformat', sheetManager, sheet, set.type, set.id, set.indexes, set.items, set.datas);
	})
}
// same arguments, but got called after the notes and layout was formated
EffectProcessor.prototype.postFormat = function processEffect(sheetManager, sheet, effectSets) {
	var self = this;
	effectSets.forEach(function (set) {
		self.emit('postformat', sheetManager, sheet, set.type, set.id, set.indexes, set.items, set.datas);
	})
}
/*
 * Boolean fix: should processor try to fix the effect if the effect is incorrect
 */
EffectProcessor.prototype.validate = function validate(sheetManager, sheet, effectSets, fix, change) {
	var self = this;
	var result = {pass: true, error: null};
	effectSets.forEach(function (set) {
		self.emit('validate', sheetManager, sheet, set.type, set.id, set.indexes, set.items, set.datas, fix, change, result);
	})
	return result;
}
EffectProcessor.prototype.addEffectSets = function addEffectSet(sets) {
	var self = this;
	if (!Array.isArray(sets)) sets = [sets];
	sets.forEach(function (set) {
		var name;
		for (name in set) {
			if (set.hasOwnProperty(name)) {
				self.on(name, set[name]);
			}
		}
	})
}

// some defult sets for effect handling
EffectProcessor.noteEffectSets = [
// inject handler for tuplet
{
	preformat: function (sheetManager, sheet, type, id, indexes, items, datas) {
		if (type !== "tuplet") return;
		if (items.length < 2) return;
		var tuplet = new Vex.Flow.Tuplet(items);
		sheetManager.noteDrawables.push(tuplet);
	}
},
// inject handler for tie
{
	preformat:  function (sheetManager, sheet, type, id, indexes, items, datas) {
		if (type !== "tie") return;
		if (items.length !== 2) return;
		if (!datas[0] || !datas[1]) return;
		
	  var tie = new Vex.Flow.StaveTie({
	    first_note: items[0],
	    last_note: items[1],
	    first_indices: datas[0],
	    last_indices: datas[1]
	  });
	  
		sheetManager.noteDrawables.push(tie);
	}
},
// inject handler for colored note
{
	postformat: function (sheetManager, sheet, type, id, indexes, items, datas) {
		if (type !== "style") return;
		for (var i = 0; i < datas.length; i++) {
			if (datas[i] == null || "string" !== typeof datas[i]) return;
		}
	  indexes.forEach(function (index, order) {
			sheetManager.setColor(index, datas[order], true);
	  })
	}
}
]
EffectProcessor.trackEffectSets = [
	// handler for stave connectors
	{
		preformat: function (sheetManager, sheet, type, id, indexes, items, datas) {
			if (type !== "stave_connector") return;
			if (items.length < 1) return;
			var i, firstStave, secondStave;
			var cols = sheetManager.staveTable.cols;
			
			var firstTrack = items[0];
			var secondTrack = items[items.length - 1];
			var info = datas[0];
			for (i = 0; i < firstTrack.length; i += cols) {
				if (!info.onEnd) {
					firstStave = firstTrack[i];
					secondStave = secondTrack[i];
				} else {
					firstStave = firstTrack[i + cols - 1 < firstTrack.length ? i + cols - 1 : firstTrack.length - 1];
					secondStave = secondTrack[i + cols - 1 < firstTrack.length ? i + cols - 1 : firstTrack.length - 1];
				}
	      var connector = new Vex.Flow.StaveConnector(firstStave, secondStave);
	      connector.setType(Vex.Flow.StaveConnector.type[info.type || "SINGLE"]);
	      if (info.text && i === 0) {
	      	connector.setText(info.text);
	      }
				sheetManager.staveDrawables.push(connector)
			}
		}
	}
];
EffectProcessor.measureEffectSets = [
	// handler for measure text
	{
		preformat: function (sheetManager, sheet, type, id, indexes, items, datas) {
			console.log("test", arguments)
			if (type !== "text") return;
			
			items.forEach(function (stave, index) {
				var info = datas[index];
				// nothing to draw...
				if (!info || !info.text) return;
      	stave.setText(info.text, Vex.Flow.Modifier.Position[info.position || "ABOVE"], info.options || {});
			})
		}
	},
	// handler for stave connectors
	{
		postformat: function (sheetManager, sheet, type, id, indexes, items, datas) {
			if (type !== "stave_connector") return;
			if (items.length < 1) return;
			var firstStave, secondStave;

			var info = datas[0];
			firstStave = items[0]
			secondStave =items[items.length - 1];
			
			if (info.begBarType) {
				items.forEach(function (item) {
					item.setBegBarType(Vex.Flow.Barline.type[info.begBarType]);
				})
			}
			if (info.endBarType) {
				items.forEach(function (item) {
					item.setEndBarType(Vex.Flow.Barline.type[info.endBarType]);
				})
			}
			
      var connector = new Vex.Flow.StaveConnector(firstStave, secondStave);
      connector.setType(Vex.Flow.StaveConnector.type[info.type || "SINGLE"]);
      
			// some REALLY DIRTY HACK to fix align with repeat start....
			if (info.begBarType === "REPEAT_BEGIN" && info.type === "BOLD_DOUBLE_LEFT") {
				
				var temp
				var maxShiftX = firstStave.getModifierXShift();
				
				for (var i = 1; i < items.length; i++) {
					temp = items[i].getModifierXShift();
					console.log(temp, maxShiftX);
					if (temp > maxShiftX) {
						maxShiftX = temp;
					}
				}
				for (var i = 0; i < items.length; i++) {
					var offsetDiff = maxShiftX - items[i].getModifierXShift();
					console.log(offsetDiff);
					temp = items[i].modifiers[0].x
					temp += offsetDiff;
					items[i].modifiers[0].setX(temp);
				}
				
				connector.setXShift(maxShiftX);
				
			}
      if (info.text) {
      	connector.setText(info.text);
      }
			sheetManager.staveDrawables.push(connector)
		},
		validate: function (sheetManager, sheet, type, id, indexes, items, datas, fix, change, result) {
			if (type !== "stave_connector") return;
			// if some effect should cross all staves, than it should
			if (fix && change && change.op === "add" && datas[0].all === true) {
				var measure = indexes[0][1];
				var i;
				for (i = change.index; i < change.index + change.count; i++) {
					sheetManager.addEffect([i, measure], new Effect(type, id, datas[0]));
				}
			}
		}
	}
];