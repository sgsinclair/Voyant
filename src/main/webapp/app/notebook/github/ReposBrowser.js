Ext.define("Voyant.notebook.github.ReposBrowser", {
	extend: "Ext.container.Container",
	xtype: "githubreposbrowser",
	config: {
		repoType: 'owner',
		selectedFileNode: undefined,
		repoId: undefined,
		filePath: undefined
	},

	octokit: undefined,

	constructor: function(config) {
		config = config || {};
		
		this.octokit = config.octokit;

    	this.callParent(arguments);
    },

	initComponent: function() {
		Ext.apply(this, {
			layout: {
				type: 'hbox',
				align: 'stretch',
				pack: 'start'
			},
			defaults: {
				padding: '0 5 5 5'
			},
			items: [{
				layout: {
					type: 'vbox',
					align: 'stretch',
					pack: 'start'
				},
				flex: 1,
				items: [{
					html: '<h3>Search</h3>'
				},{
					layout: {
						type: 'accordion'
					},
					items: [{
						title: 'My Repositories',
						frame: true,
						items: {
							xtype: 'radiogroup',
							fieldLabel: 'Show repositories for which I am',
							labelAlign: 'top',
							layout: 'vbox',
							items: [{
								boxLabel: 'Owner',
								name: 'repoType',
								inputValue: 'owner',
								checked: true
							},{
								boxLabel: 'Collaborator',
								name: 'repoType',
								inputValue: 'collaborator'
							},{
								boxLabel: 'Organization Member',
								name: 'repoType',
								inputValue: 'organization_member'
							}],
							listeners: {
								change: function(field, newValues, oldValue) {
									this.setRepoType(newValues.repoType);
									this.clearTree(true);
									this.octokit.getReposForAuthenticatedUser(this.getRepoType(), 0, 100).then((resp) => {
										this.addReposToTree(resp.data);
									},(error) => {
										console.log(error);
									})
								},
								scope: this
							}
						},
						listeners: {
							expand: function() {
								this.clearTree(true);
								this.octokit.getReposForAuthenticatedUser(this.getRepoType(), 0, 100).then((resp) => {
									this.addReposToTree(resp.data);
								},(error) => {
									console.log(error);
								})
							},
							scope: this
						}
					},{
						title: 'Public Repositories',
						frame: true,
						layout: 'vbox',
						items: [{
							fieldLabel: 'Limit to user or organization',
							labelAlign: 'top',
							xtype: 'textfield'
						},{
							text: 'Search',
							xtype: 'button',
							handler: function(button) {
								let repoOwner = button.prev('textfield').getValue();
								if (repoOwner !== '') {
									this.clearTree(true);
									this.octokit.getReposForUser(repoOwner, 0, 100).then((resp) => {
										this.addReposToTree(resp.data.items);
									},(error) => {
										console.log(error);
									})
								}
							},
							scope: this
						}],
						listeners: {
							expand: function() {
								this.clearTree();
							},
							scope: this
						}
					}]
				}
				// ,{
				// 	padding: '20 0 0 0',
				// 	items: [{
				// 		fieldLabel: 'Search within repositories',
				// 		labelAlign: 'top',
				// 		xtype: 'textfield'
				// 	},{
				// 		xtype: 'button',
				// 		text: 'Search',
				// 		margin: '0 5 0 0',
				// 		handler: function(button) {
				// 			let query = button.prev('textfield').getValue();
				// 			if (query !== '') {
				// 				this.searchWithinRepositories(query);
				// 			}
				// 		},
				// 		scope: this
				// 	},{
				// 		xtype: 'button',
				// 		text: 'Clear',
				// 		handler: function(button) {
							
				// 		},
				// 		scope: this
				// 	}]
				// }
				]
			},{
				flex: 2,
				layout: {
					type: 'vbox',
					align: 'stretch',
					pack: 'start'
				},
				items: [{
					html: '<h3>Results</h3>'
				},{
					xtype: 'treepanel',
					itemId: 'repoTree',
					flex: 1,
					scrollable: true,
					rootVisible: false,
					viewConfig: {
						emptyText: 'No results',
						listeners: {
							afteritemexpand: function(node, index, el) {
								if (node.hasChildNodes() === false) {
									switch(node.data.type) {
										case 'repo':
											let tr = el.querySelector('tr');
											Ext.fly(tr).addCls('x-grid-tree-loading');
											this.octokit.getRepoContents(node.getId()).then(function(resp) {
												Ext.fly(tr).removeCls('x-grid-tree-loading');
												this.addRepoContentsToNode(node, resp);
											}.bind(this))
											break;
										case 'folder':
											break;
									}
								}
							},
							itemclick: function(view, node, el) {
								if (node.data.type === 'file') {
									this.setSelectedFileNode(node);
									this.fireEvent('fileNodeSelected', this, node);
								}
							},
							scope: this
						}
					},
					store: {
						root: {
							name: 'Root',
							children: []
						}
					}
				}]
			}],
			listeners: {
				boxready: function() {
					this.down('#repoTree').setLoading(true);
					this.octokit.getReposForAuthenticatedUser(this.getRepoType(), 0, 100).then((resp) => {
						this.addReposToTree(resp.data);
					},(error) => {
						console.log(error);
					})
				}
			}
		});
		this.callParent(arguments);
	},

	updateSelectedFileNode: function(node, oldValue) {
		if (node !== undefined) {
			let repoParent = node.parentNode;
			while (repoParent !== null && repoParent.data.type !== 'repo') {
				repoParent = repoParent.parentNode;
			}

			this.setRepoId(repoParent.getId());
			this.setFilePath(node.getId());
		} else {
			this.setRepoId(undefined);
			this.setFilePath(undefined);
		}
	},

	clearTree: function(setLoading) {
		let repoTree = this.down('#repoTree');
		let root = repoTree.getRootNode();
		root.removeAll();
		repoTree.getView().refresh();

		if (setLoading) {
			repoTree.setLoading(true);
		}

		this.setSelectedFileNode(undefined);
		this.fireEvent('fileNodeDeselected', this);
	},

	addReposToTree: function(rawRepos) {
		let repoTree = this.down('#repoTree');
		repoTree.setLoading(false);
		let root = repoTree.getRootNode();
		let repos = rawRepos.map((repo) => {
			return {
				id: repo.full_name,
				text: repo.full_name,
				description: repo.description,
				leaf: false,
				type: 'repo'
			}
		});
		root.appendChild(repos);
	},

	addRepoContentsToNode: function(node, octokitResponse) {
		function parseContents(content) {
			let nodeConfig = {
				id: content.path,
				text: content.name,
				type: content.type,
				leaf: content.type === 'file'
			};
			if (nodeConfig.leaf === false) {
				nodeConfig.children = [];
				content.contents.forEach((child) => {
					nodeConfig.children.push(parseContents(child));
				})
			}
			return nodeConfig;
		}
		let contents = parseContents(octokitResponse.contents);
		node.appendChild(contents.children);
	}
})