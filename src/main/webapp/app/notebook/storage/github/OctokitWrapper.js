Ext.define("Voyant.notebook.github.OctokitWrapper", {
	extend: "Ext.Base",
	alias: "octokitwrapper",

	octokit: undefined,

	constructor: function(config) {
		const authToken = config.authToken;
		this.octokit = new Octokit({
			auth: authToken,
			userAgent: 'https://github.com/sgsinclair/Voyant'
		});
	},

	getInfoForAuthenticatedUser: function() {
		return this.octokit.users.getAuthenticated();
	},

	getReposForAuthenticatedUser: function(affiliation='owner', page=0, per_page=10) {
		return this.octokit.repos.listForAuthenticatedUser({
			affiliation,
			page,
			per_page
		});
	},

	getReposForUser: function(owner, page=0, per_page=10) {
		return this.octokit.search.repos({
			q: 'user:'+owner,
			page,
			per_page
		})
	},

	searchWithinRepositories: function(query, page=0, per_page=10) {
		console.log(query);
	},

	getRepoContents: function(repoId) {
		let {owner, repo} = this.parseFullName(repoId);
		return this.getBranchSHAs({owner, repo, branch: 'master'}).then(function(resp) {
			return this.getTreeContentsRecursively(resp);
		}.bind(this));
	},

	getTreeContentsRecursively: function(params) {
		return this.octokit.git.getTree({
			owner: params.owner,
			repo: params.repo,
			tree_sha: params.baseTreeSHA,
			recursive: 1,
			headers: {
				'If-None-Match': '' // cache busting
			}
		}).then(function (resp) {
			return {
				...params,
				contents: this.unflattenContents(resp.data.tree),
				truncated: resp.data.truncated
			}
		}.bind(this));
	},

	loadFile: function(repoId, path) {
		let {owner, repo} = this.parseFullName(repoId);
		let ref = 'master';
		return this.octokit.repos.getContents({
			owner, repo, ref, path
		}).then(function(resp) {
			return {
				owner, repo, ref, path,
				sha: resp.data.sha,
				file: atob(resp.data.content)
			}
		}.bind(this));
	},

	// SAVING

	doesRepoExist: function(owner, repo) {
		return this.getRepoContents(owner+'/'+repo).then(function(resp) {
			return true;
		}.bind(this), function(err) {
			console.log(err);
			return false;
		}.bind(this));
	},

	getPermissionsForUser: function(owner, repo, username) {
		return this.octokit.repos.getCollaboratorPermissionLevel({
			owner, repo, username
		}).then(function(resp) {
			return resp.data.permission;
		}.bind(this), function(err) {
			return 'none';
		}.bind(this));
	},

	saveFile: async function(owner, repo, path, content, branch, message, sha) {
		if (sha === undefined) {
			sha = await this.getLatestFileSHA({owner, repo, branch, path})
		}
		return this.octokit.repos.createOrUpdateFile({owner, repo, path, content: btoa(content), branch, message, sha});
	},

	// UTILITIES

	parseFullName: function(fullName) {
		let [owner, repo] = fullName.split('/');
		return {owner, repo};
	},

	getBranchSHAs: function(params) {
		return this.octokit.repos.getBranch({
			owner: params.owner,
			repo: params.repo,
			branch: params.branch,
			headers: {
				'If-None-Match': '' // cache busting
			}
		}).then((resp) => {
			return {
				...params,
				baseTreeSHA: resp.data.commit.commit.tree.sha,
				parentCommitSHA: resp.data.commit.sha
			}
		})
	},

	getLatestFileSHA: async function(params) {
		const {owner, repo, branch, path} = params
		const {data: {data: {repository: {object: result}}}} = await this.octokit.request({
			method: 'POST',
			url: '/graphql',
			query: `{
				repository(owner: "${owner}", name: "${repo}") {
					object(expression: "${branch}:${path}") {
						... on Blob {
							oid
						}
					}
				}
			}`
		}).catch(function(error) {
			console.log(error);
		});
		const sha = result ? result.oid : undefined
		return sha
	},

	unflattenContents: function(flatContents) {
		const files = flatContents.filter(file=>file.type==='blob')
		var result = {type: 'folder', name: '', path: '', contents: []}
		const findSubFolder = (parentFolder, folderNameToFind) => {
			 const subfolder = parentFolder.contents.find(el => {
			 	return el.type === 'folder' && el.name === folderNameToFind
			 })
			return subfolder;
		}
		const addSubFolder = (newFolderName, parentFolder) => {
			const newSubFolder = {type: 'folder', name: newFolderName, path: `${parentFolder.path}/${newFolderName}`, contents:[]}
			parentFolder.contents.push(newSubFolder)
			return newSubFolder;
		}
		const addFile = (newFileName, parentFolder) => {
			const newFile = {type: 'file', name: newFileName, path: `${parentFolder.path}/${newFileName}`}
			parentFolder.contents.push(newFile)
		}
		const isFile = (pathSections, currentIndex) => {
			return pathSections.length - 1 == currentIndex
		}

		files.forEach(file=>{
			const pathSections = file.path.split('/')
			pathSections.reduce(function(parentFolder, pathSection, pathSectionIndex) {
				const subFolder = findSubFolder(parentFolder, pathSection)
				if (subFolder) {
					return subFolder
				} else if (isFile(pathSections, pathSectionIndex)) {
					return addFile(pathSection, parentFolder)
				} else {
					return addSubFolder(pathSection, parentFolder)
				}
			}, result)
		})
		return result
	}
});
