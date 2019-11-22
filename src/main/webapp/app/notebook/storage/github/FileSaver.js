Ext.define("Voyant.notebook.github.FileSaver", {
	extend: "Ext.container.Container",
	xtype: "githubfilesaver",
	config: {
		currentFile: undefined,
		username: undefined
	},

	octokit: undefined,
	saveData: undefined,

	constructor: function(config) {
		config = config || {};
		
		this.octokit = config.octokit;
		this.saveData = config.saveData;

		this.setCurrentFile(config.currentFile);

    	this.callParent(arguments);
    },

	initComponent: function() {
		Ext.apply(this, {
			layout: {
				type: 'vbox',
				pack: 'start',
				align: 'stretch'
			},
			items: [{
				xtype: 'githubreposbrowser',
				octokit: this.octokit,
				itemId: 'repoBrowser',
				flex: 1,
				listeners: {
					nodeSelected: function(src, type, node) {
						const form = this.queryById('saveForm').getForm();
						const [owner, repo] = src.getRepoId().split('/');
						form.setValues({owner, repo});
						if (type === 'file') {
							const pathComponents = this.getPathComponents(src.getPath());
							form.setValues({...pathComponents});
						} else if (type === 'folder') {
							const folder = src.getPath().replace(/^\//, '');
							form.setValues({folder, file: ''});
						} else if (type === 'repo') {
							form.setValues({folder: '', file: ''});
						}
					},
					nodeDeselected: function(node) {
						// loadWin.queryById('load').setDisabled(true);
					},
					scope: this
				}
			},{
				bodyPadding: '10',
				height: 200,
				layout: {
					type: 'vbox',
					pack: 'start'
				},
				xtype: 'form',
				itemId: 'saveForm',
				items: [{
					html: '<span class="x-panel-header-title-default">Repository Path</span>'
				},{
					xtype: 'container',
					layout: 'hbox',
					defaults: {
						xtype: 'textfield',
						labelAlign: 'top'
					},
					items: [{
						fieldLabel: 'GitHub User',
						name: 'owner',
						allowBlank: false,
						margin: '0 10 0 0'
					},{
						fieldLabel: 'Repository Name',
						allowBlank: false,
						name: 'repo'
					}]
				},{
					html: '<span class="x-panel-header-title-default">File Path</span>',
					margin: '10 0 0 0',
				},{
					xtype: 'container',
					layout: 'hbox',
					defaults: {
						xtype: 'textfield',
						labelAlign: 'top'
					},
					items: [{
						fieldLabel: 'Folder(s)',
						name: 'folder',
						allowBlank: true,
						margin: '0 10 0 0'
					},{
						fieldLabel: 'File Name',
						allowBlank: false,
						name: 'file'
					}]
				},{
					/*
					xtype: 'container',
					width: '100%',
					layout: {
						type: 'hbox',
						align: 'middle',
						pack: 'start'
					},
					margin: '25 0 0 0',
					defaults: {
						xtype: 'button'
					},
					items: [{
						text: 'Save',
						handler: function () {
							this.doSave(false);
						},
						scope: this,
						margin: '0 10 0 0'
					}
					// ,{
					// 	text: 'Save as Pull Request',
					// 	handler: function () {
					// 		this.doSave(true);
					// 	},
					// 	scope: this
					// }
					]
				},{
					*/
					itemId: 'status',
					html: '',
					margin: '15 0 0 0'
				}],
				listeners: {
					validitychange: function(form, valid) {
						this.fireEvent('formValidityChange', this, valid);
					},
					scope: this
				}
			}],
			listeners: {
				boxready: function() {
					this.initForm();
				},
				scope: this
			}
		});

		this.callParent(arguments);
	},

	initForm: function() {
		this.octokit.getInfoForAuthenticatedUser().then(function(resp) {
			const username = resp.data.login;
			this.setUsername(username);

			const form = this.queryById('saveForm').getForm();
			const currentFile = this.getCurrentFile();			
			if (currentFile !== undefined) {
				const pathComponents = this.getPathComponents(currentFile.path);
				form.setValues({
					owner: currentFile.owner,
					repo: currentFile.repo,
					...pathComponents
				});
			} else {
				form.setValues({owner: username});
			}
		}.bind(this))
	},

	getPathComponents: function(path) {
		const pathComponents = path.split('/');
		let file = pathComponents[pathComponents.length-1];
		let folder = '';
		if (pathComponents.length > 2) {
			folder = pathComponents.slice(0, -1).join('/');
		}
		return {
			folder,
			file
		}
	},

	doSave: async function(isPR=false) {
		const form = this.queryById('saveForm').getForm();
		if (form.isValid()) {
			const {owner, repo, folder, file} = form.getValues();
			let path = file;
			if (folder !== '') {
				path = folder+'/'+file;
			}
			this.setStatus('Checking repository');
			const repoExists = await this.octokit.doesRepoExist(owner, repo);
			if (repoExists) {
				this.setStatus('Checking permissions');
				const permission = await this.octokit.getPermissionsForUser(owner, repo, this.getUsername());
				if (permission === 'none' || permission === 'read') {
					this.setStatus('You don\'t have permission to write to this repository', 'error');
				} else {
					this.setStatus('Checking file');
					const branch = 'master';
					const content = this.saveData;
					const fileData = {owner, repo, branch, path};
					const sha = await this.octokit.getLatestFileSHA(fileData);
					if (sha !== undefined) {
						const message = 'File updated by Spyral';
						this.octokit.saveFile(owner, repo, path, content, branch, message, sha).then(function(resp) {
							this.setStatus('File updated');
							setTimeout(function() {
								this.fireEvent('fileSaved', this, fileData);
							}.bind(this), 500);
						}.bind(this), function(error) {
							this.setStatus('Error: '+error.message, 'error');
						});
					} else {
						const message = 'File created by Spyral';
						this.octokit.saveFile(owner, repo, path, content, branch, message).then(function(resp) {
							this.setStatus('File created');
							setTimeout(function() {
								this.fireEvent('fileSaved', this, fileData);
							}.bind(this), 500);
						}.bind(this), function(error) {
							this.setStatus('Error: '+error.message, 'error');
						});
					}
				}
			} else {
				this.setStatus('The specified repository does not exist', 'error');
			}
		} else {
			this.setStatus('Form is not valid', 'error');
		}
	},

	setStatus: function(message, type) {
		let cls = '';
		if (type && type === 'error') {
			cls = 'x-form-invalid-under-default';
		}
		this.queryById('status').setHtml(`<span class="${cls}">${message}</span>`);
	}
});
