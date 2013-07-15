Ext.define('Voyant.store.CorpusTerms', {
    extend: 'Ext.data.Store',
    model: 'Voyant.model.CorpusTerms',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable'],
    transferable: ['embed'],
    proxy: {
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	extraParams: {tool: 'CorpusTerms', limit: 500},
    	reader: {
    		type: 'json',
    		root: 'corpusTerms.terms',
    		totalProperty: 'corpusTerms.total'
    	}
    },
	constructor : function(config, promise) {
		this.callParent([config])
		var dfd = Voyant.utils.deferredManager.getDeferred();
		var newpromise = dfd.promise();
		var me = this;
		var configref = config;
		if (promise && promise.promise) {
			if (promise.state()=='resolved') {
				Ext.merge(config, {corpus: promise.getId()})
				this._getTerms(dfd,config)
			}
			else {
				$.when(promise)
					.done(function(corpus) {
						Ext.merge(config, {corpus: corpus.getId()})
						me._getTerms(dfd,config)
				})
			}
		}
		else {
			this._getTerms(dfd, config);
		}
		var newpromise = dfd.promise();
		newpromise.show = window.show;
		this.transfer(this, newpromise);
//		var methods = ['getDocuments','getSize','getTokensCount','getTypesCount']
//		for (var i=0;i<methods.length;i++) {
//			promise[methods[i]] = this[methods[i]];
//		}
		return newpromise;
	},
	
	_getTerms: function(dfd, config) {
		Ext.applyIf(config, {stopList: 'auto'})
		this.load({
			params: Ext.merge({tool: 'CorpusTerms'}, config),
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(this)
				}
				else {
					Voyant.utils.Show.MODE='error';
					var id = Ext.data.IdGenerator.get('uuid').generate();
					show("Failed attempt to fetch corpus terms. <a href='#' onclick='document.getElementById(\""+id+"\").style.display=\"inherit\"; this.style.display=\"none\"; return false'>+</a><pre id='"+id+"' style='display: none'>"+operation.error+"</pre>");
				}
				Voyant.utils.deferredManager.release()
			},
			scope: this
		});
	},
	
	embed: function(widget, config) {
		if (this.promise) {
			$.when(this).done(function(terms) {terms.embed(widget,config)})		
		}
		else {
			if (Ext.isObject(widget) && !config) {
				config = widget;
				widget = Voyant.widget.Cirrus;
			}
			widget = widget || Voyant.widget.Cirrus;
			widget = this.getWidget(widget);
			config = config || {};
			Ext.applyIf(config, {renderTo: this.getRenderTo(), store: this, width: 400, height: 400})
			if (widget) {Ext.create(widget, config)}
		}
	},
	show: function(config) {
		config = config || {};
		Ext.applyIf(config, {limit: 5})
		if (!config.limit) {limit.config=Number.MAX_VALUE;}
		var total = this.getTotalCount();
		var message = "There are "+Ext.util.Format.number(total,"0,000")+" term"+(total==1 ? '' : 's');
		var count = this.getCount();
		if (count==0) {message+='.'}
		else {
			if (count>config.limit) {message+=' including';}
			message+=":"
			for (var i=0,len=(count<config.limit ? count : config.limit);i<len;i++) {
				var record = this.getAt(i);
				message+=' '+record.get('term')+' ('+Ext.util.Format.number(record.get('rawFreq'),"0,000")+')';
				if (i<len-1) {message+=','}
			}
		}
		message.show();
	}

});