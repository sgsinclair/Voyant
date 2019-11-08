Ext.define("Voyant.notebook.github.GitHubDialogs", {
	extend: "Ext.Component",
	requires: ['Voyant.notebook.github.OctokitWrapper','Voyant.notebook.github.ReposBrowser','Voyant.notebook.github.FileSaver'],
	alias: "widget.githubdialogs",
	config: {
		repoType: 'owner',
		currentFile: undefined
	},

	authToken: undefined,
	octokitWrapper: undefined,

	currentWindow: undefined,

	constructor: function(config) {
		config = config || {};
    	this.callParent(arguments);
    },

	initComponent: function() {
		this.callParent(arguments);
	},

	close: function() {
		if (this.currentWindow !== undefined) {
			this.currentWindow.close();
			this.currentWindow = undefined;
		}
	},

	showAuthenticate: function(callback) {
		const parent = this;

		let authWin = undefined;
		authWin = Ext.create('Ext.window.Window', {
			title: 'Authenticate with GitHub',
			width: 750,
			height: 550,
			closable: false,
			layout: {
				type: 'vbox',
				align: 'middle',
				pack: 'center'
			},
			items: [{
				html: '<div style="margin-bottom: 10px;">You must authorize Spyral to use GitHub on your behalf.</div>'
			},{
				xtype: 'button',
				text: 'Authorize with GitHub',
				handler: function(button) {
					function postMessageHandler(event) {
						if (event.origin === window.location.origin && event.data === 'oauth_cookie_set') {
							window.removeEventListener("message", postMessageHandler, false);
							event.source.close();
							parent.initOctokitWrapper();
							button.up('window').close();
							callback.call(parent);
						}
					}
					window.open(Voyant.application.getBaseUrlFull()+'spyral/oauth', '_blank');
					window.addEventListener("message", postMessageHandler, false);
				}
			}],
			buttons: [{
				text: 'Cancel',
				handler: function() {
					parent.close();
				}
			}]
		});
		authWin.show();

		this.currentWindow = authWin;
	},

	showLoad: function() {
		const parent = this;

		this.authToken = this.getCookieValue('access-token');
		if (this.authToken === '') {
			this.showAuthenticate(this.showLoad);
			return;
		} else if (this.octokitWrapper === undefined) {
			this.initOctokitWrapper();
		}

		let loadWin = undefined;
		loadWin = Ext.create('Ext.window.Window', {
			title: 'Load from GitHub',
			width: 750,
			height: 550,
			closable: false,
			maximizable: true,
			layout: 'fit',
			items: {
				xtype: 'githubreposbrowser',
				octokit: this.octokitWrapper,
				itemId: 'repoBrowser',
				listeners: {
					nodeSelected: function(src, type, node) {
						if (type === 'file') {
							loadWin.queryById('load').setDisabled(false);
						} else {
							loadWin.queryById('load').setDisabled(true);	
						}
					},
					nodeDeselected: function(node) {
						loadWin.queryById('load').setDisabled(true);
					}
				}
			},
			buttons: [{
				text: 'Load Selected',
				itemId: 'load',
				disabled: true,
				handler: function() {
					const repoBrowser = loadWin.queryById('repoBrowser');
					this.loadFile(repoBrowser.getRepoId(), repoBrowser.getPath());
				},
				scope: this
			},{
				text: 'Cancel',
				handler: function() {
					parent.close();
				}
			}]
		});
		loadWin.show();

		this.currentWindow = loadWin;
	},

	showSave: function(data) {
		const parent = this;

		this.authToken = this.getCookieValue('access-token');
		if (this.authToken === '') {
			this.showAuthenticate();
			return;
		} else if (this.octokitWrapper === undefined) {
			this.initOctokitWrapper();
		}

		let saveWin = undefined;
		saveWin = Ext.create('Ext.window.Window', {
			title: 'Save to GitHub',
			width: 750,
			height: 650,
			closable: false,
			maximizable: true,
			layout: 'fit',
			items: {
				xtype: 'githubfilesaver',
				octokit: this.octokitWrapper,
				currentFile: this.getCurrentFile(),
				saveData: data,
				itemId: 'fileSaver',
				listeners: {
					formValidityChange: function(src, valid) {
						saveWin.queryById('save').setDisabled(!valid);
					},
					fileSaved: function(src, fileData) {
						parent.fireEvent('fileSaved', parent, fileData);
					}
				}
			},
			buttons: [{
				text: 'Save',
				itemId: 'save',
				disabled: true,
				handler: function() {
					saveWin.queryById('fileSaver').doSave();
				},
				scope: this
			},{
				text: 'Cancel',
				handler: function() {
					parent.close();
					parent.fireEvent('saveCancelled', parent);
				}
			}]
		});
		saveWin.show();

		this.currentWindow = saveWin;
	},

	getCookieValue: function(cookieName) {
		const re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');
		const sMatch = (' '+document.cookie).match(re);
		if (cookieName && sMatch) return unescape(sMatch[1]);
		return '';
	},

	initOctokitWrapper: function() {
		this.authToken = this.getCookieValue('access-token');
		this.octokitWrapper = new Voyant.notebook.github.OctokitWrapper({
			authToken: this.authToken
		});
	},

	loadFileFromId: function(id) {
		const parts = decodeURIComponent(id).split('/');
		if (parts.length >= 3) {
			const repoId = parts[0]+'/'+parts[1];
			const filePath = parts.slice(2).join('/');
			this.loadFile(repoId, filePath);
		}
	},

	loadFile: function(repoId, filePath) {
		this.authToken = this.getCookieValue('access-token');
		if (this.authToken === '') {
			this.showAuthenticate(this.loadFile.bind(this, repoId, filePath));
			return;
		} else if (this.octokitWrapper === undefined) {
			this.initOctokitWrapper();
		}
		this.octokitWrapper.loadFile(repoId, filePath).then((data) => {
			this.setCurrentFile(data);
			this.fireEvent('fileLoaded', this, data);
		});
	}
})
