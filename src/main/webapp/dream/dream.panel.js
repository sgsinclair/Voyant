Ext.define("Voyant.panel.Dream", {
	extend: "Ext.panel.Panel",
	requires: ['Voyant.data.store.DocumentQueryMatches'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.dream',
    config: {
    	corpus: undefined
    },
	listeners: {
		afterrender: function(container) {
						
			if (!container.getCorpus()) {
				container.body.mask();
			}
			
			$("#export").click(function(ev) {
				if ($("#total-badge").html()!="0") {
					Ext.create('Ext.window.Window', {
					    title: 'Export DREaM Corpus',
					    width: 500,
					    items: [{
					    	xtype: 'container',
					    	layout: 'hbox',
					    	defaults: {
					    		flex: 1,
					    		margin: 5,
						    	xtype: 'button'
					    	},
					    	items: [{
						    	text: 'Send to Voyant Tools',
			                    glyph: 'xf08e@FontAwesome',
			                    cls: 'send-voyant',
			                    handler: function(button) {
			                    	var dlg = button.findParentByType("window");
			                    	container.getAggregateSearchDocumentQueryMatches({
			                    		params: {createNewCorpus: true},
			                    		callback: function(records, operation, success) {
			                    			if (success) {
			                    				var corpus = operation.getProxy().getReader().rawData.documentsFinder.corpus;
			                    				var url = this.getBaseUrl()+"?corpus="+corpus;
			                    				var win = window.open(url);
			                    				if (!win) { // popup blocked
			                    					win = Ext.Msg.show({
			                    						buttons: Ext.MessageBox.OK,
			                    						buttonText: {ok: "Close"},
			                    						icon: Ext.MessageBox.INFO,
			                    						message: "<a href='"+url+"' target='_blank' class='link'>Click here to access your new corpus.</a>",
			                    						buttonText: 'Close'
			                    					});
			                    					Ext.Msg.getEl().dom.querySelector("a").addEventListener("click", function() {
			                    						win.close()
			                    					})
			                    				}
			                    				dlg.destroy();
			                    			}
			                    		}
			                    	})
			                    }
						    },{
						    	text: 'Download a ZIP Archive',
						    	glyph: 'xf019@FontAwesome'
						    }]
					    },{
					    	xtype: 'fieldset',
					    	title: 'Download Details',
					    	collapsible: true,
					    	items: [{
					    		xtype: 'radiogroup',
					            fieldLabel: 'file format',
					            cls: 'x-check-group-alt',
					            width: 250,
					            labelWidth: 80,
					            items: [
					                {boxLabel: 'XML', name: 'export-format', inputValue: 'XML',checked: true},
					                {boxLabel: 'plain text', name: 'export-format', inputValue: 'text'},
					                
					            ]				    		
					    	},{
					    		xtype: 'fieldset',
					    		title: 'File Name',
					    		cls: 'filename',
						    	html: '<table><tr><td>include:</td><td><ul id="filename-use" class="filenamegroup"><li>year</li><li>author</li><li>short title</li></ul></td></tr><tr><td>exclude:</td><td><ul id="filename-ignore" class="filenamegroup"><li>long title</li><li>publisher</li><li>current time</li></ul></td></tr></table>',
						    	listeners: {
						    		afterrender: {
						    			fn: function() {
						    				$( "#filename-use, #filename-ignore" ).sortable({
						    				      connectWith: ".filenamegroup"
						    				    }).disableSelection();
						    			}
						    		}
						    	}
					    	}]
					    }]
					}).show();
				}
				else {
					Ext.Msg.show({
					    title:'Export Error',
					    message: 'No documents match the all of the current selection criteria.',
					    buttons: Ext.Msg.OK,
					    icon: Ext.Msg.ERROR
					});
				}
				ev.preventDefault();
			});
			var extractLast = function(term) {
			      return split( term ).pop();
		    };
			var split = function( val ) {
			      return val.split( /,\s*/ );
		    };
		    $("#slider-pubDate").slider({
		        range: true,
		        min: 1450,
		        max: 1700,
		        values: [ 1450, 1450 ],
		        slide: function( event, ui ) {
		          $( "#pubDate-label" ).html( ui.values[ 0 ] + "-" + ui.values[ 1 ] );
		        },
		        change: function(event, ui) {
		        	container.search(ui.values[0]==ui.values[1] ? new String(ui.values[0]) : "["+ui.values[0]+"-"+ui.values[1]+"]", "pubDate")
		        }
		    
		      });
		    $( "#pubDate-label" ).html(  $( "#slider-pubDate" ).slider( "values", 0 ) +
		    	      "-" + $( "#slider-pubDate" ).slider( "values", 1 ) );
		    
			$(".dream-terms-search")
		      // don't navigate away from the field on tab when selecting an item
		      .bind( "keydown", function( event ) {
		        if ( event.keyCode === $.ui.keyCode.TAB &&
		            $( this ).autocomplete( "instance" ).menu.active ) {
		          event.preventDefault();
		        }
		        if (event.keyCode === $.ui.keyCode.TAB || event.keyCode === $.ui.keyCode.ENTER) {
		        	container.search(this.value, this.name);
			          event.preventDefault();
		        }
		      })
		      .autocomplete({
		        source: function( request, response ) {
		        	var term = extractLast( request.term ).trim().replace(/,$/,'')+"*"
		        	$.ajax({
		                url: container.getTromboneUrl(),
		                dataType: "json",
		                data: {
				            query: this.element[0].name+":"+term,
				            tool: 'corpus.CorpusTerms',
				            limit: 5,
				            corpus: container.getCorpus().getId()
		                },
		                success: function( data ) {
		                	var terms = [];
		                	if (data.corpusTerms.terms.length>1) {
		                		terms.push({id: term, label: term, value: term})
		                	}
				        	data.corpusTerms.terms.forEach(function(corpusTerm) {
				        		  terms.push({id: corpusTerm.term, label: corpusTerm.term + "("+corpusTerm.rawFreq+")", value: corpusTerm.term})
				        	})
				        	response(terms);
		                }
		              });
		        },
		        search: function() {
		          // custom minLength
		          var term = extractLast( this.value );
		          if ( term.length < 2 ) {
		            return false;
		          }
		        },
		        focus: function() {
		          // prevent value inserted on focus
		          return false;
		        },
		        select: function( event, ui ) {
		          var terms = split( this.value );
		          // remove the current input
		          terms.pop();
		          // add the selected item
		          terms.push( ui.item.value );
		          // add placeholder to get the comma-and-space at the end
		          terms.push( "" );
		          this.value = terms.join( ", " );
		          container.search(this.value, this.name);
		          return false;
		        }
		      });
		},
		loadedCorpus: function(src, corpus) {
			this.body.unmask();
			this.setCorpus(corpus);
		}
	},
	search: function(value, field) {
		var el = Ext.get(this.getEl().dom.querySelector("#"+field+"-badge"));
		el.setDisplayed("initial").update("?");
		value = value.trim().replace(/,$/,'');
		if (value) {
			Ext.create("Voyant.data.store.DocumentQueryMatches", {
				autoDestroy: true,
				autoLoad: false,
				corpus: this.getCorpus()
			}).load({
				scope: this,
				params: {query: field+":"+value},
				callback: function(records, operation, success) {
					var count = success && records.length>0 ? records[0].getCount() : "0";
					el.dom.innerHTML=count; // update(0) doesn't work
					this.searchAggregate();
				}
			})
		}
		else {
			el.dom.innerHTML=0;
			this.searchAggregate();
		}
	},
	searchAggregate: function() {
		var aggregateQueries = this.getAggregateQueries();

		var el = Ext.get(this.getEl().dom.querySelector("#total-badge"));
		el.setDisplayed("initial").update("?");
		if (aggregateQueries.queries.length>1) {
			this.getAggregateSearchDocumentQueryMatches({
				callback: function(records, operation, success) {
					var count = 0;
					if (success) {
						records.forEach(function(record) {
							count+=record.getCount();
						})
					}
					el.dom.innerHTML=count; // update(0) doesn't work
				}
			})
		}
		else if (aggregateQueries.queries.length==1) {
			el.dom.innerHTML = this.getEl().dom.querySelector("#"+aggregateQueries.fields[0]+"-badge").innerHTML; // only one field, so just copy value
		}
		else {
			el.dom.innerHTML=0;
		}
	},
	getAggregateQueries: function() {
		var queries = [];
		var fields = [];
		var searches = this.getEl().dom.querySelectorAll(".dream-terms-search");
		for (var i=0,len=searches.length;i<len;i++) {
			var val = searches[i].value.trim().replace(/,$/,'');
			if (val) {
				fields.push(searches[i].name);
				var qs = [];
				val.split(/\s*,\s*/).forEach(function(q) {
					qs.push(searches[i].name+":"+q)
				});			
				queries.push("+("+qs.join(" | ")+")")
			}
		}

		var pubYearSlider = $(this.getEl().dom.querySelector("#slider-pubDate"));
		var values = pubYearSlider.slider("values");
		var min = pubYearSlider.slider("option", "min");
		if (values[1]>min) { // make sure we don't have default end value
			queries.push("+pubDate:"+(values[0]==values[1] ? values[0] : "["+values[0]+"-"+values[1]+"]"))
			fields.push("pubDate");
		}
		return {queries: queries, fields: fields}
	},
	getAggregateSearchDocumentQueryMatches: function(config) {
		var docMatches = this.getCorpus().getDocumentQueryMatches();
		config = config || {};
		config.params = config.params || {};
		if (!config.params.query) {config.params.query = this.getAggregateQueries().queries.join(" ")}
		docMatches.load(Ext.applyIf(config, {
			scope: this
		}))
	}
	
})