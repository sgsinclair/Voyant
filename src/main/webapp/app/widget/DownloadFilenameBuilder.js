Ext.define('Voyant.widget.DownloadFilenameBuilder', {
    extend: 'Ext.field.Container', //'Ext.container.Container',
    mixins: ['Voyant.util.Localization', 'Ext.field.Field'],
    alias: 'widget.downloadfilenamebuilder',
	statics: {
		i18n: {
		}
	},
	config: {
	    name: 'documentFilename',
	    itemId: 'documentFilename',
		fields: ['pubDate', 'title', 'author'],
		value: ['pubDate', 'title'],
		width: 400
	},
	

    initComponent: function(config) {
    	config = config || {};
        var me = this;
        
        me.initField();

        me.on('afterrender', function() {
        	this.items.eachKey(function(key) {
        		new Ext.dd.DropZone(this.items.get(key).getTargetEl(), {
        			ddGroup: 'downloadfilename',
        			getTargetFromEvent: function(e) {
        				var target = e.getTarget();
        				// check that we're not dropping on another source
        				return target.className && target.className.indexOf('dragsource')>-1 ? target.parentNode : target;
        	        },
        	        onNodeDrop : function(target, dd, e, data){
        	        	target.appendChild(dd.el.dom);
        	            return true;
        	        }
        		});
        	}, this)
        	
        	this.getFields().map(function(item) {
        		item = Ext.isString(item) ? {
            		tag: 'span',
            		html: this.localize(item+"Label"),
            		value: item
        		} : item;
        		var container = this.queryById(Ext.Array.contains(this.getValue(), item.value) ? 'enabled' : 'available')
				var el = Ext.dom.Helper.append(container.getTargetEl(), Ext.apply(item, {cls: 'dragsource'}));
    			Ext.create('Ext.dd.DragSource', el, {
    				ddGroup: 'downloadfilename'
                });
        	}, this)
        }, me);
        me.callParent(arguments);
    }, 
    defaults: {
    	xtype: 'container',
    	width: '100%'
    },
    items: [{
    	itemId: 'enabled',
    	cls: 'dropzone dropzone-enabled'
    }, {
    	itemId: 'available',
    	cls: 'dropzone dropzone-disabled'
    }],
    
    
    getValue: function() {
    	return this.rendered ? this.getTargetEl().query('.dropzone-enabled .dragsource').map(function(source) {return source.getAttribute('value')}) : this.value;
    },
    
    setValue: function(val) {
    	if (this.rendered) {
        	this.getTargetEl().query(".dragsource", false).forEach(function(source) {
        		var enabled = Ext.Array.contains(this.value, source.getAttribute('value'))
        		if (enabled && source.parent().hasCls('dropzone-disabled')) {
        			this.queryById('enabled').getTargetEl().appendChild(source.dom);
        		} else if (!enabled && source.parent().hasCls('dropzone-enabled')) {
        			this.queryById('available').getTargetEl().appendChild(source.dom);
        		}
        	}, this)
    	} else {
    		this.value = val;
    	}
    }
    
    
});
