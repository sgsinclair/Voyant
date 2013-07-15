Ext.define('Voyant.store.Contexts', {
    extend: 'Ext.data.Store',
    model: 'Voyant.model.Contexts',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable'],
    transferable: ['embed'],
    proxy: {
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	extraParams: {tool: 'Contexts', limit: 500},
    	reader: {
    		type: 'json',
    		root: 'contexts.contexts',
    		totalProperty: 'contexts.total'
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
				this._getContexts(dfd,config)
			}
			else {
				$.when(promise)
					.done(function(corpus) {
						Ext.merge(config, {corpus: corpus.getId()})
						me._getContexts(dfd,config)
				})
			}
		}
		else {
			this._getContexts(dfd, config);
		}
		var newpromise = dfd.promise();
		newpromise.show = window.show;
		this.transfer(this, newpromise);
		return newpromise;
	},
	
	_getContexts: function(dfd, config) {
		Ext.applyIf(config, {stopList: 'auto'})
		this.load({
			params: config, //Ext.merge({tool: 'CorpusTerms'}, config),
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(this)
				}
				else {
					dfd.fail(this)
				}
				Voyant.utils.deferredManager.release()
			},
			scope: this
		});
	},
	
	embed: function(widget, config) {
		if (this.promise) {
			$.when(this).done(function(contexts) {contexts.embed(widget,config)})		
		}
		else {
			if (Ext.isObject(widget) && !config) {
				config = widget;
				widget = Voyant.widget.ContextsGrid;
			}
			widget = widget || Voyant.widget.ContextsGrid;
			widget = this.getWidget(widget);
			config = config || {};
			Ext.applyIf(config, {renderTo: this.getRenderTo(), store: this, height: 350})
			if (widget) {Ext.create(widget, config)}
		}
	},
	show: function(config) {
		config = config || {};
		Ext.applyIf(config, {limit: 5})
		if (!config.limit) {limit.config=Number.MAX_VALUE;}
		var total = this.getTotalCount();
		var message = "There are "+Ext.util.Format.number(total,"0,000")+" context"+(total==1 ? '' : 's');
		message+='.';
		message.show();
	}

});