/* global EventEmitter, Vex, inherits, MIDI */

// a setInterval implement based on requestAnimationFrame;
(function (root) {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  
  var id = -1;
  var counterCount = 0;
  var counters = {};
  
  var currentFrame = null;
  
  root._tick = function (current) {
    currentFrame = null;
    if (counterCount === 0) return;
    
    var i, counter;
    for (i in counters) {
      if (counters.hasOwnProperty(i)) {
        counter = counters[i];
        if (counter.last >= current) continue;
        
        counter.func(Math.max(current - counter.start, 0));
      }
    }
    
    currentFrame = requestAnimationFrame(root._tick);
  };
  
  root.setRender = function (fn) {
    id++;
    counterCount++;
    
    counters[id] = {
      func: fn,
      last: -1,
      start: performance.now()
    };
    
    fn(0);
    
    if (currentFrame === null) {
      currentFrame = requestAnimationFrame(root._tick);
    }
    return id;
  };
  root.clearRender = function (id) {
    if (!counters[id]) return false;
    delete counters[id];
    counterCount--;
  };
  
} (window.Render = {}));
 

// general class
var MyEventEmitter = (function (oldEventEmitter) {
	function EventEmitter() {
		oldEventEmitter.call(this)
	}
	inherits(EventEmitter, oldEventEmitter);
	// throw it if `error` got called without listeners
	EventEmitter.prototype.emit = function emit(name, data) {
		if (name === 'error') {
			if (this.getListeners('error').length === 0) {
				throw data;
			}
		}
		EventEmitter.super_.prototype.emit.apply(this, arguments);
	}
	return EventEmitter;
} (EventEmitter));

// entend midi.js mapping to standard key/octave notation
(function () {
  var key, postFix, temp, MIDINumber;
  var i, j;
  
  var octave0 = {
    'c': 0,
    'd': 2,
    'e': 4,
    'f': 5,
    'g': 7,
    'a': 9,
    'b': 11,
  }
  
  var postFixs = {
    'bb': -2,
    'b': -1,
    '': 0,
    '#': 1,
    '##': 2
  }
  
  for (var i = 0; i< 11; i++) {
    for (key in octave0) {
      for (postFix in postFixs) {
          MIDINumber = i * 12 + octave0[key] + postFixs[postFix];
          if (MIDINumber < 0 || MIDINumber > 127) continue;
          
          MIDI.keyToNote[key + postFix + '/' + i] = MIDINumber;
      }
    }
  }
  
  console.log(JSON.stringify(MIDI.keyToNote, 0, 4));
  
} ());

function SoundManager () {
  this.eventList = [];
  this.counterId = null;
  
  MyEventEmitter.call(this);
}

inherits(SoundManager, MyEventEmitter);

SoundManager.prototype.loadSound = function loadSound(soundFontList) {
  var self = this;
  soundFontList = Array.prototype.slice.call(soundFontList, 0);
  
  console.log(soundFontList)
	MIDI.loadPlugin({
		soundfontUrl: "//music-hub.github.io/midi-js-soundfonts/FluidR3_GM/",
		// instrument: "acoustic_grand_piano",
		instrument: soundFontList,
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			
			soundFontList.forEach(function (name, index) {
			  console.log(index, MIDI.GM.byName[name].number)
			  MIDI.programChange(index, MIDI.GM.byName[name].number);
			})
			
			
			// play the note
		/*	MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75); */ 
			
			self.emit('load')
		}
	});
}


SoundManager.prototype.playSheet = function playSheet(sheetManager, bpm, beatValue) {
  bpm = bpm || 140;
  var self = this;
  
  this.clearEvent();
  
	var delay = 0; // play one note every quarter second
	var note = 50; // the MIDI note
	var velocity = 127; // how hard the note hits
  
  var measure, track, voice,
    channel = 0,
    soundMeasureOffset = 0,
    soundMeasureLength = null,
    soundNoteOffset = 0,
    soundNoteLength = null,
    totalMeasures = sheetManager.getMeasureCount(), 
    totalTracks = sheetManager.getChannelCount();
  
  for (track = 0; track < totalTracks; track++) {
    soundMeasureOffset = 0;
    for (measure = 0; measure < totalMeasures; measure++) {
      soundNoteOffset = 0;
      voice = sheetManager.voiceTable.staveByTrack(track, measure);
      voice.tickables.forEach(function (tickable, noteIndex) {
        soundNoteLength = tickable.ticks.numerator 
          / tickable.ticks.denominator 
          / Vex.Flow.RESOLUTION
          * 4
          * (60 / bpm);
        console.log(soundNoteLength);
        
        var isSilent = tickable.noteType !== 'n';
        console.log('isSilent: ' + isSilent);
        if (!isSilent) {
          tickable.keys.forEach(function (key) {
            var midiNum = MIDI.keyToNote[key];
            if ('number' !== typeof midiNum) return;
            console.log(midiNum);
            console.log(soundMeasureOffset + soundNoteOffset, soundMeasureOffset + soundNoteOffset + soundNoteLength)
      			MIDI.setVolume(track, 127);
      			MIDI.noteOn(track, midiNum, velocity, soundMeasureOffset + soundNoteOffset);
      			console.log(track, midiNum, velocity, soundMeasureOffset + soundNoteOffset);
      			self.scheduleEvent('noteon', {
      			  index: [track, measure, noteIndex],
      			  midiNum:　midiNum
      			}, (soundMeasureOffset + soundNoteOffset) * 1000)
      			
      			MIDI.noteOff(track, midiNum, soundMeasureOffset + soundNoteOffset + soundNoteLength);
      			console.log(track, midiNum, soundMeasureOffset + soundNoteOffset + soundNoteLength);
      			
      			self.scheduleEvent('noteoff', {
      			  index: [track, measure, noteIndex],
      			  midiNum:　midiNum
      			}, (soundMeasureOffset + soundNoteOffset + soundNoteLength) * 1000)
      			
          })
        }
        soundNoteOffset += soundNoteLength;
      })
      var soundMeasureLength = voice.getTotalTicks().numerator
        / voice.getTotalTicks().denominator
        / Vex.Flow.RESOLUTION
        * 4
        * (60 / bpm);
      soundMeasureOffset += soundMeasureLength;
      console.log('total seconds in measure: ' + soundNoteOffset, ', expexted ' + soundMeasureLength);
      //soundOffsets += 
    }
  }
  this.startEvent()
  console.log(this, MIDI);
}

SoundManager.prototype.clearEvent = function clearEvent() {
  this.eventList = [];
}

SoundManager.prototype.scheduleEvent = function scheduleEvent(type, data, time) {
  this.eventList.push({
    type: type,
    data: data,
    time: time
  })
}

SoundManager.prototype.startEvent = function startEvent() {
  /* global Render */
  var self = this;
  this.eventList = this.eventList.sort(function (a, b) {
    if (a.time == b.time) return 0;
    return a.time > b.time ? 1 : -1; 
  })
  if (this.counterId) Render.clearRender(this.counterId);
  this.counterId = Render.setRender(function (time) {
    if (self.eventList.length === 0) return Render.clearRender(self.counterId);
    var i, head;
    while (self.eventList.length > 0) {
      var head = self.eventList[0];
      if (head.time > time) break;
      self.eventList.shift();
      self.emit(head.type, head.data, time);
    }
    if (self.eventList.length === 0) return Render.clearRender(self.counterId);
  })
}