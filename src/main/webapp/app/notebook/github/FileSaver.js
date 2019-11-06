Ext.define("Voyant.notebook.github.FileSaver", {
	extend: "Ext.form.Panel",
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
			bodyPadding: '0 10 10 10',
			layout: {
				type: 'vbox',
				pack: 'start'
			},
			items: [{
				html: '<h3>Repository Path</h3>'
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
				html: '<h3>File Path</h3>',
				margin: '15 0 0 0',
			},{
				xtype: 'textfield',
				allowBlank: false,
				name: 'path',
				width: 352
			},{
				html: '<span class="x-form-item-label-default">The file (and folder) path to which to save (e.g. french/basque/SaintSauveur.html)</span>'
			},{
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
				itemId: 'status',
				html: '',
				margin: '15 0 0 0'
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

			const currentFile = this.getCurrentFile();
			if (currentFile !== undefined) {
				this.getForm().setValues({
					owner: currentFile.owner,
					repo: currentFile.repo,
					path: currentFile.path.replace(/^\//, '')
				});
			} else {
				this.getForm().setValues({owner: username});
			}
		}.bind(this))
	},

	doSave: async function(isPR) {
		const form = this.getForm();
		if (form.isValid()) {
			const {owner, repo, path} = form.getValues();
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
					const sha = await this.octokit.getLatestFileSHA({owner, repo, branch, path});
					if (sha !== undefined) {
						const message = 'File updated by Spyral';
						this.octokit.saveFile(owner, repo, path, content, branch, message, sha).then(function(resp) {
							this.setStatus('File updated');
							setTimeout(function() {
								this.fireEvent('fileSaved', this);
							}.bind(this), 500);
						}.bind(this), function(error) {
							this.setStatus('Error: '+error.message, 'error');
						});
					} else {
						const message = 'File created by Spyral';
						this.octokit.saveFile(owner, repo, path, content, branch, message).then(function(resp) {
							this.setStatus('File created');
							setTimeout(function() {
								this.fireEvent('fileSaved', this);
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
