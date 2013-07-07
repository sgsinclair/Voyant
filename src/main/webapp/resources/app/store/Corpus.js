Ext.define('Voyant.store.Corpus', {
	requires: ['Voyant.store.Document'],
    extend: 'Ext.data.Store',
    model: 'Voyant.model.Corpus',
    proxy: {
    	actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	reader: {
    		type: 'json',
    		documentIds: 'documentIds',
    		root: 'corpusSummary.corpus'
    	}
    },
	constructor : function(source, config) {
		this.callParent([config])
		var dfd = Voyant.utils.deferredManager.getDeferred();
		var params = {tool: ['CorpusCreator','CorpusSummary']};
		if (Ext.isString(source) || Ext.isArray(source)) {
			params.input = source;
		}
		this.load({
			params: Ext.merge(params, config),
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(this)
				}
				else {
					dfd.fail(operation.error)
				}
				Voyant.utils.deferredManager.release()
			},
			scope: this
		});
		var promise = dfd.promise();
		promise.show = window.show;
		promise.getSize = this.getSize;
		return promise;
	},
	show: function() {
		var size = this.getSize();
		var message = "This corpus";
		if (size==0) {message += ' is empty.';}
		else {
			message+=' has '+size+' document';
			if (size>1) {message+='s'}
			message+='.';
		}
		message.show();
	},
	
	getTerms: function() {
		
	},
	
	getSize : function() {
		if (this.promise) {
			var newdfd = $.Deferred();
			$.when(this).done(function(corpus) {
				newdfd.resolve(corpus.getSize())
			})
			var newpromise = newdfd.promise();
			newpromise.show = Number.prototype.show
			return newpromise;
		}			
		return this==null ? 0 : this.first().getDocuments().getCount();
	}
});