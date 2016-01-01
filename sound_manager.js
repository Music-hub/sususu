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
		/*	MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75); */ 
			
			self.emit('load')
		}
	});
}


SoundManager.prototype.playSheet = function playSheet(sheetManager, bpm, beatValue) {
  bpm = bpm || 140;
  
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
      voice.tickables.forEach(function (tickable) {
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
      			MIDI.setVolume(0, 127);
      			MIDI.noteOn(0, midiNum, velocity, soundMeasureOffset + soundNoteOffset);
      			MIDI.noteOff(0, midiNum, soundMeasureOffset + soundNoteOffset + soundNoteLength);
      			
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
  
  console.log(MIDI)
  
}
/*

function test() {
  var a = new SoundManager;
  a.loadSound();
  a.on('load', function () {
    a.playSheet();
  })
}

test();

*/