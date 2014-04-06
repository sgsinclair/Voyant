Ext.define('Voyant.utils.Documenter', {
	statics: {
		members: {},
		loadDocumentationClasses: function(classes) {
			for (var i=0; i<classes.length;i++) {
				
				var cls = classes[i];
				// pre-load corpus
				Ext.Ajax.request({
					url: '../docs/output/json/'+cls+'.json',
					params: {cls: cls},
					failure: function(response, opts) {
						//showError("Unable to load documentation",response.responseText);
					},
					success: function(response, opts) {
				//		var jsonString = response.responseText.substring(response.responseText.indexOf("(")+1, response.responseText.length-2);
						var json = Ext.decode(response.responseText);
						if (json && json.members) {
							for (var i=0, len=json.members.length; i<len; i++) {
								json.members[i].memberOf = json.name; // point to parent, in addition to "owner"
								if (!Voyant.utils.Documenter.members[json.members[i].name] || !Ext.isArray(Voyant.utils.Documenter.members[json.members[i].name])) {
									Voyant.utils.Documenter.members[json.members[i].name] = [json.members[i]];
								}
								else {
									Voyant.utils.Documenter.members[json.members[i].name].push(json.members[i]);
								}
							}
						}
						if (!Voyant.utils.Documenter.members[opts.params.cls]) {
							Voyant.utils.Documenter.members[opts.params.cls] = [json];
						}
						else {
							Voyant.utils.Documenter.members[opts.params.cls].push(json);
						}
					}
				})				
			}
		}
	},
	editor: null,
	setEditor: function(editor) {this.editor=editor;},
	
	handleAceEditorTokenizerUpdateData: function(editor, target, data) {
		var pos = editor.getCursorPosition();
		var token = editor.session.getTokenAt(pos.row,pos.column);
		var members = [];
		if (token && token.type=='identifier') {
			if (Voyant.utils.Documenter.members[token.value]) {
				members.push(token.value);
				if (token.value=='Corpus') { // check to see if we have new keyword
					var newFound = false;
					var tokens = editor.session.getTokens(pos.row);
					for (var i=token.index-1; i>-1; i--) {
						if (tokens[i].type=='keyword' && tokens[i].value=='new') {newFound=true; break}
						var isSpace = tokens[i].type=='text' && Ext.isEmpty(tokens[i].value.trim());
						if (!isSpace) {break;}
					}
					if (!newFound) {
						console.warn(pos.row, token.start, pos.row+1, token.start+token.value.length)
						var annotations = editor.session.getAnnotations();
						var range = new Range(pos.row, token.start, pos.row, token.start+token.value.length-1)
						editor.session.addMarker(range, "ace_error"); 
						editor.session.setAnnotations([{
			                row: pos.row,
			                column: pos.column,
			                text: 'To create a new Corpus use the "new" keyword: new Corpus()',
			                type: 'error',
			                raw: 'To create a new Corpus use the "new" keyword: new Corpus()'
						}])
					}
				}
			}
			else if (this.membersLookupCache && this.membersLookupCache[token.value]) {
				members = this.membersLookupCache[token.value];
			}
			else {
				for (member in Voyant.utils.Documenter.members) {
					if (member.indexOf(token.value)==0) {
						members.push(member)
					}
				}
				// keep this looup for next time
				if (!this.membersLookupCache) {this.membersLookupCache = {};}
				this.membersLookupCache[token.value] = members;
			}
		}
		else if (token && token.type=='punctuation.operator' && token.value=='.') {
			var m = this.getPreviousIdentifier(editor.session, pos, token);
			if (m!==false && m.value && Voyant.utils.Documenter.members[m.value]) {members.push(m.value)}
		}
		if (members.length>0) {
			this.showDocumentation(members)
		}
	},
	
	getPreviousIdentifier: function(session, pos, token) {
		var paren = 0;
		for (var i=pos.row; i>-1; i--) {
			var tokens = session.getTokens(i);
			for (var j=(i==pos.row ? token.index-1 : tokens.length-1);j>-1;j--) {
				if (tokens[j].type=='identifier' && paren==0) {
					return tokens[j];
				}
				else if (tokens[j].type=='paren.rparen') {
					paren++;
				}
				else if (tokens[j].type=='paren.lparen') {
					paren--;
				}
			}
		}
		return false;
	},

	showDocumentation: function(memberNames) {
		
		var currentMembersCache = memberNames.join(";");

		// bail if this is the currently displayed docs
		if (this.currentMembersCache && this.currentMembersCache==currentMembersCache) {return true}
		
		this.currentMembersCache = currentMembersCache;
		
		// try to find the docs in the cache
		if (Voyant.utils.Documenter.cachedDocs && Voyant.utils.Documenter.cachedDocs[currentMembersCache]) {
			this.getEl().down(".container-docs ").update(Voyant.utils.Documenter.cachedDocs[currentMembersCache]);
			return true;
		}
		
		// nope, proceed
		if (memberNames) {
			
			// first organize members by owners
			var owners = {};
			var membersHash = {};
			for (var i=0, len=memberNames.length; i<len; i++) {
				membersHash[memberNames[i]] = true;
				var membersArray = Voyant.utils.Documenter.members[memberNames[i]];
				for (var j=0; j<membersArray.length; j++) {
					var member = membersArray[j];
					if (member.tagname=='class') {
						if (!owners[member.name]) {owners[member.name]=[member]}
						else {owners[member.name].push(member);}
					}
					else if (member.tagname=='method' || member.tagname=='cfg') {
						var owned = member.memberOf ? member.memberOf : member.owner;
						if (!owners[owned]) {owners[owned]=[member]}
						else {owners[owned].push(member);}
					}
				}
			}

			// now output 
			var out = "<ul>";
			for (var owner in owners) {
				var cls = Voyant.utils.Documenter.members[owner] ? Voyant.utils.Documenter.members[owner][0] : undefined;
				out+="<li>";
				if (membersHash[owner] && owner=='Corpus') {out+="<span class='keyword'>new<span> ";}
				out+=Ext.DomHelper.createHtml({tag: 'a', href: '../docs/index.html#/api/'+owner, target: 'voyant-docs', cls: 'class', 'data-qtip': cls.short_doc, html: owner});
				// check for a documented constructor
				if (membersHash[owner] && cls && cls.members) {
					for (var i=0, len=cls.members.length; i<len; i++) {
						if (cls.members[i].tagname=='method' && cls.members[i].name=='constructor' && !Ext.isEmpty(cls.members[i].doc.trim())) {
							out+=this.getMethodParamDocs(cls.members[i]);
							break;
						}
					}
				}
				out+="<ul>";
				for (var i=0, len=owners[owner].length; i<len; i++) {
					var o = owners[owner][i];
					if (o.tagname=='method' || o.tagname=='cfg') {
						if (o.name!='constructor') {out+=this.getMemberDocs(o, owner);}
					}
					else if (o.tagname=='class') {
						for (var j=0;j<o.members.length;j++) {
							if (o.members[j].tagname=='method' && o.members[j].name!='constructor') {
								out+=this.getMemberDocs(o.members[j], owner);						
							}
						}
					}
					out+="</li>";
				}
				out+="</ul></li>"
			}
			out += "</ul>";
			this.getEl().down(".container-docs ").update(out);
			
			if (!Voyant.utils.Documenter.cachedDocs) {Voyant.utils.Documenter.cachedDocs = {}}
			Voyant.utils.Documenter.cachedDocs[currentMembersCache] = out;
		}
		
		/*	
		if (classes) {
			var out = "<ul>";
			if (Ext.isString(classes)) {classes = [classes];}
			for (var i=0;i<classes.length;i++) {
				var clz = this.cachedClasses[classes[i]];
				if (!clz.summary) {
					var dom = Ext.DomHelper.createContextualFragment(this.cachedClasses[classes[i]].html);
					var summary = "<li class='"+clz.tagname+"'>"+classes[i];
					if (clz.members.method.length>0) {
						summary+="<ul>";
						for (var j=0;j<clz.members.method.length;j++) {
							var method = Ext.DomQuery.selectNode("#method-"+clz.members.method[j].name, dom);
							var title = Ext.DomQuery.selectNode(".title", method);
							var description = Ext.DomQuery.selectNode(".long", method);
							var el = Ext.DomHelper.createDom({tag: 'li', cls: clz.members.method[j].tagname, qtip: description.innerHTML})
							summary+="<li class='"+clz.members.method[j].tagname+"'>"+title.innerHTML+"</li>";
						}
						summary+="</ul>";
					}
					summary+="</li>";
					this.cachedClasses[classes[i]].summary = summary;
				}
				out+=this.cachedClasses[classes[i]].summary;
			}
		}
		*/
	},
	
	getMethodReturnDocs: function(member) {
		return member['return'] ? Ext.DomHelper.createHtml({tag: 'span', cls: 'return', 'data-qtip': this.getNormalizedDoc(member['return'].doc), html: member['return'].type}) : '';
	},
	
	getMethodParamDocs: function(member) {
		var out='(';
		if (member.params) {
			
			// first filter out non-documented params
			var params = [];
			for (var j=0;j<member.params.length;j++) {
				if (member.params[j].doc && !Ext.isEmpty(member.params[j].doc.trim())) {
					params.push(member.params[j]);
				}
			}
			
			for (var j=0;j<params.length;j++) {
				out+=Ext.DomHelper.createHtml({tag: 'span', cls: params[j].tagname, 'data-qtip': this.getNormalizedDoc(params[j].doc), html: params[j].name})
				if (j+1<params.length) {out+='<span class="comma">,</span> '}
			}

		}
		return out+ ')';
	},
	
	getMethodSignatureDocs : function(member) {
		var r = this.getMethodReturnDocs(member);
		return this.getMethodParamDocs(member) + (r ? ' : '+r : '');
	},
	
	getMemberDocs: function(member, cls) {
		if (Ext.isEmpty(member.doc.trim())) {return '';}
		var out ="<li>"+Ext.DomHelper.createHtml({tag: 'a', href: '../docs/index.html#/api/'+cls+'-'+member.id, target: 'voyant-docs', cls: member.tagname, 'data-qtip': this.getNormalizedDoc(member.doc), html: member.name});
		if (member.tagname=='method') {
			out+=this.getMethodSignatureDocs(member);
		}
		return out+"</li>";
	},
	
	getNormalizedDoc: function(doc) {
		return doc.replace(/<\/?a\b.*?>/i,'');
	}
	
	
	
});

Voyant.utils.Documenter.loadDocumentationClasses(['Corpus']);

/*


		return;
		var newClass = null;
		debugger
		if (data) {
			for (var i=data.data.first; i<data.data.last+1; i++) {
				var tokens = editor.session.getTokens(i);
				var currentIdentifier = null;
				var currentEqualityIdentifier = null;
				var currentCompoundIdentifier = [];
				var objects = {};
				for (var j=0;j<tokens.length;j++) {
					var token = tokens[j];
					switch(token.type) {
						case 'identifier':
							currentIdentifier = token.value;
							if (currentCompoundIdentifier.length>0 && tokens[j-1] && tokens[j-1].value=='.') {
								currentCompoundIdentifier.push(currentIdentifier);
							}
							break;
						case 'keyword.operator':
							if (token.value=='=' && currentIdentifier) {
								currentEqualityIdentifier = currentIdentifier;
							}
							break;
						case 'punctuation.operator':
							if (currentIdentifier && tokens[j-1] && tokens[j-1].type=='identifier') {
								currentCompoundIdentifier.push(tokens[j-1])
							}
							break;
					}					
				}
				debugger
			}
			return
			var pos = editor.getCursorPosition();
			var token = editor.session.getTokenAt(data.data.range.end.row,data.data.range.end.column);
			console.warn(data, token);
			if (token && token.type=='identifier') {
				var classes = [];
				for (member in window) {
					if (member.indexOf(token.value)==0 && window[member].$className) {
						classes.push(window[member].$className);
					}
				}
				console.warn(token, classes)
			}
		}
		else {
			newClass = 'Corpus';
		}
		if (newClass && this.currentClass!=newClass) {
			this.currentClass = newClass;
			if (this.cachedClasses[newClass]) {
				this.showDocumentation(newClass);
			}
			else {
				var t = "test";
				Ext.Ajax.request({
					url: '../docs/output/'+newClass+'.js',
					failure: function(response, opts) {
						//showError("Unable to load documentation",response.responseText);
					},
					success: function(response, opts) {
						var jsonString = response.responseText.substring(response.responseText.indexOf("(")+1, response.responseText.length-2);
						var json = Ext.decode(jsonString);
						this.cachedClasses[json.name] = json;
						this.showDocumentation(json.name);
					}
					,scope: this
				})
			}
		}
*/