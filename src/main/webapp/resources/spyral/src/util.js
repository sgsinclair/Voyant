export class Util {
	static id(len) {
		len = len || 8;
		// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
		return Math.random().toString(36).substring(2, 2+len) + Math.random().toString(36).substring(2, 2+len)
	}
	static toString(contents, config) {
		if (contents.constructor === Array || contents.constructor===Object) {
			contents = JSON.stringify(contents);
			if (contents.length>500) {
				contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";
			}
		}
		return contents.toString();
	}
	static more(before, more, after) {
		return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";

	}
}
