Ext.define('Voyant.notebook.Notebook', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.notebook.editor.CodeEditorWrapper','Voyant.notebook.editor.TextEditorWrapper','Voyant.notebook.util.Show','Voyant.panel.Cirrus','Voyant.panel.Summary'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.notebook',
    statics: {
    	i18n: {
    		title: {en: "Voyant Notebook"},
			eror: {en: "Error"},
			cannotMoveHigher: {en: "This block is already at the top and cannot be moved higher."},
			cannotMoveLower: {en: "This block is already at the bottom and cannot be moved lower."},
			defaultBlocks: {en: [
			    {
			    	type: 'text',
			    	content: "<h1 style='text-align: center;'>Voyant Notebook Template (title)</h1><p>This is a Voyant Notebook, a dynamic document that combines writing, code and data in service of reading, analyzing and interpreting digital texts.</p><p>Voyant Notebooks are composed of text blocks (like this one) and code blocks (like the one below). You can <span class='marker'>click on the blocks to edit</span> them and add new blocks by clicking add icon that appears in the left column when hovering over a block.</p>"
			    },{
			    	content: "// create a new corpus and embed the default visualization for its terms\n"+'var Corpus = new Corpus("Hello world!");'+"\ncorpus.getCorpusTerms().emebed();"
			    }
			]},
			failedNotebookLoad: {en: "Failed to load the specified notebook. A new notebook template will be presented instead."}
    	}
    },
    constructor: function() {
    	Ext.apply(this, {
    		title: this.localize('title'),
    	    tools: [
    	            {type: 'help'},
    	            {type: 'next', handler: this.runAllCode, scope: this},
    	            {type: 'save'}
    	   ]
    		
    	})
        this.callParent(arguments);
    },
    autoScroll: true,
    listeners: {
    	boxready: function() {
        	var queryParams = Ext.Object.fromQueryString(document.location.search);
        	if (queryParams.input) {
        		this.loadBlocks(Ext.isString(queryParams.input) ? [queryParams.input] : queryParams.input);
            	if (queryParams.run) {this.runAllCode()}
        	}
        	else {
        		var url = location.href.replace(location.hash,"").replace(location.search,'');
        		var notebook = url.substring(url.lastIndexOf("/",url.length-2)+1, url.length-1);
        		if (notebook && notebook!='new') {
            		var me = this;
            		this.mask(this.localize("fetchingNotebook"));
        			$.getJSON(this.getTromboneUrl(), {
        				tool: 'notebook.NotebookManager',
        				notebook: notebook 
        			}).done(function(data) {
        				me.loadBlocks(data);
        				if (queryParams && queryParams.run) {me.runAllCode()}
        			}).fail(function(response) {
        				me.showError({message: me.localize('failedNotebookLoad')});
        				me.loadBlocks(me.localize("defaultBlocks"));
        			}).always(function() {
        				me.unmask()
        			})
        		}
        		else {
            		this.loadBlocks(this.localize("defaultBlocks"));
        			
        		}
        	}
    	},
    	
    	notebookWrapperMoveUp: function(wrapper) {
    		var i = this.items.findIndex('id', wrapper.id);
    		if (i==0) {
    			Ext.Msg.show({
    				title: this.localize('error'),
    				msg: this.localize('cannotMoveHigher'),
    				buttons: Ext.MessageBox.OK,
    				icon: Ext.MessageBox.WARNING
    			});
    		}
    		else {this.move(i, i-1);}
    	},
    	
    	notebookWrapperMoveDown: function(wrapper) {
    		var i = this.items.findIndex('id', wrapper.id);
    		if (i==this.items.getCount()-1) {
    			Ext.Msg.show({
    				title: this.localize('error'),
    				msg: this.localize('cannotMoveLower'),
    				buttons: Ext.MessageBox.OK,
    				icon: Ext.MessageBox.WARNING
    			});
    		}
    		else {this.move(i, i+1);}
    	},
    	
    	notebookWrapperRemove: function(wrapper) {
    		this.remove(wrapper);
    	},
    	
    	notebookWrapperRun: function(wrapper) {
    	},

    	notebookWrapperAdd: function(wrapper, e) {
    		var i = this.items.findIndex('id', wrapper.id);
    		var xtype = wrapper.getXType(wrapper);
    		if ((xtype=='notebooktexteditorwrapper' && !e.hasModifier()) || (xtype=='notebookcodeeditorwrapper' && e.hasModifier())) {this.addCode('',i+1);}
    		else {this.addText('',i+1);}
    	}

    },
    
    loadBlocks: function(blocks) {
    	blocks.forEach(function(block) {
    		if (Ext.isString(block) && block!='') {this.addCode(block);}
    		else if (block.content) {
        		if (block.type=='text') {this.addText(block.content);}
        		else {this.addCode(block.content);}
    		}
    	}, this)
    },
    
    addText: function(content, position) {
    	this._add(content, position, 'notebooktexteditorwrapper');
    },
 
    addCode: function(content, position) {
    	this._add(content, position, 'notebookcodeeditorwrapper');
    },
    
    _add: function(content, position, xtype) {
    	position = (typeof position === 'undefined') ? this.items.getCount() : position;
    	this.insert(position, {
    		xtype: xtype,
    		content: content
    	})
    },
    
    runAllCode: function() {
    	var containers = [];
    	this.items.each(function(item) {
    		if (item.isXType('notebookcodeeditorwrapper')) {
    			containers.push(item);
    		}
    	})
    	this._runCodeContainers(containers);
    },
    
    _runCodeContainers: function(containers) {
    	if (containers.length>0) {
        	if (Voyant.application.getDeferredCount()==0) {
        		var container = containers.shift();
        		container.run();
        	}
        	Ext.defer(this._runCodeContainers, 100, this, [containers]);
    	}
    }
    
    
})