Ext.define('Voyant.util.Storage', {
	MAX_LENGTH: 950000, // keep it under 1 megabyte
	
	storeResource: function(id, data) {
		var dataString = Ext.encode(data);
		
		if (dataString.length > this.MAX_LENGTH) {
			// split into chunks
			var dfd = new Ext.Deferred();
			
			var numChunks = Math.ceil(dataString.length / this.MAX_LENGTH);
			
			var chunkIds = [];
			for (var i = 0; i < numChunks; i++) {
				chunkIds.push(id+'-chunk'+i);
			}
			this._doStore(id+'-hasChunks', Ext.encode(chunkIds)).then(function() {
				var chunkCount = 0;
				var currIndex = 0;
				for (var i = 0; i < numChunks; i++) {
					var chunkString = dataString.substr(currIndex, this.MAX_LENGTH);
					
					this._doStore(chunkIds[i], chunkString).then(function() {
						chunkCount++;
						if (chunkCount == numChunks) {
							dfd.resolve();
						}
					}, function() {
						dfd.reject();
					}, null, this);
					
					currIndex += this.MAX_LENGTH;
				}
			}, function() {
				dfd.reject();
			}, null, this);
			
			return dfd.promise;
		} else {
			return this._doStore(id, dataString);
		}
	},
	
	_doStore: function(id, dataString) {
		var dfd = new Ext.Deferred();
		Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: {
                tool: 'resource.StoredResource',
                resourceId: id,
                storeResource: dataString
            }
        }).then(function(response) {
            dfd.resolve();
        }, function(response) {
            dfd.reject();
        });
		
		return dfd.promise;
	},
	
	getStoredResource: function(id) {
		var dfd = new Ext.Deferred();
		
		Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: {
                tool: 'resource.StoredResource',
                verifyResourceId: id+'-hasChunks'
            }
        }).then(function(response) {
        	var json = Ext.decode(response.responseText);
        	if (json && json.storedResource && json.storedResource.id && json.storedResource.id != '') {
            	// chunks
            	this._doGetStored(json.storedResource.id, false).then(function(chunkIds) {
            		var fullData = '';
                    var dataChunks = {};
	            	for (var i = 0; i < chunkIds.length; i++) {
	            		this._doGetStored(chunkIds[i], true).then(function(response) {
	            			var chunkId = response[0];
	            			var value = response[1];
	            			dataChunks[chunkId] = value;
	            			
	            			var done = true;
	            			for (var j = chunkIds.length-1; j >= 0; j--) {
	            				if (dataChunks[chunkIds[j]] === undefined) {
	            					done = false;
	            					break;
	            				}
	            			}
	            			
	            			if (done) {
	            				for (var j = 0; j < chunkIds.length; j++) {
	            					fullData += dataChunks[chunkIds[j]];
	            				}
	            				dfd.resolve(Ext.decode(fullData));
	            			}
	            		}, function() {
	                        dfd.reject();
	                    }, null, this);
	            	}
            	}, function() {
            		dfd.reject();
            	}, null, this);
        	} else {
            	// no chunks
				this._doGetStored(id, false).then(function(value) {
					dfd.resolve(value);
				}, function() {
					dfd.reject();
				}, null, this);
        	}
        }, function() {
        	dfd.reject();
        }, null, this);
		
		return dfd.promise;
	},
	
	_doGetStored: function(id, isChunk) {
		var dfd = new Ext.Deferred();
		
		Ext.Ajax.request({
            url: this.getTromboneUrl(),
            params: {
                tool: 'resource.StoredResource',
                retrieveResourceId: id,
                failQuietly: true
            }
        }).then(function(response) {
        	var json = Ext.decode(response.responseText);
        	var id = json.storedResource.id;
        	var value = json.storedResource.resource;
        	if (value.length == 0) {
        		dfd.reject();
        	} else {
	        	if (isChunk != true) {
	        		value = Ext.decode(value);
	        		dfd.resolve(value);
	        	} else {
	        		dfd.resolve([id, value]);
	        	}
        	}
        }, function() {
        	dfd.reject();
        }, null, this);
		
		return dfd.promise;
	}
});
