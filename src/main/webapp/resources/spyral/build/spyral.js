var Spyral = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.5',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  concat: function concat(arg) { // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) { throw it; };

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;

	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = { length: -1 };

	    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
	    else O[1] = 1;

	    method.call(O, argument0, argument1);
	  });
	};

	var $forEach = arrayIteration.forEach;



	var STRICT_METHOD = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	// `Array.isArray` method
	// https://tc39.github.io/ecma262/#sec-array.isarray
	_export({ target: 'Array', stat: true }, {
	  isArray: isArray
	});

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var defineProperty$1 = objectDefineProperty.f;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var nativeJoin = [].join;

	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD$1 = arrayMethodIsStrict('join', ',');

	// `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join
	_export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$1 }, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var $map = arrayIteration.map;



	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');
	// FF49- issue
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('map');

	// `Array.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1 }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var nativeAssign = Object.assign;
	var defineProperty$2 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$2({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$2(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
	  keys: function keys(it) {
	    return objectKeys(toObject(it));
	  }
	});

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var SPECIES$2 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$2]) {
	    defineProperty(Constructor, SPECIES$2, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$3]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var ITERATOR$4 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$4] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$4] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var SPECIES$3 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$1 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (classofRaw(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    global_1.addEventListener &&
	    typeof postMessage == 'function' &&
	    !global_1.importScripts &&
	    !fails(post) &&
	    location.protocol !== 'file:'
	  ) {
	    defer = post;
	    global_1.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

	var macrotask = task.set;


	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$2 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$2) == 'process';
	// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

	var flush, head, last, notify, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$2.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();
	        else last = undefined;
	        throw error;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (IS_NODE) {
	    notify = function () {
	      process$2.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;
	    notify = function () {
	      then.call(promise, flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) last.next = task;
	  if (!head) {
	    head = task;
	    notify();
	  } last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	};

	// 25.4.1.5 NewPromiseCapability(C)
	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
		f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;
	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var task$1 = task.set;










	var SPECIES$4 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState$1 = internalState.get;
	var setInternalState$1 = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	var FORCED$1 = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true;
	    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  }
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
	  // Detect correctness of subclassing with @@species support
	  var promise = PromiseConstructor.resolve(1);
	  var FakePromise = function (exec) {
	    exec(function () { /* empty */ }, function () { /* empty */ });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$4] = FakePromise;
	  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
	});

	var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
	});

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0;
	    // variable length - can't use forEach
	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }
	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (handler = global_1['on' + name]) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          then.call(value,
	            bind(internalResolve, promise, wrapper, state),
	            bind(internalReject, promise, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, { done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED$1) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState$1(this);
	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    setInternalState$1(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };
	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$1(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };
	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then;

	    // wrap native Promise#then for native async functions
	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected);
	    // https://github.com/zloirock/core-js/issues/640
	    }, { unsafe: true });

	    // wrap fetch result
	    if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input /* , init */) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({ global: true, wrap: true, forced: FORCED$1 }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);

	PromiseWrapper = getBuiltIn(PROMISE);

	// statics
	_export({ target: PROMISE, stat: true, forced: FORCED$1 }, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});

	_export({ target: PROMISE, stat: true, forced:  FORCED$1 }, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});

	_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
	// so we use an intermediate function.
	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$2 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalState$2 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$2(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$2(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	// TODO: Remove from `core-js@4` since it's moved to entry points







	var SPECIES$5 = wellKnownSymbol('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	var REPLACE = wellKnownSymbol('replace');
	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$5] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(
	      REPLACE_SUPPORTS_NAMED_GROUPS &&
	      REPLACE_KEEPS_$0 &&
	      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    )) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];

	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var charAt$1 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	// `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var arrayPush = [].push;
	var min$2 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype$1[ITERATOR$5] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$5, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$5] = ArrayValues;
	    }
	    if (!CollectionPrototype$1[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1);
	    }
	    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var ITERATOR$6 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$6]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	// `Array.from` method implementation
	// https://tc39.github.io/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$1 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
	  delta += floor$1(delta / numPoints);
	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$1(delta / baseMinusTMin);
	  }
	  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        for (var k = base; /* no condition */; k += base) {
	          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$1(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }
	  return output.join('');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }
	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`





















	var $fetch$1 = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$7 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$3 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;

	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$3(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

	  setInternalState$3(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () { /* empty */ },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) throw TypeError('Expected sequence with length 2');
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({ key: key, value: init[key] + '' });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);
	      else index++;
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) entries.push({ key: key, value: val });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    // Array#sort is not stable in some engines
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	redefine(URLSearchParamsPrototype, ITERATOR$7, URLSearchParamsPrototype.entries);

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674
	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input /* , init */) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch$1.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`











	var codeAt = stringMultibyte.codeAt;





	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$4 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$2 = Math.floor;
	var pow = Math.pow;

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
	// eslint-disable-next-line no-control-regex
	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;
	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result;
	  // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);
	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }
	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;
	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }
	    numbers.push(number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index == partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = numbers.pop();
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// eslint-disable-next-line max-statements
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (char()) {
	    if (pieceIndex == 8) return;
	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }
	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (char()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!DIGIT.test(char())) return;
	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece == 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }
	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$2(host / 256);
	    } return result.join('.');
	  // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0))
	    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
	    string.length == 2 ||
	    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;
	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	// eslint-disable-next-line max-statements
	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');

	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];
	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (
	            (isSpecial(url) != has(specialSchemes, buffer)) ||
	            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
	            (url.scheme == 'file' && !url.host)
	          )) return;
	          url.scheme = buffer;
	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }
	          buffer = '';
	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case NO_SCHEME:
	        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }
	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        } break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;
	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        } break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        } break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        } break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);
	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];
	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }
	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;
	            else url.username += encodedCodePoints;
	          }
	          buffer = '';
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;
	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;
	          else if (char == ']') seenBracket = false;
	          buffer += char;
	        } break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url)) ||
	          stateOverride
	        ) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
	            buffer = '';
	          }
	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;
	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;
	        else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }
	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        } break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }
	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
	          else url.host = base.host;
	        }
	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          } continue;
	        } else buffer += char;
	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        } break;

	      case PATH:
	        if (
	          char == EOF || char == '/' ||
	          (char == '\\' && isSpecial(url)) ||
	          (!stateOverride && (char == '?' || char == '#'))
	        ) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }
	            url.path.push(buffer);
	          }
	          buffer = '';
	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }
	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        } break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';
	          else if (char == '#') url.query += '%23';
	          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$4(that, { type: 'URL' });
	  var baseState, failure;
	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
	    else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }
	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);
	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };
	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';
	  if (host !== null) {
	    output += '//';
	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }
	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';
	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? ''
	    : port === null ? serializeHost(host)
	    : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return { get: getter, set: setter, configurable: true, enumerable: true };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;
	      else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);
	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);
	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }
	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  });
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');

	_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
	  URL: URLConstructor
	});

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function ownKeys$1(object, enumerableOnly) {
	  var keys = Object.keys(object);

	  if (Object.getOwnPropertySymbols) {
	    var symbols = Object.getOwnPropertySymbols(object);
	    if (enumerableOnly) symbols = symbols.filter(function (sym) {
	      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
	    });
	    keys.push.apply(keys, symbols);
	  }

	  return keys;
	}

	function _objectSpread2(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};

	    if (i % 2) {
	      ownKeys$1(Object(source), true).forEach(function (key) {
	        _defineProperty(target, key, source[key]);
	      });
	    } else if (Object.getOwnPropertyDescriptors) {
	      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
	    } else {
	      ownKeys$1(Object(source)).forEach(function (key) {
	        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
	      });
	    }
	  }

	  return target;
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (_isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	var DatePrototype = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING = 'toString';
	var nativeDateToString = DatePrototype[TO_STRING];
	var getTime = DatePrototype.getTime;

	// `Date.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
	if (new Date(NaN) + '' != INVALID_DATE) {
	  redefine(DatePrototype, TO_STRING, function toString() {
	    var value = getTime.call(this);
	    // eslint-disable-next-line no-self-compare
	    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
	  });
	}

	var TO_STRING$1 = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING$1];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

	// `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING$1, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	function id$1(len) {
	  len = len || 8; // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

	  return Math.random().toString(36).substring(2, 2 + len) + Math.random().toString(36).substring(2, 2 + len);
	}
	/**
	 * Class embodying Load functionality.
	 * @memberof Spyral
	 * @class
	 */


	var Load = /*#__PURE__*/function () {
	  function Load() {
	    _classCallCheck(this, Load);
	  }

	  _createClass(Load, null, [{
	    key: "setBaseUrl",

	    /**
	     * Set the base URL for use with the Load class
	     * @param {string} baseUrl 
	     */
	    value: function setBaseUrl(baseUrl) {
	      this.baseUrl = baseUrl;
	    }
	    /**
	     * Make a call to trombone
	     * @param {object} config 
	     * @param {object} params
	     * @returns {JSON}
	     */

	  }, {
	    key: "trombone",
	    value: function trombone() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var params = arguments.length > 1 ? arguments[1] : undefined;
	      var url = new URL(config.trombone ? config.trombone : this.baseUrl + "trombone");

	      var all = _objectSpread2({}, config, {}, params);

	      for (var key in all) {
	        if (all[key] === undefined) {
	          delete all[key];
	        }
	      }

	      var searchParams = Object.keys(all).map(function (key) {
	        return encodeURIComponent(key) + '=' + encodeURIComponent(all[key]);
	      }).join("&");
	      var opt = {};

	      if (searchParams.length < 800 || "method" in all && all["method"] == "GET") {
	        for (var key in all) {
	          url.searchParams.set(key, all[key]);
	        }
	      } else {
	        opt = {
	          method: 'POST',
	          headers: {
	            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	          },
	          body: searchParams
	        };
	      }

	      return fetch(url.toString(), opt).then(function (response) {
	        if (response.ok) {
	          return response.json();
	        } else {
	          return response.text().then(function (text) {
	            if (Voyant && Voyant.util && Voyant.util.DetailedError) {
	              new Voyant.util.DetailedError({
	                msg: "",
	                error: text.split(/(\r\n|\r|\n)/).shift(),
	                details: text
	              }).showMsg();
	            } else {
	              alert(text.split(/(\r\n|\r|\n)/).shift());

	              if (window.console) {
	                console.error(text);
	              }
	            }

	            throw Error(text);
	          });
	        }
	      });
	    }
	    /**
	     * Fetch content from a URL, often resolving cross-domain data constraints
	     * @param {string} urlToFetch 
	     * @param {object} config
	     * @returns {Response}
	     */

	  }, {
	    key: "load",
	    value: function load(urlToFetch, config) {
	      var url = new URL(config && config.trombone ? config.trombone : this.baseUrl + "trombone");
	      url.searchParams.set("fetchData", urlToFetch);
	      return fetch(url.toString()).then(function (response) {
	        if (response.ok) {
	          return response;
	        } else {
	          return response.text().then(function (text) {
	            if (Voyant && Voyant.util && Voyant.util.DetailedError) {
	              new Voyant.util.DetailedError({
	                error: text.split(/(\r\n|\r|\n)/).shift(),
	                details: text
	              }).showMsg();
	            } else {
	              alert(text.split(/(\r\n|\r|\n)/).shift());

	              if (window.console) {
	                console.error(text);
	              }
	            }

	            throw Error(text);
	          });
	        }
	      })["catch"](function (err) {
	        throw err;
	      });
	    }
	    /**
	     * Fetch HTML content from a URL
	     * @param {string} url 
	     * @returns {Document}
	     */

	  }, {
	    key: "html",
	    value: function html(url) {
	      return this.text(url).then(function (text) {
	        return new DOMParser().parseFromString(text, 'text/html');
	      });
	    }
	    /**
	     * Fetch XML content from a URL
	     * @param {string} url 
	     * @returns {XMLDocument}
	     */

	  }, {
	    key: "xml",
	    value: function xml(url) {
	      return this.text(url).then(function (text) {
	        return new DOMParser().parseFromString(text, 'text/xml');
	      });
	    }
	    /**
	     * Fetch JSON content from a URL
	     * @param {string} url 
	     * @returns {JSON}
	     */

	  }, {
	    key: "json",
	    value: function json(url) {
	      return this.load(url).then(function (response) {
	        return response.json();
	      });
	    }
	    /**
	     * Fetch text content from a URL
	     * @param {string} url 
	     * @returns {string}
	     */

	  }, {
	    key: "text",
	    value: function text(url) {
	      return this.load(url).then(function (response) {
	        return response.text();
	      });
	    }
	    /**
	     * Create a file input in the target element and returns a Promise that's resolved with the file that is added to the input.
	     * The file is also temporarily stored in the session storage for successive retrieval.
	     * @param {element} target The target element to append the input to
	     * @returns {Promise}
	     */

	  }, {
	    key: "file",
	    value: function file() {
	      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

	      if (target === undefined) {
	        if (typeof Spyral !== 'undefined' && Spyral.Notebook) {
	          target = Spyral.Notebook.getTarget();
	        } else {
	          target = document.createElement("div");
	          document.body.appendChild(target);
	        }
	      }

	      return new Promise(function (resolve, reject) {
	        if (target.hasAttribute('spyral-temp-doc')) {
	          var storedFile = window.sessionStorage.getItem(target.getAttribute('spyral-temp-doc'));

	          if (storedFile !== null) {
	            resolve(storedFile);
	            return;
	          }
	        }

	        var fileInput = document.createElement('input');
	        fileInput.setAttribute('type', 'file');
	        fileInput.addEventListener('change', function (event) {
	          var fr = new FileReader();

	          fr.onload = function (e) {
	            var file = e.target.result;
	            resolve(file);
	            window.sessionStorage.setItem(target.getAttribute('spyral-temp-doc'), file);
	          };

	          fr.readAsText(this.files[0]);
	        }, false);
	        target.appendChild(fileInput);
	        target.setAttribute('spyral-temp-doc', id$1(16));
	      });
	    }
	  }]);

	  return Load;
	}();

	_defineProperty(Load, "baseUrl", void 0);

	// if docIndex or docId is defined, or if mode=="documents" then we're in documents mode

	function isDocumentsMode() {
	  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  return "docIndex" in config || "docId" in config || "mode" in config && config.mode == "documents";
	}
	/**
	 * The Corpus class in Spyral. Here's a simple example:
	 * 
	 * 	loadCorpus("Hello World!").summary();
	 * 
	 * This loads a corpus and returns an asynchronous `Promise`, but all of the methods
	 * of Corpus are appended to the Promise, so {@link #summary} will be called
	 * once the Corpus promise is fulfilled. It's equivalent to the following:
	 *
	 * 	loadCorpus("Hello World!").then(corpus -> corpus.summary());
	 *
	 * The `loadCorpus` method is actually an alias, so the full form of this would actually be something like this:
	 * 
	 * 	Spyral.Corpus.load("Hello World").then(corpus -> corpus.summary());
	 * 
	 * But we like our short-cuts, so the first form is the preferred form.
	 * 
	 * Have a look at the {@link #input} configuration for more examples.
	 * 
	 * There is a lot of flexibility in how corpora are created, here's a summary of the parameters:
	 * 
	 * - **sources**: {@link #corpus}, {@link #input}
	 * - **formats**:
	 * 	- **Text**: {@link #inputRemoveFrom}, {@link #inputRemoveFromAfter}, {@link #inputRemoveUntil}, {@link #inputRemoveUntilAfter}
	 * 	- **XML**: {@link #xmlAuthorXpath}, {@link #xmlCollectionXpath}, {@link #xmlContentXpath}, {@link #xmlExtraMetadataXpath}, {@link #xmlKeywordXpath}, {@link #xmlPubPlaceXpath}, {@link #xmlPublisherXpath}, {@link #xmlTitleXpath}
	 * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}
	 * - **other**: {@link #inputFormat}, {@link #subTitle}, {@link #title}, {@link #tokenization}

	 * @memberof Spyral
	 * @class
	 */


	var Corpus = /*#__PURE__*/function () {
	  /**
	   * @cfg {String} corpus The ID of a previously created corpus.
	   * 
	   * A corpus ID can be used to try to retrieve a corpus that has been previously created.
	   * Typically the corpus ID is used as a first string argument, with an optional second
	   * argument for other parameters (especially those to recreate the corpus if needed).
	   * 
	   * 		loadCorpus("goldbug");
	   * 
	   * 		loadCorpus("goldbug", {
	   *			// if corpus ID "goldbug" isn't found, use the input
	   * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
	   * 			inputRemoveUntil: 'THE GOLD-BUG',
	   * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 		});
	   */

	  /**
	   * @cfg {String/String[]} input Input sources for the corpus.
	   * 
	   * The input sources can be either normal text or URLs (starting with `http`).
	   * 
	   * Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.
	   * 
	   * 		loadCorpus("Hello Voyant!"); // one document with this string
	   * 
	   * 		loadCorpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
	   * 
	   * 		loadCorpus("http://hermeneuti.ca/"); // one document from URL
	   * 
	   * 		loadCorpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
	   * 
	   * 		loadCorpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
	   * 
	   * 		loadCorpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
	   * 			inputRemoveUntil: 'THE GOLD-BUG',
	   * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 		});
	   * 
	   * 		// use a corpus ID but also specify an input source if the corpus can't be found
	   * 		loadCorpus("goldbug", {
	   * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
	   * 			inputRemoveUntil: 'THE GOLD-BUG',
	   * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 		});
	   */

	  /**
	   * @cfg {String} inputFormat The input format of the corpus (the default is to auto-detect).
	   * 
	   * The auto-detect format is usually reliable and inputFormat should only be used if the default
	   * behaviour isn't desired. Most of the relevant values are used for XML documents:
	   * 
	   * - **DTOC**: Dynamic Table of Contexts XML format
	   * - **HTML**: Hypertext Markup Language
	   * - **RSS**: Really Simple Syndication XML format
	   * - **TEI**: Text Encoding Initiative XML format
	   * - **TEICORPUS**: Text Encoding Initiative Corpus XML format
	   * - **TEXT**: plain text
	   * - **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)
	   * 
	   * Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).
	   */

	  /**
	   * @cfg {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
	   * 
	   * Possible values are:
	   * 
	   * - **undefined or blank** (default): the entire table is one document
	   * - **rows**: each row of the table is a separate document
	   * - **columns**: each column of the table is a separate document
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableAuthor Determine how to extract the author from each document; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableTitle Determine how to extract the title from each document; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
	   * 
	   * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tokenization The tokenization strategy to use
	   * 
	   * This should usually be undefined, unless specific behaviour is required. These are the valid values:
	   * 
	   * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
	   * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
	   * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tokenization).
	   */

	  /**
	   * @cfg {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
	   * 			 xmlContentXpath: "//body"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
	   * 			 xmlTitleXpath: "//title"
	   * 		}); // title would be: "Hello world!"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
	   * 			 xmlAuthorXpath: "//author"
	   * 		}); // author would be: "Stéfan Sinclair"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
	   * 			 xmlPubPlaceXpath: "//pubPlace"
	   * 		}); // publication place would be: "Montreal"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
	   * 			 xmlPublisherXpath: "//publisher"
	   * 		}); // publisher would be: "The Owl"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
	   * 			 xmlKeywordXpath: "//keyword"
	   * 		}); // publisher would be: "text analysis"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
	   * 			 xmlCollectionXpath: "//collection"
	   * 		}); // publisher would be: "documentation"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
	   * 			 xmlDocumentsXPath: '//sp',
	   *           xmlGroupByXpath: "//@s"
	   * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
	   * 			 xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
	   * 		}); // tool would be "Voyant" and phase would be "1"
	   * 
	   * Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
	   * possible to define multiple values (each on its own line) in the form of name=xpath.
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */

	  /**
	   * @cfg {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
	   * 
	   * This is an advanced parameter that allows you to define a URL of an XSL template that can
	   * be called *before* text extraction (in other words, the other XML-based parameters apply
	   * after this template has been processed).
	   */

	  /**
	   * @cfg {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveUntil: "This"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */

	  /**
	   * @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveUntilAfter: "world!"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */

	  /**
	   * @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveFrom: "This"
	   * 		}); // document would be: "Hello World!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */

	  /**
	   * @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveFromAfter: "This"
	   * 		}); // document would be: "Hello World! This"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */

	  /**
	   * @cfg {String} subTitle A sub-title for the corpus.
	   * 
	   * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
	   */

	  /**
	   * @cfg {String} title A title for the corpus.
	   * 
	   * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
	   */

	  /**
	  * @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of the specialized DToC context).
	  *
	  * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
	  *
	  *   	 p    	 paragraph
	  *   	 ref[@target*="religion"]    	 religion
	  *
	   * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
	  */

	  /*// don't document this because it should really only be used internally, use loadCorpus or Corpus.load instead
	   * Create a new Corpus using the specified Corpus ID
	   * @constructor
	   * @param {string} id The Corpus ID
	   */
	  function Corpus(id) {
	    _classCallCheck(this, Corpus);

	    this.corpusid = id;
	  }

	  _createClass(Corpus, [{
	    key: "id",

	    /**
	     * Get a Promise for the ID of the corpus.
	     * 
	     * @return {Promise/String} a Promise for the string ID of the corpus
	     */
	    value: function id() {
	      var me = this;
	      return new Promise(function (resolve) {
	        return resolve(me.corpusid);
	      });
	    }
	    /*
	     * Create a Corpus and return the ID
	     * @param {object} config 
	     * @param {object} api 
	     */
	    //	static id(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.id(api || config));
	    //	}

	    /**
	     * Get a Promise for the metadata object (of the corpus or document, depending on which mode is used).
	     * 
	     * The following is an example of the object return for the metadata of the Jane Austen corpus:
	     * 
	     * 	{
	     * 		"id": "b50407fd1cbbecec4315a8fc411bad3c",
	     * 		"alias": "austen",
	    	 * 		"title": "",
	     * 		"subTitle": "",
	     * 		"documentsCount": 8,
	     * 		"createdTime": 1582429585984,
	     * 		"createdDate": "2020-02-22T22:46:25.984-0500",
	     * 		"lexicalTokensCount": 781763,
	     * 		"lexicalTypesCount": 15368,
	     * 		"noPasswordAccess": "NORMAL",
	     * 		"languageCodes": [
	     * 			"en"
	     * 		]
	     * 	}
	     * 
	     * The following is an example of what is returned as metadata for the first document:
	     *
	     * 		[
	        * 			{
	        *   			"id": "ddac6b12c3f4261013c63d04e8d21b45",
	        *   			"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
	        *   			"tokensCount-lexical": "33559",
	        *   			"lastTokenStartOffset-lexical": "259750",
	        *   			"parent_modified": "1548457455000",
	        *   			"typesCount-lexical": "4235",
	        *   			"typesCountMean-lexical": "7.924203",
	        *   			"lastTokenPositionIndex-lexical": "33558",
	        *   			"index": "0",
	        *   			"language": "en",
	        *   			"sentencesCount": "1302",
	        *   			"source": "stream",
	        *   			"typesCountStdDev-lexical": "46.626404",
	        *   			"title": "1790 Love And Freindship",
	        *   			"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
	        *   			"extra.Content-Type": "text/plain; charset=windows-1252",
	        *   			"parentType": "expansion",
	        *   			"extra.Content-Encoding": "windows-1252",
	        *   			"parent_source": "file",
	        *   			"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
	        *   			"modified": "1432861756000",
	        *   			"location": "1790 Love And Freindship.txt",
	        *   			"parent_title": "Austen",
	        *   			"parent_location": "Austen.zip"
	        *   		}
	        *  	 ]
	     * 
	     * In Corpus mode there's no reason to specify arguments. In documents mode you
	     * can request specific documents in the config object:
	     * 
	     *  * **start**: the zero-based start of the list
	     *  * **limit**: a limit to the number of items to return at a time
	     *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	     *  * **query**: one or more term queries for the title, author or full-text
	     *  * **sort**: one of the following sort orders (composed of a feature like `INDEX` and a sort direction `ASC` or `DESC`): `INDEXASC`, `INDEXDESC`, `TITLEASC`, `TITLEDESC`, `AUTHORASC`, `AUTHORDESC`, `TOKENSCOUNTLEXICALASC`, `TOKENSCOUNTLEXICALDESC`, `TYPESCOUNTLEXICALASC`, `TYPESCOUNTLEXICALDESC`, `TYPETOKENRATIOLEXICALASC`, `TYPETOKENRATIOLEXICALDESC`, `PUBDATEASC`, `PUBDATEDESC`
	     * 
	     *  An example:
	     *  
	     *  	// this would show the number 8 (the size of the corpus)
	     *  	loadCorpus("austen").metadata().then(metadata => metadata.documentsCount)
	     *  
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @return {Promise/Object} a Promise for an Object containing metadata
	     */

	  }, {
	    key: "metadata",
	    value: function metadata(config) {
	      return Load.trombone(config, {
	        tool: isDocumentsMode(config) ? "corpus.DocumentsMetadata" : "corpus.CorpusMetadata",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return isDocumentsMode(config) ? data.documentsMetadata.documents : data.corpus.metadata;
	      });
	    }
	    /*
	     * Create a Corpus and return the metadata
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static metadata(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.metadata(api || config));
	    //	}

	    /**
	     * Get a Promise for a brief summary of the corpus that includes essential metadata (documents count, terms count, etc.) 
	     * 
	     * An example:
	     * 
	     * 		loadCorpus("austen").summary();
	     * 
	     * @return {Promise/String} a Promise for a string containing a brief summary of the corpus metadata
	     */

	  }, {
	    key: "summary",
	    value: function summary() {
	      return this.metadata().then(function (data) {
	        // TODO: make this a template
	        return "This corpus (".concat(data.alias ? data.alias : data.id, ") has ").concat(data.documentsCount.toLocaleString(), " documents with ").concat(data.lexicalTokensCount.toLocaleString(), " total words and ").concat(data.lexicalTypesCount.toLocaleString(), " unique word forms.");
	      });
	    }
	    /*
	     * Create a Corpus and return the summary
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static summary(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.summary(api || config));
	    //	}

	    /**
	     * Get a Promise for an Array of the document titles.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start of the list
	     *  * **limit**: a limit to the number of items to return at a time
	     *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	     *  * **query**: one or more term queries for the title, author or full-text
	     *  * **sort**: one of the following sort orders (composed of a feature like `INDEX` and a sort direction `ASC` or `DESC`): `INDEXASC`, `INDEXDESC`, `TITLEASC`, `TITLEDESC`, `AUTHORASC`, `AUTHORDESC`, `TOKENSCOUNTLEXICALASC`, `TOKENSCOUNTLEXICALDESC`, `TYPESCOUNTLEXICALASC`, `TYPESCOUNTLEXICALDESC`, `TYPETOKENRATIOLEXICALASC`, `TYPETOKENRATIOLEXICALDESC`, `PUBDATEASC`, `PUBDATEDESC`
	     * 
	     * An example:
	     * 
	     * 		loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
	     * 
	     * @param {Object} config an Object specifying parameters (see list above) 
	     * @returns {Promise/Array} a Promise for an Array of document titles  
	     */

	  }, {
	    key: "titles",
	    value: function titles(config) {
	      return Load.trombone(config, {
	        tool: "corpus.DocumentsMetadata",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.documentsMetadata.documents.map(function (doc) {
	          return doc.title;
	        });
	      });
	    }
	    /*
	     * Create a Corpus and return the titles
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static titles(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.titles(api || config));
	    //	}

	    /**
	     * Get a Promise for the text of the entire corpus.
	     * 
	     * Texts are concatenated together with two new lines and three dashes (\\n\\n---\\n\\n)
	     * 
	     * The following are valid in the config parameter:
	     * 
	     * * **noMarkup**: strips away the markup
	     * * **compactSpace**: strips away superfluous spaces and multiple new lines
	     * * **limit**: a limit to the number of characters (per text)
	     * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	     * 
	     * An example:
	     *
	     * 		// fetch 1000 characters from each text in the corpus into a single string
	     * 		loadCorpus("austen").text({limit:1000})
	     * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @returns {Promise/String} a Promise for a string of the corpus
	     */

	  }, {
	    key: "text",
	    value: function text(config) {
	      return this.texts(config).then(function (data) {
	        return data.join("\n\n---\n\n");
	      });
	    }
	    /*
	     * Create a Corpus and return the text
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static text(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.text(api || config));	
	    //	}

	    /**
	     * Get a Promise for an Array of texts from the entire corpus.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     * * **noMarkup**: strips away the markup
	     * * **compactSpace**: strips away superfluous spaces and multiple new lines
	     * * **limit**: a limit to the number of characters (per text)
	     * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	     * 
	     * An example:
	     *
	     * 		// fetch 1000 characters from each text in the corpus into an Array
	     * 		loadCorpus("austen").texts({limit:1000})
	     * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @returns {Promise/String} a Promise for an Array of texts from the corpus
	     */

	  }, {
	    key: "texts",
	    value: function texts(config) {
	      return Load.trombone(config, {
	        tool: "corpus.CorpusTexts",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.texts.texts;
	      });
	    }
	    /*
	     * Create a Corpus and return the texts
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static texts(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.texts(api || config));	
	    //	}

	    /**
	     * Get a Promise for an Array of terms (either CorpusTerms or DocumentTerms, depending on the specified mode).
	     * These terms are actually types, so information about each type is collected (as opposed to the {#link tokens}
	     * method which is for every occurrence in document order).
	     * 
	     * The mode is set to "documents" when any of the following is true
	     * 
	     * * the `mode` parameter is set to "documents"
	     * * a `docIndex` parameter being set
	     * * a `docId` parameter being set
	     * 
	     * The following is an example a Corpus Term (corpus mode):
	     * 
	     * 		{
	     * 			"term": "the",
	     * 			"inDocumentsCount": 8,
	     * 			"rawFreq": 28292,
	     * 			"relativeFreq": 0.036189996,
	     * 			"comparisonRelativeFreqDifference": 0
	     * 		}
	     * 
	     * The following is an example of Document Term (documents mode):
	     * 
	     * 		{
	     * 			"term": "the",
	     * 			"rawFreq": 1333,
	     * 			"relativeFreq": 39721.086,
	     * 			"zscore": 28.419,
	     * 			"zscoreRatio": -373.4891,
	     * 			"tfidf": 0.0,
	     * 			"totalTermsCount": 33559,
	    	 * 			"docIndex": 0,
	     * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
	     * 		}
	     * 
	     * The following config parameters are valid in both modes:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **minRawFreq**: the minimum raw frequency of terms
	     *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
	     *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **withDistributions**: a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **tokenType**: the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	     * 
	     * The following are specific to corpus mode:
	     * 
	     *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
	     *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
	     *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
	     *  * **sort**: the order of the terms, one of the following (composed of a value and a direction of ASCending or DEScending: `INDOCUMENTSCOUNTASC, INDOCUMENTSCOUNTDESC, RAWFREQASC, RAWFREQDESC, TERMASC, TERMDESC, RELATIVEPEAKEDNESSASC, RELATIVEPEAKEDNESSDESC, RELATIVESKEWNESSASC, RELATIVESKEWNESSDESC, COMPARISONRELATIVEFREQDIFFERENCEASC, COMPARISONRELATIVEFREQDIFFERENCEDESC`
	     *  
	     *  The following are specific to documents mode:
	     * 
	     *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
	     *  * **sort**: the order of the terms, one of the following (composed of a value and a direction of ASCending or DEScending: `RAWFREQASC, RAWFREQDESC, RELATIVEFREQASC, RELATIVEFREQDESC, TERMASC, TERMDESC, TFIDFASC, TFIDFDESC, ZSCOREASC, ZSCOREDESC`
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     *  
	     * An example:
	     * 
	     * 		// show top 5 terms
	      	 * 		loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
	      	 * 
	      	 *		// show top term for each document
	      	 * 		loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
	      	 * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @returns {Promise/Array} a Promise for a Array of Terms
	     */

	  }, {
	    key: "terms",
	    value: function terms(config) {
	      return Load.trombone(config, {
	        tool: isDocumentsMode(config) ? "corpus.DocumentTerms" : "corpus.CorpusTerms",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return isDocumentsMode(config) ? data.documentTerms.terms : data.corpusTerms.terms;
	      });
	    }
	    /*
	     * Create a Corpus and return the terms
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static terms(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.terms(api || config));
	    //	}

	    /**
	     * Get a Promise for an Array of document tokens.
	     * 
	     * The promise returns an array of document token objects. A document token object can look something like this:
	     * 
	     *		{
	     *			"docId": "8a61d5d851a69c03c6ba9cc446713574",
	     *			"docIndex": 0,
	     *			"term": "LOVE",
	     *			"tokenType": "lexical",
	     *			"rawFreq": 54,
	     *			"position": 0,
	     *			"startOffset": 3,
	     *			"endOffset": 7
	     *		}
	     *
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **noOthers**: only include lexical forms, no other tokens
	     *  * **stripTags**: one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	     *  * **withPosLemmas**: include part-of-speech and lemma information when available (reliability of this may vary by instance)
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     * 
	     * An example:
	     * 
	     * 		// load the first 20 tokens (don't include tags, spaces, etc.)
	     * 		loadCorpus("austen").tokens({limit: 20, noOthers: true})
	     * 
	     * @param {Object} config an Object specifying parameters (see above)
	     * @returns {Promise/Array} a Promise for an Array of document tokens
	     */

	  }, {
	    key: "tokens",
	    value: function tokens(config) {
	      return Load.trombone(config, {
	        tool: "corpus.DocumentTokens",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.documentTokens.tokens;
	      });
	    }
	    /*
	     * Create a Corpus and return the tokens
	     * @param {*} config 
	     * @param {*} api 
	     */
	    //	static tokens(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.tokens(api || config));
	    //	}

	    /**
	     * Get a Promise for an Array of words from the corpus.
	     * 
	     * The array of words are in document order, much like tokens.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     * 
	     * An example:
	     * 
	     * 		// load the first 20 words in the corpus
	     * 		loadCorpus("austen").tokens({limit: 20})
	     * 
	     * @param {Object} config an Object specifying parameters (see above)
	     * @returns {Promise/Array} a Promise for an Array of words
	     */

	  }, {
	    key: "words",
	    value: function words() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	      // by default DocumentTokens limits to 50 which probably isn't expected
	      if (!("limit" in config)) {
	        config.limit = 0;
	      }

	      return Load.trombone(config, {
	        tool: "corpus.DocumentTokens",
	        noOthers: true,
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.documentTokens.tokens.map(function (t) {
	          return t.term;
	        });
	      });
	    }
	    /*
	     * Create a Corpus and return an array of lexical forms (words) in document order.
	     * @param {object} config 
	     * @param {object} api 
	     */
	    //	static words(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.words(api || config));
	    //	}

	    /**
	     * Get a Promise for an Array of Objects that contain keywords in contexts (KWICs).
	     * 
	     * An individual KWIC Object looks something like this:
	     * 
	     * 		{
	        *			"docIndex": 0,
	        *			"query": "love",
	        *			"term": "love",
	        *			"position": 0,
	        *			"left": "",
	        *			"middle": "LOVE",
	        *			"right": " AND FREINDSHIP AND OTHER EARLY"
	        *		}
	        *
	        * The following are some of the valid parameters:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of contexts to provide per request
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **sort**: the sort order of the results, one of the following (composed of a feature and one of **ASC**ending or **DESC**ending: `TERMASC, TERMDESC, DOCINDEXASC, DOCINDEXDESC, POSITIONASC, POSITIONDESC, LEFTASC, LEFTDESC, RIGHTASC, RIGHTDESC`
	     *  * **overlapStrategy**: KWICs can feature overlapping words and this determines how to handle them, like the example of "to be or not to be" and searching for "be":
	     *  		* **none**: ignore overlapping contexts (default)
	     *  			* left: "to", middle: "be", right: "or not to be"
	     *  			* left: "to be or not to", middle: "be", right: ""
	     *  		* **first**: only keep the first instance (default), `first` or `merge`
	     *  			* left: "to", middle: "be", right: "or not to be"
	     *  		* **merge**: keep both instances by sharing words
	     *  			* left: "to", middle: "be", right: "or"
	     *  			* left: "not to", middle: "be", right: ""
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     * 
	     */

	  }, {
	    key: "contexts",
	    value: function contexts(config) {
	      if ((!config || !config.query) && console) {
	        console.warn("No query provided for contexts request.");
	      }

	      return Load.trombone(config, {
	        tool: "corpus.DocumentContexts",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.documentContexts.contexts;
	      });
	    }
	    /*
	     * Create a Corpus and return the contexts
	     * @param {object} config 
	     * @param {object} api 
	     */
	    //	static contexts(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.contexts(api || config));
	    //	}

	    /**
	     * Get a Promise for an Array of Objects that contain collocates.
	     * 
	     * An individual collocate looks something like this:
	     * 
	     * 		{
	        *   		"term": "love",
	        *   		"rawFreq": 568,
	        *   		"contextTerm": "mr",
	        *   		"contextTermRawFreq": 24
	        *		}
	        *
	        * The following are some of the valid parameters:
	     */

	  }, {
	    key: "collocates",
	    value: function collocates(config) {
	      if ((!config || !config.query) && console) {
	        console.warn("No query provided for collocates request.");
	      }

	      return Load.trombone(config, {
	        tool: "corpus.CorpusCollocates",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.corpusCollocates.collocates;
	      });
	    }
	    /*
	     * Create a Corpus and return the collocates
	     * @param {object} config 
	     * @param {object} api 
	     */
	    //	static collocates(config, api) {
	    //		return Corpus.load(config).then(corpus => corpus.collocates(api || config));
	    //	}

	  }, {
	    key: "phrases",
	    value: function phrases(config) {
	      return Load.trombone(config, {
	        tool: isDocumentsMode(config) ? "corpus.DocumentNgrams" : "corpus.CorpusNgrams",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return isDocumentsMode(config) ? data.documentNgrams.ngrams : data.corpusNgrams.ngrams;
	      });
	    }
	    /**
	     * Create a Corpus and return the phrases
	     * @param {object} config 
	     * @param {object} api 
	     */

	  }, {
	    key: "correlations",
	    value: function correlations(config) {
	      if ((!config || !config.query) && console) {
	        console.warn("No query provided for correlations request.");

	        if (!isDocumentsMode(config)) {
	          throw new Error("Unable to run correlations for a corpus without a query.");
	        }
	      }

	      return Load.trombone(config, {
	        tool: isDocumentsMode(config) ? "corpus.DocumentTermCorrelations" : "corpus.CorpusTermCorrelations",
	        corpus: this.corpusid
	      }).then(function (data) {
	        return data.termCorrelations.correlations;
	      });
	    }
	    /**
	     * Create a Corpus and return the correlations
	     * @param {object} config 
	     * @param {object} api 
	     */

	  }, {
	    key: "tool",
	    value: function tool(_tool) {
	      var _arguments = arguments;
	      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var me = this;
	      return new Promise(function (resolve, reject) {
	        var isTool = function isTool(obj) {
	          return obj && typeof obj == "string" && /\W/.test(obj) == false || _typeof(obj) == "object" && "forTool" in obj;
	        };

	        var isConfig = function isConfig(obj) {
	          return obj && _typeof(obj) == "object" && !("forTool" in obj);
	        };

	        var lastArg = _arguments[_arguments.length - 1];
	        config = isConfig(lastArg) ? lastArg : {}; // we have all tools and we'll show them individually

	        if (isTool(_tool) && (isTool(lastArg) || isConfig(lastArg))) {
	          var val;
	          var url;

	          var _ret = function () {
	            var defaultAttributes = {
	              width: undefined,
	              height: undefined,
	              style: "width: 350px; height: 350px",
	              "float": "right"
	            };
	            var out = "";

	            for (var i = 0; i < _arguments.length; i++) {
	              var t = _arguments[i];

	              if (isTool(t)) {
	                (function () {
	                  if (typeof t == "string") {
	                    t = {
	                      forTool: t
	                    };
	                  } // make sure we have object
	                  // build iframe tag


	                  out += "<iframe ";

	                  for (var attr in defaultAttributes) {
	                    val = (attr in t ? t[attr] : undefined) || (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);

	                    if (val !== undefined) {
	                      out += ' ' + attr + '="' + val + '"';
	                    }
	                  } // build url


	                  url = new URL((config && config.voyantUrl ? config.voyantUrl : Load.baseUrl) + "tool/" + t.forTool + "/");
	                  url.searchParams.append("corpus", me.corpusid); // add API values from config (some may be ignored)

	                  var all = Object.assign(t, config);
	                  Object.keys(all).forEach(function (key) {
	                    if (key !== "input" && !(key in defaultAttributes)) {
	                      url.searchParams.append(key, all[key]);
	                    }
	                  }); // finish tag

	                  out += ' src="' + url + '"></iframe>';
	                })();
	              }
	            }

	            return {
	              v: resolve(out)
	            };
	          }();

	          if (_typeof(_ret) === "object") return _ret.v;
	        } else {
	          if (Array.isArray(_tool)) {
	            _tool = _tool.join(";");
	          }

	          var defaultAttributes = {
	            width: undefined,
	            height: undefined,
	            style: "width: 90%; height: " + 350 * (_tool ? _tool : "").split(";").length + "px"
	          }; // build iframe tag

	          var out = "<iframe ";

	          for (var attr in defaultAttributes) {
	            var val = (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);

	            if (val !== undefined) {
	              out += ' ' + attr + '="' + val + '"';
	            }
	          } // build url


	          var url = new URL((config && config.voyantUrl ? config.voyantUrl : Load.baseUrl) + (_tool ? "?view=customset&tableLayout=" + _tool : ""));
	          url.searchParams.append("corpus", me.corpusid); // add API values from config (some may be ignored)

	          Object.keys(config).forEach(function (key) {
	            if (key !== "input" && !(key in defaultAttributes)) {
	              url.searchParams.append(key, config[key]);
	            }
	          });
	          resolve(out + " src='" + url + "'></iframe");
	        }
	      });
	    }
	    /**
	     * Create a Corpus and return the tool
	     * @param {*} tool 
	     * @param {*} config 
	     * @param {*} api 
	     */

	  }, {
	    key: "toString",
	    value: function toString() {
	      return this.summary();
	    }
	    /**
	     * Create a new Corpus using the provided config
	     * @param {object} config 
	     */

	  }], [{
	    key: "setBaseUrl",
	    value: function setBaseUrl(baseUrl) {
	      Load.setBaseUrl(baseUrl);
	    }
	  }, {
	    key: "phrases",
	    value: function phrases(config, api) {
	      return Corpus.load(config).then(function (corpus) {
	        return corpus.phrases(api || config);
	      });
	    }
	  }, {
	    key: "correlations",
	    value: function correlations(config, api) {
	      return Corpus.load(config).then(function (corpus) {
	        return corpus.correlations(api || config);
	      });
	    }
	  }, {
	    key: "tool",
	    value: function tool(_tool2, config, api) {
	      return Corpus.load(config).then(function (corpus) {
	        return corpus.tool(_tool2, config, api);
	      });
	    }
	  }, {
	    key: "create",
	    value: function create(config) {
	      return Corpus.load(config);
	    }
	    /**
	     * Load a Corpus using the provided config
	     * @param {object} config The Corpus config
	     */

	  }, {
	    key: "load",
	    value: function load(config) {
	      var promise = new Promise(function (resolve, reject) {
	        if (config instanceof Corpus) {
	          resolve(config);
	        } else if (typeof config === "string" && config.length > 0 && /\W/.test(config) === false) {
	          resolve(new Corpus(config));
	        } else if (_typeof(config) === "object" && config.corpus) {
	          resolve(new Corpus(config.corpus));
	        } else {
	          if (typeof config === "string") {
	            config = {
	              input: config
	            };
	          }

	          if (config && config.input) {
	            Load.trombone(config, {
	              tool: "corpus.CorpusMetadata"
	            }).then(function (data) {
	              return resolve(new Corpus(data.corpus.metadata.id));
	            });
	          }
	        }
	      });
	      ["id", "metadata", "summary", "titles", "text", "texts", "terms", "tokens", "words", "contexts", "collocates", "phrases", "correlations", "tool"].forEach(function (name) {
	        promise[name] = function () {
	          var args = arguments;
	          return promise.then(function (corpus) {
	            return corpus[name].apply(corpus, args);
	          });
	        };
	      });

	      promise.assign = function (name) {
	        this.then(function (corpus) {
	          window[name] = corpus;
	          return corpus;
	        });
	      };

	      return promise;
	    }
	  }]);

	  return Corpus;
	}();

	_defineProperty(Corpus, "Load", Load);

	var $every = arrayIteration.every;



	var STRICT_METHOD$2 = arrayMethodIsStrict('every');
	var USES_TO_LENGTH$2 = arrayMethodUsesToLength('every');

	// `Array.prototype.every` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.every
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || !USES_TO_LENGTH$2 }, {
	  every: function every(callbackfn /* , thisArg */) {
	    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.prototype.fill` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.fill
	var arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = toObject(this);
	  var length = toLength(O.length);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	// `Array.prototype.fill` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.fill
	_export({ target: 'Array', proto: true }, {
	  fill: arrayFill
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('fill');

	var $filter = arrayIteration.filter;



	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('filter');
	// Edge 14- issue
	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('filter');

	// `Array.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$3 }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $findIndex = arrayIteration.findIndex;



	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES = true;

	var USES_TO_LENGTH$4 = arrayMethodUsesToLength(FIND_INDEX);

	// Shouldn't skip holes
	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

	// `Array.prototype.findIndex` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$4 }, {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND_INDEX);

	var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration(function (iterable) {
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.github.io/ecma262/#sec-array.from
	_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
	  from: arrayFrom
	});

	var $includes = arrayIncludes.includes;



	var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

	// `Array.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.includes
	_export({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$5 }, {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');

	var $indexOf = arrayIncludes.indexOf;



	var nativeIndexOf = [].indexOf;

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$3 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$6 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

	// `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$3 || !USES_TO_LENGTH$6 }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod$3 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$1(callbackfn);
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = toLength(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};

	var arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	  left: createMethod$3(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$3(true)
	};

	var $reduce = arrayReduce.left;



	var STRICT_METHOD$4 = arrayMethodIsStrict('reduce');
	var USES_TO_LENGTH$7 = arrayMethodUsesToLength('reduce', { 1: 0 });

	// `Array.prototype.reduce` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 || !USES_TO_LENGTH$7 }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var nativeReverse = [].reverse;
	var test$1 = [1, 2];

	// `Array.prototype.reverse` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
	// fix for Safari 12.0 bug
	// https://bugs.webkit.org/show_bug.cgi?id=188794
	_export({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
	  reverse: function reverse() {
	    // eslint-disable-next-line no-self-assign
	    if (isArray(this)) this.length = this.length;
	    return nativeReverse.call(this);
	  }
	});

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$8 = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

	var SPECIES$6 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$8 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$6];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var test$2 = [];
	var nativeSort = test$2.sort;

	// IE8-
	var FAILS_ON_UNDEFINED = fails(function () {
	  test$2.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails(function () {
	  test$2.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD$5 = arrayMethodIsStrict('sort');

	var FORCED$2 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$5;

	// `Array.prototype.sort` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.sort
	_export({ target: 'Array', proto: true, forced: FORCED$2 }, {
	  sort: function sort(comparefn) {
	    return comparefn === undefined
	      ? nativeSort.call(toObject(this))
	      : nativeSort.call(toObject(this), aFunction$1(comparefn));
	  }
	});

	var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('splice');
	var USES_TO_LENGTH$9 = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });

	var max$2 = Math.max;
	var min$3 = Math.min;
	var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

	// `Array.prototype.splice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$9 }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = toLength(O.length);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$3(max$2(toInteger(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
	      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
	    }
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    O.length = len - actualDeleteCount + insertCount;
	    return A;
	  }
	});

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$4 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$4(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$4(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$4(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$3 = objectDefineProperty.f;
	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;

	// Opera ~12 has broken Object#toString
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

	// `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
	        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
	        default: return +it;
	      }
	      digits = it.slice(2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	// `Number` constructor
	// https://tc39.github.io/ecma262/#sec-number-constructor
	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper
	      // check on 1..constructor(foo) case
	      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
	        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };
	  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty$3(NumberWrapper, key, getOwnPropertyDescriptor$3(NativeNumber, key));
	    }
	  }
	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  } return it;
	};

	var MATCH$1 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$1] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) { /* empty */ }
	  } return false;
	};

	// `String.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.includes
	_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~String(requireObjectCoercible(this))
	      .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var max$3 = Math.max;
	var min$4 = Math.min;
	var floor$3 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// @@replace logic
	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return replacer !== undefined
	        ? replacer.call(searchValue, O, replaceValue)
	        : nativeReplace.call(String(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	    function (regexp, replaceValue) {
	      if (
	        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
	        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
	      ) {
	        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	        if (res.done) return res.value;
	      }

	      var rx = anObject(regexp);
	      var S = String(this);

	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regexpExecAbstract(rx, S);
	        if (result === null) break;

	        results.push(result);
	        if (!global) break;

	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = String(result[0]);
	        var position = max$3(min$4(toInteger(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];

	  // https://tc39.github.io/ecma262/#sec-getsubstitution
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default: // \d\d?
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$3(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim;


	// `String.prototype.trim` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.trim
	_export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	/**
	 * Class representing a Chart.
	 * @memberof Spyral
	 * @class
	 */
	var Chart = /*#__PURE__*/function () {
	  /**
	   * The Highcharts config object
	   * @typedef {object} HighchartsConfig
	   * @property {(string|object)} title
	   * @property {(string|object)} subtitle
	   * @property {object} credits
	   * @property {object} xAxis
	   * @property {object} yAxis
	   * @property {object} chart
	   * @property {array} series
	   * @property {object} plotOptions
	   */

	  /**
	   * Construct a new Chart class
	   * @constructor
	   * @param {element} target 
	   * @param {array} data 
	   */
	  function Chart(target, data) {
	    _classCallCheck(this, Chart);

	    this.target = target;
	    this.data = data;
	  }
	  /**
	   * Create a new chart
	   * See {@link https://api.highcharts.com/highcharts/} for full set of config options.
	   * @param {(string|element)} target 
	   * @param {HighchartsConfig} config 
	   * @returns {Highcharts.Chart}
	   */


	  _createClass(Chart, [{
	    key: "create",
	    value: function create(target, config) {
	      return Highcharts.chart(target, config);
	    }
	    /**
	     * Create a new chart
	     * See {@link https://api.highcharts.com/highcharts/} for full set of config options.
	     * @param {(string|element)} target 
	     * @param {HighchartsConfig} config 
	     * @returns {Highcharts.Chart}
	     */

	  }, {
	    key: "bar",

	    /**
	     * Create a bar chart
	     * @param {object} [config]
	     * @returns {Highcharts.Chart}
	     */
	    value: function bar() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      Chart.setSeriesData(config, this.data);
	      return Chart.bar(this.target, config);
	    }
	    /**
	     * Create a bar chart
	     * @param {element} target 
	     * @param {object} config 
	     * @returns {Highcharts.Chart}
	     */

	  }, {
	    key: "line",

	    /**
	     * Create a line chart
	     * @param {object} [config]
	     * @returns {Highcharts.Chart}
	     */
	    value: function line() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      Chart.setSeriesData(config, this.data);
	      return Chart.line(this.target, config);
	    }
	    /**
	     * Create a line chart
	     * @param {element} target 
	     * @param {object} config 
	     * @returns {Highcharts.Chart}
	     */

	  }, {
	    key: "scatter",

	    /**
	     * Create a scatter plot
	     * @param {object} [config]
	     * @returns {Highcharts.Chart}
	     */
	    value: function scatter() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      Chart.setSeriesData(config, this.data);
	      return Chart.scatter(this.target, config);
	    }
	    /**
	     * Create a scatter plot
	     * @param {element} target 
	     * @param {object} config 
	     * @returns {Highcharts.Chart}
	     */

	  }, {
	    key: "networkgraph",

	    /**
	     * Create a network graph
	     * @param {object} [config]
	     * @returns {Highcharts.Chart}
	     */
	    value: function networkgraph() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      config.plotOptions = {
	        networkgraph: {
	          layoutAlgorithm: {
	            enableSimulation: true
	          },
	          keys: ['from', 'to']
	        }
	      };
	      Chart.setSeriesData(config, this.data);
	      return Chart.networkgraph(this.target, config);
	    }
	    /**
	     * Create a network graph
	     * @param {element} target 
	     * @param {object} config 
	     * @returns {Highcharts.Chart}
	     */

	  }], [{
	    key: "create",
	    value: function create(target, config) {
	      // convert title and suppress if not provided
	      if ("title" in config) {
	        if (typeof config.title == "string") {
	          config.title = {
	            text: config.title
	          };
	        }
	      } else {
	        config.title = false;
	      } // convert subtitle and convert if not provided


	      if ("subtitle" in config) {
	        if (typeof config.subtitle == "string") {
	          config.subtitle = {
	            text: config.subtitle
	          };
	        }
	      } else {
	        config.subtitle = false;
	      } // convert credits


	      if (!("credits" in config)) {
	        config.credits = false;
	      } // suppress xAxis title unless provided


	      if (!("xAxis" in config)) {
	        config.xAxis = {};
	      }

	      if (!("title" in config.xAxis)) ; //config.xAxis.title = false;
	      // suppress xAxis title unless provided


	      if (!("yAxis" in config)) {
	        config.yAxis = {};
	      }

	      if (!("title" in config.yAxis)) {
	        config.yAxis.title = false;
	      }

	      return Highcharts.chart(target, config);
	    }
	    /**
	     * Sets the default chart type
	     * @param {object} config The chart config object
	     * @param {string} type The type of chart
	     */

	  }, {
	    key: "setDefaultChartType",
	    value: function setDefaultChartType(config, type) {
	      if ("type" in config) {
	        config.chart.type = config.type;
	        delete config.type;
	        return;
	      } // TODO: check plot options and series?


	      if ("chart" in config) {
	        if ("type" in config.chart) {
	          return;
	        } // already set

	      } else {
	        config.chart = {};
	      }

	      config.chart.type = type;
	      return config;
	    }
	    /**
	     * Add the provided data to the config as a series
	     * @param {object} config 
	     * @param {array} data 
	     */

	  }, {
	    key: "setSeriesData",
	    value: function setSeriesData(config, data) {
	      if (Array.isArray(data)) {
	        if (Array.isArray(data[0])) {
	          config.series = data.map(function (subArray) {
	            return {
	              data: subArray
	            };
	          });
	        } else {
	          config.series = [{
	            data: data
	          }];
	        }
	      }
	    }
	  }, {
	    key: "bar",
	    value: function bar(target, config) {
	      Chart.setDefaultChartType(config, 'bar');
	      return Highcharts.chart(target, config);
	    }
	  }, {
	    key: "line",
	    value: function line(target, config) {
	      Chart.setDefaultChartType(config, 'line');
	      return Highcharts.chart(target, config);
	    }
	  }, {
	    key: "scatter",
	    value: function scatter(target, config) {
	      Chart.setDefaultChartType(config, 'scatter');
	      return Highcharts.chart(target, config);
	    }
	  }, {
	    key: "networkgraph",
	    value: function networkgraph(target, config) {
	      Chart.setDefaultChartType(config, 'networkgraph');
	      return Highcharts.chart(target, config);
	    }
	  }]);

	  return Chart;
	}();

	/**
	 * Class representing a Table.
	 * @memberof Spyral
	 * @class
	 */

	var Table = /*#__PURE__*/function () {
	  /**
	   * The Table config object
	   * @typedef {object} TableConfig
	   * @property {string} format The format of the provided data, either "tsv" or "csv"
	   * @property {(object|array)} headers The table headers
	   * @property {boolean} hasHeaders True if the headers are the first item in the data
	   * @property {string} count Specify "vertical" or "horizontal" to create a table of unique item counts in the provided data
	   */

	  /**
	   * Create a new Table
	   * @constructor
	   * @param {(object|array|string|number)} data
	   * @param {TableConfig} config
	   */
	  function Table(data, config) {
	    var _this = this;

	    for (var _len = arguments.length, other = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	      other[_key - 2] = arguments[_key];
	    }

	    _classCallCheck(this, Table);

	    this._rows = [];
	    this._headers = {};
	    this._rowKeyColumnIndex = 0; // we have a configuration object followed by values: create({headers: []}, 1,2,3) …

	    if (data && _typeof(data) == "object" && (typeof config == "string" || typeof config == "number" || Array.isArray(config))) {
	      data.rows = [config].concat(other).filter(function (v) {
	        return v !== undefined;
	      });
	      config = undefined;
	    } // we have a simple variable set of arguments: create(1,2,3) …


	    if (arguments.length > 0 && Array.from(arguments).every(function (a) {
	      return a !== undefined && !Array.isArray(a) && _typeof(a) != "object";
	    })) {
	      data = [data, config].concat(other).filter(function (v) {
	        return v !== undefined;
	      });
	      config = undefined;
	    } // could be CSV or TSV


	    if (Array.isArray(data) && data.length == 1 && typeof data[0] == "string" && (data[0].indexOf(",") > -1 || data[0].indexOf("\t") > -1)) {
	      data = data[0];
	    } // first check if we have a string that might be delimited data


	    if (data && (typeof data == "string" || typeof data == "number")) {
	      if (typeof data == "number") {
	        data = String(data);
	      } // convert to string for split


	      var rows = [];
	      var format = config && "format" in config ? config.format : undefined;
	      data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])+/g).forEach(function (line, i) {
	        if (line.trim().length > 0) {
	          var values;

	          if (format && format == "tsv" || line.indexOf("\t") > -1) {
	            values = line.split(/\t/);
	          } else if (format && format == "csv" || line.indexOf(",") > -1) {
	            values = parseCsvLine(line);
	          } else {
	            values = [line];
	          } // if we can't find any config information for headers then we try to guess
	          // if the first line doesn't have any numbers - this heuristic may be questionable


	          if (i == 0 && values.every(function (v) {
	            return isNaN(v);
	          }) && (_typeof(config) != "object" || _typeof(config) == "object" && !("hasHeaders" in config) && !("headers" in config))) {
	            _this.setHeaders(values);
	          } else {
	            rows.push(values.map(function (v) {
	              return isNaN(v) ? v : Number(v);
	            }));
	          }
	        }
	      });
	      data = rows;
	    }

	    if (data && Array.isArray(data)) {
	      if (config) {
	        if (Array.isArray(config)) {
	          this.setHeaders(config);
	        } else if (_typeof(config) == "object") {
	          if ("headers" in config) {
	            this.setHeaders(config.headers);
	          } else if ("hasHeaders" in config && config.hasHeaders) {
	            this.setHeaders(data.shift());
	          }
	        }
	      }

	      if (config && "count" in config && config.count) {
	        var freqs = Table.counts(data);

	        if (config.count == "vertical") {
	          for (var item in freqs) {
	            this.addRow(item, freqs[item]);
	          }

	          this.rowSort(function (a, b) {
	            return Table.cmp(b[1], a[1]);
	          });
	        } else {
	          this._headers = []; // reset and use the terms as headers

	          this.addRow(freqs);
	          this.columnSort(function (a, b) {
	            return Table.cmp(_this.cell(0, b), _this.cell(0, a));
	          });
	        }
	      } else {
	        this.addRows(data);
	      }
	    } else if (data && _typeof(data) == "object") {
	      if ("headers" in data && Array.isArray(data.headers)) {
	        this.setHeaders(data.headers);
	      } else if ("hasHeaders" in data && "rows" in data) {
	        this.setHeaders(data.rows.shift());
	      }

	      if ("rows" in data && Array.isArray(data.rows)) {
	        this.addRows(data.rows);
	      }

	      if ("rowKeyColumn" in data) {
	        if (typeof data.rowKeyColumn == "number") {
	          if (data.rowKeyColumn < this.columns()) {
	            this._rowKeyColumnIndex = data.rowKeyColumn;
	          } else {
	            throw new Error("The rowKeyColumn value is higher than the number headers designated: " + data.rowKeyColum);
	          }
	        } else if (typeof data.rowKeyColumn == "string") {
	          if (data.rowKeyColumn in this._headers) {
	            this._rowKeyColumnIndex = this._headers[data.rowKeyColumn];
	          } else {
	            throw new Error("Unable to find column designated by rowKeyColumn: " + data.rowKeyColumn);
	          }
	        }
	      }
	    }
	  }
	  /**
	   * Set the headers for the Table
	   * @param {(object|array)} data
	   * @returns {Table}
	   */


	  _createClass(Table, [{
	    key: "setHeaders",
	    value: function setHeaders(data) {
	      var _this2 = this;

	      if (data && Array.isArray(data)) {
	        data.forEach(function (h) {
	          return _this2.addColumn(h);
	        }, this);
	      } else if (_typeof(data) == "object") {
	        if (this.columns() == 0 || Object.keys(data).length == this.columns()) {
	          this._headers = data;
	        } else {
	          throw new Error("The number of columns don't match: ");
	        }
	      } else {
	        throw new Error("Unrecognized argument for headers, it should be an array or an object." + data);
	      }

	      return this;
	    }
	    /**
	     * Add rows to the Table
	     * @param {array} data
	     * @returns {Table}
	     */

	  }, {
	    key: "addRows",
	    value: function addRows(data) {
	      var _this3 = this;

	      data.forEach(function (row) {
	        return _this3.addRow(row);
	      }, this);
	      return this;
	    }
	    /**
	     * Add a row to the Table
	     * @param {(array|object)} data
	     * @returns {Table}
	     */

	  }, {
	    key: "addRow",
	    value: function addRow(data) {
	      for (var _len2 = arguments.length, other = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        other[_key2 - 1] = arguments[_key2];
	      }

	      // we have multiple arguments, so call again as an array
	      if (other.length > 0) {
	        return this.addRow([data].concat(other));
	      }

	      this.setRow(this.rows(), data, true);
	      return this;
	    }
	    /**
	     * Set a row
	     * @param {(number|string)} ind The row index
	     * @param {(object|array)} data
	     * @param {boolean} create
	     * @returns {Table}
	     */

	  }, {
	    key: "setRow",
	    value: function setRow(ind, data, create) {
	      var _this4 = this;

	      var rowIndex = this.getRowIndex(ind, create);

	      if (rowIndex >= this.rows() && !create) {
	        throw new Error("Attempt to set row values for a row that does note exist: " + ind + ". Maybe use addRow() instead?");
	      } // we have a simple array, so we'll just push to the rows


	      if (data && Array.isArray(data)) {
	        if (data.length > this.columns()) {
	          if (create) {
	            for (var i = this.columns(); i < data.length; i++) {
	              this.addColumn();
	            }
	          } else {
	            throw new Error("The row that you've created contains more columns than the current table. Maybe use addColunm() first?");
	          }
	        }

	        data.forEach(function (d, i) {
	          return _this4.setCell(rowIndex, i, d);
	        }, this);
	      } // we have an object so we'll use the headers
	      else if (_typeof(data) == "object") {
	          for (var _column in data) {
	            if (!this.hasColumn(_column)) ;

	            this.setCell(rowIndex, _column, data[_column]);
	          }
	        } else if (this.columns() < 2 && create) {
	          // hopefully some scalar value
	          if (this.columns() == 0) {
	            this.addColumn(); // create first column if it doesn't exist
	          }

	          this.setCell(rowIndex, 0, data);
	        } else {
	          throw new Error("setRow() expects an array or an object, maybe setCell()?");
	        }

	      return this;
	    }
	    /**
	     * Set a column
	     * @param {(number|string)} ind The column index
	     * @param {(object|array)} data
	     * @param {boolean} create
	     * @returns {Table}
	     */

	  }, {
	    key: "setColumn",
	    value: function setColumn(ind, data, create) {
	      var _this5 = this;

	      var columnIndex = this.getColumnIndex(ind, create);

	      if (columnIndex >= this.columns() && !create) {
	        throw new Error("Attempt to set column values for a column that does note exist: " + ind + ". Maybe use addColumn() instead?");
	      } // we have a simple array, so we'll just push to the rows


	      if (data && Array.isArray(data)) {
	        data.forEach(function (d, i) {
	          return _this5.setCell(i, columnIndex, d, create);
	        }, this);
	      } // we have an object so we'll use the headers
	      else if (_typeof(data) == "object") {
	          for (var row in data) {
	            this.setCell(row, columnIndex, data[column], create);
	          }
	        } // hope we have a scalar value to assign to the first row
	        else {
	            this.setCell(0, columnIndex, data, create);
	          }

	      return this;
	    }
	    /**
	     * Add to or set a cell value
	     * @param {(number|string)} row The row index
	     * @param {(number|string)} column The column index
	     * @param {number} value The value to set/add
	     * @param {boolean} overwrite True to set, false to add to current value
	     */

	  }, {
	    key: "updateCell",
	    value: function updateCell(row, column, value, overwrite) {
	      var rowIndex = this.getRowIndex(row, true);
	      var columnIndex = this.getColumnIndex(column, true);
	      var val = this.cell(rowIndex, columnIndex);
	      this._rows[rowIndex][columnIndex] = val && !overwrite ? val + value : value;
	      return this;
	    }
	    /**
	     * Get the value of a cell
	     * @param {(number|string)} rowInd The row index
	     * @param {(number|string)} colInd The column index
	     * @returns {number}
	     */

	  }, {
	    key: "cell",
	    value: function cell(rowInd, colInd) {
	      return this._rows[this.getRowIndex(rowInd)][this.getColumnIndex(colInd)];
	    }
	    /**
	     * Set the value of a cell
	     * @param {(number|string)} row The row index
	     * @param {(number|string)} column The column index
	     * @param {number} value The value to set
	     * @returns {Table}
	     */

	  }, {
	    key: "setCell",
	    value: function setCell(row, column, value) {
	      this.updateCell(row, column, value, true);
	      return this;
	    }
	    /**
	     * Get (and create) the row index
	     * @param {(number|string)} ind The index
	     * @param {boolean} create
	     * @returns {number}
	     */

	  }, {
	    key: "getRowIndex",
	    value: function getRowIndex(ind, create) {
	      var _this6 = this;

	      if (typeof ind == "number") {
	        if (ind < this._rows.length) {
	          return ind;
	        } else if (create) {
	          this._rows[ind] = Array(this.columns());
	          return ind;
	        }

	        throw new Error("The requested row does not exist: " + ind);
	      } else if (typeof ind == "string") {
	        var row = this._rows.findIndex(function (r) {
	          return r[_this6._rowKeyColumnIndex] === ind;
	        }, this);

	        if (row > -1) {
	          return row;
	        } else if (create) {
	          var arr = Array(this.columns());
	          arr[this._rowKeyColumnIndex] = ind;
	          this.addRow(arr);
	          return this.rows();
	        } else {
	          throw new Error("Unable to find the row named " + ind);
	        }
	      }

	      throw new Error("Please provide a valid row (number or named row)");
	    }
	    /**
	     * Get (and create) the column index
	     * @param {(number|string)} ind The index
	     * @param {boolean} create
	     * @returns {number}
	     */

	  }, {
	    key: "getColumnIndex",
	    value: function getColumnIndex(ind, create) {
	      if (typeof ind == "number") {
	        if (ind < this.columns()) {
	          return ind;
	        } else if (create) {
	          this.addColumn(ind);
	          return ind;
	        }

	        throw new Error("The requested column does not exist: " + ind);
	      } else if (typeof ind == "string") {
	        if (ind in this._headers) {
	          return this._headers[ind];
	        } else if (create) {
	          this.addColumn({
	            header: ind
	          });
	          return this._headers[ind];
	        }

	        throw new Error("Unable to find column named " + ind);
	      }

	      throw new Error("Please provide a valid column (number or named column)");
	    }
	    /**
	     * Add a column (at the specified index)
	     * @param {(object|string)} config
	     * @param {(number|string)} ind
	     */

	  }, {
	    key: "addColumn",
	    value: function addColumn(config, ind) {
	      // determine col
	      var col = this.columns(); // default

	      if (config && typeof config == "string") {
	        col = config;
	      } else if (config && _typeof(config) == "object" && "header" in config) {
	        col = config.header;
	      } else if (ind !== undefined) {
	        col = ind;
	      } // check if it exists


	      if (col in this._headers) {
	        throw new Error("This column exists already: " + config.header);
	      } // add column


	      var colIndex = this.columns();
	      this._headers[col] = colIndex; // determine data

	      var data = [];

	      if (config && _typeof(config) == "object" && "rows" in config) {
	        data = config.rows;
	      } else if (Array.isArray(config)) {
	        data = config;
	      } // add data to each row


	      this._rows.forEach(function (r, i) {
	        return r[colIndex] = data[i];
	      });

	      return this;
	    }
	    /**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of rows in this table.
	     * When the first argument is the boolean value `true` all rows are returned.
	     * When the first argument is a an array then the rows corresponding to the row
	     * indices or names are returned. When all arguments except are numbers or strings
	     * then each of those is returned.
	     * @param {(boolean|array|number|string)} [inds]
	     * @param {(object|number|string)} [config]
	     * @returns {number|array}
	     */

	  }, {
	    key: "rows",
	    value: function rows(inds, config) {
	      var _this7 = this;

	      // return length
	      if (inds == undefined) {
	        return this._rows.length;
	      }

	      var rows = [];

	      for (var _len3 = arguments.length, other = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	        other[_key3 - 2] = arguments[_key3];
	      }

	      var asObj = config && _typeof(config) == "object" && config.asObj || other.length > 0 && _typeof(other[other.length - 1]) == "object" && other[other.length - 1].asObj; // return all

	      if (typeof inds == "boolean" && inds) {
	        rows = this._rows.map(function (r, i) {
	          return _this7.row(i, asObj);
	        });
	      } // return specified rows
	      else if (Array.isArray(inds)) {
	          rows = inds.map(function (ind) {
	            return _this7.row(ind);
	          });
	        } // return specified rows as varargs
	        else if (typeof inds == "number" || typeof inds == "string") {
	            [inds, config].concat(other).every(function (i) {
	              if (typeof i == "number" || typeof i == "string") {
	                rows.push(_this7.row(i, asObj));
	                return true;
	              } else {
	                return false;
	              }
	            });

	            if (other.length > 0) {
	              // when config is in last position
	              if (_typeof(other[other.length - 1]) == "object") {
	                config = other[other.length - 1];
	              }
	            }
	          } // zip if requested


	      if (config && _typeof(config) == "object" && "zip" in config && config.zip) {
	        if (rows.length < 2) {
	          throw new Error("Only one row available, can't zip");
	        }

	        return Table.zip(rows);
	      } else {
	        return rows;
	      }
	    }
	    /**
	     * Get the specified row
	     * @param {(number|string)} ind
	     * @param {boolean} [asObj]
	     * @returns {(number|string|object)}
	     */

	  }, {
	    key: "row",
	    value: function row(ind, asObj) {
	      var row = this._rows[this.getRowIndex(ind)];

	      if (asObj) {
	        var obj = {};

	        for (var key in this._headers) {
	          obj[key] = row[this._headers[key]];
	        }

	        return obj;
	      } else {
	        return row;
	      }
	    }
	    /**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of columns in this table.
	     * When the first argument is the boolean value `true` all columns are returned.
	     * When the first argument is a number a slice of the columns is returned and if
	     * the second argument is a number it is treated as the length of the slice to
	     * return (note that it isn't the `end` index like with Array.slice()).
	     * @param {(boolean|array|number|string)} [inds]
	     * @param {(object|number|string)} [config]
	     * @returns {number|array}
	     */

	  }, {
	    key: "columns",
	    value: function columns(inds, config) {
	      var _this8 = this;

	      // return length
	      if (inds == undefined) {
	        return Object.keys(this._headers).length;
	      }

	      var columns = [];

	      for (var _len4 = arguments.length, other = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
	        other[_key4 - 2] = arguments[_key4];
	      }

	      var asObj = config && _typeof(config) == "object" && config.asObj || other.length > 0 && _typeof(other[other.length - 1]) == "object" && other[other.length - 1].asObj; // return all columns

	      if (typeof inds == "boolean" && inds) {
	        for (var i = 0, len = this.columns(); i < len; i++) {
	          columns.push(this.column(i, asObj));
	        }
	      } // return specified columns
	      else if (Array.isArray(inds)) {
	          inds.forEach(function (i) {
	            return columns.push(_this8.column(i, asObj));
	          }, this);
	        } else if (typeof inds == "number" || typeof inds == "string") {
	          [inds, config].concat(other).every(function (i) {
	            if (typeof i == "number" || typeof i == "string") {
	              columns.push(_this8.column(i, asObj));
	              return true;
	            } else {
	              return false;
	            }
	          });

	          if (other.length > 0) {
	            // when config is in last position
	            if (_typeof(other[other.length - 1]) == "object") {
	              config = other[other.length - 1];
	            }
	          }
	        }

	      if (config && _typeof(config) == "object" && "zip" in config && config.zip) {
	        if (columns.length < 2) {
	          throw new Error("Only one column available, can't zip");
	        }

	        return Table.zip(columns);
	      } else {
	        return columns;
	      }
	    }
	    /**
	     * Get the specified column
	     * @param {(number|string)} ind
	     * @param {boolean} [asObj]
	     * @returns {(number|string|object)}
	     */

	  }, {
	    key: "column",
	    value: function column(ind, asObj) {
	      var _this9 = this;

	      var column = this.getColumnIndex(ind);

	      var data = this._rows.forEach(function (r) {
	        return r[column];
	      }); // TODO


	      if (asObj) {
	        var obj = {};

	        this._rows.forEach(function (r) {
	          obj[r[_this9._rowKeyColumnIndex]] = r[column];
	        });

	        return obj;
	      } else {
	        return this._rows.map(function (r) {
	          return r[column];
	        });
	      }
	    }
	    /**
	     * Get the specified header
	     * @param {(number|string)} ind
	     * @returns {(number|string)}
	     */

	  }, {
	    key: "header",
	    value: function header(ind) {
	      var _this10 = this;

	      var keys = Object.keys(this._headers);
	      var i = this.getColumnIndex(ind);
	      return keys[keys.findIndex(function (k) {
	        return i == _this10._headers[k];
	      })];
	    }
	    /**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of headers in this table.
	     * When the first argument is the boolean value `true` all headers are returned.
	     * When the first argument is a number a slice of the headers is returned.
	     * When the first argument is an array the slices specified in the array are returned.
	     * @param {(boolean|array|number|string)} inds
	     * @returns {(number|array)}
	     */

	  }, {
	    key: "headers",
	    value: function headers(inds) {
	      var _this11 = this;

	      // return length
	      if (inds == undefined) {
	        return Object.keys(this._headers).length;
	      }

	      if (typeof inds == "boolean" && inds) {
	        inds = Array(Object.keys(this._headers).length).fill().map(function (_, i) {
	          return i;
	        });
	      } // return specified rows


	      if (Array.isArray(inds)) {
	        return inds.map(function (i) {
	          return _this11.header(i);
	        });
	      } // return specified rows as varargs
	      else if (typeof inds == "number" || typeof inds == "string") {
	          for (var _len5 = arguments.length, other = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
	            other[_key5 - 1] = arguments[_key5];
	          }

	          return [inds].concat(other).map(function (i) {
	            return _this11.header(i);
	          });
	        }
	    }
	    /**
	     * Does the specified column exist
	     * @param {(number|string)} ind
	     * @returns {(number|string)}
	     */

	  }, {
	    key: "hasColumn",
	    value: function hasColumn(ind) {
	      return ind in this._headers;
	    }
	    /**
	     * Runs the specified function on each row.
	     * The function is passed the row and the row index.
	     * @param {function} fn
	     */

	  }, {
	    key: "forEach",
	    value: function forEach(fn) {
	      this._rows.forEach(function (r, i) {
	        return fn(r, i);
	      });
	    }
	    /**
	     * Get the minimum value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowMin",
	    value: function rowMin(ind) {
	      return Math.min.apply(null, this.row(ind));
	    }
	    /**
	     * Get the maximum value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowMax",
	    value: function rowMax(ind) {
	      return Math.max.apply(null, this.row(ind));
	    }
	    /**
	     * Get the minimum value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnMin",
	    value: function columnMin(ind) {
	      return Math.min.apply(null, this.column(ind));
	    }
	    /**
	     * Get the maximum value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnMax",
	    value: function columnMax(ind) {
	      return Math.max.apply(null, this.column(ind));
	    }
	    /**
	     * Get the sum of the values in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowSum",
	    value: function rowSum(ind) {
	      return Table.sum(this.row(ind));
	    }
	    /**
	     * Get the sum of the values in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnSum",
	    value: function columnSum(ind) {
	      return Table.sum(this.column(ind));
	    }
	    /**
	     * Get the mean of the values in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowMean",
	    value: function rowMean(ind) {
	      return Table.mean(this.row(ind));
	    }
	    /**
	     * Get the mean of the values in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnMean",
	    value: function columnMean(ind) {
	      return Table.mean(this.column(ind));
	    }
	    /**
	     * Get the count of each unique value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowCounts",
	    value: function rowCounts(ind) {
	      return Table.counts(this.row(ind));
	    }
	    /**
	     * Get the count of each unique value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnCounts",
	    value: function columnCounts(ind) {
	      return Table.counts(this.column(ind));
	    }
	    /**
	     * Get the rolling mean for the specified row
	     * @param {(number|string)} ind
	     * @param {number} neighbors
	     * @param {boolean} overwrite
	     * @returns {array}
	     */

	  }, {
	    key: "rowRollingMean",
	    value: function rowRollingMean(ind, neighbors, overwrite) {
	      var means = Table.rollingMean(this.row(ind), neighbors);

	      if (overwrite) {
	        this.setRow(ind, means);
	      }

	      return means;
	    }
	    /**
	     * Get the rolling mean for the specified column
	     * @param {(number|string)} ind
	     * @param {number} neighbors
	     * @param {boolean} overwrite
	     * @returns {array}
	     */

	  }, {
	    key: "columnRollingMean",
	    value: function columnRollingMean(ind, neighbors, overwrite) {
	      var means = Table.rollingMean(this.column(ind), neighbors);

	      if (overwrite) {
	        this.setColumn(ind, means);
	      }

	      return means;
	    }
	    /**
	     * Get the variance for the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowVariance",
	    value: function rowVariance(ind) {
	      return Table.variance(this.row(ind));
	    }
	    /**
	     * Get the variance for the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnVariance",
	    value: function columnVariance(ind) {
	      return Table.variance(this.column(ind));
	    }
	    /**
	     * Get the standard deviation for the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "rowStandardDeviation",
	    value: function rowStandardDeviation(ind) {
	      return Table.standardDeviation(this.row(ind));
	    }
	    /**
	     * Get the standard deviation for the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */

	  }, {
	    key: "columnStandardDeviation",
	    value: function columnStandardDeviation(ind) {
	      return Table.standardDeviation(this.column(ind));
	    }
	    /**
	     * Get the z scores for the specified row
	     * @param {(number|string)} ind
	     * @returns {array}
	     */

	  }, {
	    key: "rowZScores",
	    value: function rowZScores(ind) {
	      return Table.zScores(this.row(ind));
	    }
	    /**
	     * Get the z scores for the specified column
	     * @param {(number|string)} ind
	     * @returns {array}
	     */

	  }, {
	    key: "columnZScores",
	    value: function columnZScores(ind) {
	      return Table.zScores(this.column(ind));
	    }
	    /**
	     * TODO
	     * Sort the specified rows
	     * @returns {Table}
	     */

	  }, {
	    key: "rowSort",
	    value: function rowSort(inds, config) {
	      var _this12 = this;

	      // no inds, use all columns
	      if (inds === undefined) {
	        inds = Array(this.columns()).fill().map(function (_, i) {
	          return i;
	        });
	      } // wrap a single index as array


	      if (typeof inds == "string" || typeof inds == "number") {
	        inds = [inds];
	      }

	      if (Array.isArray(inds)) {
	        return this.rowSort(function (a, b) {
	          var ind;

	          for (var i = 0, len = inds.length; i < len; i++) {
	            ind = _this12.getColumnIndex(inds[i]);

	            if (a != b) {
	              if (typeof a[ind] == "string" && typeof b[ind] == "string") {
	                return a[ind].localeCompare(b[ind]);
	              } else {
	                return a[ind] - b[ind];
	              }
	            }
	          }

	          return 0;
	        }, config);
	      }

	      if (typeof inds == "function") {
	        this._rows.sort(function (a, b) {
	          if (config && "asObject" in config && config.asObject) {
	            var c = {};

	            for (var k in _this12._headers) {
	              c[k] = a[_this12._headers[k]];
	            }

	            var d = {};

	            for (var _k in _this12._headers) {
	              d[_k] = b[_this12._headers[_k]];
	            }

	            return inds.apply(_this12, [c, d]);
	          } else {
	            return inds.apply(_this12, [a, b]);
	          }
	        });

	        if (config && "reverse" in config && config.reverse) {
	          this._rows.reverse(); // in place

	        }
	      }

	      return this;
	    }
	    /**
	     * TODO
	     * Sort the specified columns
	     * @returns {Table}
	     */

	  }, {
	    key: "columnSort",
	    value: function columnSort(inds, config) {
	      var _this13 = this;

	      // no inds, use all columns
	      if (inds === undefined) {
	        inds = Array(this.columns()).fill().map(function (_, i) {
	          return i;
	        });
	      } // wrap a single index as array


	      if (typeof inds == "string" || typeof inds == "number") {
	        inds = [inds];
	      }

	      if (Array.isArray(inds)) {
	        // convert to column names
	        var headers = inds.map(function (ind) {
	          return _this13.header(ind);
	        }); // make sure we have all columns

	        Object.keys(this._headers).forEach(function (h) {
	          if (!headers.includes(h)) {
	            headers.push(h);
	          }
	        }); // sort names alphabetically

	        headers.sort(function (a, b) {
	          return a.localeCompare(b);
	        }); // reorder by columns

	        this._rows = this._rows.map(function (_, i) {
	          return headers.map(function (h) {
	            return _this13.cell(i, h);
	          });
	        });
	        this._headers = {};
	        headers.forEach(function (h, i) {
	          return _this13._headers[h] = i;
	        });
	      }

	      if (typeof inds == "function") {
	        var _headers = Object.keys(this._headers);

	        if (config && "asObject" in _headers && _headers.asObject) {
	          _headers = _headers.map(function (h, i) {
	            return {
	              header: h,
	              data: _this13._rows.map(function (r, j) {
	                return _this13.cell(i, j);
	              })
	            };
	          });
	        }

	        _headers.sort(function (a, b) {
	          return inds.apply(_this13, [a, b]);
	        });

	        _headers = _headers.map(function (h) {
	          return _typeof(h) == "object" ? h.header : h;
	        }); // convert back to string
	        // make sure we have all keys

	        Object.keys(this._headers).forEach(function (k) {
	          if (_headers.indexOf(k) == -1) {
	            _headers.push(k);
	          }
	        });
	        this._rows = this._rows.map(function (_, i) {
	          return _headers.map(function (h) {
	            return _this13.cell(i, h);
	          });
	        });
	        this._headers = {};

	        _headers.forEach(function (h, i) {
	          return _this13._headers[h] = i;
	        });
	      }
	    }
	    /**
	     * Get a CSV representation of the Table
	     * @param {object} [config]
	     * @returns {string}
	     */

	  }, {
	    key: "toCsv",
	    value: function toCsv(config) {
	      var cell = function cell(c) {
	        var quote = /"/g;
	        return typeof c == "string" && (c.indexOf(",") > -1 || c.indexOf('"') > -1) ? '"' + c.replace(quote, '\"') + '"' : c;
	      };

	      return (config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).map(function (h) {
	        return cell(h);
	      }).join(",") + "\n") + this._rows.map(function (row) {
	        return row.map(function (c) {
	          return cell(c);
	        }).join(",");
	      }).join("\n");
	    }
	    /**
	     * Get a TSV representation of the Table
	     * @param {object} [config]
	     * @returns {string}
	     */

	  }, {
	    key: "toTsv",
	    value: function toTsv(config) {
	      return config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).join("\t") + "\n" + this._rows.map(function (row) {
	        return row.join("\t");
	      }).join("\n");
	    }
	    /**
	     * Set the target's contents to an HTML representation of the Table
	     * @param {(function|string|object)} target
	     * @param {object} [config]
	     * @returns {Table}
	     */

	  }, {
	    key: "html",
	    value: function html(target, config) {
	      var html = this.toString(config);

	      if (typeof target == "function") {
	        target(html);
	      } else {
	        if (typeof target == "string") {
	          target = document.querySelector(target);

	          if (!target) {
	            throw "Unable to find specified target: " + target;
	          }
	        }

	        if (_typeof(target) == "object" && "innerHTML" in target) {
	          target.innerHTML = html;
	        }
	      }

	      return this;
	    }
	    /**
	     * Get an HTML representation of the Table
	     * @param {object} [config]
	     * @returns {string}
	     */

	  }, {
	    key: "toString",
	    value: function toString() {
	      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      return "<table class='voyantTable'>" + (config && "caption" in config && typeof config.caption == "string" ? "<caption>" + config.caption + "</caption>" : "") + (config && "noHeaders" in config && config.noHeaders ? "" : "<thead><tr>" + this.headers(true).map(function (c) {
	        return "<th>" + c + "</th>";
	      }).join("") + "</tr></thead>") + "<tbody>" + this._rows.map(function (row) {
	        return "<tr>" + row.map(function (c) {
	          return "<td>" + (typeof c === "number" ? c.toLocaleString() : c) + "</td>";
	        }).join("") + "</tr>";
	      }).join("") + "</tbody></table>";
	    }
	    /**
	     * Show a chart representing the Table
	     * @param {(string|element)} [target]
	     * @param {HighchartsConfig} [config]
	     * @returns {Highcharts.Chart}
	     */

	  }, {
	    key: "chart",
	    value: function chart() {
	      var _this14 = this;

	      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
	      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	      if (_typeof(target) === 'object') {
	        config = target;
	        target = undefined;
	      }

	      if (target === undefined) {
	        if (typeof Spyral !== 'undefined' && Spyral.Notebook) {
	          target = Spyral.Notebook.getTarget();
	        } else {
	          target = document.createElement("div");
	          document.body.appendChild(target);
	        }
	      }

	      config.chart = config.chart || {};
	      var columnsCount = this.columns();
	      var rowsCount = this.rows();
	      var headers = this.headers(config.columns ? config.columns : true);
	      var isHeadersCategories = headers.every(function (h) {
	        return isNaN(h);
	      });

	      if (isHeadersCategories) {
	        Chart.setDefaultChartType(config, "column");
	      } // set categories if not set


	      config.xAxis = config.xAxis || {};
	      config.xAxis.categories = config.xAxis.categories || headers; // start filling in series

	      config.series = config.series || []; // one row, so let's take series from rows

	      if (rowsCount === 1) {
	        config.dataFrom = config.dataFrom || "rows";
	      } else if (columnsCount === 1) {
	        config.dataFrom = config.dataFrom || "columns";
	      }

	      if ("dataFrom" in config) {
	        if (config.dataFrom === "rows") {
	          config.data = {
	            rows: []
	          };
	          config.data.rows.push(headers);
	          config.data.rows = config.data.rows.concat(this.rows(true));
	        } else if (config.dataFrom === "columns") {
	          config.data = {
	            columns: []
	          };
	          config.data.columns = config.data.columns.concat(this.columns(true));

	          if (config.data.columns.length === headers.length) {
	            headers.forEach(function (h, i) {
	              config.data.columns[i].splice(0, 0, h);
	            });
	          }
	        }
	      } else if ("seriesFrom" in config) {
	        if (config.seriesFrom === "rows") {
	          this.rows(config.rows ? config.rows : true).forEach(function (row, i) {
	            config.series[i] = config.series[i] || {};
	            config.series[i].data = headers.map(function (h) {
	              return _this14.cell(i, h);
	            });
	          });
	        } else if (config.seriesFrom === "columns") {
	          this.columns(config.columns ? config.columns : true).forEach(function (col, i) {
	            config.series[i] = config.series[i] || {};
	            config.series[i].data = [];

	            for (var r = 0; r < rowsCount; r++) {
	              config.series[i].data.push(_this14.cell(r, i));
	            }
	          });
	        }
	      }

	      delete config.dataFrom;
	      delete config.seriesFrom;
	      return Chart.create(target, config);
	    }
	    /**
	     * Create a new Table
	     * @param {(object|array|string|number)} data
	     * @param {TableConfig} config
	     * @returns {Table}
	     */

	  }], [{
	    key: "create",
	    value: function create(data, config) {
	      for (var _len6 = arguments.length, other = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
	        other[_key6 - 2] = arguments[_key6];
	      }

	      return _construct(Table, [data, config].concat(other));
	    }
	    /**
	     * Fetch a Table from a source
	     * @param {string|Request} input
	     * @param {object} api
	     * @param {object} config
	     * @returns {Promise}
	     */

	  }, {
	    key: "fetch",
	    value: function fetch(input, api, config) {
	      return new Promise(function (resolve, reject) {
	        window.fetch(input, api).then(function (response) {
	          if (!response.ok) {
	            throw new Error(response.status + " " + response.statusText);
	          }

	          response.text().then(function (text) {
	            resolve(Table.create(text, config || api));
	          });
	        });
	      });
	    }
	    /**
	     * Get the count of each unique value in the data
	     * @param {array} data
	     * @returns {object}
	     */

	  }, {
	    key: "counts",
	    value: function counts(data) {
	      var vals = {};
	      data.forEach(function (v) {
	        return v in vals ? vals[v]++ : vals[v] = 1;
	      });
	      return vals;
	    }
	    /**
	     * Compare two values
	     * @param {(number|string)} a
	     * @param {(number|string)} b
	     * @returns {number}
	     */

	  }, {
	    key: "cmp",
	    value: function cmp(a, b) {
	      return typeof a == "string" && typeof b == "string" ? a.localeCompare(b) : a - b;
	    }
	    /**
	     * Get the sum of the provided values
	     * @param {array} data
	     * @returns {number}
	     */

	  }, {
	    key: "sum",
	    value: function sum(data) {
	      return data.reduce(function (a, b) {
	        return a + b;
	      }, 0);
	    }
	    /**
	     * Get the mean of the provided values
	     * @param {array} data
	     * @returns {number}
	     */

	  }, {
	    key: "mean",
	    value: function mean(data) {
	      return Table.sum(data) / data.length;
	    }
	    /**
	     * Get rolling mean for the provided values
	     * @param {array} data
	     * @param {number} neighbors
	     * @returns {array}
	     */

	  }, {
	    key: "rollingMean",
	    value: function rollingMean(data, neighbors) {
	      // https://stackoverflow.com/questions/41386083/plot-rolling-moving-average-in-d3-js-v4/41388581#41387286
	      return data.map(function (val, idx, arr) {
	        var start = Math.max(0, idx - neighbors),
	            end = idx + neighbors;
	        var subset = arr.slice(start, end + 1);
	        var sum = subset.reduce(function (a, b) {
	          return a + b;
	        });
	        return sum / subset.length;
	      });
	    }
	    /**
	     * Get the variance for the provided values
	     * @param {array} data
	     * @returns {number}
	     */

	  }, {
	    key: "variance",
	    value: function variance(data) {
	      var m = Table.mean(data);
	      return Table.mean(data.map(function (num) {
	        return Math.pow(num - m, 2);
	      }));
	    }
	    /**
	     * Get the standard deviation for the provided values
	     * @param {array} data
	     * @returns {number}
	     */

	  }, {
	    key: "standardDeviation",
	    value: function standardDeviation(data) {
	      return Math.sqrt(Table.variance(data));
	    }
	    /**
	     * Get the z scores for the provided values
	     * @param {array} data
	     * @returns {array}
	     */

	  }, {
	    key: "zScores",
	    value: function zScores(data) {
	      var m = Table.mean(data);
	      var s = Table.standardDeviation(data);
	      return data.map(function (num) {
	        return (num - m) / s;
	      });
	    }
	    /**
	     * Perform a zip operation of the provided arrays {@link https://en.wikipedia.org/wiki/Convolution_(computer_science)}
	     * @param {array} data
	     * @returns {array}
	     */

	  }, {
	    key: "zip",
	    value: function zip() {
	      for (var _len7 = arguments.length, data = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
	        data[_key7] = arguments[_key7];
	      }

	      // we have a single nested array, so let's recall with flattened arguments
	      if (data.length == 1 && Array.isArray(data) && data.every(function (d) {
	        return Array.isArray(d);
	      })) {
	        var _Table$zip;

	        return (_Table$zip = Table.zip).apply.apply(_Table$zip, [null].concat(data));
	      } // allow arrays to be of different lengths


	      var len = Math.max.apply(null, data.map(function (d) {
	        return d.length;
	      }));
	      return new Array(len).fill().map(function (_, i) {
	        return data.map(function (d) {
	          return d[i];
	        });
	      });
	    }
	  }]);

	  return Table;
	}(); // this seems like a good balance between a built-in flexible parser and a heavier external parser
	// https://lowrey.me/parsing-a-csv-file-in-es6-javascript/


	var regex = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

	function parseCsvLine(line) {
	  var arr = [];
	  line.replace(regex, function (m0, m1, m2, m3) {
	    if (m1 !== undefined) {
	      arr.push(m1.replace(/\\'/g, "'"));
	    } else if (m2 !== undefined) {
	      arr.push(m2.replace(/\\"/g, "\""));
	    } else if (m3 !== undefined) {
	      arr.push(m3);
	    }

	    return "";
	  });

	  if (/,\s*$/.test(line)) {
	    arr.push("");
	  }

	  return arr;
	}

	var CategoriesManager = {
	  _categories: {},
	  _features: {},
	  _featureDefaults: {},
	  getCategories: function getCategories() {
	    return this._categories;
	  },
	  getCategoryTerms: function getCategoryTerms(name) {
	    return this._categories[name];
	  },
	  addCategory: function addCategory(name) {
	    if (this._categories[name] === undefined) {
	      this._categories[name] = [];
	    }
	  },
	  renameCategory: function renameCategory(oldName, newName) {
	    var terms = this.getCategoryTerms(oldName);
	    this.addTerms(newName, terms);

	    for (var feature in this._features) {
	      var value = this._features[feature][oldName];
	      this.setCategoryFeature(newName, feature, value);
	    }

	    this.removeCategory(oldName);
	  },
	  removeCategory: function removeCategory(name) {
	    delete this._categories[name];

	    for (var feature in this._features) {
	      delete this._features[feature][name];
	    }
	  },
	  addTerm: function addTerm(category, term) {
	    this.addTerms(category, [term]);
	  },
	  addTerms: function addTerms(category, terms) {
	    if (!Array.isArray(terms)) {
	      terms = [terms];
	    }

	    if (this._categories[category] === undefined) {
	      this.addCategory(category);
	    }

	    for (var i = 0; i < terms.length; i++) {
	      var term = terms[i];

	      if (this._categories[category].indexOf(term) === -1) {
	        this._categories[category].push(term);
	      }
	    }
	  },
	  removeTerm: function removeTerm(category, term) {
	    this.removeTerms(category, [term]);
	  },
	  removeTerms: function removeTerms(category, terms) {
	    if (!Array.isArray(terms)) {
	      terms = [terms];
	    }

	    if (this._categories[category] !== undefined) {
	      for (var i = 0; i < terms.length; i++) {
	        var term = terms[i];

	        var index = this._categories[category].indexOf(term);

	        if (index !== -1) {
	          this._categories[category].splice(index, 1);
	        }
	      }
	    }
	  },
	  getCategoryForTerm: function getCategoryForTerm(term) {
	    for (var category in this._categories) {
	      if (this._categories[category].indexOf(term) != -1) {
	        return category;
	      }
	    }

	    return undefined;
	  },
	  getFeatureForTerm: function getFeatureForTerm(feature, term) {
	    return this.getCategoryFeature(this.getCategoryForTerm(term), feature);
	  },
	  getFeatures: function getFeatures() {
	    return this._features;
	  },
	  addFeature: function addFeature(name, defaultValue) {
	    if (this._features[name] === undefined) {
	      this._features[name] = {};
	    }

	    if (defaultValue !== undefined) {
	      this._featureDefaults[name] = defaultValue;
	    }
	  },
	  removeFeature: function removeFeature(name) {
	    delete this._features[name];
	    delete this._featureDefaults[name];
	  },
	  setCategoryFeature: function setCategoryFeature(categoryName, featureName, featureValue) {
	    if (this._features[featureName] === undefined) {
	      this.addFeature(featureName);
	    }

	    this._features[featureName][categoryName] = featureValue;
	  },
	  getCategoryFeature: function getCategoryFeature(categoryName, featureName) {
	    var value = undefined;

	    if (this._features[featureName] !== undefined) {
	      value = this._features[featureName][categoryName];

	      if (value === undefined) {
	        value = this._featureDefaults[featureName];

	        if (typeof value === 'function') {
	          value = value();
	        }
	      }
	    }

	    return value;
	  },
	  getCategoryExportData: function getCategoryExportData() {
	    return {
	      categories: Object.assign({}, this._categories),
	      features: Object.assign({}, this._features)
	    };
	  },
	  loadCategoryData: function loadCategoryData(id) {
	    if (Voyant !== undefined && Ext !== undefined) {
	      var dfd = new Ext.Deferred();
	      Ext.Ajax.request({
	        url: Voyant.application.getTromboneUrl(),
	        params: {
	          tool: 'resource.StoredCategories',
	          retrieveResourceId: id,
	          failQuietly: false,
	          corpus: this.getCorpus() ? this.getCorpus().getId() : undefined
	        }
	      }).then(function (response) {
	        var json = Ext.decode(response.responseText);
	        var id = json.storedCategories.id;
	        var value = json.storedCategories.resource;

	        if (value.length === 0) {
	          dfd.reject();
	        } else {
	          value = Ext.decode(value);
	          this._categories = value.categories;
	          this._features = value.features;
	          dfd.resolve(value);
	        }
	      }, function () {
	        this.showError("Unable to load categories data: " + id);
	        dfd.reject();
	      }, null, this);
	      return dfd.promise;
	    }
	  },
	  saveCategoryData: function saveCategoryData(data) {
	    if (Voyant !== undefined && Ext !== undefined) {
	      data = data || this.getCategoryExportData();
	      var dfd = new Ext.Deferred();
	      var dataString = Ext.encode(data);
	      Ext.Ajax.request({
	        url: Voyant.application.getTromboneUrl(),
	        params: {
	          tool: 'resource.StoredResource',
	          storeResource: dataString
	        }
	      }).then(function (response) {
	        var json = Ext.util.JSON.decode(response.responseText);
	        var id = json.storedResource.id;
	        dfd.resolve(id);
	      }, function (response) {
	        dfd.reject();
	      });
	      return dfd.promise;
	    }
	  }
	};

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 * @namespace
	 */
	class Notebook {
		/**
		 * Returns the previous block.
		 * @static
		 * @returns {string}
		 */
		static getPreviousBlock() {
			return Spyral.Notebook.getBlock(-1);
		}
		/**
		 * Returns the next block.
		 * @static
		 * @returns {string}
		 */
		static getNextBlock() {
			return Spyral.Notebook.getBlock(1);
		}
		/**
		 * Returns the current block.
		 * @static
		 * @params {number} [offset] If specified, returns the block whose position is offset from the current block
		 * @returns {string}
		 */
		static getBlock() {
			if (Voyant && Voyant.notebook) {
				return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
			}
		}
		/**
		 * 
		 * @param {*} contents 
		 * @param {*} config 
		 */
		static show(contents, config) {
			var contents = Spyral.Util.toString(contents, config);
			if (contents instanceof Promise) {
				contents.then(c => Voyant.notebook.util.Show.show(c));
			} else {
				Voyant.notebook.util.Show.show(contents);
			}
		}
		/**
		 * Returns the target element
		 * @returns {element}
		 */
		static getTarget() {
			if (Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentBlock) {
				return Voyant.notebook.Notebook.currentBlock.results.getEl().dom
			} else {
				const target = document.createElement("div");
				document.body.appendChild(target);
				return target;
			}
		}

		/**
		 * Fetch and return the content of a notebook or a particular cell in a notebook
		 * @param {string} url
		 */
		static async import(url) {
			const isFullNotebook = url.indexOf('#') === -1;
			const isAbsoluteUrl = url.indexOf('http') === 0;

			let notebookId = '';
			let cellId = undefined;
			if (isAbsoluteUrl) {
				const urlParts = url.match(/\/[\w-]+/g);
				if (urlParts !== null) {
					notebookId = urlParts[urlParts.length-1].replace('/', '');
				} else {
					return;
				}
				if (!isFullNotebook) {
					cellId = url.split('#')[1];
				}
			} else {
				if (isFullNotebook) {
					notebookId = url;
				} else {
					[notebookId, cellId] = url.split('#');
				}
			}

			const json = await Spyral.Load.trombone({
				tool: 'notebook.NotebookManager',
				action: 'load',
				id: notebookId,
				noCache: 1
			});

			const notebook = json.notebook.data;
			const parser = new DOMParser();
			const htmlDoc = parser.parseFromString(notebook, 'text/html');
			
			let code = '';
			let error = undefined;
			if (cellId !== undefined) {
				const cell = htmlDoc.querySelector('#'+cellId);
				if (cell !== null && cell.classList.contains('notebookcodeeditorwrapper')) {
					code = cell.querySelector('pre').textContent;
				} else {
					error = 'No code found for cell: '+cellId;
				}
			} else {
				htmlDoc.querySelectorAll('section.notebook-editor-wrapper').forEach((cell, i) => {
					if (cell.classList.contains('notebookcodeeditorwrapper')) {
						code += cell.querySelector('pre').textContent + "\n";
					}
				});
			}
			
			if (Ext) {
				if (error === undefined) {
					Ext.toast({ // quick tip that auto-destructs
					     html: 'Imported code from: '+url,
					     width: 200,
					     align: 'b'
					});
				} else {
					Ext.Msg.show({
						title: 'Error importing code from: '+url,
						message: error,
						icon: Ext.Msg.ERROR,
						buttons: Ext.Msg.OK
					});
				}
			}

			let result = undefined;
			try {
				result = eval.call(window, code);
			} catch(e) {
				return e
			}
			if (result !== undefined) {
				console.log(result);
			}
			return result; // could be a promise?
		}
	}

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 * @namespace
	 */
	class Util {
		/**
		 * Generates a random ID of the specified length.
		 * @static
		 * @param {number} len The length of the ID to generate?
		 * @returns {string}
		 */
		static id(len) {
			len = len || 8;
			// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
			return Math.random().toString(36).substring(2, 2+len) + Math.random().toString(36).substring(2, 2+len)
		}
		/**
		 * 
		 * @static
		 * @param {*} contents 
		 * @param {*} config 
		 * @returns {string}
		 */
		static toString(contents, config) {
			if (contents.constructor === Array || contents.constructor===Object) {
				contents = JSON.stringify(contents);
				if (contents.length>500) {
					contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";
				}
			}
			return contents.toString();
		}
		/**
		 * 
		 * @static
		 * @param {*} before 
		 * @param {*} more 
		 * @param {*} after 
		 */
		static more(before, more, after) {
			return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+" <a href=''>+</a><div style='display: none'>"+contents.substring(501)+"</div>";

		}
	}

	/**
	 * A class for storing Notebook metadata
	 * @memberof Spyral
	 */
	class Metadata {
		/**
		 * The Metadata config object
		 * @typedef {object} MetadataConfig
		 * @property {string} title The title of the Corpus
		 * @property {string} author The author of the Corpus
		 * @property {string} description The description of the Corpus
		 * @property {array} keywords The keywords for the Corpus
		 * @property {string} created When the Corpus was created
		 * @property {string} language The language of the Corpus
		 * @property {string} license The license for the Corpus
		 */

		/** 
		 * The metadata constructor.
		 * @constructor
		 * @param {MetadataConfig} config The metadata config object
		 */
		constructor(config) {
			['title', 'author', 'description', 'keywords', 'modified', 'created', 'language', 'license'].forEach(key => {
				this[key] = undefined;
			});
			this.version = "0.1"; // may be changed by config
			if (config instanceof HTMLDocument) {
				config.querySelectorAll("meta").forEach(function(meta) {
					var name =  meta.getAttribute("name");
					if (name && this.hasOwnProperty(name)) {
						var content = meta.getAttribute("content");
						if (content) {
							this[name] = content;
						}
					}
				}, this);
			} else {
				this.set(config);
			}
			if (!this.created) {this.setDateNow("created");}
		}

		/**
		 * Set metadata properties.
		 * @param {object} config A config object
		 */
		set(config) {
			for (var key in config) {
				if (this.hasOwnProperty(key)) {
					this[key] = config[key];
				}
			}
		}

		/**
		 * Sets the specified field to the current date and time.
		 * @param {string} field 
		 */
		setDateNow(field) {
			this[field] = new Date().toISOString();
		}

		/**
		 * Gets the specified field as a short date.
		 * @param {string} field
		 * @returns {string|undefined}
		 */
		shortDate(field) {
			return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
		}

		/**
		 * Gets the fields as a set of HTML meta tags.
		 * @returns {string}
		 */
		getHeaders() {
			var quotes = /"/g, newlines = /(\r\n|\r|\n)/g, tags = /<\/?\w+.*?>/g,
				headers = "<title>"+(this.title || "").replace(tags,"")+"</title>\n";
			for (var key in this) {
				if (this[key]) {
					headers+='<meta name="'+key+'" content="'+this[key].replace(quotes, "&quot;").replace(newlines, " ")+'">';
				}
			}
			return headers;
		}
	}

	/**
	 * @namespace Spyral
	 */
	const Spyral$1 = {
		Notebook,
		Util,
		Metadata,
		Corpus,
		Table,
		Load,
		Chart,
		CategoriesManager
	};

	return Spyral$1;

}());
