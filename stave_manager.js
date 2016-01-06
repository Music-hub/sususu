// main class for sheet manager
/* global EventEmitter, Vex */

var inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

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
} (EventEmitter))

// main class for handle all sheet drawing and manipulating methods
function SheetManager (canvas, options)
{
	MyEventEmitter.call(this);
	
	this.canvas = canvas;
	
	this.options = null;
	this.renderer = null;
	this.ctx = null;
	this.sheet = null;
	this.data = {
		//auto generate field
		rows : 1,
		staveWidth : null
	};
	
	this._optionsDefault = {
		width : 700,
		lineHeight : 100,
		cols : 4,
		paddingLeft : 20,
		paddingRight : 20,
		paddingTop : 20,
		paddingBottom : 20,
		paddingFirstLine : 20,
		extraHeadStaveWidth: 40
	}
	this.init(options);
	this.on('error', console.error.bind(console));
}
inherits(SheetManager, MyEventEmitter);

SheetManager.fn = SheetManager.prototype;

SheetManager.prototype.mergeOptions = function mergeOptions(obj1,obj2){
	var obj3 = {};
	for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	return obj3;
}

// init some empty data table, reset everything to initial state, merge options to defult options.
SheetManager.prototype.init = function init(options) {
	options = options || {};
	
	if (options.padding) {
		if (!options.paddingRight) options.paddingRight = options.padding;
		if (!options.paddingBottom) options.paddingBottom = options.padding;
		if (!options.paddingTop) options.paddingTop = options.padding;
		if (!options.paddingLeft) options.paddingLeft = options.padding;
		if (!options.paddingFirstLine) options.paddingFirstLine = options.paddingLeft;
	}
	
	this.options = this.options || {};
	this.options = this.mergeOptions(this._optionsDefault, this.options);
	this.options = this.mergeOptions(this.options, options);
	
	if (!this.options.effectProcessor) {
		this.options.effectProcessor = {};
		if (!this.options.effectProcessor.note) {
			this.options.effectProcessor.note = new EffectProcessor()
			this.options.effectProcessor.note.addEffectSets(EffectProcessor.noteEffectSets);
		}
		if (!this.options.effectProcessor.track) {
			this.options.effectProcessor.track = new EffectProcessor()
			this.options.effectProcessor.track.addEffectSets(EffectProcessor.trackEffectSets);
		}
		if (!this.options.effectProcessor.measure) {
			this.options.effectProcessor.measure = new EffectProcessor()
			this.options.effectProcessor.measure.addEffectSets(EffectProcessor.measureEffectSets);
		}
	}
	
	var height = this.data.rows * this.options.lineHeight + this.options.paddingBottom + this.options.paddingTop;
	var width = this.options.width + this.options.paddingRight + this.options.paddingLeft;
	
	this.data.staveWidth = Math.floor((this.options.width - this.options.extraHeadStaveWidth) / this.options.cols);
	
	// drop current contents
	this.canvas.height = 1;
	this.canvas.width = 1;
	
	this.canvas.height = height;
	this.canvas.width = width;
	
	this.renderer = new Vex.Flow.Renderer(
		this.canvas,
		Vex.Flow.Renderer.Backends.CANVAS
	);
	
	this.ctx = this.renderer.getContext();
	
	this.noteDrawables = [];
	this.staveDrawables = [];
	
	this.noteTable = null;
	this.voiceTable = null;
	this.staveTable = null;
	this.firstDraw = true;
}

// change either the sheet or the options, or call it with empty argument to reinit the layout after sheet being modified
SheetManager.prototype.setSheet = function setSheet(sheet, options) {
	this.sheet = sheet || this.sheet;
	
	var tracks = this.sheet.getChannelCount(),
	    measures = this.sheet.getMeasureCount();
	
	this.init(options);
	this.data.rows = tracks * Math.ceil(measures / this.options.cols);
	this.init(options);
	
	
	this.noteTable = new MeasureManager (tracks, measures, this.options.cols);
	this.voiceTable = new MeasureManager (tracks, measures, this.options.cols);
	this.staveTable = new MeasureManager (tracks, measures, this.options.cols);
}

// get a sheet clone back from manager
SheetManager.prototype.getSheet = function getSheet(sheet, options) {
	return this.sheet ? this.sheet.clone() : null;
}

// format the sheet and init all vex notes and stave
SheetManager.prototype.preDrawSheet = function preDrawSheet() {
	this.createStave();
	this.addStaveTrackEffect();
	this.addStaveMeasureEffect();
	this.addClef();
	this.addKeySignature();
	this.addTimeSignature();
	this.addConnector();
	this.postStaveFormat();

	this.createNote();
	this.processNoteEffect();
	this.createVoice();
	this.addDot()
	this.addAccidental()
	this.addBeam();
	this.alignNote();
	this.postNoteFormat();
	
	this.emit('post-all-format', this);
}

// clear the canvas
SheetManager.prototype._clearCanvas = function _clearCanvas() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

// draw all items of the sheet
SheetManager.prototype.renderSheet = function renderSheet() {
	this.emit('pre-draw', this);
	this._clearCanvas();
	
	this.drawStave();
	
	this.drawNote();
	// recuaculate all note position if the layout chnaged
	if (this.eventInited === true) {
		this.noteBoundingBoxs = this.getAllNoteBoundingBox();
		this.staveBoundingBoxs = this.getAllStaveBoundingBox();
	}
	this.emit('post-draw', this);
}

// format and draw the sheet, actully combination of `preDrawSheet`, `_clearCanvas`, `renderSheet`
SheetManager.prototype.drawSheet = function drawSheet() {
	this.preDrawSheet();
	this.renderSheet();
}

