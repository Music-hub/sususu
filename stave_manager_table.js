/* global SheetManager, Vex */
;(function (manager) {
  var fn = manager.fn;
  
  /*
   * return {
   *   pitch: String
   *   octave: Number
   * }
   *
   */
  fn.getPitch = function getPitch(line, clef, keySignature) {
    var clef = clef || 'tremble';
    var keySignature = keySignature || 'C';
    var list = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    var base = -2;
    var baseOctave = 4;
    
    line += this.getClefOffset(clef);
    
    var pitchNumber, octave;
    
    pitchNumber = ((line - base) % 7 + 7) % 7;
    octave = Math.floor((line - base) / 7) + baseOctave;
    
    return {
      pitch: this.getkeySignatureKey(list[pitchNumber], keySignature),
      octave: octave
    }
  }
  
  fn.getClefOffset = function (clef) {
    if (Vex.Flow.clefProperties.values[clef]) {
      return -Vex.Flow.clefProperties.values[clef].line_shift
    } else {
      this.emit('error', new Error('unknown clef: ' + clef));
      return null;
    }
  }
  
  fn.getkeySignatureKey = function (key, signature) {
    switch (signature) {
      case 'C#':
        if (key === 'b') key = 'b#';
      case 'F#':
        if (key === 'e') key = 'e#';
      case 'B':
        if (key === 'a') key = 'a#';
      case 'E':
        if (key === 'd') key = 'd#';
      case 'A':
        if (key === 'g') key = 'g#';
      case 'D':
        if (key === 'c') key = 'c#';
      case 'G':
        if (key === 'f') key = 'f#';
      break;
      
      case 'Cb':
        if (key === 'f') key = 'fb';
      case 'Gb':
        if (key === 'c') key = 'cb';
      case 'Db':
        if (key === 'g') key = 'gb';
      case 'Ab':
        if (key === 'd') key = 'db';
      case 'Eb':
        if (key === 'a') key = 'ab';
      case 'Bb':
        if (key === 'e') key = 'eb';
      case 'F':
        if (key === 'b') key = 'bb';
      break;
    }
    return key;
  }
  
} (SheetManager));