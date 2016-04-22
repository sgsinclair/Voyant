Ext.define('Voyant.widget.StopListOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.stoplistoption',
    layout: 'hbox',
    statics: {
    	i18n: {
    		label: {en: "Stopwords:"},
    		editList: {en: "Edit List"},
    		noEditAutoTitle: {en: "Edit Stoplist Error"},
    		noEditAutoMessage: {en: 'The auto-detected stoplist cannot be edited, please select a specifc stoplist such as the "New User-Defined List".'},
    		auto: {en: "Auto-detect"},
    		none: {en: "None"},
    		'new': {en: "New User-Defined List"},
    		
    		ar: {en: "Arabic", value: 'stop.ar.arabic-lucene.txt'},
    		bg: {en: "Bulgarian", value: 'stop.bu.bulgarian-lucene.txt'},
    		br: {en: "Breton", value: 'stop.br.breton-lucene.txt'},
    		ca: {en: "Catalan", value: 'stop.ca.catalan-lucene.txt'},
    		ckb: {en: "Kurdish", value: 'stop.ckb-turkish-lucene.txt'},
    		cn: {en: "Chinese", value: 'stop.cn.chinese-lawrence.txt'},
    		cz: {en: "Czech", value: 'stop.cz.czech-lucene.txt'},
    		de: {en: "German", value: 'stop.de.german.txt'},
    		el: {en: "Greek", value: 'stop.el.greek-lucene.txt'},
    		en: {en: "English", value: 'stop.en.taporware.txt'},
    		es: {en: "Spanish", value: 'stop.es.spanish.txt'},
    		eu: {en: "Basque", value: 'stop.eu.basque-lucene.txt'},
    		fa: {en: "Farsi", value: 'stop.fa.farsi-lucene.txt'},
    		fr: {en: "French", value: 'stop.fr.veronis.txt'},
    		ga: {en: "Irish", value: 'stop.ga-irish-lucene.txt'},
    		gl: {en: "Galician", value: 'stop.ga.galician-lucene.txt'},
    		hi: {en: "Hindi", value: 'stop.hi.hindi-lucene.txt'},
    		hu: {en: "Hungarian", value: 'stop.hu.hungarian.txt'},
    		hy: {en: "Armenian", value: 'stop.hy.armenian-lucene.txt'},
    		id: {en: "Indonesian", value: 'stop.id.indonesian-lucene.txt'},
    		it: {en: "Italian", value: 'stop.it.italian.txt'},
    		ja: {en: "Japanese", value: 'stop.ja.japanese-lucene.txt'},
    		lt: {en: "Latvian", value: 'stop.lv.latvian-lucene.txt'},
    		lv: {en: "Lithuanian", value: 'stop.lt.lithuanian-lucene.txt'},
    		mu: {en: "Multilingual", value: 'stop.mu.multi.txt'},
    		nl: {en: "Dutch", value: 'stop.nl.dutch.txt'},
    		no: {en: "Norwegian", value: 'stop.no.norwegian.txt'},
    		ro: {en: "Romanian", value: 'stop.ro.romanian-lucene.txt'},
    		se: {en: "Swedish", value: 'stop.se.swedish-long.txt'},
    		th: {en: "Thai", value: 'stop.th.thai-lucene.txt'},
    		tr: {en: "Turkish", value: 'stop.tr.turkish-lucene.txt'},
    		
    		ok: {en: "Save"},
    		cancel: {en: "Cancel"},
    		editStopListTitle: {en: "Edit Stoplist"},
    		editStopListMessage: {en: "This is the stoplist, one term per line."},
    		applyGlobally: {en: "apply globally"}
    	}
    },
    initComponent: function(config) {
    	var me = this;
    	var value = this.up('window').panel.getApiParam('stopList');
    	
    	var data = [];
    	"ar,bg,br,ca,ckb,cn,cz,de,el,en,es,eu,fa,fr,ga,gl,hi,hu,hy,id,it,ja,lv,lt,mu,nl,no,ro,se,th,tr".split(",").forEach(function(lang) {
    		data.push({name: this.localize(lang), value: this.localize(lang, {lang: 'value'})})
    	}, this);
//    	debugger
//        var data = [{name : this.localize('en'),   value: 'stop.en.taporware.txt'},
//               {name : this.localize('de'),   value: 'stop.de.german.txt'},
//               {name : this.localize('es'),   value: 'stop.es.spanish.txt'},
//               {name : this.localize('fr'),   value: 'stop.fr.veronis.txt'},
//               {name : this.localize('hu'),   value: 'stop.hu.hungarian.txt'},
//               {name : this.localize('it'),   value: 'stop.it.italian.txt'},
//               {name : this.localize('no'),   value: 'stop.no.norwegian.txt'},
//               {name : this.localize('se'),   value: 'stop.se.swedish-long.txt'},
//               {name : this.localize('mu'),   value: 'stop.mu.multi.txt'}]
    	data.sort(function(a,b) { // sort by label
    		return a.name < b.name ? -1 : 1;
    	})
    	data.splice(0, 0, {name : this.localize('auto'),   value: 'auto'}, {name : this.localize('none'),   value: ''},  {name : this.localize('new'),   value: 'new'})
    	Ext.apply(me, {
	    		items: [{
	    	        xtype: 'combo',
	    	        queryMode: 'local',
	    	        value: value,
	    	        triggerAction: 'all',
	    	        editable: true,
	    	        fieldLabel: this.localize('label'),
	    	        labelAlign: 'right',
	    	        name: 'stopList',
	    	        displayField: 'name',
	    	        valueField: 'value',
	    	        store: {
	    	            fields: ['name', 'value'],
	    	            data: data
	    	        }
	    		}, {width: 10}, {xtype: 'tbspacer'}, {
	    			xtype: 'button',
	    			text: this.localize('editList'),
		            ui: 'default-toolbar',
	    			handler: this.editList,
	    			scope: this
	    		}, {width: 10}, {
	    			xtype: 'checkbox',
	    			name: 'stopListGlobal',
	    			checked: true,
	    			boxLabel: this.localize('applyGlobally')
	    		}]
    	})
        me.callParent(arguments);
    },
    
    editList: function() {
    	var win = this.up('window');
    	var panel = win.panel;
    	var value = this.down('combo').getValue();
    	var corpusId = panel.getApplication && panel.getApplication().getCorpus ? panel.getApplication().getCorpus().getId() : undefined;
    	if (value=='auto' && !corpusId) {
    		Ext.Msg.show({
			    title: this.localize('noEditAutoTitle'),
			    message: this.localize('noEditAutoMessage'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
    		return
    	}
    	Ext.Ajax.request({
    	    url: panel.getTromboneUrl(),
    	    params: {
        		tool: 'resource.KeywordsManager',
    			stopList: value,
    			corpus: corpusId
    	    },
    	    success: function(response){
    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	var keywords = json.keywords.keywords.sort().join("\n");
    			Ext.Msg.show({
	    		    title: this.localize('editStopListTitle'),
	    		    message: this.localize('editStopListMessage'),
	    		    buttons: Ext.Msg.OKCANCEL,
	    		    buttonText: {
	    		        ok: this.localize('ok'),
	    		        cancel: this.localize('cancel')
	    		    },
	    		    icon: Ext.Msg.INFO,
	    		    prompt: true,
	    	        multiline: true,
	    	        value: keywords,
	    	        original: keywords,
	    	        fn: function(btn,value,stoplist) {
	    	        	if (btn=='ok' && stoplist.original!=value) {
	    	        		var combo = this.down('combo')
	    	        		if (Ext.String.trim(value).length==0) {
	    	        			combo.setValue('empty');
	    	        		}
	    	        		else {
	    	        	    	Ext.Ajax.request({
	    	        	    	    url: panel.getTromboneUrl(),
	    	        	    	    params: {
	    	        	        		tool: 'resource.StoredResource',
	    	        	    			storeResource: value,
	    	        	    			corpus: corpusId
	    	        	    	    },
	    	        	    	    combo: combo,
	    	        	    	    success: function(response, req) {
	    	        	    	    	var json = Ext.util.JSON.decode(response.responseText);
	    	        	    	    	var store = req.combo.getStore();
	    	        	    	    	var value = 'keywords-'+json.storedResource.id;
	    	        	    	    	store.add({name: value, value: value});
	    	        	    	    	req.combo.setValue(value)
	    	        	    	    	req.combo.updateLayout()
	    	        	    	    },
	    	        	    	    scope: this
	    	        	    	})
	    	        		}
	    	        	}
	    	        },
	    	        scope: this
    			})
    	    },
    	    scope: this
    	});
    	
//    	$.getJSON( this.up('window').panel.getTromboneUrl(), {
//    		tool: 'resource.KeywordsManager',
//			stopList: this.down('combo').getValue()
//    	}).done(function(data) {
//    		deb
//    		this.unmask();
//    	}).fail(function() {
//    		debugger
//    	})
//		Ext.Msg.show({
//		    title: this.localize('exportDataTitle'),
//		    message: this.localize('exportDataHtmlMessage'),
//		    buttons: Ext.Msg.OK,
//		    icon: Ext.Msg.INFO,
//		    prompt: true,
//	        multiline: true,
//	        value: '',
//	        listeners: {
//	        	render: function() {
//	        		debugger
//	        	}
//	        }
//		});
    }
})