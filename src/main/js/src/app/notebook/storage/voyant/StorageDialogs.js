Ext.define("Voyant.notebook.StorageDialogs", {
	extend: "Ext.Component",
	requires: [],
	alias: "",
	config: {
		accessCode: undefined
	},

	constructor: function(config) {
		config = config || {};
    	this.callParent(arguments);
    },

	initComponent: function() {
		this.callParent(arguments);
	},
	
	showSave: function(data, metadata, notebookId='') {
		const me = this;
		const newNotebook = notebookId === '';
		const title = newNotebook ? 'Save New Notebook' : 'Overwrite Existing Notebook';
		Ext.create('Ext.window.Window', {
			title: title,
			items: [{
				xtype: 'form',
				width: 450,
				bodyPadding: 5,
				plugins: ['datatip'],
				listeners: {
					beforeshowtip: function(tip, config, msg) {
						return !config.currentTarget.el.hasCls('x-form-invalid'); // don't show tooltip if the field is invalid because otherwise the two tips overlap
					}
				},
				layout: 'anchor',
				defaults: {
					labelAlign: 'right',
					labelWidth: 160,
					width: 360,
					inputAttrTpl: 'spellcheck="false"',
					xtype: 'textfield'
				},
    	    	items: [{
					fieldLabel: 'Notebook ID' + (newNotebook ? ' (optional)' : ''),
					name: 'notebookId',
					value: notebookId,
					allowBlank: true,
					readOnly: !newNotebook,
					tooltip: 'An ID used to identify this notebook. If left blank, one will be generated for you.',
					validator: function(val) {
						if (val == '') {
							return true;
						} else if (val.match(/^[\w-]{4,16}$/) === null) {
							return 'The ID must be between 4 and 16 alphanumeric characters.'
						} else {
							return true;
						}
					}
				},{
					fieldLabel: 'Access Code',
					name: 'accessCode',
					allowBlank: false,
					value: newNotebook ? this.generateAccessCode() : this.getAccessCode(),
					tooltip: 'The Access Code is required to overwrite this notebook.',
					validator: function(val) {
						if (val.match(/^[\w-]{4,16}$/) === null) {
							return 'The access code must be between 4 and 16 alphanumeric characters.'
						} else {
							return true;
						}
					}
				},{
					fieldLabel: 'Email (optional)',
					name: 'email',
					allowBlank: true,
					vtype: 'email',
					hidden: !newNotebook,
					tooltip: 'An email will be sent to this address with the Notebook URL and Access Code.'
				}]
			}],
			buttons: [{
    	        text: 'Cancel',
	            ui: 'default-toolbar',
    	        handler: function() {
    	            this.up('window').close();
					me.fireEvent('saveCancelled', me);
    	        }
    	    }, " ", {
    	        text: 'Save',
    	        handler: function(button) {
					const win = button.up('window');
					const form = win.down('form').getForm();
					if (form.isValid()) {
						const values = form.getValues();
						values.data = data;
						values.metadata = metadata;
						if (newNotebook && values.notebookId !== '') {
							me.doesNotebookIdExist(values.notebookId).then(function(exists) {
								if (exists) {
									form.findField('notebookId').markInvalid('That Notebook ID already exists.');
								} else {
									me.doSave(values);
									win.close();
								}
							});
						} else {
							button.setDisabled(true);
							me.doSave(values).then(function(didSave) {
								button.setDisabled(false);
								if (didSave) {
									win.close();
								} else {
									form.findField('accessCode').markInvalid('Invalid access code.');
								}
							});
						}
					}
    	        }
			}],
			listeners: {
				close: function() {
					me.fireEvent('close', me); // need an additional close event in case the user uses the close tool / esc button
				}
			}
		}).show();
	},

	doesNotebookIdExist: function(id) {
		const dfd = new Ext.Deferred();

		Spyral.Load.trombone({
			tool: 'notebook.GitNotebookManager',
			action: 'exists',
			id: id,
			noCache: 1
		}).then(function(json) {
			var exists = json.notebook.data === 'true';
			dfd.resolve(exists);
		}).catch(function(err) {
			console.log(err);
		});

		return dfd.promise;
	},

	doSave: function({notebookId, accessCode, email, data, metadata}) {
		const me = this;
		metadata.id = notebookId;

		return Spyral.Load.trombone({
			tool: 'notebook.GitNotebookManager',
			action: 'save',
			id: notebookId,
			accessCode: accessCode,
			email: email,
			data: data,
			metadata: JSON.stringify(metadata)
		}).then(function(json) {
			if (json.notebook.data !== 'true') {
				return false;
			} else {
				me.setAccessCode(accessCode);
				const notebookId = json.notebook.id;
				me.fireEvent('fileSaved', me, notebookId);
				return true;
			}
		}).catch(function(err) {
			me.fireEvent('fileSaved', me, null);
			return false;
		});
	},

	generateAccessCode: function() {
		const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
		let code = '';
		while (code.length < 6) {
			if (Math.random() < .3) {
				code += Math.floor(Math.random()*9);
			} else {
				let letter = alphabet[Math.floor(Math.random()*alphabet.length)];
				if (Math.random() < .5) {
					letter = letter.toUpperCase();
				}
				code += letter;
			}
		}
		return code;
	},

	reset: function() {
		this.setAccessCode(undefined);
	}
})