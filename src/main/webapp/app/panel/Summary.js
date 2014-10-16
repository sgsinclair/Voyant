Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel', 'Voyant.util.SparkLine'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
    		title: {en: "Summary"},
    		mostFrequentWords: {en: 'Most <b>frequent words</b> in the corpus: '},
    		docsLength: {en: '<tpl for="docs"><a href="#" onclick="return false" class="document-id" voyant:val="{id}">{title}</a> ({totalWordTokens})<tpl if="xindex &lt; docsLen">, </tpl></tpl>'},
    		docsLengthLongest: {en: '<b>Longest documents</b> (by words {0})'},
    		docsLengthShortest: {en: 'Shortest documents'},
    		docsLengthAll: {en: 'Documents ordered by number of words ({0})'}
    	}
    },
    config: {
    	corpus: undefined
    },
    padding: 10,
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title')
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		
    		this.setCorpus(corpus);
    		
    		// TODO: complete the summary
    		if (this.rendered) {
    			var summaryListParent = Ext.dom.Helper.append(this.getLayout().getRenderTarget(), '<ul></ul>');
    			Ext.dom.Helper.append(summaryListParent, '<li>'+corpus.getShow()+'</li>');
    		
    			this.showLongestDocuments(summaryListParent);
    			
    			this.showMostFrequentWords(summaryListParent);
    		}
    		else {
    			Ext.defer(this.fireEvent, 100, this);
    		}

    	});
    	
    	this.on("activate", function() {
        		if (this.getCorpus()) {
            		this.dispatchEvent('ensureCorpusView', this, this.getCorpus());
        		}
    		}, this);

    	// if we need to embed this, do so
    	if (config.embedded) {
    		var cls = Ext.getClass(config.embedded).getName();
    		if (cls=="Voyant.data.model.Corpus") {
    			config.corpus = config.embedded;
    		}
    	}
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    },
    
    showLongestDocuments: function(parentEl) {
    	var docStore = Ext.create("Voyant.data.store.Documents", {
    		corpus: this.getCorpus(),
    		sorters: {
    			property: 'tokensCount-lexical',
    			direction: 'ASC' // why does ASC work when it should be DESC?
    		}
    	});
    	docStore.on('load', function(store, records, success) {
    		var count = store.getTotalCount();
    		if (count > 1) {
    			var lengths = [];
    			
    			var data = count > 5 ? {shortest: store.getRange(count-2,count).reverse(), longest: store.getRange(0,1)} : {all: store.getRange(0,count)};
    			for (var k in data) {
    				if (k) {
    					var items = data[k];
    					for (var i=0;i<items.length;i++) {
    						var doc = items[i];
    						lengths.push(doc.get('tokensCount-lexical'));
    						data[k][i] = {
    							title: doc.getShortTitle(),
    							id: doc.get('id'),
    							totalWordTokens: Ext.util.Format.number(doc.get('tokensCount-lexical'),'0,000'),
    							docsLen: items.length
    						};
    					}
    				}
    			}
    			
    			var tpl = new Ext.XTemplate(this.localize('docsLength'));
    			var out = '';
    			if (count>5) {
    				out += new Ext.Template(this.localize('docsLengthLongest')) + this.localize('colon') + tpl.apply({docs: data.longest})+'. ';
    				out += this.localize('docsLengthShortest') + this.localize('colon') + tpl.apply({docs: data.shortest})+'. ';
    				out += "<a href='#' onclick='return false' class='corpus-documents corpus-documents-length'>"+this.localize('seeAll')+'</a>';
    			}
    			else {
    				out += new Ext.Template(this.localize('docsLengthAll')).apply([this.getSparkLine(lengths)]) + this.localize('colon') + tpl.apply({docs: data.all});
    			}
    			Ext.dom.Helper.append(parentEl, '<li>'+out+'</li>');
    		} else {
    			
    		}

		}, this);
    	docStore.load({
			params: {
				start: 0,
				limit: 5
			}
		});

    },
    
    showMostFrequentWords: function(parentEl) {
    	var corpus = this.getCorpus();
    	var corpusTerms = corpus.getCorpusTerms({
			listeners: {
				load: function(store, records) {
					console.log(store, records);
				}
			}
		});
		corpusTerms.load({
			scope: this,
			callback: function(records) {
				var message = this.localize('mostFrequentWords');
				records.forEach(function(r, index, array) {
					message += r.getTerm()+' ('+Ext.util.Format.number(r.get('rawFreq'), "0,000")+')';
					if (index < array.length - 1) {
						message += ', ';
					} else {
						message += '.';
					}
				});
				Ext.dom.Helper.append(parentEl, '<li>'+message+'</li>');
			},
			params: {
				start: 0,
				limit: 5
			}
		});
    }
});