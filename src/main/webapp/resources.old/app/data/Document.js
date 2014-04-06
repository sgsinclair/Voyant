/**
 * Document docs
 * 
 * @author Stéfan Sinclair
 * @since 4.0
 * @class Voyant.data.Document
*/
var Document = function(source, config) {
    return Ext.create("Voyant.data.Document", source, config);
}

Ext.define('Voyant.data.Document', {
    extend: 'Ext.data.Store',
    model: 'Voyant.data.model.Document',
    mixins: ['Voyant.utils.Embeddable','Voyant.utils.Transferable','Voyant.utils.Localization'],
    transferable: ['show', 'getTerms', 'getTokensCount', 'getTypesCount'],
    alternateClassName: ['Document'],
    statics: {
        i18n: {
            failedCreateDocument: {en: 'Failed attempt to create a Document.'},
            thisDocument: {en: 'This document'},
            isEmpty: {en: 'is empty'},
            widthNwordsAndNTypes: {
                en: new Ext.Template("with {words} total words and {types} unique word forms")
            },
        }
    },
    proxy: {
    	type: 'ajax',
    	url: Voyant.TROMBONE_URL,
    	reader: {
    		type: 'json',
    		documentIds: 'documentIds',
    		root: 'corpusSummary.corpus'
    	}
    },

    /**
     * Create a new Document.
     * @param {Mixed} [source] The source document as a text string, a URL.
     * @param {Object} [config] Configuration options for creating the {@link Document}.
     */
    constructor : function(source, config) {

        window.alert("In Document constructor");

        this.callParent([config])

        var dfd = Voyant.utils.deferredManager.getDeferred();

        var params = {tool: ['CorpusCreator','CorpusSummary']};
        
        // Moved this above if/elseif below (12/20/13) - jarmoza
        // make sure to set the proxy exception handler because we don't get the full responseText otherwise
        this.proxy.on('exception', function(reader, response, error, eOpts) {
            showError(this.localize('failedCreateDocument'), response.responseText);
        }, this);

        if (Ext.isString(source)) {//|| Ext.isArray(source)) {
            params.input = source;
        }
        // Only strings and uris are allowed for Document construction
        else if (Ext.isArray(source)){
            dfd.fail(this.localize('failedCreateDocument'));
        }
        
        if (source) {           
            this.load({
                params: Ext.merge(params, config),
                callback: function(records, operation, success, a, b, c) {
                    Voyant.utils.deferredManager.release()
                    if (success) {
                        dfd.resolve(this)
                    }
                    else {
                        // the proxy should show the error
                        dfd.fail(this.localize('failedCreateDocument'));
                    }
                },
                scope: this
            });
            var promise = dfd.promise();
            promise.corpus = this;
            promise.show = window.show;
            promise.$className = this.$className;
            this.transfer(this, promise);
            return promise;
        }
    },

    getTerms: function(config) {
        config = config || {};
        if (this.promise) {
            if (this.state()=='resolved') {
                Ext.merge(config, {doc: this.getId()});
                return this.corpus.getTerms(config);
            }
            return new Ext.create("Voyant.data.DocumentTerms", config, this);
        }
        Ext.merge(config, {corpus: this.getId()});
        return new Ext.create("Voyant.data.DocumentTerms", config);
    },

    /**
     * Get the total number of word tokens in the document.
     * @return {Number} the total number of word tokens in the document
     */
    getTokensCount: function(mode) {
        if (this.promise) {
            var newdfd = $.Deferred();
            var newpromise = newdfd.promise();
            $.when(this).done(function(doc) {
                newdfd.resolve(doc.getTokensCount(mode))
            })
            newpromise.show = Number.prototype.show
            return newpromise;
        }       
        return this.sum('tokensCount-'+(mode ? mode : 'lexical'));
    },
    
    /**
     * Get the total number of word types (unique word forms) in the document.
     * @return {Number} the total number of word types (unique word forms) in the document
     */
    getTypesCount: function(mode) {
        if (this.promise) {
            var newdfd = $.Deferred();
            var newpromise = newdfd.promise();
            $.when(this).done(function(doc) {
                newdfd.resolve(corpus.getTypesCount(mode))
            })
            newpromise.show = Number.prototype.show
            return newpromise;
        }       
        return this.sum('typesCount-'+(mode ? mode : 'lexical'));
    },

    /**
     * Show  a very brief overview of this Document including total words (tokens) and unique words (types).
     */
    show: function() {
        //var size = this.getSize();
        var message = this.localize('thisDocument');
        if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
        else {
            message+=' ';
/*            if (size>1) {
                message+=this.localize('hasNdocuments', {count: Ext.util.Format.number(size,"0,000")})
            }
            else {
                message+=this.localize('has1document')          
            }*/
            message+=' '+this.localize('widthNwordsAndNTypes', {words: Ext.util.Format.number(this.getTokensCount(),"0,000"), types: Ext.util.Format.number(this.getTypesCount(),"0,000")})+'.'
        }
        message.show();
    },
});