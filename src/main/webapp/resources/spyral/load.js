// assumes Spyral has already been declared (by spyral.js)

{
	class Load {
		static trombone(config, params) {
			let  url = new URL(config && config.trombone ? config.trombone : this.baseUrl+"trombone");
			let all = {...config,...params};
			for (var key in all) {
				if (all[key]===undefined) {delete all[key]}
			}
			let searchParams = Object.keys(all).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(all[key])).join("&")
			let opt = {};
			if (searchParams.length<800 || ("method" in all && all["method"]=="GET")) {
				for (var key in all) {url.searchParams.set(key, all[key]);}
			} else {
				opt = {
					method: 'POST',
					headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
					body: searchParams
				}
			}
			return fetch(url, opt).then(response => {
				if (response.ok) {
					return response.json()
				}
				else {
					return response.text().then(text => {
						if (Voyant && Voyant.util && Voyant.util.DetailedError) {
							new Voyant.util.DetailedError({
								msg: "",
								error: text.split(/(\r\n|\r|\n)/).shift(),
								details: text
							}).showMsg();
						} else {
							alert(text.split(/(\r\n|\r|\n)/).shift())
							if (window.console) {console.error(text)}
						}
						throw Error(text);
					});
				}
			})
			
			
		}
				
		static load(urlToFetch, config) {
			let  url = new URL(config && config.trombone ? config.trombone : this.baseUrl+"trombone");
			url.searchParams.set("fetchData", urlToFetch);
			return fetch(url).then(response => {
				if (response.ok) {
					return response;
				}
				else {
					return response.text().then(text => {
						if (Voyant && Voyant.util && Voyant.util.DetailedError) {
							new Voyant.util.DetailedError({
								error: text.split(/(\r\n|\r|\n)/).shift(),
								details: text
							}).showMsg();
						} else {
							alert(text.split(/(\r\n|\r|\n)/).shift())
							if (window.console) {console.error(text)}
						}
						throw Error(text);
					});
				}
			}).catch(err => {throw err})
		}
	
		static html(url) {
			return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/html'));
		}
		static xml(url) {
			return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/xml'));
		}
		static json(url) {
			return this.load(url).then(response => response.json());
		}
		static text(url) {
			return this.load(url).then(response => response.text());
		}
		static corpus(config) {
			return Spyral.Corpus.load(config);
		}

	}
	
	Object.assign(Spyral, {Load})

}

Spyral.Load.baseUrl = "http://localhost:8080/voyant/";
