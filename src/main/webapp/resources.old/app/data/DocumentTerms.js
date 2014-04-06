Ext.define('Voyant.data.DocumentTerms', {
    //extend: 'Ext.data.Store',
    model: 'Voyant.data.model.DocumentTerms',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable'],
    transferable: ['embed', 'show'],
    proxy: {
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	extraParams: {tool: 'DocumentTerms', limit: 500},
    	reader: {
    		type: 'json',
    		root: 'documentTerms.documentTerms',
    		totalProperty: 'documentTerms.total'
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
				Ext.merge(config, {doc: promise.getId()})
				this._getTerms(dfd,config)
			}
			else {
				$.when(promise)
					.done(function(doc) {
						Ext.merge(config, {doc: doc.getId()})
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

		return newpromise;
	},
	
	_getTerms: function(dfd, config) {
		Ext.applyIf(config, {stopList: 'auto'})
		this.load({
			params: Ext.merge({tool: 'DocumentTerms'}, config),
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(this)
				}
				else {
					Voyant.utils.Show.MODE='error';
					var id = Ext.data.IdGenerator.get('uuid').generate();
					show("Failed attempt to fetch document terms. <a href='#' onclick='document.getElementById(\""+id+"\").style.display=\"inherit\"; this.style.display=\"none\"; return false'>+</a><pre id='"+id+"' style='display: none'>"+operation.error+"</pre>");
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
				message+=' '+record.get('term')+' ('+Ext.util.Format.number(record.get('freq'),"0,000")+')';
				if (i<len-1) {message+=','}
			}
		}
		message.show();
	}

});