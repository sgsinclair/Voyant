
function equals(expected, actual, message) {
	if (expected!==actual) throw new Error("Expected: "+expected+" ("+typeof expected+"); Actual: "+actual+" ("+typeof actual+")");
}

function error(fn, expectedError) {
	try {
		fn()
	} catch(err) {
		if ((typeof err == "string" && err==expectedError) || (typeof err == "object" && err.message==expectedError)) {
			return;
		}
		throw err;
	}
	throw new Error("Uncaught error: "+expectedError);
}