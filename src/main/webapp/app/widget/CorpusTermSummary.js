Ext.define('Voyant.widget.CorpusTermSummary', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.panel.Panel'],
    alias: 'widget.corpustermsummary',
    statics: {
        i18n: {
            title: 'Corpus Term Summary: ',
            items: 'Items',
            loading: 'Loading...',
            distribution: 'Distribution: ',
            collocates: 'Collocates: ',
            correlations: 'Correlations: ',
            phrases: 'Phrases: '
        },
        api: {
            stopList: 'auto',
            query: undefined,
            limit: 5
        }
    },
    config: {
        corpus: undefined,
        record: undefined, // Voyant.data.model.CorpusTerm
        collocatesStore: undefined,
        correlationsStore: undefined,
        phrasesStore: undefined,
        documentTermsStore: undefined
    },
    cls: 'corpus-term-summary',

    constructor: function(config) {
        if (config.record === undefined) {
            console.warn('CorpusTermSummary: no config.record!');
            return false;
        }
        
        Ext.apply(this, {
            items: {
                itemId: 'main',
                minHeight: 200,
                scrollable: true,
                margin: 5
            },
            dockedItems: {
                dock: 'bottom',
                xtype: 'toolbar',
                items: {
                    fieldLabel: this.localize('items'),
                    labelWidth: 40,
                    width: 120,
                    xtype: 'slider',
                    increment: 5,
                    minValue: 5,
                    maxValue: 59,
                    listeners: {
                        boxready: function(slider) {
                            slider.setValue(this.getApiParam('limit'));
                        },
                        changecomplete: function(slider, newvalue) {
                            this.setApiParam('limit', newvalue);
                            this.loadStuff();
                        },
                        scope: this
                    }
                }
            },
            listeners: {
                boxready: function() {
                    this.body.on('click', function(e) {
                        var target = e.getTarget(null, null, true);
                        if (target && target.dom.tagName == 'A') {
                            if (target.hasCls('corpus-type')) {
                                this.dispatchEvent('termsClicked', this, [target.getHtml()]);
                            }
                        }
                    }, this, {stopPropagation: true});
                    
                    this.getDockedItems().forEach(function(i) {
                       i.getEl().on('click', null, this, {stopPropagation: true}); // stop owner container from receiving clicks
                    });
                    
                    this.loadStuff();
                },
                scope: this
            }
        });
        
        Ext.applyIf(config, {
            title: this.localize('title')+config.record.getTerm()
        });

        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        
        var corpus = this.getRecord().store.getCorpus();
        this.setCorpus(corpus);

        this.setApiParam('query', this.getRecord().getTerm());
        
        this.setCollocatesStore(Ext.create('Voyant.data.store.CorpusCollocates', { corpus: corpus }));
        this.setCorrelationsStore(Ext.create('Voyant.data.store.TermCorrelations', { corpus: corpus }));
        this.setPhrasesStore(Ext.create('Voyant.data.store.CorpusNgrams', { corpus: corpus }));
        this.setDocumentTermsStore(Ext.create('Voyant.data.store.DocumentTerms', { corpus: corpus }));
        
    },

    loadStuff: function() {
        this.getComponent('main').removeAll();
        
        var docIndexes = [];
        for (var i = 0; i < this.getCorpus().getDocumentsCount(); i++) {
            docIndexes[i] = i;
        }
        this.getComponent('main').add({
            xtype: 'container',
            cls: 'section',
            layout: 'hbox',
            align: 'bottom',
            items: [{
                xtype: 'container',
                html: '<div class="header">'+this.localize('distribution')+'</div>'
            },{
                itemId: 'distLine',
                xtype: 'sparklineline',
                values: [],
                height: 20,
                width: 200
            }],
            listeners: {
                afterrender: function(container) {
                    container.mask(this.localize('loading'));
                    // TODO make distribution bins reflective of doc sizes
                    this.getDocumentTermsStore().load({
                        params: {
                            query: this.getApiParam('query'),
                            docIndex: docIndexes,
                            withDistributions: true,
                            bins: parseInt(this.getApiParam('limit'))*2
                        },
                        callback: function(records, op, success) {
                            if (success && records && records.length>0) {
                                var arrays = records.map(function(r) { return r.getDistributions(); });
                                var values = arrays.reduce(function(a,b) { return a.concat(b); });
                                this.down('#distLine').setValues(values);
                                container.unmask();
                            }
                        },
                        scope: this
                    });
                },
                scope: this
            }
        });
        
        this.addSection(
            this.localize('collocates'), this.getCollocatesStore(), this.getApiParams(),
            '<tpl for="." between="; "><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{term}">{term}</a><span style="font-size: smaller"> ({val})</span></tpl>',
            function(r) {
                return {term: r.getContextTerm(), val: r.getContextTermRawFreq()}
            }
        );
        
        this.addSection(
            this.localize('correlations'), this.getCorrelationsStore(), this.getApiParams(),
            '<tpl for="." between="; "><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{term}">{term}</a><span style="font-size: smaller"> ({val})</span></tpl>',
            function(r) {
                return {term: r.get('source-term'), val: r.get('source').rawFreq}
            }
        );
        
        this.addSection(
            this.localize('phrases'), this.getPhrasesStore(), Ext.apply({minLength: 3, sort: 'length'}, this.getApiParams()),
            '<tpl for="."><div>&ldquo;{phrase}&rdquo;</div></tpl>',
            function(r) {
                return {phrase: r.getTerm()}
            }
        );
    },
    
    addSection: function(title, store, params, template, mapping) {
        return this.getComponent('main').add({
            xtype: 'container',
            html: '<div class="header">'+title+'</div>',
            cls: 'section',
            listeners: {
                afterrender: function(container) {
                    container.mask(this.localize('loading'));
                    store.load({
                        params: params,
                        callback: function(records, op, success) {
                            if (success && records && records.length>0) {
                                container.unmask();
                                Ext.dom.Helper.append(container.getTargetEl().first().first(),
                                    new Ext.XTemplate('<div class="contents">'+template+'</div>').apply(records.map(mapping))
                                );
                            }
                        }
                    });
                },
                scope: this
            }
        });
    }
});
