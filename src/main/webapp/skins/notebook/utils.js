function handleError(msg, url, linenumber) {
	var scriptCount = this.document.body.getElementsByTagName('script').length;
	var results = window.parent.document.querySelectorAll('div.code_result');
	results[scriptCount-1].innerHTML = '<span style="color: red;">'+msg+'</span>';
};

window.onerror = handleError;

function output(code) {
	var scriptCount = this.document.body.getElementsByTagName('script').length;
	var results = window.parent.document.querySelectorAll('div.code_result');
	results[scriptCount-1].innerHTML = code;
}