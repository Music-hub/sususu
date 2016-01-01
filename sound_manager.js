/* global EventEmitter, Vex, inherits, MIDI */

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
  MyEventEmitter.call(this);
}

inherits(SoundManager, MyEventEmitter);

SoundManager.prototype.loadSound = function loadSound() {
  var self = this;
	MIDI.loadPlugin({
		soundfontUrl: "//music-hub.github.io/midi-js-soundfonts/FluidR3_GM/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
			
			self.emit('load')
		}
	});
}
SoundManager.prototype.playSheet = function playSheet(sheet, bpm) {
  bpm = bpm || 140;
  
	var delay = 0; // play one note every quarter second
	var note = 50; // the MIDI note
	var velocity = 127; // how hard the note hits
  
  console.log(MIDI)
  
}


function test() {
  var a = new SoundManager;
  a.loadSound();
  a.on('load', function () {
    a.playSheet();
  })
}

test();