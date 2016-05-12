// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
Ext.define('Voyant.panel.Bubbles', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubbles',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
    		 * @property stopList The stop list to use to filter results.
    		 * Choose from a pre-defined list, or enter a comma separated list of words, or enter an URL to a list of stop words in plain text (one per line).
    		 * @type String
    		 * @private
    		 */
    		stopList: 'auto',
    		
    		docIndex: 0,
    		
    		limit: 100
    			
    			
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
		corpus: undefined,
    	options: {xtype: 'stoplistoption'}
	},
	
	
    constructor: function() {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		html: '<canvas width="800" height="600"></canvas>'
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on('loadedCorpus', function(src, corpus) {
    		this.setCorpus(corpus);
    		var canvas = this.getTargetEl().dom.querySelector("canvas");
    		var me = this;
    		Ext.Ajax.request({
    			url: this.getBaseUrl()+'resources/voyant/current/bubbles/bubbles.pjs'
    		}).then(function(data) {
    			me.bubbles = new Processing(me.getTargetEl().dom.querySelector("canvas"), data.responseText);
    			me.bubbles.bindJavascript(me);
    			me.bubbles.noLoop();
    			me.loadDocument();
    		})
    	}, this);
    },
    
    handleCurrentTerm: function(term) {
    	if (this.oscillator) {this.oscillator.frequency.value = this.terms[term] ? parseInt((this.terms[term]-this.minFreq) * 2000 / (this.maxFreq-this.minFreq)) : 0;}
    },
    
    handleDocFinished: function() {
    	if (this.gainNode) {this.gainNode.gain.value = 0;}
    	var index = parseInt(this.getApiParam('docIndex'));
    	if (index+1<this.getCorpus().getDocumentsCount()) {
    		this.setApiParam('docIndex', index+1);
    		this.loadDocument();
    	}
    },
    
    loadDocument: function() {
    	var me = this, doc = this.getCorpus().getDocument(parseInt(this.getApiParam('docIndex')));
    	doc.loadDocumentTerms(Ext.apply(this.getApiParams(["stopList"]), {
    		limit: 100
    	})).then(function(documentTerms) {
    		me.terms = {};
    		documentTerms.each(function(documentTerm) {
    			me.terms[documentTerm.getTerm()] = documentTerm.getRawFreq();
    		})
    		var values = Object.keys(me.terms).map(function(k){return me.terms[k]});
    		me.minFreq = Ext.Array.min(values);
    		me.maxFreq = Ext.Array.max(values);
    		me.getCorpus().loadTokens({whitelist: Object.keys(me.terms), noOthers: true, limit: 0, docIndex: me.getApiParam('docIndex')}).then(function(tokens) {
    			var words = [];
        		tokens.each(function(token) {
    				words.push(token.getTerm().toLowerCase());
        		})
        		me.bubbles.setLines([doc.getTitle(),words.join(" ")]);
        		me.bubbles.loop();
        		me.oscillator.frequency.value = 150;
        		me.gainNode.gain.value = 1;
    		})
    	})
    },
    
    initComponent: function() {
    	// make sure to load script
		Ext.Loader.loadScript(this.getBaseUrl()+"resources/processingjs/processing.min.js");
		
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		this.oscillator = audioCtx.createOscillator();
		this.gainNode = audioCtx.createGain();
		this.oscillator.connect(this.gainNode);
		this.gainNode.connect(audioCtx.destination);
		this.oscillator.frequency.value = 0;
		this.oscillator.start();
		this.gainNode.gain.value = 0;

    	this.callParent(arguments);
    }
});