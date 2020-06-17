var Spyral = (function () {
  'use strict';

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

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
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

  function ownKeys(object, enumerableOnly) {
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
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          prototype[method] = function (arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;

          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports );

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  /**
   * A helper for working with the Voyant Notebook app.
   * @memberof Spyral
   * @namespace
   */
  var Util = /*#__PURE__*/function () {
    function Util() {
      _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
      key: "id",

      /**
       * Generates a random ID of the specified length.
       * @static
       * @param {number} len The length of the ID to generate?
       * @returns {string}
       */
      value: function id() {
        var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
        // based on https://stackoverflow.com/a/13403498
        var times = Math.ceil(len / 11);
        var id = '';

        for (var i = 0; i < times; i++) {
          id += Math.random().toString(36).substring(2); // the result of this is 11 characters long
        }

        return id.substring(0, len);
      }
      /**
       * 
       * @static
       * @param {array|object|string} contents 
       * @returns {string}
       */

    }, {
      key: "toString",
      value: function toString(contents) {
        if (contents.constructor === Array || contents.constructor === Object) {
          contents = JSON.stringify(contents);

          if (contents.length > 500) {
            contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' + contents.substring(0, 500) + " <a href=''>+</a><div style='display: none'>" + contents.substring(501) + "</div>";
          }
        }

        return contents.toString();
      }
      /**
       * 
       * @static
       * @param {string} before 
       * @param {string} more 
       * @param {string} after 
       */

    }, {
      key: "more",
      value: function more(before, _more, after) {
        return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' + _more.substring(0, 500) + " <a href=''>+</a><div style='display: none'>" + _more.substring(501) + "</div>" + after;
      }
    }]);

    return Util;
  }();

  /**
   * A multiple file input that features drag n drop as well as temporary file storage in session storage.
   */

  var FileInput = /*#__PURE__*/function () {
    /**
     * The FileInput constructor
     * @param {element} target The element to place the file input into
     * @param {function} resolve A function to call with the file(s)
     * @param {function} reject A function to call if the input is cancelled
     */
    function FileInput(target, resolve, reject) {
      _classCallCheck(this, FileInput);

      this.target = target;
      this.resolve = resolve;
      this.reject = reject;
      this.inputParent = undefined;
      this.fileInput = undefined;
      this.inputLabel = undefined;

      if (target.querySelector('[spyral-temp-doc]') !== null) {
        FileInput.getStoredFiles(target).then(function (storedFiles) {
          if (storedFiles !== null) {
            resolve(storedFiles);
          }
        });
      } else {
        this._init();
      }
    }

    _createClass(FileInput, [{
      key: "_init",
      value: function _init() {
        var _this = this;

        // construct the elements
        this.inputParent = document.createElement('div');
        this.inputParent.setAttribute('style', 'padding: 8px; background-color: #fff; outline: 2px dashed #999; text-align: center;');
        this.inputParent.setAttribute('spyral-temp-doc', Util.id(32));
        var fileInputId = Util.id(16);
        this.fileInput = document.createElement('input');
        this.fileInput.style.setProperty('display', 'none');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('multiple', 'multiple');
        this.fileInput.setAttribute('id', fileInputId);
        this.fileInput.addEventListener('change', function (event) {
          _this._showFiles(event.target.files);

          _this._storeFiles(event.target.files);
        });
        this.inputParent.appendChild(this.fileInput);
        this.inputLabel = document.createElement('label');
        this.inputLabel.setAttribute('for', fileInputId);
        this.inputParent.appendChild(this.inputLabel);
        var labelText = document.createElement('strong');
        labelText.style.setProperty('cursor', 'pointer');
        labelText.appendChild(document.createTextNode('Choose a file'));
        this.inputLabel.appendChild(labelText);
        var dndSpot = document.createElement('span');
        dndSpot.appendChild(document.createTextNode(' or drag it here'));
        this.inputLabel.appendChild(dndSpot);
        var resetButton = document.createElement('span');
        resetButton.setAttribute('style', 'width: 16px; height: 16px; border: 1px solid #999; float: right; line-height: 12px; color: #666; cursor: pointer;');
        resetButton.setAttribute('title', 'Remove File Input'); // listener to remove the element, which can be called from a saved notebook

        resetButton.setAttribute('onclick', "if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') { Ext.getCmp(this.parentElement.parentElement.getAttribute('id')).destroy(); } else { this.parentElement.remove(); }"); // additional listener to reject the promise, if this input was created through run code

        resetButton.addEventListener('click', function () {
          this.reject();
        }.bind(this));
        resetButton.appendChild(document.createTextNode('x'));
        this.inputParent.appendChild(resetButton);
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
          _this.inputParent.addEventListener(event, function (e) {
            e.preventDefault();
            e.stopPropagation();
          });
        });
        ['dragover', 'dragenter'].forEach(function (event) {
          _this.inputParent.addEventListener(event, function (e) {
            _this.inputParent.style.setProperty('background-color', '#ccc');
          });
        });
        ['dragend', 'dragleave', 'drop'].forEach(function (event) {
          _this.inputParent.addEventListener(event, function (e) {
            _this.inputParent.style.removeProperty('background-color');
          });
        });
        this.inputParent.addEventListener('drop', function (event) {
          _this._showFiles(event.dataTransfer.files);

          _this._storeFiles(event.dataTransfer.files);
        });
        this.target.appendChild(this.inputParent);
        console.log('init done');
      } // update label with file info

    }, {
      key: "_showFiles",
      value: function _showFiles(files) {
        if (files.length > 0) {
          this.inputLabel.textContent = files.length > 1 ? Array.from(files).map(function (f) {
            return f.name;
          }).join(', ') : files[0].name; // prevent file input from being re-used

          this.fileInput.remove();
        }
      }
    }, {
      key: "_storeFiles",
      value: function _storeFiles(fileList) {
        var _this2 = this;

        var files = Array.from(fileList);
        var readFiles = [];
        var currIndex = 0;

        if (files.length > 0) {
          var fr = new FileReader();

          fr.onload = function (e) {
            readFiles.push({
              filename: files[currIndex].name,
              type: files[currIndex].type,
              data: e.target.result
            });
            currIndex++;

            if (currIndex < files.length) {
              fr.readAsDataURL(files[currIndex]);
            } else {
              // store each file in its own session storage entry
              var childIds = readFiles.map(function (val, index) {
                var childId = Util.id(32);
                window.sessionStorage.setItem('filename-' + childId, val.filename);
                window.sessionStorage.setItem('data-' + childId, val.data);
                window.sessionStorage.setItem('type-' + childId, val.type);
                return childId;
              }); // store the ids for each file for later retrieval

              window.sessionStorage.setItem(_this2.inputParent.getAttribute('spyral-temp-doc'), childIds.join());
              createServerStorage();

              if (typeof ServerStorage !== 'undefined') {
                var serverStorage = new ServerStorage();
                serverStorage.storeResource(_this2.inputParent.getAttribute('spyral-temp-doc'), childIds.join());
                readFiles.map(function (val, index) {
                  var childId = childIds[index];
                  serverStorage.storeResource(childId, {
                    filename: val.filename,
                    data: val.data,
                    type: val.type
                  });
                  return childId;
                });
              }

              _this2.resolve(files);
            }
          };

          fr.readAsDataURL(files[currIndex]);
        } else {
          this.resolve(files);
        }
      }
    }], [{
      key: "getStoredFiles",
      value: function () {
        var _getStoredFiles = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(target) {
          var spyralTempDoc, fileIds, storedFiles, i, fileId, filename, data, type, file, serverStorage, _storedFiles, _i, storedFile, _file;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(target.hasAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]') !== null)) {
                    _context.next = 53;
                    break;
                  }

                  spyralTempDoc = target.getAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]').getAttribute('spyral-temp-doc'); // check local storage

                  fileIds = window.sessionStorage.getItem(spyralTempDoc);

                  if (!(fileIds !== null)) {
                    _context.next = 22;
                    break;
                  }

                  storedFiles = [];
                  fileIds = fileIds.split(',');
                  i = 0;

                case 7:
                  if (!(i < fileIds.length)) {
                    _context.next = 19;
                    break;
                  }

                  fileId = fileIds[i];
                  filename = window.sessionStorage.getItem('filename-' + fileId);
                  data = window.sessionStorage.getItem('data-' + fileId);
                  type = window.sessionStorage.getItem('type-' + fileId);
                  _context.next = 14;
                  return FileInput.dataUrlToFile(data, filename, type);

                case 14:
                  file = _context.sent;
                  storedFiles.push(file);

                case 16:
                  i++;
                  _context.next = 7;
                  break;

                case 19:
                  return _context.abrupt("return", storedFiles);

                case 22:
                  // check server storage (if available)
                  createServerStorage();

                  if (!((typeof ServerStorage === "undefined" ? "undefined" : _typeof(ServerStorage)) !== undefined)) {
                    _context.next = 53;
                    break;
                  }

                  serverStorage = new ServerStorage();
                  _context.prev = 25;
                  _context.next = 28;
                  return serverStorage.getStoredResource(spyralTempDoc);

                case 28:
                  fileIds = _context.sent;

                  if (!(fileIds !== undefined)) {
                    _context.next = 47;
                    break;
                  }

                  _storedFiles = [];
                  fileIds = fileIds.split(',');
                  _i = 0;

                case 33:
                  if (!(_i < fileIds.length)) {
                    _context.next = 44;
                    break;
                  }

                  _context.next = 36;
                  return serverStorage.getStoredResource(fileIds[_i]);

                case 36:
                  storedFile = _context.sent;
                  _context.next = 39;
                  return FileInput.dataUrlToFile(storedFile.data, storedFile.filename, storedFile.type);

                case 39:
                  _file = _context.sent;

                  _storedFiles.push(_file);

                case 41:
                  _i++;
                  _context.next = 33;
                  break;

                case 44:
                  return _context.abrupt("return", _storedFiles);

                case 47:
                  return _context.abrupt("return", null);

                case 48:
                  _context.next = 53;
                  break;

                case 50:
                  _context.prev = 50;
                  _context.t0 = _context["catch"](25);
                  return _context.abrupt("return", null);

                case 53:
                  return _context.abrupt("return", null);

                case 54:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[25, 50]]);
        }));

        function getStoredFiles(_x) {
          return _getStoredFiles.apply(this, arguments);
        }

        return getStoredFiles;
      }()
    }, {
      key: "dataUrlToFile",
      value: function () {
        var _dataUrlToFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataUrl, fileName, mimeType) {
          var res, buf, file;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return fetch(dataUrl);

                case 2:
                  res = _context2.sent;
                  _context2.next = 5;
                  return res.arrayBuffer();

                case 5:
                  buf = _context2.sent;
                  file = new File([buf], fileName, {
                    type: mimeType
                  });
                  return _context2.abrupt("return", file);

                case 8:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function dataUrlToFile(_x2, _x3, _x4) {
          return _dataUrlToFile.apply(this, arguments);
        }

        return dataUrlToFile;
      }()
    }, {
      key: "destroy",
      value: function destroy(target) {
        if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
          if (target.hasAttribute('spyral-temp-doc')) {
            target = target.parentElement;
          }

          Ext.getCmp(target.getAttribute('id')).destroy();
        } else {
          target.remove();
        }
      }
      /* currently unused
      static clearStoredFiles(target) {
      	if (target.hasAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]') !== null) {
      		const spyralTempDoc = target.getAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]').getAttribute('spyral-temp-doc');
      		let fileIds = window.sessionStorage.getItem(spyralTempDoc);
      		if (fileIds !== null) {
      			fileIds.split(',').forEach((fileId) => {
      				window.sessionStorage.removeItem('filename-'+fileId);
      				window.sessionStorage.removeItem('data-'+fileId);
      				window.sessionStorage.removeItem('type-'+fileId);
      			})
      			window.sessionStorage.removeItem(spyralTempDoc);
      		}
      		// TODO also clear server storage?
      	}
      }
      */

    }]);

    return FileInput;
  }();

  function createServerStorage() {
    if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
      if (typeof ServerStorage === 'undefined') {
        Ext.define('ServerStorage', {
          extend: 'Voyant.util.Storage',
          getTromboneUrl: function getTromboneUrl() {
            return Voyant.application.getTromboneUrl();
          }
        });
      }
    }
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
          if (all[key] instanceof Array) {
            return all[key].map(function (val) {
              return encodeURIComponent(key) + '=' + encodeURIComponent(val);
            }).join("&");
          } else {
            return encodeURIComponent(key) + '=' + encodeURIComponent(all[key]);
          }
        }).join("&");

        if ("method" in all === false) {
          all.method = "GET";
        }

        var opt = {};

        if (all.method === "GET") {
          if (searchParams.length < 800) {
            var _loop = function _loop(_key) {
              if (all[_key] instanceof Array) {
                all[_key].forEach(function (val) {
                  url.searchParams.append(_key, val);
                });
              } else {
                url.searchParams.set(_key, all[_key]);
              }
            };

            for (var _key in all) {
              _loop(_key);
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
        } else if (all.method === "POST") {
          opt = {
            method: 'POST'
          };

          if ("body" in all) {
            opt.body = all["body"];
          } else {
            opt.headers = {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            };
            opt.body = searchParams;
          }
        } else {
          console.warn('Load.trombone: unsupported method:', all.method);
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
       * Create a file input in the target element and returns a Promise that's resolved with the file(s) that is added to the input.
       * The file is also temporarily stored in the session storage for successive retrieval.
       * @param {element} target The target element to append the input to
       * @returns {Promise}
       */

    }, {
      key: "files",
      value: function files() {
        var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        var hasPreExistingTarget = false;

        function createTarget() {
          if (typeof Spyral !== 'undefined' && Spyral.Notebook && typeof Ext !== 'undefined') {
            var spyralTarget = Spyral.Notebook.getTarget(); // check for pre-existing target

            var codeWrapper = spyralTarget.closest('.notebook-code-wrapper');

            if (codeWrapper === null) {
              console.warn("Spyral.Load.files: can't find CodeEditorWrapper parent");
              target = null;
            } else {
              target = codeWrapper.querySelector('[spyral-temp-doc]');
            }

            if (target === null) {
              // add a component so that vbox layout will be properly calculated
              var resultsCmp = Ext.getCmp(spyralTarget.getAttribute('id'));
              var codeEditorCell = resultsCmp.findParentByType('notebookcodeeditorwrapper');

              var targetConfig = codeEditorCell._getUIComponent('');

              var targetCmp = codeEditorCell.insert(1, targetConfig); // insert after code cell

              codeEditorCell.setHeight(codeEditorCell.getHeight() + 80); // need to explicitly adjust height for added component to be visible

              target = targetCmp.getEl().dom;
            } else {
              hasPreExistingTarget = true;
              target = target.parentElement;
            }
          } else {
            target = document.createElement("div");
            target.setAttribute('class', 'target');
            document.body.appendChild(target);
          }
        }

        if (target === undefined) {
          createTarget();
        }

        var promise;

        if (hasPreExistingTarget) {
          promise = new Promise( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
              var storedFiles, deleteMsg;
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return FileInput.getStoredFiles(target);

                    case 2:
                      storedFiles = _context.sent;

                      if (!(storedFiles !== null)) {
                        _context.next = 8;
                        break;
                      }

                      resolve(storedFiles);
                      return _context.abrupt("return");

                    case 8:
                      // files have been removed so re-create the input
                      FileInput.destroy(target);
                      createTarget();
                      deleteMsg = 'The previously added files have been deleted. You will need to add new files.';

                      if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
                        Ext.ComponentQuery.query('notebook')[0].toastError({
                          html: deleteMsg,
                          anchor: 'tr'
                        });
                      } else {
                        alert(deleteMsg);
                      }

                    case 12:
                      new FileInput(target, resolve, reject);

                    case 13:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function (_x, _x2) {
              return _ref.apply(this, arguments);
            };
          }());
        } else {
          promise = new Promise(function (resolve, reject) {
            new FileInput(target, resolve, reject);
          });
        } // graft this function to avoid need for then


        promise.setNextBlockFromFiles = function () {
          var args = arguments;
          return this.then(function (files) {
            return Spyral.Notebook.setNextBlockFromFiles.apply(Load, [files].concat(Array.from(args)));
          });
        };

        promise.loadCorpusFromFiles = function () {
          var args = arguments;
          return this.then(function (files) {
            return Spyral.Corpus.load.apply(Spyral.Corpus, [files].concat(Array.from(args)));
          });
        };

        return promise;
      }
    }]);

    return Load;
  }();

  _defineProperty(Load, "baseUrl", void 0);

  var interopRequireDefault = createCommonjsModule(function (module) {
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        "default": obj
      };
    }

    module.exports = _interopRequireDefault;
  });
  unwrapExports(interopRequireDefault);

  var check = function check(it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


  var global_1 = // eslint-disable-next-line no-undef
  check((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) == 'object' && globalThis) || check((typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window) || check((typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self) || check(_typeof(commonjsGlobal) == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
  Function('return this')();

  var fails = function fails(exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var descriptors = !fails(function () {
    return Object.defineProperty({}, 1, {
      get: function get() {
        return 7;
      }
    })[1] != 7;
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
    1: 2
  }, 1); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;
  var objectPropertyIsEnumerable = {
    f: f
  };

  var createPropertyDescriptor = function createPropertyDescriptor(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function classofRaw(it) {
    return toString.call(it).slice(8, -1);
  };

  var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function requireObjectCoercible(it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  var toIndexedObject = function toIndexedObject(it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function isObject(it) {
    return _typeof(it) === 'object' ? it !== null : typeof it === 'function';
  };

  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function toPrimitive(input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function has(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function documentCreateElement(it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function get() {
        return 7;
      }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor(O, P);
    } catch (error) {
      /* empty */
    }
    if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };
  var objectGetOwnPropertyDescriptor = {
    f: f$1
  };

  var replacement = /#|\.prototype\./;

  var isForced = function isForced(feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';
  var isForced_1 = isForced;

  var path = {};

  var aFunction = function aFunction(it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    }

    return it;
  };

  var functionBindContext = function functionBindContext(fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 0:
        return function () {
          return fn.call(that);
        };

      case 1:
        return function (a) {
          return fn.call(that, a);
        };

      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function ()
    /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  var anObject = function anObject(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    }

    return it;
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) {
      /* empty */
    }
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

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

  var wrapConstructor = function wrapConstructor(NativeConstructor) {
    var Wrapper = function Wrapper(a, b, c) {
      if (this instanceof NativeConstructor) {
        switch (arguments.length) {
          case 0:
            return new NativeConstructor();

          case 1:
            return new NativeConstructor(a);

          case 2:
            return new NativeConstructor(a, b);
        }

        return new NativeConstructor(a, b, c);
      }

      return NativeConstructor.apply(this, arguments);
    };

    Wrapper.prototype = NativeConstructor.prototype;
    return Wrapper;
  };
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


  var _export = function _export(options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var PROTO = options.proto;
    var nativeSource = GLOBAL ? global_1 : STATIC ? global_1[TARGET] : (global_1[TARGET] || {}).prototype;
    var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
    var targetPrototype = target.prototype;
    var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
    var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

    for (key in source) {
      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contains in native

      USE_NATIVE = !FORCED && nativeSource && has(nativeSource, key);
      targetProperty = target[key];
      if (USE_NATIVE) if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(nativeSource, key);
        nativeProperty = descriptor && descriptor.value;
      } else nativeProperty = nativeSource[key]; // export native or implementation

      sourceProperty = USE_NATIVE && nativeProperty ? nativeProperty : source[key];
      if (USE_NATIVE && _typeof(targetProperty) === _typeof(sourceProperty)) continue; // bind timers to global for call from export context

      if (options.bind && USE_NATIVE) resultProperty = functionBindContext(sourceProperty, global_1); // wrap global constructors for prevent changs in this version
      else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty); // make static versions for prototype methods
        else if (PROTO && typeof sourceProperty == 'function') resultProperty = functionBindContext(Function.call, sourceProperty); // default case
          else resultProperty = sourceProperty; // add a flag to not completely full polyfills

      if (options.sham || sourceProperty && sourceProperty.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty(resultProperty, 'sham', true);
      }

      target[key] = resultProperty;

      if (PROTO) {
        VIRTUAL_PROTOTYPE = TARGET + 'Prototype';

        if (!has(path, VIRTUAL_PROTOTYPE)) {
          createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
        } // export virtual prototype methods


        path[VIRTUAL_PROTOTYPE][key] = sourceProperty; // export real prototype methods

        if (options.real && targetPrototype && !targetPrototype[key]) {
          createNonEnumerableProperty(targetPrototype, key, sourceProperty);
        }
      }
    }
  };

  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  _export({
    target: 'Object',
    stat: true,
    forced: !descriptors,
    sham: !descriptors
  }, {
    defineProperty: objectDefineProperty.f
  });

  var defineProperty_1 = createCommonjsModule(function (module) {
    var Object = path.Object;

    var defineProperty = module.exports = function defineProperty(it, key, desc) {
      return Object.defineProperty(it, key, desc);
    };

    if (Object.defineProperty.sham) defineProperty.sham = true;
  });

  var defineProperty = defineProperty_1;

  var defineProperty$1 = defineProperty;

  // https://tc39.github.io/ecma262/#sec-isarray

  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  // https://tc39.github.io/ecma262/#sec-toobject

  var toObject = function toObject(argument) {
    return Object(requireObjectCoercible(argument));
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function toInteger(argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function toLength(argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var createProperty = function createProperty(object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
  };

  var setGlobal = function setGlobal(key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = '__core-js_shared__';
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.6.4',
      mode:  'pure' ,
      copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
    });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function uid(key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
  && !Symbol.sham // eslint-disable-next-line no-undef
  && _typeof(Symbol.iterator) == 'symbol';

  var WellKnownSymbolsStore = shared('wks');
  var _Symbol = global_1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid ? _Symbol : _Symbol && _Symbol.withoutSetter || uid;

  var wellKnownSymbol = function wellKnownSymbol(name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(_Symbol, name)) WellKnownSymbolsStore[name] = _Symbol[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate

  var arraySpeciesCreate = function arraySpeciesCreate(originalArray, length) {
    var C;

    if (isArray(originalArray)) {
      C = originalArray.constructor; // cross-realm fallback

      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var aFunction$1 = function aFunction(variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function getBuiltIn(namespace, method) {
    return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
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

  var arrayMethodHasSpeciesSupport = function arrayMethodHasSpeciesSupport(METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return engineV8Version >= 51 || !fails(function () {
      var array = [];
      var constructor = array.constructor = {};

      constructor[SPECIES$1] = function () {
        return {
          foo: 1
        };
      };

      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/679

  var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });
  var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

  var isConcatSpreadable = function isConcatSpreadable(O) {
    if (!isObject(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };

  var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species

  _export({
    target: 'Array',
    proto: true,
    forced: FORCED
  }, {
    concat: function concat(arg) {
      // eslint-disable-line no-unused-vars
      var O = toObject(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;

      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];

        if (isConcatSpreadable(E)) {
          len = toLength(E.length);
          if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

          for (k = 0; k < len; k++, n++) {
            if (k in E) createProperty(A, n, E[k]);
          }
        } else {
          if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          createProperty(A, n++, E);
        }
      }

      A.length = n;
      return A;
    }
  });

  var entryVirtual = function entryVirtual(CONSTRUCTOR) {
    return path[CONSTRUCTOR + 'Prototype'];
  };

  var concat = entryVirtual('Array').concat;

  var ArrayPrototype = Array.prototype;

  var concat_1 = function concat_1(it) {
    var own = it.concat;
    return it === ArrayPrototype || it instanceof Array && own === ArrayPrototype.concat ? concat : own;
  };

  var concat$1 = concat_1;

  var concat$2 = concat$1;

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function toAbsoluteIndex(index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  var createMethod = function createMethod(IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++]; // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
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

  var arrayMethodIsStrict = function arrayMethodIsStrict(METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () {
        throw 1;
      }, 1);
    });
  };

  var defineProperty$2 = Object.defineProperty;
  var cache = {};

  var thrower = function thrower(it) {
    throw it;
  };

  var arrayMethodUsesToLength = function arrayMethodUsesToLength(METHOD_NAME, options) {
    if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
    var argument0 = has(options, 0) ? options[0] : thrower;
    var argument1 = has(options, 1) ? options[1] : undefined;
    return cache[METHOD_NAME] = !!method && !fails(function () {
      if (ACCESSORS && !descriptors) return true;
      var O = {
        length: -1
      };
      if (ACCESSORS) defineProperty$2(O, 1, {
        enumerable: true,
        get: thrower
      });else O[1] = 1;
      method.call(O, argument0, argument1);
    });
  };

  var $indexOf = arrayIncludes.indexOf;
  var nativeIndexOf = [].indexOf;
  var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
  var STRICT_METHOD = arrayMethodIsStrict('indexOf');
  var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof

  _export({
    target: 'Array',
    proto: true,
    forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH
  }, {
    indexOf: function indexOf(searchElement
    /* , fromIndex = 0 */
    ) {
      return NEGATIVE_ZERO // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var indexOf = entryVirtual('Array').indexOf;

  var ArrayPrototype$1 = Array.prototype;

  var indexOf_1 = function indexOf_1(it) {
    var own = it.indexOf;
    return it === ArrayPrototype$1 || it instanceof Array && own === ArrayPrototype$1.indexOf ? indexOf : own;
  };

  var indexOf$1 = indexOf_1;

  var indexOf$2 = indexOf$1;

  var hiddenKeys = {};

  var indexOf$3 = arrayIncludes.indexOf;

  var objectKeysInternal = function objectKeysInternal(object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) {
      !has(hiddenKeys, key) && has(O, key) && result.push(key);
    } // Don't enum bug & hidden keys


    while (names.length > i) {
      if (has(O, key = names[i++])) {
        ~indexOf$3(result, key) || result.push(key);
      }
    }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

  // https://tc39.github.io/ecma262/#sec-object.keys

  var objectKeys = Object.keys || function keys(O) {
    return objectKeysInternal(O, enumBugKeys);
  };

  // https://tc39.github.io/ecma262/#sec-object.defineproperties

  var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;

    while (length > index) {
      objectDefineProperty.f(O, key = keys[index++], Properties[key]);
    }

    return O;
  };

  var html = getBuiltIn('document', 'documentElement');

  var keys = shared('keys');

  var sharedKey = function sharedKey(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var GT = '>';
  var LT = '<';
  var PROTOTYPE = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO = sharedKey('IE_PROTO');

  var EmptyConstructor = function EmptyConstructor() {
    /* empty */
  };

  var scriptTag = function scriptTag(content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  }; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


  var NullProtoObjectViaActiveX = function NullProtoObjectViaActiveX(activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak

    return temp;
  }; // Create object with fake `null` prototype: use iframe Object with cleared prototype


  var NullProtoObjectViaIFrame = function NullProtoObjectViaIFrame() {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  }; // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug


  var activeXDocument;

  var _NullProtoObject = function NullProtoObject() {
    try {
      /* global ActiveXObject */
      activeXDocument = document.domain && new ActiveXObject('htmlfile');
    } catch (error) {
      /* ignore */
    }

    _NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;

    while (length--) {
      delete _NullProtoObject[PROTOTYPE][enumBugKeys[length]];
    }

    return _NullProtoObject();
  };

  hiddenKeys[IE_PROTO] = true; // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create

  var objectCreate = Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      EmptyConstructor[PROTOTYPE] = anObject(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

      result[IE_PROTO] = O;
    } else result = _NullProtoObject();

    return Properties === undefined ? result : objectDefineProperties(result, Properties);
  };

  // https://tc39.github.io/ecma262/#sec-object.create

  _export({
    target: 'Object',
    stat: true,
    sham: !descriptors
  }, {
    create: objectCreate
  });

  var Object$1 = path.Object;

  var create = function create(P, D) {
    return Object$1.create(P, D);
  };

  var create$1 = create;

  var create$2 = create$1;

  // https://tc39.github.io/ecma262/#sec-array.isarray

  _export({
    target: 'Array',
    stat: true
  }, {
    isArray: isArray
  });

  var isArray$1 = path.Array.isArray;

  var isArray$2 = isArray$1;

  var isArray$3 = isArray$2;

  function _arrayWithHoles$1(arr) {
    if (isArray$3(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles$1;

  var iterators = {};

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != 'function') {
    sharedStore.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function enforce(it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function getterFor(TYPE) {
    return function (it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function set(it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function get(it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function has(it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;

    set = function set(it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function get(it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function has$1(it) {
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

  var correctPrototypeGetter = !fails(function () {
    function F() {
      /* empty */
    }

    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var IE_PROTO$1 = sharedKey('IE_PROTO');
  var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.getprototypeof

  var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    }

    return O instanceof Object ? ObjectPrototype : null;
  };

  var ITERATOR = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS = false;
  // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


  var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

  if ([].keys) {
    arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
      PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
    }
  }

  if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
  };

  var TO_STRING_TAG = wellKnownSymbol('toStringTag');
  var test = {};
  test[TO_STRING_TAG] = 'z';
  var toStringTagSupport = String(test) === '[object z]';

  var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag'); // ES3 wrong here

  var CORRECT_ARGUMENTS = classofRaw(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function tryGet(it, key) {
    try {
      return it[key];
    } catch (error) {
      /* empty */
    }
  }; // getting tag from ES6+ `Object.prototype.toString`


  var classof = toStringTagSupport ? classofRaw : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring


  var objectToString = toStringTagSupport ? {}.toString : function toString() {
    return '[object ' + classof(this) + ']';
  };

  var defineProperty$3 = objectDefineProperty.f;
  var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

  var setToStringTag = function setToStringTag(it, TAG, STATIC, SET_METHOD) {
    if (it) {
      var target = STATIC ? it : it.prototype;

      if (!has(target, TO_STRING_TAG$2)) {
        defineProperty$3(target, TO_STRING_TAG$2, {
          configurable: true,
          value: TAG
        });
      }

      if (SET_METHOD && !toStringTagSupport) {
        createNonEnumerableProperty(target, 'toString', objectToString);
      }
    }
  };

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

  var returnThis = function returnThis() {
    return this;
  };

  var createIteratorConstructor = function createIteratorConstructor(IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
      next: createPropertyDescriptor(1, next)
    });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
    iterators[TO_STRING_TAG] = returnThis;
    return IteratorConstructor;
  };

  var aPossiblePrototype = function aPossiblePrototype(it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    }

    return it;
  };

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
    } catch (error) {
      /* empty */
    }

    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var redefine = function redefine(target, key, value, options) {
    if (options && options.enumerable) target[key] = value;else createNonEnumerableProperty(target, key, value);
  };

  var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$1 = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis$1 = function returnThis() {
    return this;
  };

  var defineIterator = function defineIterator(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function getIterationMethod(KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

      switch (KIND) {
        case KEYS:
          return function keys() {
            return new IteratorConstructor(this, KIND);
          };

        case VALUES:
          return function values() {
            return new IteratorConstructor(this, KIND);
          };

        case ENTRIES:
          return function entries() {
            return new IteratorConstructor(this, KIND);
          };
      }

      return function () {
        return new IteratorConstructor(this);
      };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR$1] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY; // fix native

    if (anyNativeIterator) {
      CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

      if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {


        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
        iterators[TO_STRING_TAG] = returnThis$1;
      }
    } // fix Array#{values, @@iterator}.name in V8 / FF


    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;

      defaultIterator = function values() {
        return nativeIterator.call(this);
      };
    } // define iterator


    if (( FORCED) && IterablePrototype[ITERATOR$1] !== defaultIterator) {
      createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
    }

    iterators[NAME] = defaultIterator; // export additional methods

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
      } else _export({
        target: NAME,
        proto: true,
        forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
      }, methods);
    }

    return methods;
  };

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState = internalState.set;
  var getInternalState = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
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
      target: toIndexedObject(iterated),
      // target
      index: 0,
      // next index
      kind: kind // kind

    }); // `%ArrayIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;

    if (!target || index >= target.length) {
      state.target = undefined;
      return {
        value: undefined,
        done: true
      };
    }

    if (kind == 'keys') return {
      value: index,
      done: false
    };
    if (kind == 'values') return {
      value: target[index],
      done: false
    };
    return {
      value: [index, target[index]],
      done: false
    };
  }, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

  iterators.Arguments = iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

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

  var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global_1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype;

    if (CollectionPrototype && classof(CollectionPrototype) !== TO_STRING_TAG$3) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
    }

    iterators[COLLECTION_NAME] = iterators.Array;
  }

  var createMethod$1 = function createMethod(CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$1(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$1(true)
  };

  var charAt = stringMultibyte.charAt;
  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$1 = internalState.set;
  var getInternalState$1 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
  // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

  defineIterator(String, 'String', function (iterated) {
    setInternalState$1(this, {
      type: STRING_ITERATOR,
      string: String(iterated),
      index: 0
    }); // `%StringIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState$1(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return {
      value: undefined,
      done: true
    };
    point = charAt(string, index);
    state.index += point.length;
    return {
      value: point,
      done: false
    };
  });

  var ITERATOR$2 = wellKnownSymbol('iterator');

  var getIteratorMethod = function getIteratorMethod(it) {
    if (it != undefined) return it[ITERATOR$2] || it['@@iterator'] || iterators[classof(it)];
  };

  var getIterator = function getIterator(it) {
    var iteratorMethod = getIteratorMethod(it);

    if (typeof iteratorMethod != 'function') {
      throw TypeError(String(it) + ' is not iterable');
    }

    return anObject(iteratorMethod.call(it));
  };

  var getIterator_1 = getIterator;

  var getIterator$1 = getIterator_1;

  var ITERATOR$3 = wellKnownSymbol('iterator');

  var isIterable = function isIterable(it) {
    var O = Object(it);
    return O[ITERATOR$3] !== undefined || '@@iterator' in O // eslint-disable-next-line no-prototype-builtins
    || iterators.hasOwnProperty(classof(O));
  };

  var isIterable_1 = isIterable;

  var isIterable$1 = isIterable_1;

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;
  var toString$1 = {}.toString;
  var windowNames = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function getWindowNames(it) {
    try {
      return nativeGetOwnPropertyNames(it);
    } catch (error) {
      return windowNames.slice();
    }
  }; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


  var f$4 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
  };

  var objectGetOwnPropertyNamesExternal = {
    f: f$4
  };

  var f$5 = Object.getOwnPropertySymbols;
  var objectGetOwnPropertySymbols = {
    f: f$5
  };

  var f$6 = wellKnownSymbol;
  var wellKnownSymbolWrapped = {
    f: f$6
  };

  var defineProperty$4 = objectDefineProperty.f;

  var defineWellKnownSymbol = function defineWellKnownSymbol(NAME) {
    var _Symbol = path.Symbol || (path.Symbol = {});

    if (!has(_Symbol, NAME)) defineProperty$4(_Symbol, NAME, {
      value: wellKnownSymbolWrapped.f(NAME)
    });
  };

  var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

  var createMethod$2 = function createMethod(TYPE) {
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

      for (; length > index; index++) {
        if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);

          if (TYPE) {
            if (IS_MAP) target[index] = result; // map
            else if (result) switch (TYPE) {
                case 3:
                  return true;
                // some

                case 5:
                  return value;
                // find

                case 6:
                  return index;
                // findIndex

                case 2:
                  push.call(target, value);
                // filter
              } else if (IS_EVERY) return false; // every
          }
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$2(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod$2(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod$2(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod$2(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod$2(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod$2(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$2(6)
  };

  var $forEach = arrayIteration.forEach;
  var HIDDEN = sharedKey('hidden');
  var SYMBOL = 'Symbol';
  var PROTOTYPE$1 = 'prototype';
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var setInternalState$2 = internalState.set;
  var getInternalState$2 = internalState.getterFor(SYMBOL);
  var ObjectPrototype$1 = Object[PROTOTYPE$1];
  var $Symbol = global_1.Symbol;
  var $stringify = getBuiltIn('JSON', 'stringify');
  var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var nativeDefineProperty$1 = objectDefineProperty.f;
  var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
  var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
  var AllSymbols = shared('symbols');
  var ObjectPrototypeSymbols = shared('op-symbols');
  var StringToSymbolRegistry = shared('string-to-symbol-registry');
  var SymbolToStringRegistry = shared('symbol-to-string-registry');
  var WellKnownSymbolsStore$1 = shared('wks');
  var QObject = global_1.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDescriptor = descriptors && fails(function () {
    return objectCreate(nativeDefineProperty$1({}, 'a', {
      get: function get() {
        return nativeDefineProperty$1(this, 'a', {
          value: 7
        }).a;
      }
    })).a != 7;
  }) ? function (O, P, Attributes) {
    var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$1, P);
    if (ObjectPrototypeDescriptor) delete ObjectPrototype$1[P];
    nativeDefineProperty$1(O, P, Attributes);

    if (ObjectPrototypeDescriptor && O !== ObjectPrototype$1) {
      nativeDefineProperty$1(ObjectPrototype$1, P, ObjectPrototypeDescriptor);
    }
  } : nativeDefineProperty$1;

  var wrap = function wrap(tag, description) {
    var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
    setInternalState$2(symbol, {
      type: SYMBOL,
      tag: tag,
      description: description
    });
    if (!descriptors) symbol.description = description;
    return symbol;
  };

  var isSymbol = useSymbolAsUid ? function (it) {
    return _typeof(it) == 'symbol';
  } : function (it) {
    return Object(it) instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(O, P, Attributes) {
    if (O === ObjectPrototype$1) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
    anObject(O);
    var key = toPrimitive(P, true);
    anObject(Attributes);

    if (has(AllSymbols, key)) {
      if (!Attributes.enumerable) {
        if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
        O[HIDDEN][key] = true;
      } else {
        if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
        Attributes = objectCreate(Attributes, {
          enumerable: createPropertyDescriptor(0, false)
        });
      }

      return setSymbolDescriptor(O, key, Attributes);
    }

    return nativeDefineProperty$1(O, key, Attributes);
  };

  var $defineProperties = function defineProperties(O, Properties) {
    anObject(O);
    var properties = toIndexedObject(Properties);
    var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
    $forEach(keys, function (key) {
      if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
    });
    return O;
  };

  var $create = function create(O, Properties) {
    return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(V) {
    var P = toPrimitive(V, true);
    var enumerable = nativePropertyIsEnumerable$1.call(this, P);
    if (this === ObjectPrototype$1 && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
    return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
    var it = toIndexedObject(O);
    var key = toPrimitive(P, true);
    if (it === ObjectPrototype$1 && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
    var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);

    if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
      descriptor.enumerable = true;
    }

    return descriptor;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(O) {
    var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
    });
    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
    var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$1;
    var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype$1, key))) {
        result.push(AllSymbols[key]);
      }
    });
    return result;
  }; // `Symbol` constructor
  // https://tc39.github.io/ecma262/#sec-symbol-constructor


  if (!nativeSymbol) {
    $Symbol = function _Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
      var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
      var tag = uid(description);

      var setter = function setter(value) {
        if (this === ObjectPrototype$1) setter.call(ObjectPrototypeSymbols, value);
        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
      };

      if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$1, tag, {
        configurable: true,
        set: setter
      });
      return wrap(tag, description);
    };

    redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
      return getInternalState$2(this).tag;
    });
    redefine($Symbol, 'withoutSetter', function (description) {
      return wrap(uid(description), description);
    });
    objectPropertyIsEnumerable.f = $propertyIsEnumerable;
    objectDefineProperty.f = $defineProperty;
    objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
    objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
    objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

    wellKnownSymbolWrapped.f = function (name) {
      return wrap(wellKnownSymbol(name), name);
    };

    if (descriptors) {
      // https://github.com/tc39/proposal-Symbol-description
      nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
        configurable: true,
        get: function description() {
          return getInternalState$2(this).description;
        }
      });
    }
  }

  _export({
    global: true,
    wrap: true,
    forced: !nativeSymbol,
    sham: !nativeSymbol
  }, {
    Symbol: $Symbol
  });
  $forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
    defineWellKnownSymbol(name);
  });
  _export({
    target: SYMBOL,
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Symbol.for` method
    // https://tc39.github.io/ecma262/#sec-symbol.for
    'for': function _for(key) {
      var string = String(key);
      if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
      var symbol = $Symbol(string);
      StringToSymbolRegistry[string] = symbol;
      SymbolToStringRegistry[symbol] = string;
      return symbol;
    },
    // `Symbol.keyFor` method
    // https://tc39.github.io/ecma262/#sec-symbol.keyfor
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
      if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
    },
    useSetter: function useSetter() {
      USE_SETTER = true;
    },
    useSimple: function useSimple() {
      USE_SETTER = false;
    }
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol,
    sham: !descriptors
  }, {
    // `Object.create` method
    // https://tc39.github.io/ecma262/#sec-object.create
    create: $create,
    // `Object.defineProperty` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperty
    defineProperty: $defineProperty,
    // `Object.defineProperties` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperties
    defineProperties: $defineProperties,
    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Object.getOwnPropertyNames` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
    getOwnPropertyNames: $getOwnPropertyNames,
    // `Object.getOwnPropertySymbols` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443

  _export({
    target: 'Object',
    stat: true,
    forced: fails(function () {
      objectGetOwnPropertySymbols.f(1);
    })
  }, {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return objectGetOwnPropertySymbols.f(toObject(it));
    }
  }); // `JSON.stringify` method behavior with symbols
  // https://tc39.github.io/ecma262/#sec-json.stringify

  if ($stringify) {
    var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
      var symbol = $Symbol(); // MS Edge converts symbol values to JSON as {}

      return $stringify([symbol]) != '[null]' // WebKit converts symbol values to JSON as null
      || $stringify({
        a: symbol
      }) != '{}' // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
    });
    _export({
      target: 'JSON',
      stat: true,
      forced: FORCED_JSON_STRINGIFY
    }, {
      // eslint-disable-next-line no-unused-vars
      stringify: function stringify(it, replacer, space) {
        var args = [it];
        var index = 1;
        var $replacer;

        while (arguments.length > index) {
          args.push(arguments[index++]);
        }

        $replacer = replacer;
        if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

        if (!isArray(replacer)) replacer = function replacer(key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return $stringify.apply(null, args);
      }
    });
  } // `Symbol.prototype[@@toPrimitive]` method
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive


  if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
    createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
  } // `Symbol.prototype[@@toStringTag]` property
  // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag


  setToStringTag($Symbol, SYMBOL);
  hiddenKeys[HIDDEN] = true;

  // https://tc39.github.io/ecma262/#sec-symbol.asynciterator

  defineWellKnownSymbol('asyncIterator');

  // https://tc39.github.io/ecma262/#sec-symbol.hasinstance

  defineWellKnownSymbol('hasInstance');

  // https://tc39.github.io/ecma262/#sec-symbol.isconcatspreadable

  defineWellKnownSymbol('isConcatSpreadable');

  // https://tc39.github.io/ecma262/#sec-symbol.iterator

  defineWellKnownSymbol('iterator');

  // https://tc39.github.io/ecma262/#sec-symbol.match

  defineWellKnownSymbol('match');

  defineWellKnownSymbol('matchAll');

  // https://tc39.github.io/ecma262/#sec-symbol.replace

  defineWellKnownSymbol('replace');

  // https://tc39.github.io/ecma262/#sec-symbol.search

  defineWellKnownSymbol('search');

  // https://tc39.github.io/ecma262/#sec-symbol.species

  defineWellKnownSymbol('species');

  // https://tc39.github.io/ecma262/#sec-symbol.split

  defineWellKnownSymbol('split');

  // https://tc39.github.io/ecma262/#sec-symbol.toprimitive

  defineWellKnownSymbol('toPrimitive');

  // https://tc39.github.io/ecma262/#sec-symbol.tostringtag

  defineWellKnownSymbol('toStringTag');

  // https://tc39.github.io/ecma262/#sec-symbol.unscopables

  defineWellKnownSymbol('unscopables');

  // https://tc39.github.io/ecma262/#sec-math-@@tostringtag

  setToStringTag(Math, 'Math', true);

  // https://tc39.github.io/ecma262/#sec-json-@@tostringtag

  setToStringTag(global_1.JSON, 'JSON', true);

  var symbol = path.Symbol;

  // https://github.com/tc39/proposal-using-statement

  defineWellKnownSymbol('asyncDispose');

  // https://github.com/tc39/proposal-using-statement

  defineWellKnownSymbol('dispose');

  // https://github.com/tc39/proposal-observable

  defineWellKnownSymbol('observable');

  // https://github.com/tc39/proposal-pattern-matching

  defineWellKnownSymbol('patternMatch');

  defineWellKnownSymbol('replaceAll');

  var symbol$1 = symbol;

  var symbol$2 = symbol$1;

  function _iterableToArrayLimit$1(arr, i) {
    if (typeof symbol$2 === "undefined" || !isIterable$1(Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = getIterator$1(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit$1;

  var callWithSafeIterationClosing = function callWithSafeIterationClosing(iterator, fn, value, ENTRIES) {
    try {
      return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
    } catch (error) {
      var returnMethod = iterator['return'];
      if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
      throw error;
    }
  };

  var ITERATOR$4 = wellKnownSymbol('iterator');
  var ArrayPrototype$2 = Array.prototype; // check on default Array iterator

  var isArrayIteratorMethod = function isArrayIteratorMethod(it) {
    return it !== undefined && (iterators.Array === it || ArrayPrototype$2[ITERATOR$4] === it);
  };

  // https://tc39.github.io/ecma262/#sec-array.from


  var arrayFrom = function from(arrayLike
  /* , mapfn = undefined, thisArg = undefined */
  ) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var argumentsLength = arguments.length;
    var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iteratorMethod = getIteratorMethod(O);
    var index = 0;
    var length, result, step, iterator, next, value;
    if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2); // if the target is not iterable or it's an array with the default iterator - use a simple case

    if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
      iterator = iteratorMethod.call(O);
      next = iterator.next;
      result = new C();

      for (; !(step = next.call(iterator)).done; index++) {
        value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
        createProperty(result, index, value);
      }
    } else {
      length = toLength(O.length);
      result = new C(length);

      for (; length > index; index++) {
        value = mapping ? mapfn(O[index], index) : O[index];
        createProperty(result, index, value);
      }
    }

    result.length = index;
    return result;
  };

  var ITERATOR$5 = wellKnownSymbol('iterator');
  var SAFE_CLOSING = false;

  try {
    var called = 0;
    var iteratorWithReturn = {
      next: function next() {
        return {
          done: !!called++
        };
      },
      'return': function _return() {
        SAFE_CLOSING = true;
      }
    };

    iteratorWithReturn[ITERATOR$5] = function () {
      return this;
    }; // eslint-disable-next-line no-throw-literal


    Array.from(iteratorWithReturn, function () {
      throw 2;
    });
  } catch (error) {
    /* empty */
  }

  var checkCorrectnessOfIteration = function checkCorrectnessOfIteration(exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
    var ITERATION_SUPPORT = false;

    try {
      var object = {};

      object[ITERATOR$5] = function () {
        return {
          next: function next() {
            return {
              done: ITERATION_SUPPORT = true
            };
          }
        };
      };

      exec(object);
    } catch (error) {
      /* empty */
    }

    return ITERATION_SUPPORT;
  };

  var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
    Array.from(iterable);
  }); // `Array.from` method
  // https://tc39.github.io/ecma262/#sec-array.from

  _export({
    target: 'Array',
    stat: true,
    forced: INCORRECT_ITERATION
  }, {
    from: arrayFrom
  });

  var from_1 = path.Array.from;

  var from_1$1 = from_1;

  var from_1$2 = from_1$1;

  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
  var USES_TO_LENGTH$1 = arrayMethodUsesToLength('slice', {
    ACCESSORS: true,
    0: 0,
    1: 2
  });
  var SPECIES$2 = wellKnownSymbol('species');
  var nativeSlice = [].slice;
  var max$1 = Math.max; // `Array.prototype.slice` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.slice
  // fallback for not array-like ES3 strings and DOM objects

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1
  }, {
    slice: function slice(start, end) {
      var O = toIndexedObject(this);
      var length = toLength(O.length);
      var k = toAbsoluteIndex(start, length);
      var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

      var Constructor, result, n;

      if (isArray(O)) {
        Constructor = O.constructor; // cross-realm fallback

        if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
          Constructor = undefined;
        } else if (isObject(Constructor)) {
          Constructor = Constructor[SPECIES$2];
          if (Constructor === null) Constructor = undefined;
        }

        if (Constructor === Array || Constructor === undefined) {
          return nativeSlice.call(O, k, fin);
        }
      }

      result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));

      for (n = 0; k < fin; k++, n++) {
        if (k in O) createProperty(result, n, O[k]);
      }

      result.length = n;
      return result;
    }
  });

  var slice = entryVirtual('Array').slice;

  var ArrayPrototype$3 = Array.prototype;

  var slice_1 = function slice_1(it) {
    var own = it.slice;
    return it === ArrayPrototype$3 || it instanceof Array && own === ArrayPrototype$3.slice ? slice : own;
  };

  var slice$1 = slice_1;

  var slice$2 = slice$1;

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray$1;

  function _unsupportedIterableToArray$1(o, minLen) {
    var _context;

    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);

    var n = slice$2(_context = Object.prototype.toString.call(o)).call(_context, 8, -1);

    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return from_1$2(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray$1;

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableRest = _nonIterableRest$1;

  function _slicedToArray$1(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray$1;

  var $forEach$1 = arrayIteration.forEach;
  var STRICT_METHOD$1 = arrayMethodIsStrict('forEach');
  var USES_TO_LENGTH$2 = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

  var arrayForEach = !STRICT_METHOD$1 || !USES_TO_LENGTH$2 ? function forEach(callbackfn
  /* , thisArg */
  ) {
    return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach


  _export({
    target: 'Array',
    proto: true,
    forced: [].forEach != arrayForEach
  }, {
    forEach: arrayForEach
  });

  var forEach = entryVirtual('Array').forEach;

  var forEach$1 = forEach;

  var ArrayPrototype$4 = Array.prototype;
  var DOMIterables = {
    DOMTokenList: true,
    NodeList: true
  };

  var forEach_1 = function forEach_1(it) {
    var own = it.forEach;
    return it === ArrayPrototype$4 || it instanceof Array && own === ArrayPrototype$4.forEach // eslint-disable-next-line no-prototype-builtins
    || DOMIterables.hasOwnProperty(classof(it)) ? forEach$1 : own;
  };

  var forEach$2 = forEach_1;

  var $includes = arrayIncludes.includes;
  var USES_TO_LENGTH$3 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes

  _export({
    target: 'Array',
    proto: true,
    forced: !USES_TO_LENGTH$3
  }, {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  }); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

  var includes = entryVirtual('Array').includes;

  var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
  // https://tc39.github.io/ecma262/#sec-isregexp

  var isRegexp = function isRegexp(it) {
    var isRegExp;
    return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
  };

  var notARegexp = function notARegexp(it) {
    if (isRegexp(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    }

    return it;
  };

  var MATCH$1 = wellKnownSymbol('match');

  var correctIsRegexpLogic = function correctIsRegexpLogic(METHOD_NAME) {
    var regexp = /./;

    try {
      '/./'[METHOD_NAME](regexp);
    } catch (e) {
      try {
        regexp[MATCH$1] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (f) {
        /* empty */
      }
    }

    return false;
  };

  // https://tc39.github.io/ecma262/#sec-string.prototype.includes


  _export({
    target: 'String',
    proto: true,
    forced: !correctIsRegexpLogic('includes')
  }, {
    includes: function includes(searchString
    /* , position = 0 */
    ) {
      return !!~String(requireObjectCoercible(this)).indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var includes$1 = entryVirtual('String').includes;

  var ArrayPrototype$5 = Array.prototype;
  var StringPrototype = String.prototype;

  var includes$2 = function includes$2(it) {
    var own = it.includes;
    if (it === ArrayPrototype$5 || it instanceof Array && own === ArrayPrototype$5.includes) return includes;

    if (typeof it === 'string' || it === StringPrototype || it instanceof String && own === StringPrototype.includes) {
      return includes$1;
    }

    return own;
  };

  var includes$3 = includes$2;

  var includes$4 = includes$3;

  // a string of all valid unicode whitespaces
  // eslint-disable-next-line max-len
  var whitespaces = "\t\n\x0B\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";

  var whitespace = '[' + whitespaces + ']';
  var ltrim = RegExp('^' + whitespace + whitespace + '*');
  var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

  var createMethod$3 = function createMethod(TYPE) {
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
    start: createMethod$3(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
    end: createMethod$3(2),
    // `String.prototype.trim` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.trim
    trim: createMethod$3(3)
  };

  var trim = stringTrim.trim;
  var $parseInt = global_1.parseInt;
  var hex = /^[+-]?0[Xx]/;
  var FORCED$1 = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22; // `parseInt` method
  // https://tc39.github.io/ecma262/#sec-parseint-string-radix

  var numberParseInt = FORCED$1 ? function parseInt(string, radix) {
    var S = trim(String(string));
    return $parseInt(S, radix >>> 0 || (hex.test(S) ? 16 : 10));
  } : $parseInt;

  // https://tc39.github.io/ecma262/#sec-parseint-string-radix

  _export({
    global: true,
    forced: parseInt != numberParseInt
  }, {
    parseInt: numberParseInt
  });

  var _parseInt = path.parseInt;

  var _parseInt$1 = _parseInt;

  var _parseInt$2 = _parseInt$1;

  var slice$3 = slice_1;

  var slice$4 = slice$3;

  var test$1 = [];
  var nativeSort = test$1.sort; // IE8-

  var FAILS_ON_UNDEFINED = fails(function () {
    test$1.sort(undefined);
  }); // V8 bug

  var FAILS_ON_NULL = fails(function () {
    test$1.sort(null);
  }); // Old WebKit

  var STRICT_METHOD$2 = arrayMethodIsStrict('sort');
  var FORCED$2 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$2; // `Array.prototype.sort` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.sort

  _export({
    target: 'Array',
    proto: true,
    forced: FORCED$2
  }, {
    sort: function sort(comparefn) {
      return comparefn === undefined ? nativeSort.call(toObject(this)) : nativeSort.call(toObject(this), aFunction(comparefn));
    }
  });

  var sort = entryVirtual('Array').sort;

  var ArrayPrototype$6 = Array.prototype;

  var sort_1 = function sort_1(it) {
    var own = it.sort;
    return it === ArrayPrototype$6 || it instanceof Array && own === ArrayPrototype$6.sort ? sort : own;
  };

  var sort$1 = sort_1;

  var sort$2 = sort$1;

  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


  var regexpFlags = function regexpFlags() {
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

  var flags_1 = function flags_1(it) {
    return regexpFlags.call(it);
  };

  var RegExpPrototype = RegExp.prototype;

  var flags_1$1 = function flags_1$1(it) {
    return (it === RegExpPrototype || it instanceof RegExp) && !('flags' in it) ? flags_1(it) : it.flags;
  };

  var flags = flags_1$1;

  var flags$1 = flags;

  var xregexp = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _concat = interopRequireDefault(concat$2);

    var _indexOf = interopRequireDefault(indexOf$2);

    var _create = interopRequireDefault(create$2);

    var _slicedToArray2 = interopRequireDefault(slicedToArray);

    var _forEach = interopRequireDefault(forEach$2);

    var _getIterator2 = interopRequireDefault(getIterator$1);

    var _includes = interopRequireDefault(includes$4);

    var _parseInt2 = interopRequireDefault(_parseInt$2);

    var _slice = interopRequireDefault(slice$4);

    var _sort = interopRequireDefault(sort$2);

    var _flags = interopRequireDefault(flags$1);
    /*!
     * XRegExp 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2007-present MIT License
     */

    /**
     * XRegExp provides augmented, extensible regular expressions. You get additional regex syntax and
     * flags, beyond what browsers support natively. XRegExp is also a regex utility belt with tools to
     * make your client-side grepping simpler and more powerful, while freeing you from related
     * cross-browser inconsistencies.
     */
    // ==--------------------------==
    // Private stuff
    // ==--------------------------==
    // Property name used for extended regex instance data


    var REGEX_DATA = 'xregexp'; // Optional features that can be installed and uninstalled

    var features = {
      astral: false,
      namespacing: false
    }; // Native methods to use and restore ('native' is an ES3 reserved keyword)

    var nativ = {
      exec: RegExp.prototype.exec,
      test: RegExp.prototype.test,
      match: String.prototype.match,
      replace: String.prototype.replace,
      split: String.prototype.split
    }; // Storage for fixed/extended native methods

    var fixed = {}; // Storage for regexes cached by `XRegExp.cache`

    var regexCache = {}; // Storage for pattern details cached by the `XRegExp` constructor

    var patternCache = {}; // Storage for regex syntax tokens added internally or by `XRegExp.addToken`

    var tokens = []; // Token scopes

    var defaultScope = 'default';
    var classScope = 'class'; // Regexes that match native regex syntax, including octals

    var nativeTokens = {
      // Any native multicharacter token in default scope, or any single character
      'default': /\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?(?:[:=!]|<[=!])|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,
      // Any native multicharacter token in character class scope, or any single character
      'class': /\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/
    }; // Any backreference or dollar-prefixed character in replacement strings

    var replacementToken = /\$(?:{([\w$]+)}|<([\w$]+)>|(\d\d?|[\s\S]))/g; // Check for correct `exec` handling of nonparticipating capturing groups

    var correctExecNpcg = nativ.exec.call(/()??/, '')[1] === undefined; // Check for ES6 `flags` prop support

    var hasFlagsProp = (0, _flags["default"])(/x/) !== undefined; // Shortcut to `Object.prototype.toString`

    var _ref = {},
        toString = _ref.toString;

    function hasNativeFlag(flag) {
      // Can't check based on the presence of properties/getters since browsers might support such
      // properties even when they don't support the corresponding flag in regex construction (tested
      // in Chrome 48, where `'unicode' in /x/` is true but trying to construct a regex with flag `u`
      // throws an error)
      var isSupported = true;

      try {
        // Can't use regex literals for testing even in a `try` because regex literals with
        // unsupported flags cause a compilation error in IE
        new RegExp('', flag);
      } catch (exception) {
        isSupported = false;
      }

      return isSupported;
    } // Check for ES6 `u` flag support


    var hasNativeU = hasNativeFlag('u'); // Check for ES6 `y` flag support

    var hasNativeY = hasNativeFlag('y'); // Tracker for known flags, including addon flags

    var registeredFlags = {
      g: true,
      i: true,
      m: true,
      u: hasNativeU,
      y: hasNativeY
    };
    /**
     * Attaches extended data and `XRegExp.prototype` properties to a regex object.
     *
     * @private
     * @param {RegExp} regex Regex to augment.
     * @param {Array} captureNames Array with capture names, or `null`.
     * @param {String} xSource XRegExp pattern used to generate `regex`, or `null` if N/A.
     * @param {String} xFlags XRegExp flags used to generate `regex`, or `null` if N/A.
     * @param {Boolean} [isInternalOnly=false] Whether the regex will be used only for internal
     *   operations, and never exposed to users. For internal-only regexes, we can improve perf by
     *   skipping some operations like attaching `XRegExp.prototype` properties.
     * @returns {RegExp} Augmented regex.
     */

    function augment(regex, captureNames, xSource, xFlags, isInternalOnly) {
      var _context;

      regex[REGEX_DATA] = {
        captureNames: captureNames
      };

      if (isInternalOnly) {
        return regex;
      } // Can't auto-inherit these since the XRegExp constructor returns a nonprimitive value


      if (regex.__proto__) {
        regex.__proto__ = XRegExp.prototype;
      } else {
        for (var p in XRegExp.prototype) {
          // An `XRegExp.prototype.hasOwnProperty(p)` check wouldn't be worth it here, since this
          // is performance sensitive, and enumerable `Object.prototype` or `RegExp.prototype`
          // extensions exist on `regex.prototype` anyway
          regex[p] = XRegExp.prototype[p];
        }
      }

      regex[REGEX_DATA].source = xSource; // Emulate the ES6 `flags` prop by ensuring flags are in alphabetical order

      regex[REGEX_DATA].flags = xFlags ? (0, _sort["default"])(_context = xFlags.split('')).call(_context).join('') : xFlags;
      return regex;
    }
    /**
     * Removes any duplicate characters from the provided string.
     *
     * @private
     * @param {String} str String to remove duplicate characters from.
     * @returns {String} String with any duplicate characters removed.
     */


    function clipDuplicates(str) {
      return nativ.replace.call(str, /([\s\S])(?=[\s\S]*\1)/g, '');
    }
    /**
     * Copies a regex object while preserving extended data and augmenting with `XRegExp.prototype`
     * properties. The copy has a fresh `lastIndex` property (set to zero). Allows adding and removing
     * flags g and y while copying the regex.
     *
     * @private
     * @param {RegExp} regex Regex to copy.
     * @param {Object} [options] Options object with optional properties:
     *   - `addG` {Boolean} Add flag g while copying the regex.
     *   - `addY` {Boolean} Add flag y while copying the regex.
     *   - `removeG` {Boolean} Remove flag g while copying the regex.
     *   - `removeY` {Boolean} Remove flag y while copying the regex.
     *   - `isInternalOnly` {Boolean} Whether the copied regex will be used only for internal
     *     operations, and never exposed to users. For internal-only regexes, we can improve perf by
     *     skipping some operations like attaching `XRegExp.prototype` properties.
     *   - `source` {String} Overrides `<regex>.source`, for special cases.
     * @returns {RegExp} Copy of the provided regex, possibly with modified flags.
     */


    function copyRegex(regex, options) {
      var _context2;

      if (!XRegExp.isRegExp(regex)) {
        throw new TypeError('Type RegExp expected');
      }

      var xData = regex[REGEX_DATA] || {};
      var flags = getNativeFlags(regex);
      var flagsToAdd = '';
      var flagsToRemove = '';
      var xregexpSource = null;
      var xregexpFlags = null;
      options = options || {};

      if (options.removeG) {
        flagsToRemove += 'g';
      }

      if (options.removeY) {
        flagsToRemove += 'y';
      }

      if (flagsToRemove) {
        flags = nativ.replace.call(flags, new RegExp("[".concat(flagsToRemove, "]+"), 'g'), '');
      }

      if (options.addG) {
        flagsToAdd += 'g';
      }

      if (options.addY) {
        flagsToAdd += 'y';
      }

      if (flagsToAdd) {
        flags = clipDuplicates(flags + flagsToAdd);
      }

      if (!options.isInternalOnly) {
        if (xData.source !== undefined) {
          xregexpSource = xData.source;
        } // null or undefined; don't want to add to `flags` if the previous value was null, since
        // that indicates we're not tracking original precompilation flags


        if ((0, _flags["default"])(xData) != null) {
          // Flags are only added for non-internal regexes by `XRegExp.globalize`. Flags are never
          // removed for non-internal regexes, so don't need to handle it
          xregexpFlags = flagsToAdd ? clipDuplicates((0, _flags["default"])(xData) + flagsToAdd) : (0, _flags["default"])(xData);
        }
      } // Augment with `XRegExp.prototype` properties, but use the native `RegExp` constructor to avoid
      // searching for special tokens. That would be wrong for regexes constructed by `RegExp`, and
      // unnecessary for regexes constructed by `XRegExp` because the regex has already undergone the
      // translation to native regex syntax


      regex = augment(new RegExp(options.source || regex.source, flags), hasNamedCapture(regex) ? (0, _slice["default"])(_context2 = xData.captureNames).call(_context2, 0) : null, xregexpSource, xregexpFlags, options.isInternalOnly);
      return regex;
    }
    /**
     * Converts hexadecimal to decimal.
     *
     * @private
     * @param {String} hex
     * @returns {Number}
     */


    function dec(hex) {
      return (0, _parseInt2["default"])(hex, 16);
    }
    /**
     * Returns a pattern that can be used in a native RegExp in place of an ignorable token such as an
     * inline comment or whitespace with flag x. This is used directly as a token handler function
     * passed to `XRegExp.addToken`.
     *
     * @private
     * @param {String} match Match arg of `XRegExp.addToken` handler
     * @param {String} scope Scope arg of `XRegExp.addToken` handler
     * @param {String} flags Flags arg of `XRegExp.addToken` handler
     * @returns {String} Either '' or '(?:)', depending on which is needed in the context of the match.
     */


    function getContextualTokenSeparator(match, scope, flags) {
      if ( // No need to separate tokens if at the beginning or end of a group
      match.input[match.index - 1] === '(' || match.input[match.index + match[0].length] === ')' || // No need to separate tokens if before or after a `|`
      match.input[match.index - 1] === '|' || match.input[match.index + match[0].length] === '|' || // No need to separate tokens if at the beginning or end of the pattern
      match.index < 1 || match.index + match[0].length >= match.input.length || // No need to separate tokens if at the beginning of a noncapturing group or lookahead.
      // The way this is written relies on:
      // - The search regex matching only 3-char strings.
      // - Although `substr` gives chars from the end of the string if given a negative index,
      //   the resulting substring will be too short to match. Ex: `'abcd'.substr(-1, 3) === 'd'`
      nativ.test.call(/^\(\?[:=!]/, match.input.substr(match.index - 3, 3)) || // Avoid separating tokens when the following token is a quantifier
      isQuantifierNext(match.input, match.index + match[0].length, flags)) {
        return '';
      } // Keep tokens separated. This avoids e.g. inadvertedly changing `\1 1` or `\1(?#)1` to `\11`.
      // This also ensures all tokens remain as discrete atoms, e.g. it avoids converting the syntax
      // error `(? :` into `(?:`.


      return '(?:)';
    }
    /**
     * Returns native `RegExp` flags used by a regex object.
     *
     * @private
     * @param {RegExp} regex Regex to check.
     * @returns {String} Native flags in use.
     */


    function getNativeFlags(regex) {
      return hasFlagsProp ? (0, _flags["default"])(regex) : // Explicitly using `RegExp.prototype.toString` (rather than e.g. `String` or concatenation
      // with an empty string) allows this to continue working predictably when
      // `XRegExp.proptotype.toString` is overridden
      nativ.exec.call(/\/([a-z]*)$/i, RegExp.prototype.toString.call(regex))[1];
    }
    /**
     * Determines whether a regex has extended instance data used to track capture names.
     *
     * @private
     * @param {RegExp} regex Regex to check.
     * @returns {Boolean} Whether the regex uses named capture.
     */


    function hasNamedCapture(regex) {
      return !!(regex[REGEX_DATA] && regex[REGEX_DATA].captureNames);
    }
    /**
     * Converts decimal to hexadecimal.
     *
     * @private
     * @param {Number|String} dec
     * @returns {String}
     */


    function hex(dec) {
      return (0, _parseInt2["default"])(dec, 10).toString(16);
    }
    /**
     * Checks whether the next nonignorable token after the specified position is a quantifier.
     *
     * @private
     * @param {String} pattern Pattern to search within.
     * @param {Number} pos Index in `pattern` to search at.
     * @param {String} flags Flags used by the pattern.
     * @returns {Boolean} Whether the next nonignorable token is a quantifier.
     */


    function isQuantifierNext(pattern, pos, flags) {
      return nativ.test.call((0, _includes["default"])(flags).call(flags, 'x') ? // Ignore any leading whitespace, line comments, and inline comments
      /^(?:\s|#[^#\n]*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/ : // Ignore any leading inline comments
      /^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/, (0, _slice["default"])(pattern).call(pattern, pos));
    }
    /**
     * Determines whether a value is of the specified type, by resolving its internal [[Class]].
     *
     * @private
     * @param {*} value Object to check.
     * @param {String} type Type to check for, in TitleCase.
     * @returns {Boolean} Whether the object matches the type.
     */


    function isType(value, type) {
      return toString.call(value) === "[object ".concat(type, "]");
    }
    /**
     * Adds leading zeros if shorter than four characters. Used for fixed-length hexadecimal values.
     *
     * @private
     * @param {String} str
     * @returns {String}
     */


    function pad4(str) {
      while (str.length < 4) {
        str = "0".concat(str);
      }

      return str;
    }
    /**
     * Checks for flag-related errors, and strips/applies flags in a leading mode modifier. Offloads
     * the flag preparation logic from the `XRegExp` constructor.
     *
     * @private
     * @param {String} pattern Regex pattern, possibly with a leading mode modifier.
     * @param {String} flags Any combination of flags.
     * @returns {Object} Object with properties `pattern` and `flags`.
     */


    function prepareFlags(pattern, flags) {
      // Recent browsers throw on duplicate flags, so copy this behavior for nonnative flags
      if (clipDuplicates(flags) !== flags) {
        throw new SyntaxError("Invalid duplicate regex flag ".concat(flags));
      } // Strip and apply a leading mode modifier with any combination of flags except g or y


      pattern = nativ.replace.call(pattern, /^\(\?([\w$]+)\)/, function ($0, $1) {
        if (nativ.test.call(/[gy]/, $1)) {
          throw new SyntaxError("Cannot use flag g or y in mode modifier ".concat($0));
        } // Allow duplicate flags within the mode modifier


        flags = clipDuplicates(flags + $1);
        return '';
      }); // Throw on unknown native or nonnative flags

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator2["default"])(flags), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var flag = _step.value;

          if (!registeredFlags[flag]) {
            throw new SyntaxError("Unknown regex flag ".concat(flag));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return {
        pattern: pattern,
        flags: flags
      };
    }
    /**
     * Prepares an options object from the given value.
     *
     * @private
     * @param {String|Object} value Value to convert to an options object.
     * @returns {Object} Options object.
     */


    function prepareOptions(value) {
      var options = {};

      if (isType(value, 'String')) {
        (0, _forEach["default"])(XRegExp).call(XRegExp, value, /[^\s,]+/, function (match) {
          options[match] = true;
        });
        return options;
      }

      return value;
    }
    /**
     * Registers a flag so it doesn't throw an 'unknown flag' error.
     *
     * @private
     * @param {String} flag Single-character flag to register.
     */


    function registerFlag(flag) {
      if (!/^[\w$]$/.test(flag)) {
        throw new Error('Flag must be a single character A-Za-z0-9_$');
      }

      registeredFlags[flag] = true;
    }
    /**
     * Runs built-in and custom regex syntax tokens in reverse insertion order at the specified
     * position, until a match is found.
     *
     * @private
     * @param {String} pattern Original pattern from which an XRegExp object is being built.
     * @param {String} flags Flags being used to construct the regex.
     * @param {Number} pos Position to search for tokens within `pattern`.
     * @param {Number} scope Regex scope to apply: 'default' or 'class'.
     * @param {Object} context Context object to use for token handler functions.
     * @returns {Object} Object with properties `matchLength`, `output`, and `reparse`; or `null`.
     */


    function runTokens(pattern, flags, pos, scope, context) {
      var i = tokens.length;
      var leadChar = pattern[pos];
      var result = null;
      var match;
      var t; // Run in reverse insertion order

      while (i--) {
        t = tokens[i];

        if (t.leadChar && t.leadChar !== leadChar || t.scope !== scope && t.scope !== 'all' || t.flag && !(0, _includes["default"])(flags).call(flags, t.flag)) {
          continue;
        }

        match = XRegExp.exec(pattern, t.regex, pos, 'sticky');

        if (match) {
          result = {
            matchLength: match[0].length,
            output: t.handler.call(context, match, scope, flags),
            reparse: t.reparse
          }; // Finished with token tests

          break;
        }
      }

      return result;
    }
    /**
     * Enables or disables implicit astral mode opt-in. When enabled, flag A is automatically added to
     * all new regexes created by XRegExp. This causes an error to be thrown when creating regexes if
     * the Unicode Base addon is not available, since flag A is registered by that addon.
     *
     * @private
     * @param {Boolean} on `true` to enable; `false` to disable.
     */


    function setAstral(on) {
      features.astral = on;
    }
    /**
     * Adds named capture groups to the `groups` property of match arrays. See here for details:
     * https://github.com/tc39/proposal-regexp-named-groups
     *
     * @private
     * @param {Boolean} on `true` to enable; `false` to disable.
     */


    function setNamespacing(on) {
      features.namespacing = on;
    }
    /**
     * Returns the object, or throws an error if it is `null` or `undefined`. This is used to follow
     * the ES5 abstract operation `ToObject`.
     *
     * @private
     * @param {*} value Object to check and return.
     * @returns {*} The provided object.
     */


    function toObject(value) {
      // null or undefined
      if (value == null) {
        throw new TypeError('Cannot convert null or undefined to object');
      }

      return value;
    } // ==--------------------------==
    // Constructor
    // ==--------------------------==

    /**
     * Creates an extended regular expression object for matching text with a pattern. Differs from a
     * native regular expression in that additional syntax and flags are supported. The returned object
     * is in fact a native `RegExp` and works with all native methods.
     *
     * @class XRegExp
     * @constructor
     * @param {String|RegExp} pattern Regex pattern string, or an existing regex object to copy.
     * @param {String} [flags] Any combination of flags.
     *   Native flags:
     *     - `g` - global
     *     - `i` - ignore case
     *     - `m` - multiline anchors
     *     - `u` - unicode (ES6)
     *     - `y` - sticky (Firefox 3+, ES6)
     *   Additional XRegExp flags:
     *     - `n` - explicit capture
     *     - `s` - dot matches all (aka singleline)
     *     - `x` - free-spacing and line comments (aka extended)
     *     - `A` - astral (requires the Unicode Base addon)
     *   Flags cannot be provided when constructing one `RegExp` from another.
     * @returns {RegExp} Extended regular expression object.
     * @example
     *
     * // With named capture and flag x
     * XRegExp(`(?<year>  [0-9]{4} ) -?  # year
     *          (?<month> [0-9]{2} ) -?  # month
     *          (?<day>   [0-9]{2} )     # day`, 'x');
     *
     * // Providing a regex object copies it. Native regexes are recompiled using native (not XRegExp)
     * // syntax. Copies maintain extended data, are augmented with `XRegExp.prototype` properties, and
     * // have fresh `lastIndex` properties (set to zero).
     * XRegExp(/regex/);
     */


    function XRegExp(pattern, flags) {
      if (XRegExp.isRegExp(pattern)) {
        if (flags !== undefined) {
          throw new TypeError('Cannot supply flags when copying a RegExp');
        }

        return copyRegex(pattern);
      } // Copy the argument behavior of `RegExp`


      pattern = pattern === undefined ? '' : String(pattern);
      flags = flags === undefined ? '' : String(flags);

      if (XRegExp.isInstalled('astral') && !(0, _includes["default"])(flags).call(flags, 'A')) {
        // This causes an error to be thrown if the Unicode Base addon is not available
        flags += 'A';
      }

      if (!patternCache[pattern]) {
        patternCache[pattern] = {};
      }

      if (!patternCache[pattern][flags]) {
        var context = {
          hasNamedCapture: false,
          captureNames: []
        };
        var scope = defaultScope;
        var output = '';
        var pos = 0;
        var result; // Check for flag-related errors, and strip/apply flags in a leading mode modifier

        var applied = prepareFlags(pattern, flags);
        var appliedPattern = applied.pattern;
        var appliedFlags = (0, _flags["default"])(applied); // Use XRegExp's tokens to translate the pattern to a native regex pattern.
        // `appliedPattern.length` may change on each iteration if tokens use `reparse`

        while (pos < appliedPattern.length) {
          do {
            // Check for custom tokens at the current position
            result = runTokens(appliedPattern, appliedFlags, pos, scope, context); // If the matched token used the `reparse` option, splice its output into the
            // pattern before running tokens again at the same position

            if (result && result.reparse) {
              appliedPattern = (0, _slice["default"])(appliedPattern).call(appliedPattern, 0, pos) + result.output + (0, _slice["default"])(appliedPattern).call(appliedPattern, pos + result.matchLength);
            }
          } while (result && result.reparse);

          if (result) {
            output += result.output;
            pos += result.matchLength || 1;
          } else {
            // Get the native token at the current position
            var _XRegExp$exec = XRegExp.exec(appliedPattern, nativeTokens[scope], pos, 'sticky'),
                _XRegExp$exec2 = (0, _slicedToArray2["default"])(_XRegExp$exec, 1),
                token = _XRegExp$exec2[0];

            output += token;
            pos += token.length;

            if (token === '[' && scope === defaultScope) {
              scope = classScope;
            } else if (token === ']' && scope === classScope) {
              scope = defaultScope;
            }
          }
        }

        patternCache[pattern][flags] = {
          // Use basic cleanup to collapse repeated empty groups like `(?:)(?:)` to `(?:)`. Empty
          // groups are sometimes inserted during regex transpilation in order to keep tokens
          // separated. However, more than one empty group in a row is never needed.
          pattern: nativ.replace.call(output, /(?:\(\?:\))+/g, '(?:)'),
          // Strip all but native flags
          flags: nativ.replace.call(appliedFlags, /[^gimuy]+/g, ''),
          // `context.captureNames` has an item for each capturing group, even if unnamed
          captures: context.hasNamedCapture ? context.captureNames : null
        };
      }

      var generated = patternCache[pattern][flags];
      return augment(new RegExp(generated.pattern, (0, _flags["default"])(generated)), generated.captures, pattern, flags);
    } // Add `RegExp.prototype` to the prototype chain


    XRegExp.prototype = /(?:)/; // ==--------------------------==
    // Public properties
    // ==--------------------------==

    /**
     * The XRegExp version number as a string containing three dot-separated parts. For example,
     * '2.0.0-beta-3'.
     *
     * @static
     * @memberOf XRegExp
     * @type String
     */

    XRegExp.version = '4.3.0'; // ==--------------------------==
    // Public methods
    // ==--------------------------==
    // Intentionally undocumented; used in tests and addons

    XRegExp._clipDuplicates = clipDuplicates;
    XRegExp._hasNativeFlag = hasNativeFlag;
    XRegExp._dec = dec;
    XRegExp._hex = hex;
    XRegExp._pad4 = pad4;
    /**
     * Extends XRegExp syntax and allows custom flags. This is used internally and can be used to
     * create XRegExp addons. If more than one token can match the same string, the last added wins.
     *
     * @memberOf XRegExp
     * @param {RegExp} regex Regex object that matches the new token.
     * @param {Function} handler Function that returns a new pattern string (using native regex syntax)
     *   to replace the matched token within all future XRegExp regexes. Has access to persistent
     *   properties of the regex being built, through `this`. Invoked with three arguments:
     *   - The match array, with named backreference properties.
     *   - The regex scope where the match was found: 'default' or 'class'.
     *   - The flags used by the regex, including any flags in a leading mode modifier.
     *   The handler function becomes part of the XRegExp construction process, so be careful not to
     *   construct XRegExps within the function or you will trigger infinite recursion.
     * @param {Object} [options] Options object with optional properties:
     *   - `scope` {String} Scope where the token applies: 'default', 'class', or 'all'.
     *   - `flag` {String} Single-character flag that triggers the token. This also registers the
     *     flag, which prevents XRegExp from throwing an 'unknown flag' error when the flag is used.
     *   - `optionalFlags` {String} Any custom flags checked for within the token `handler` that are
     *     not required to trigger the token. This registers the flags, to prevent XRegExp from
     *     throwing an 'unknown flag' error when any of the flags are used.
     *   - `reparse` {Boolean} Whether the `handler` function's output should not be treated as
     *     final, and instead be reparseable by other tokens (including the current token). Allows
     *     token chaining or deferring.
     *   - `leadChar` {String} Single character that occurs at the beginning of any successful match
     *     of the token (not always applicable). This doesn't change the behavior of the token unless
     *     you provide an erroneous value. However, providing it can increase the token's performance
     *     since the token can be skipped at any positions where this character doesn't appear.
     * @example
     *
     * // Basic usage: Add \a for the ALERT control code
     * XRegExp.addToken(
     *   /\\a/,
     *   () => '\\x07',
     *   {scope: 'all'}
     * );
     * XRegExp('\\a[\\a-\\n]+').test('\x07\n\x07'); // -> true
     *
     * // Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers.
     * // Since `scope` is not specified, it uses 'default' (i.e., transformations apply outside of
     * // character classes only)
     * XRegExp.addToken(
     *   /([?*+]|{\d+(?:,\d*)?})(\??)/,
     *   (match) => `${match[1]}${match[2] ? '' : '?'}`,
     *   {flag: 'U'}
     * );
     * XRegExp('a+', 'U').exec('aaa')[0]; // -> 'a'
     * XRegExp('a+?', 'U').exec('aaa')[0]; // -> 'aaa'
     */

    XRegExp.addToken = function (regex, handler, options) {
      options = options || {};
      var _options = options,
          optionalFlags = _options.optionalFlags;

      if (options.flag) {
        registerFlag(options.flag);
      }

      if (optionalFlags) {
        optionalFlags = nativ.split.call(optionalFlags, '');
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (0, _getIterator2["default"])(optionalFlags), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var flag = _step2.value;
            registerFlag(flag);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } // Add to the private list of syntax tokens


      tokens.push({
        regex: copyRegex(regex, {
          addG: true,
          addY: hasNativeY,
          isInternalOnly: true
        }),
        handler: handler,
        scope: options.scope || defaultScope,
        flag: options.flag,
        reparse: options.reparse,
        leadChar: options.leadChar
      }); // Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and flags
      // might now produce different results

      XRegExp.cache.flush('patterns');
    };
    /**
     * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
     * the same pattern and flag combination, the cached copy of the regex is returned.
     *
     * @memberOf XRegExp
     * @param {String} pattern Regex pattern string.
     * @param {String} [flags] Any combination of XRegExp flags.
     * @returns {RegExp} Cached XRegExp object.
     * @example
     *
     * while (match = XRegExp.cache('.', 'gs').exec(str)) {
     *   // The regex is compiled once only
     * }
     */


    XRegExp.cache = function (pattern, flags) {
      if (!regexCache[pattern]) {
        regexCache[pattern] = {};
      }

      return regexCache[pattern][flags] || (regexCache[pattern][flags] = XRegExp(pattern, flags));
    }; // Intentionally undocumented; used in tests


    XRegExp.cache.flush = function (cacheName) {
      if (cacheName === 'patterns') {
        // Flush the pattern cache used by the `XRegExp` constructor
        patternCache = {};
      } else {
        // Flush the regex cache populated by `XRegExp.cache`
        regexCache = {};
      }
    };
    /**
     * Escapes any regular expression metacharacters, for use when matching literal strings. The result
     * can safely be used at any point within a regex that uses any flags.
     *
     * @memberOf XRegExp
     * @param {String} str String to escape.
     * @returns {String} String with regex metacharacters escaped.
     * @example
     *
     * XRegExp.escape('Escaped? <.>');
     * // -> 'Escaped\?\ <\.>'
     */


    XRegExp.escape = function (str) {
      return nativ.replace.call(toObject(str), /[-\[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };
    /**
     * Executes a regex search in a specified string. Returns a match array or `null`. If the provided
     * regex uses named capture, named backreference properties are included on the match array.
     * Optional `pos` and `sticky` arguments specify the search start position, and whether the match
     * must start at the specified position only. The `lastIndex` property of the provided regex is not
     * used, but is updated for compatibility. Also fixes browser bugs compared to the native
     * `RegExp.prototype.exec` and can be used reliably cross-browser.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Number} [pos=0] Zero-based index at which to start the search.
     * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
     *   only. The string `'sticky'` is accepted as an alternative to `true`.
     * @returns {Array} Match array with named backreference properties, or `null`.
     * @example
     *
     * // Basic use, with named backreference
     * let match = XRegExp.exec('U+2620', XRegExp('U\\+(?<hex>[0-9A-F]{4})'));
     * match.hex; // -> '2620'
     *
     * // With pos and sticky, in a loop
     * let pos = 2, result = [], match;
     * while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d)>/, pos, 'sticky')) {
     *   result.push(match[1]);
     *   pos = match.index + match[0].length;
     * }
     * // result -> ['2', '3', '4']
     */


    XRegExp.exec = function (str, regex, pos, sticky) {
      var cacheKey = 'g';
      var addY = false;
      var fakeY = false;
      var match;
      addY = hasNativeY && !!(sticky || regex.sticky && sticky !== false);

      if (addY) {
        cacheKey += 'y';
      } else if (sticky) {
        // Simulate sticky matching by appending an empty capture to the original regex. The
        // resulting regex will succeed no matter what at the current index (set with `lastIndex`),
        // and will not search the rest of the subject string. We'll know that the original regex
        // has failed if that last capture is `''` rather than `undefined` (i.e., if that last
        // capture participated in the match).
        fakeY = true;
        cacheKey += 'FakeY';
      }

      regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.match`/`replace`

      var r2 = regex[REGEX_DATA][cacheKey] || (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
        addG: true,
        addY: addY,
        source: fakeY ? "".concat(regex.source, "|()") : undefined,
        removeY: sticky === false,
        isInternalOnly: true
      }));
      pos = pos || 0;
      r2.lastIndex = pos; // Fixed `exec` required for `lastIndex` fix, named backreferences, etc.

      match = fixed.exec.call(r2, str); // Get rid of the capture added by the pseudo-sticky matcher if needed. An empty string means
      // the original regexp failed (see above).

      if (fakeY && match && match.pop() === '') {
        match = null;
      }

      if (regex.global) {
        regex.lastIndex = match ? r2.lastIndex : 0;
      }

      return match;
    };
    /**
     * Executes a provided function once per regex match. Searches always start at the beginning of the
     * string and continue until the end, regardless of the state of the regex's `global` property and
     * initial `lastIndex`.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Function} callback Function to execute for each match. Invoked with four arguments:
     *   - The match array, with named backreference properties.
     *   - The zero-based match index.
     *   - The string being traversed.
     *   - The regex object being used to traverse the string.
     * @example
     *
     * // Extracts every other digit from a string
     * const evens = [];
     * XRegExp.forEach('1a2345', /\d/, (match, i) => {
     *   if (i % 2) evens.push(+match[0]);
     * });
     * // evens -> [2, 4]
     */


    XRegExp.forEach = function (str, regex, callback) {
      var pos = 0;
      var i = -1;
      var match;

      while (match = XRegExp.exec(str, regex, pos)) {
        // Because `regex` is provided to `callback`, the function could use the deprecated/
        // nonstandard `RegExp.prototype.compile` to mutate the regex. However, since `XRegExp.exec`
        // doesn't use `lastIndex` to set the search position, this can't lead to an infinite loop,
        // at least. Actually, because of the way `XRegExp.exec` caches globalized versions of
        // regexes, mutating the regex will not have any effect on the iteration or matched strings,
        // which is a nice side effect that brings extra safety.
        callback(match, ++i, str, regex);
        pos = match.index + (match[0].length || 1);
      }
    };
    /**
     * Copies a regex object and adds flag `g`. The copy maintains extended data, is augmented with
     * `XRegExp.prototype` properties, and has a fresh `lastIndex` property (set to zero). Native
     * regexes are not recompiled using XRegExp syntax.
     *
     * @memberOf XRegExp
     * @param {RegExp} regex Regex to globalize.
     * @returns {RegExp} Copy of the provided regex with flag `g` added.
     * @example
     *
     * const globalCopy = XRegExp.globalize(/regex/);
     * globalCopy.global; // -> true
     */


    XRegExp.globalize = function (regex) {
      return copyRegex(regex, {
        addG: true
      });
    };
    /**
     * Installs optional features according to the specified options. Can be undone using
     * `XRegExp.uninstall`.
     *
     * @memberOf XRegExp
     * @param {Object|String} options Options object or string.
     * @example
     *
     * // With an options object
     * XRegExp.install({
     *   // Enables support for astral code points in Unicode addons (implicitly sets flag A)
     *   astral: true,
     *
     *   // Adds named capture groups to the `groups` property of matches
     *   namespacing: true
     * });
     *
     * // With an options string
     * XRegExp.install('astral namespacing');
     */


    XRegExp.install = function (options) {
      options = prepareOptions(options);

      if (!features.astral && options.astral) {
        setAstral(true);
      }

      if (!features.namespacing && options.namespacing) {
        setNamespacing(true);
      }
    };
    /**
     * Checks whether an individual optional feature is installed.
     *
     * @memberOf XRegExp
     * @param {String} feature Name of the feature to check. One of:
     *   - `astral`
     *   - `namespacing`
     * @returns {Boolean} Whether the feature is installed.
     * @example
     *
     * XRegExp.isInstalled('astral');
     */


    XRegExp.isInstalled = function (feature) {
      return !!features[feature];
    };
    /**
     * Returns `true` if an object is a regex; `false` if it isn't. This works correctly for regexes
     * created in another frame, when `instanceof` and `constructor` checks would fail.
     *
     * @memberOf XRegExp
     * @param {*} value Object to check.
     * @returns {Boolean} Whether the object is a `RegExp` object.
     * @example
     *
     * XRegExp.isRegExp('string'); // -> false
     * XRegExp.isRegExp(/regex/i); // -> true
     * XRegExp.isRegExp(RegExp('^', 'm')); // -> true
     * XRegExp.isRegExp(XRegExp('(?s).')); // -> true
     */


    XRegExp.isRegExp = function (value) {
      return toString.call(value) === '[object RegExp]';
    }; // isType(value, 'RegExp');

    /**
     * Returns the first matched string, or in global mode, an array containing all matched strings.
     * This is essentially a more convenient re-implementation of `String.prototype.match` that gives
     * the result types you actually want (string instead of `exec`-style array in match-first mode,
     * and an empty array instead of `null` when no matches are found in match-all mode). It also lets
     * you override flag g and ignore `lastIndex`, and fixes browser bugs.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {String} [scope='one'] Use 'one' to return the first match as a string. Use 'all' to
     *   return an array of all matched strings. If not explicitly specified and `regex` uses flag g,
     *   `scope` is 'all'.
     * @returns {String|Array} In match-first mode: First match as a string, or `null`. In match-all
     *   mode: Array of all matched strings, or an empty array.
     * @example
     *
     * // Match first
     * XRegExp.match('abc', /\w/); // -> 'a'
     * XRegExp.match('abc', /\w/g, 'one'); // -> 'a'
     * XRegExp.match('abc', /x/g, 'one'); // -> null
     *
     * // Match all
     * XRegExp.match('abc', /\w/g); // -> ['a', 'b', 'c']
     * XRegExp.match('abc', /\w/, 'all'); // -> ['a', 'b', 'c']
     * XRegExp.match('abc', /x/, 'all'); // -> []
     */


    XRegExp.match = function (str, regex, scope) {
      var global = regex.global && scope !== 'one' || scope === 'all';
      var cacheKey = (global ? 'g' : '') + (regex.sticky ? 'y' : '') || 'noGY';
      regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`replace`

      var r2 = regex[REGEX_DATA][cacheKey] || (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
        addG: !!global,
        removeG: scope === 'one',
        isInternalOnly: true
      }));
      var result = nativ.match.call(toObject(str), r2);

      if (regex.global) {
        regex.lastIndex = scope === 'one' && result ? // Can't use `r2.lastIndex` since `r2` is nonglobal in this case
        result.index + result[0].length : 0;
      }

      return global ? result || [] : result && result[0];
    };
    /**
     * Retrieves the matches from searching a string using a chain of regexes that successively search
     * within previous matches. The provided `chain` array can contain regexes and or objects with
     * `regex` and `backref` properties. When a backreference is specified, the named or numbered
     * backreference is passed forward to the next regex or returned.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {Array} chain Regexes that each search for matches within preceding results.
     * @returns {Array} Matches by the last regex in the chain, or an empty array.
     * @example
     *
     * // Basic usage; matches numbers within <b> tags
     * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
     *   XRegExp('(?is)<b>.*?</b>'),
     *   /\d+/
     * ]);
     * // -> ['2', '4', '56']
     *
     * // Passing forward and returning specific backreferences
     * html = '<a href="http://xregexp.com/api/">XRegExp</a>\
     *         <a href="http://www.google.com/">Google</a>';
     * XRegExp.matchChain(html, [
     *   {regex: /<a href="([^"]+)">/i, backref: 1},
     *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
     * ]);
     * // -> ['xregexp.com', 'www.google.com']
     */


    XRegExp.matchChain = function (str, chain) {
      return function recurseChain(values, level) {
        var item = chain[level].regex ? chain[level] : {
          regex: chain[level]
        };
        var matches = [];

        function addMatch(match) {
          if (item.backref) {
            var ERR_UNDEFINED_GROUP = "Backreference to undefined group: ".concat(item.backref);
            var isNamedBackref = isNaN(item.backref);

            if (isNamedBackref && XRegExp.isInstalled('namespacing')) {
              // `groups` has `null` as prototype, so using `in` instead of `hasOwnProperty`
              if (!(item.backref in match.groups)) {
                throw new ReferenceError(ERR_UNDEFINED_GROUP);
              }
            } else if (!match.hasOwnProperty(item.backref)) {
              throw new ReferenceError(ERR_UNDEFINED_GROUP);
            }

            var backrefValue = isNamedBackref && XRegExp.isInstalled('namespacing') ? match.groups[item.backref] : match[item.backref];
            matches.push(backrefValue || '');
          } else {
            matches.push(match[0]);
          }
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = (0, _getIterator2["default"])(values), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var value = _step3.value;
            (0, _forEach["default"])(XRegExp).call(XRegExp, value, item.regex, addMatch);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return level === chain.length - 1 || !matches.length ? matches : recurseChain(matches, level + 1);
      }([str], 0);
    };
    /**
     * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
     * or regex, and the replacement can be a string or a function to be called for each match. To
     * perform a global search and replace, use the optional `scope` argument or include flag g if using
     * a regex. Replacement strings can use `${n}` or `$<n>` for named and numbered backreferences.
     * Replacement functions can use named backreferences via `arguments[0].name`. Also fixes browser
     * bugs compared to the native `String.prototype.replace` and can be used reliably cross-browser.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp|String} search Search pattern to be replaced.
     * @param {String|Function} replacement Replacement string or a function invoked to create it.
     *   Replacement strings can include special replacement syntax:
     *     - $$ - Inserts a literal $ character.
     *     - $&, $0 - Inserts the matched substring.
     *     - $` - Inserts the string that precedes the matched substring (left context).
     *     - $' - Inserts the string that follows the matched substring (right context).
     *     - $n, $nn - Where n/nn are digits referencing an existent capturing group, inserts
     *       backreference n/nn.
     *     - ${n}, $<n> - Where n is a name or any number of digits that reference an existent capturing
     *       group, inserts backreference n.
     *   Replacement functions are invoked with three or more arguments:
     *     - The matched substring (corresponds to $& above). Named backreferences are accessible as
     *       properties of this first argument.
     *     - 0..n arguments, one for each backreference (corresponding to $1, $2, etc. above).
     *     - The zero-based index of the match within the total search string.
     *     - The total string being searched.
     * @param {String} [scope='one'] Use 'one' to replace the first match only, or 'all'. If not
     *   explicitly specified and using a regex with flag g, `scope` is 'all'.
     * @returns {String} New string with one or all matches replaced.
     * @example
     *
     * // Regex search, using named backreferences in replacement string
     * const name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
     * XRegExp.replace('John Smith', name, '$<last>, $<first>');
     * // -> 'Smith, John'
     *
     * // Regex search, using named backreferences in replacement function
     * XRegExp.replace('John Smith', name, (match) => `${match.last}, ${match.first}`);
     * // -> 'Smith, John'
     *
     * // String search, with replace-all
     * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
     * // -> 'XRegExp builds XRegExps'
     */


    XRegExp.replace = function (str, search, replacement, scope) {
      var isRegex = XRegExp.isRegExp(search);
      var global = search.global && scope !== 'one' || scope === 'all';
      var cacheKey = (global ? 'g' : '') + (search.sticky ? 'y' : '') || 'noGY';
      var s2 = search;

      if (isRegex) {
        search[REGEX_DATA] = search[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`match`. Since a copy is used, `search`'s
        // `lastIndex` isn't updated *during* replacement iterations

        s2 = search[REGEX_DATA][cacheKey] || (search[REGEX_DATA][cacheKey] = copyRegex(search, {
          addG: !!global,
          removeG: scope === 'one',
          isInternalOnly: true
        }));
      } else if (global) {
        s2 = new RegExp(XRegExp.escape(String(search)), 'g');
      } // Fixed `replace` required for named backreferences, etc.


      var result = fixed.replace.call(toObject(str), s2, replacement);

      if (isRegex && search.global) {
        // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
        search.lastIndex = 0;
      }

      return result;
    };
    /**
     * Performs batch processing of string replacements. Used like `XRegExp.replace`, but accepts an
     * array of replacement details. Later replacements operate on the output of earlier replacements.
     * Replacement details are accepted as an array with a regex or string to search for, the
     * replacement string or function, and an optional scope of 'one' or 'all'. Uses the XRegExp
     * replacement text syntax, which supports named backreference properties via `${name}` or
     * `$<name>`.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {Array} replacements Array of replacement detail arrays.
     * @returns {String} New string with all replacements.
     * @example
     *
     * str = XRegExp.replaceEach(str, [
     *   [XRegExp('(?<name>a)'), 'z${name}'],
     *   [/b/gi, 'y'],
     *   [/c/g, 'x', 'one'], // scope 'one' overrides /g
     *   [/d/, 'w', 'all'],  // scope 'all' overrides lack of /g
     *   ['e', 'v', 'all'],  // scope 'all' allows replace-all for strings
     *   [/f/g, ($0) => $0.toUpperCase()]
     * ]);
     */


    XRegExp.replaceEach = function (str, replacements) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator2["default"])(replacements), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var r = _step4.value;
          str = XRegExp.replace(str, r[0], r[1], r[2]);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return str;
    };
    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     *
     * @memberOf XRegExp
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * XRegExp.split('a b c', ' ');
     * // -> ['a', 'b', 'c']
     *
     * // With limit
     * XRegExp.split('a b c', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', '..']
     */


    XRegExp.split = function (str, separator, limit) {
      return fixed.split.call(toObject(str), separator, limit);
    };
    /**
     * Executes a regex search in a specified string. Returns `true` or `false`. Optional `pos` and
     * `sticky` arguments specify the search start position, and whether the match must start at the
     * specified position only. The `lastIndex` property of the provided regex is not used, but is
     * updated for compatibility. Also fixes browser bugs compared to the native
     * `RegExp.prototype.test` and can be used reliably cross-browser.
     *
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Number} [pos=0] Zero-based index at which to start the search.
     * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
     *   only. The string `'sticky'` is accepted as an alternative to `true`.
     * @returns {Boolean} Whether the regex matched the provided value.
     * @example
     *
     * // Basic use
     * XRegExp.test('abc', /c/); // -> true
     *
     * // With pos and sticky
     * XRegExp.test('abc', /c/, 0, 'sticky'); // -> false
     * XRegExp.test('abc', /c/, 2, 'sticky'); // -> true
     */
    // Do this the easy way :-)


    XRegExp.test = function (str, regex, pos, sticky) {
      return !!XRegExp.exec(str, regex, pos, sticky);
    };
    /**
     * Uninstalls optional features according to the specified options. All optional features start out
     * uninstalled, so this is used to undo the actions of `XRegExp.install`.
     *
     * @memberOf XRegExp
     * @param {Object|String} options Options object or string.
     * @example
     *
     * // With an options object
     * XRegExp.uninstall({
     *   // Disables support for astral code points in Unicode addons
     *   astral: true,
     *
     *   // Don't add named capture groups to the `groups` property of matches
     *   namespacing: true
     * });
     *
     * // With an options string
     * XRegExp.uninstall('astral namespacing');
     */


    XRegExp.uninstall = function (options) {
      options = prepareOptions(options);

      if (features.astral && options.astral) {
        setAstral(false);
      }

      if (features.namespacing && options.namespacing) {
        setNamespacing(false);
      }
    };
    /**
     * Returns an XRegExp object that is the union of the given patterns. Patterns can be provided as
     * regex objects or strings. Metacharacters are escaped in patterns provided as strings.
     * Backreferences in provided regex objects are automatically renumbered to work correctly within
     * the larger combined pattern. Native flags used by provided regexes are ignored in favor of the
     * `flags` argument.
     *
     * @memberOf XRegExp
     * @param {Array} patterns Regexes and strings to combine.
     * @param {String} [flags] Any combination of XRegExp flags.
     * @param {Object} [options] Options object with optional properties:
     *   - `conjunction` {String} Type of conjunction to use: 'or' (default) or 'none'.
     * @returns {RegExp} Union of the provided regexes and strings.
     * @example
     *
     * XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'i');
     * // -> /a\+b\*c|(dogs)\1|(cats)\2/i
     *
     * XRegExp.union([/man/, /bear/, /pig/], 'i', {conjunction: 'none'});
     * // -> /manbearpig/i
     */


    XRegExp.union = function (patterns, flags, options) {
      options = options || {};
      var conjunction = options.conjunction || 'or';
      var numCaptures = 0;
      var numPriorCaptures;
      var captureNames;

      function rewrite(match, paren, backref) {
        var name = captureNames[numCaptures - numPriorCaptures]; // Capturing group

        if (paren) {
          ++numCaptures; // If the current capture has a name, preserve the name

          if (name) {
            return "(?<".concat(name, ">");
          } // Backreference

        } else if (backref) {
          // Rewrite the backreference
          return "\\".concat(+backref + numPriorCaptures);
        }

        return match;
      }

      if (!(isType(patterns, 'Array') && patterns.length)) {
        throw new TypeError('Must provide a nonempty array of patterns to merge');
      }

      var parts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
      var output = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = (0, _getIterator2["default"])(patterns), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var pattern = _step5.value;

          if (XRegExp.isRegExp(pattern)) {
            numPriorCaptures = numCaptures;
            captureNames = pattern[REGEX_DATA] && pattern[REGEX_DATA].captureNames || []; // Rewrite backreferences. Passing to XRegExp dies on octals and ensures patterns are
            // independently valid; helps keep this simple. Named captures are put back

            output.push(nativ.replace.call(XRegExp(pattern.source).source, parts, rewrite));
          } else {
            output.push(XRegExp.escape(pattern));
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var separator = conjunction === 'none' ? '' : '|';
      return XRegExp(output.join(separator), flags);
    }; // ==--------------------------==
    // Fixed/extended native methods
    // ==--------------------------==

    /**
     * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
     * bugs in the native `RegExp.prototype.exec`. Use via `XRegExp.exec`.
     *
     * @memberOf RegExp
     * @param {String} str String to search.
     * @returns {Array} Match array with named backreference properties, or `null`.
     */


    fixed.exec = function (str) {
      var origLastIndex = this.lastIndex;
      var match = nativ.exec.apply(this, arguments);

      if (match) {
        // Fix browsers whose `exec` methods don't return `undefined` for nonparticipating capturing
        // groups. This fixes IE 5.5-8, but not IE 9's quirks mode or emulation of older IEs. IE 9
        // in standards mode follows the spec.
        if (!correctExecNpcg && match.length > 1 && (0, _includes["default"])(match).call(match, '')) {
          var _context3;

          var r2 = copyRegex(this, {
            removeG: true,
            isInternalOnly: true
          }); // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
          // matching due to characters outside the match

          nativ.replace.call((0, _slice["default"])(_context3 = String(str)).call(_context3, match.index), r2, function () {
            var len = arguments.length; // Skip index 0 and the last 2

            for (var i = 1; i < len - 2; ++i) {
              if ((i < 0 || arguments.length <= i ? undefined : arguments[i]) === undefined) {
                match[i] = undefined;
              }
            }
          });
        } // Attach named capture properties


        var groupsObject = match;

        if (XRegExp.isInstalled('namespacing')) {
          // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
          match.groups = (0, _create["default"])(null);
          groupsObject = match.groups;
        }

        if (this[REGEX_DATA] && this[REGEX_DATA].captureNames) {
          // Skip index 0
          for (var i = 1; i < match.length; ++i) {
            var name = this[REGEX_DATA].captureNames[i - 1];

            if (name) {
              groupsObject[name] = match[i];
            }
          }
        } // Fix browsers that increment `lastIndex` after zero-length matches


        if (this.global && !match[0].length && this.lastIndex > match.index) {
          this.lastIndex = match.index;
        }
      }

      if (!this.global) {
        // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
        this.lastIndex = origLastIndex;
      }

      return match;
    };
    /**
     * Fixes browser bugs in the native `RegExp.prototype.test`.
     *
     * @memberOf RegExp
     * @param {String} str String to search.
     * @returns {Boolean} Whether the regex matched the provided value.
     */


    fixed.test = function (str) {
      // Do this the easy way :-)
      return !!fixed.exec.call(this, str);
    };
    /**
     * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
     * bugs in the native `String.prototype.match`.
     *
     * @memberOf String
     * @param {RegExp|*} regex Regex to search with. If not a regex object, it is passed to `RegExp`.
     * @returns {Array} If `regex` uses flag g, an array of match strings or `null`. Without flag g,
     *   the result of calling `regex.exec(this)`.
     */


    fixed.match = function (regex) {
      if (!XRegExp.isRegExp(regex)) {
        // Use the native `RegExp` rather than `XRegExp`
        regex = new RegExp(regex);
      } else if (regex.global) {
        var result = nativ.match.apply(this, arguments); // Fixes IE bug

        regex.lastIndex = 0;
        return result;
      }

      return fixed.exec.call(regex, toObject(this));
    };
    /**
     * Adds support for `${n}` (or `$<n>`) tokens for named and numbered backreferences in replacement
     * text, and provides named backreferences to replacement functions as `arguments[0].name`. Also
     * fixes browser bugs in replacement text syntax when performing a replacement using a nonregex
     * search value, and the value of a replacement regex's `lastIndex` property during replacement
     * iterations and upon completion. Note that this doesn't support SpiderMonkey's proprietary third
     * (`flags`) argument. Use via `XRegExp.replace`.
     *
     * @memberOf String
     * @param {RegExp|String} search Search pattern to be replaced.
     * @param {String|Function} replacement Replacement string or a function invoked to create it.
     * @returns {String} New string with one or all matches replaced.
     */


    fixed.replace = function (search, replacement) {
      var isRegex = XRegExp.isRegExp(search);
      var origLastIndex;
      var captureNames;
      var result;

      if (isRegex) {
        if (search[REGEX_DATA]) {
          captureNames = search[REGEX_DATA].captureNames;
        } // Only needed if `search` is nonglobal


        origLastIndex = search.lastIndex;
      } else {
        search += ''; // Type-convert
      } // Don't use `typeof`; some older browsers return 'function' for regex objects


      if (isType(replacement, 'Function')) {
        // Stringifying `this` fixes a bug in IE < 9 where the last argument in replacement
        // functions isn't type-converted to a string
        result = nativ.replace.call(String(this), search, function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          if (captureNames) {
            var groupsObject;

            if (XRegExp.isInstalled('namespacing')) {
              // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
              groupsObject = (0, _create["default"])(null);
              args.push(groupsObject);
            } else {
              // Change the `args[0]` string primitive to a `String` object that can store
              // properties. This really does need to use `String` as a constructor
              args[0] = new String(args[0]);
              groupsObject = args[0];
            } // Store named backreferences


            for (var i = 0; i < captureNames.length; ++i) {
              if (captureNames[i]) {
                groupsObject[captureNames[i]] = args[i + 1];
              }
            }
          } // Update `lastIndex` before calling `replacement`. Fixes IE, Chrome, Firefox, Safari
          // bug (last tested IE 9, Chrome 17, Firefox 11, Safari 5.1)


          if (isRegex && search.global) {
            search.lastIndex = args[args.length - 2] + args[0].length;
          } // ES6 specs the context for replacement functions as `undefined`


          return replacement.apply(void 0, args);
        });
      } else {
        // Ensure that the last value of `args` will be a string when given nonstring `this`,
        // while still throwing on null or undefined context
        result = nativ.replace.call(this == null ? this : String(this), search, function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return nativ.replace.call(String(replacement), replacementToken, replacer);

          function replacer($0, bracketed, angled, dollarToken) {
            bracketed = bracketed || angled; // Named or numbered backreference with curly or angled braces

            if (bracketed) {
              // XRegExp behavior for `${n}` or `$<n>`:
              // 1. Backreference to numbered capture, if `n` is an integer. Use `0` for the
              //    entire match. Any number of leading zeros may be used.
              // 2. Backreference to named capture `n`, if it exists and is not an integer
              //    overridden by numbered capture. In practice, this does not overlap with
              //    numbered capture since XRegExp does not allow named capture to use a bare
              //    integer as the name.
              // 3. If the name or number does not refer to an existing capturing group, it's
              //    an error.
              var n = +bracketed; // Type-convert; drop leading zeros

              if (n <= args.length - 3) {
                return args[n] || '';
              } // Groups with the same name is an error, else would need `lastIndexOf`


              n = captureNames ? (0, _indexOf["default"])(captureNames).call(captureNames, bracketed) : -1;

              if (n < 0) {
                throw new SyntaxError("Backreference to undefined group ".concat($0));
              }

              return args[n + 1] || '';
            } // Else, special variable or numbered backreference without curly braces


            if (dollarToken === '$') {
              // $$
              return '$';
            }

            if (dollarToken === '&' || +dollarToken === 0) {
              // $&, $0 (not followed by 1-9), $00
              return args[0];
            }

            if (dollarToken === '`') {
              var _context4; // $` (left context)


              return (0, _slice["default"])(_context4 = args[args.length - 1]).call(_context4, 0, args[args.length - 2]);
            }

            if (dollarToken === "'") {
              var _context5; // $' (right context)


              return (0, _slice["default"])(_context5 = args[args.length - 1]).call(_context5, args[args.length - 2] + args[0].length);
            } // Else, numbered backreference without braces


            dollarToken = +dollarToken; // Type-convert; drop leading zero
            // XRegExp behavior for `$n` and `$nn`:
            // - Backrefs end after 1 or 2 digits. Use `${..}` or `$<..>` for more digits.
            // - `$1` is an error if no capturing groups.
            // - `$10` is an error if less than 10 capturing groups. Use `${1}0` or `$<1>0`
            //   instead.
            // - `$01` is `$1` if at least one capturing group, else it's an error.
            // - `$0` (not followed by 1-9) and `$00` are the entire match.
            // Native behavior, for comparison:
            // - Backrefs end after 1 or 2 digits. Cannot reference capturing group 100+.
            // - `$1` is a literal `$1` if no capturing groups.
            // - `$10` is `$1` followed by a literal `0` if less than 10 capturing groups.
            // - `$01` is `$1` if at least one capturing group, else it's a literal `$01`.
            // - `$0` is a literal `$0`.

            if (!isNaN(dollarToken)) {
              if (dollarToken > args.length - 3) {
                throw new SyntaxError("Backreference to undefined group ".concat($0));
              }

              return args[dollarToken] || '';
            } // `$` followed by an unsupported char is an error, unlike native JS


            throw new SyntaxError("Invalid token ".concat($0));
          }
        });
      }

      if (isRegex) {
        if (search.global) {
          // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
          search.lastIndex = 0;
        } else {
          // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
          search.lastIndex = origLastIndex;
        }
      }

      return result;
    };
    /**
     * Fixes browser bugs in the native `String.prototype.split`. Use via `XRegExp.split`.
     *
     * @memberOf String
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     */


    fixed.split = function (separator, limit) {
      if (!XRegExp.isRegExp(separator)) {
        // Browsers handle nonregex split correctly, so use the faster native method
        return nativ.split.apply(this, arguments);
      }

      var str = String(this);
      var output = [];
      var origLastIndex = separator.lastIndex;
      var lastLastIndex = 0;
      var lastLength; // Values for `limit`, per the spec:
      // If undefined: pow(2,32) - 1
      // If 0, Infinity, or NaN: 0
      // If positive number: limit = floor(limit); if (limit >= pow(2,32)) limit -= pow(2,32);
      // If negative number: pow(2,32) - floor(abs(limit))
      // If other: Type-convert, then use the above rules
      // This line fails in very strange ways for some values of `limit` in Opera 10.5-10.63, unless
      // Opera Dragonfly is open (go figure). It works in at least Opera 9.5-10.1 and 11+

      limit = (limit === undefined ? -1 : limit) >>> 0;
      (0, _forEach["default"])(XRegExp).call(XRegExp, str, separator, function (match) {
        // This condition is not the same as `if (match[0].length)`
        if (match.index + match[0].length > lastLastIndex) {
          output.push((0, _slice["default"])(str).call(str, lastLastIndex, match.index));

          if (match.length > 1 && match.index < str.length) {
            Array.prototype.push.apply(output, (0, _slice["default"])(match).call(match, 1));
          }

          lastLength = match[0].length;
          lastLastIndex = match.index + lastLength;
        }
      });

      if (lastLastIndex === str.length) {
        if (!nativ.test.call(separator, '') || lastLength) {
          output.push('');
        }
      } else {
        output.push((0, _slice["default"])(str).call(str, lastLastIndex));
      }

      separator.lastIndex = origLastIndex;
      return output.length > limit ? (0, _slice["default"])(output).call(output, 0, limit) : output;
    }; // ==--------------------------==
    // Built-in syntax/flag tokens
    // ==--------------------------==

    /*
     * Letter escapes that natively match literal characters: `\a`, `\A`, etc. These should be
     * SyntaxErrors but are allowed in web reality. XRegExp makes them errors for cross-browser
     * consistency and to reserve their syntax, but lets them be superseded by addons.
     */


    XRegExp.addToken(/\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4}|{[\dA-Fa-f]+})|x(?![\dA-Fa-f]{2}))/, function (match, scope) {
      // \B is allowed in default scope only
      if (match[1] === 'B' && scope === defaultScope) {
        return match[0];
      }

      throw new SyntaxError("Invalid escape ".concat(match[0]));
    }, {
      scope: 'all',
      leadChar: '\\'
    });
    /*
     * Unicode code point escape with curly braces: `\u{N..}`. `N..` is any one or more digit
     * hexadecimal number from 0-10FFFF, and can include leading zeros. Requires the native ES6 `u` flag
     * to support code points greater than U+FFFF. Avoids converting code points above U+FFFF to
     * surrogate pairs (which could be done without flag `u`), since that could lead to broken behavior
     * if you follow a `\u{N..}` token that references a code point above U+FFFF with a quantifier, or
     * if you use the same in a character class.
     */

    XRegExp.addToken(/\\u{([\dA-Fa-f]+)}/, function (match, scope, flags) {
      var code = dec(match[1]);

      if (code > 0x10FFFF) {
        throw new SyntaxError("Invalid Unicode code point ".concat(match[0]));
      }

      if (code <= 0xFFFF) {
        // Converting to \uNNNN avoids needing to escape the literal character and keep it
        // separate from preceding tokens
        return "\\u".concat(pad4(hex(code)));
      } // If `code` is between 0xFFFF and 0x10FFFF, require and defer to native handling


      if (hasNativeU && (0, _includes["default"])(flags).call(flags, 'u')) {
        return match[0];
      }

      throw new SyntaxError("Cannot use Unicode code point above \\u{FFFF} without flag u");
    }, {
      scope: 'all',
      leadChar: '\\'
    });
    /*
     * Empty character class: `[]` or `[^]`. This fixes a critical cross-browser syntax inconsistency.
     * Unless this is standardized (per the ES spec), regex syntax can't be accurately parsed because
     * character class endings can't be determined.
     */

    XRegExp.addToken(/\[(\^?)\]/, // For cross-browser compatibility with ES3, convert [] to \b\B and [^] to [\s\S].
    // (?!) should work like \b\B, but is unreliable in some versions of Firefox

    /* eslint-disable no-confusing-arrow */
    function (match) {
      return match[1] ? '[\\s\\S]' : '\\b\\B';
    },
    /* eslint-enable no-confusing-arrow */
    {
      leadChar: '['
    });
    /*
     * Comment pattern: `(?# )`. Inline comments are an alternative to the line comments allowed in
     * free-spacing mode (flag x).
     */

    XRegExp.addToken(/\(\?#[^)]*\)/, getContextualTokenSeparator, {
      leadChar: '('
    });
    /*
     * Whitespace and line comments, in free-spacing mode (aka extended mode, flag x) only.
     */

    XRegExp.addToken(/\s+|#[^\n]*\n?/, getContextualTokenSeparator, {
      flag: 'x'
    });
    /*
     * Dot, in dotall mode (aka singleline mode, flag s) only.
     */

    XRegExp.addToken(/\./, function () {
      return '[\\s\\S]';
    }, {
      flag: 's',
      leadChar: '.'
    });
    /*
     * Named backreference: `\k<name>`. Backreference names can use the characters A-Z, a-z, 0-9, _,
     * and $ only. Also allows numbered backreferences as `\k<n>`.
     */

    XRegExp.addToken(/\\k<([\w$]+)>/, function (match) {
      var _context6, _context7; // Groups with the same name is an error, else would need `lastIndexOf`


      var index = isNaN(match[1]) ? (0, _indexOf["default"])(_context6 = this.captureNames).call(_context6, match[1]) + 1 : +match[1];
      var endIndex = match.index + match[0].length;

      if (!index || index > this.captureNames.length) {
        throw new SyntaxError("Backreference to undefined group ".concat(match[0]));
      } // Keep backreferences separate from subsequent literal numbers. This avoids e.g.
      // inadvertedly changing `(?<n>)\k<n>1` to `()\11`.


      return (0, _concat["default"])(_context7 = "\\".concat(index)).call(_context7, endIndex === match.input.length || isNaN(match.input[endIndex]) ? '' : '(?:)');
    }, {
      leadChar: '\\'
    });
    /*
     * Numbered backreference or octal, plus any following digits: `\0`, `\11`, etc. Octals except `\0`
     * not followed by 0-9 and backreferences to unopened capture groups throw an error. Other matches
     * are returned unaltered. IE < 9 doesn't support backreferences above `\99` in regex syntax.
     */

    XRegExp.addToken(/\\(\d+)/, function (match, scope) {
      if (!(scope === defaultScope && /^[1-9]/.test(match[1]) && +match[1] <= this.captureNames.length) && match[1] !== '0') {
        throw new SyntaxError("Cannot use octal escape or backreference to undefined group ".concat(match[0]));
      }

      return match[0];
    }, {
      scope: 'all',
      leadChar: '\\'
    });
    /*
     * Named capturing group; match the opening delimiter only: `(?<name>`. Capture names can use the
     * characters A-Z, a-z, 0-9, _, and $ only. Names can't be integers. Supports Python-style
     * `(?P<name>` as an alternate syntax to avoid issues in some older versions of Opera which natively
     * supported the Python-style syntax. Otherwise, XRegExp might treat numbered backreferences to
     * Python-style named capture as octals.
     */

    XRegExp.addToken(/\(\?P?<([\w$]+)>/, function (match) {
      var _context8; // Disallow bare integers as names because named backreferences are added to match arrays
      // and therefore numeric properties may lead to incorrect lookups


      if (!isNaN(match[1])) {
        throw new SyntaxError("Cannot use integer as capture name ".concat(match[0]));
      }

      if (!XRegExp.isInstalled('namespacing') && (match[1] === 'length' || match[1] === '__proto__')) {
        throw new SyntaxError("Cannot use reserved word as capture name ".concat(match[0]));
      }

      if ((0, _includes["default"])(_context8 = this.captureNames).call(_context8, match[1])) {
        throw new SyntaxError("Cannot use same name for multiple groups ".concat(match[0]));
      }

      this.captureNames.push(match[1]);
      this.hasNamedCapture = true;
      return '(';
    }, {
      leadChar: '('
    });
    /*
     * Capturing group; match the opening parenthesis only. Required for support of named capturing
     * groups. Also adds explicit capture mode (flag n).
     */

    XRegExp.addToken(/\((?!\?)/, function (match, scope, flags) {
      if ((0, _includes["default"])(flags).call(flags, 'n')) {
        return '(?:';
      }

      this.captureNames.push(null);
      return '(';
    }, {
      optionalFlags: 'n',
      leadChar: '('
    });
    var _default = XRegExp;
    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(xregexp);

  var $map = arrayIteration.map;
  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map'); // FF49- issue

  var USES_TO_LENGTH$4 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$4
  }, {
    map: function map(callbackfn
    /* , thisArg */
    ) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var map = entryVirtual('Array').map;

  var ArrayPrototype$7 = Array.prototype;

  var map_1 = function map_1(it) {
    var own = it.map;
    return it === ArrayPrototype$7 || it instanceof Array && own === ArrayPrototype$7.map ? map : own;
  };

  var map$1 = map_1;

  var map$2 = map$1;

  var createMethod$4 = function createMethod(IS_RIGHT) {
    return function (that, callbackfn, argumentsLength, memo) {
      aFunction(callbackfn);
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

      for (; IS_RIGHT ? index >= 0 : length > index; index += i) {
        if (index in self) {
          memo = callbackfn(memo, self[index], index, O);
        }
      }

      return memo;
    };
  };

  var arrayReduce = {
    // `Array.prototype.reduce` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
    left: createMethod$4(false),
    // `Array.prototype.reduceRight` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
    right: createMethod$4(true)
  };

  var $reduce = arrayReduce.left;
  var STRICT_METHOD$3 = arrayMethodIsStrict('reduce');
  var USES_TO_LENGTH$5 = arrayMethodUsesToLength('reduce', {
    1: 0
  }); // `Array.prototype.reduce` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce

  _export({
    target: 'Array',
    proto: true,
    forced: !STRICT_METHOD$3 || !USES_TO_LENGTH$5
  }, {
    reduce: function reduce(callbackfn
    /* , initialValue */
    ) {
      return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var reduce = entryVirtual('Array').reduce;

  var ArrayPrototype$8 = Array.prototype;

  var reduce_1 = function reduce_1(it) {
    var own = it.reduce;
    return it === ArrayPrototype$8 || it instanceof Array && own === ArrayPrototype$8.reduce ? reduce : own;
  };

  var reduce$1 = reduce_1;

  var reduce$2 = reduce$1;

  var build = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _concat = interopRequireDefault(concat$2);

    var _includes = interopRequireDefault(includes$4);

    var _map = interopRequireDefault(map$2);

    var _reduce = interopRequireDefault(reduce$2);
    /*!
     * XRegExp.build 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2012-present MIT License
     */


    var _default = function _default(XRegExp) {
      var REGEX_DATA = 'xregexp';
      var subParts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
      var parts = XRegExp.union([/\({{([\w$]+)}}\)|{{([\w$]+)}}/, subParts], 'g', {
        conjunction: 'or'
      });
      /**
       * Strips a leading `^` and trailing unescaped `$`, if both are present.
       *
       * @private
       * @param {String} pattern Pattern to process.
       * @returns {String} Pattern with edge anchors removed.
       */

      function deanchor(pattern) {
        // Allow any number of empty noncapturing groups before/after anchors, because regexes
        // built/generated by XRegExp sometimes include them
        var leadingAnchor = /^(?:\(\?:\))*\^/;
        var trailingAnchor = /\$(?:\(\?:\))*$/;

        if (leadingAnchor.test(pattern) && trailingAnchor.test(pattern) && // Ensure that the trailing `$` isn't escaped
        trailingAnchor.test(pattern.replace(/\\[\s\S]/g, ''))) {
          return pattern.replace(leadingAnchor, '').replace(trailingAnchor, '');
        }

        return pattern;
      }
      /**
       * Converts the provided value to an XRegExp. Native RegExp flags are not preserved.
       *
       * @private
       * @param {String|RegExp} value Value to convert.
       * @param {Boolean} [addFlagX] Whether to apply the `x` flag in cases when `value` is not
       *   already a regex generated by XRegExp
       * @returns {RegExp} XRegExp object with XRegExp syntax applied.
       */


      function asXRegExp(value, addFlagX) {
        var flags = addFlagX ? 'x' : '';
        return XRegExp.isRegExp(value) ? value[REGEX_DATA] && value[REGEX_DATA].captureNames ? // Don't recompile, to preserve capture names
        value : // Recompile as XRegExp
        XRegExp(value.source, flags) : // Compile string as XRegExp
        XRegExp(value, flags);
      }

      function interpolate(substitution) {
        return substitution instanceof RegExp ? substitution : XRegExp.escape(substitution);
      }

      function reduceToSubpatternsObject(subpatterns, interpolated, subpatternIndex) {
        subpatterns["subpattern".concat(subpatternIndex)] = interpolated;
        return subpatterns;
      }

      function embedSubpatternAfter(raw, subpatternIndex, rawLiterals) {
        var hasSubpattern = subpatternIndex < rawLiterals.length - 1;
        return raw + (hasSubpattern ? "{{subpattern".concat(subpatternIndex, "}}") : '');
      }
      /**
       * Provides tagged template literals that create regexes with XRegExp syntax and flags. The
       * provided pattern is handled as a raw string, so backslashes don't need to be escaped.
       *
       * Interpolation of strings and regexes shares the features of `XRegExp.build`. Interpolated
       * patterns are treated as atomic units when quantified, interpolated strings have their special
       * characters escaped, a leading `^` and trailing unescaped `$` are stripped from interpolated
       * regexes if both are present, and any backreferences within an interpolated regex are
       * rewritten to work within the overall pattern.
       *
       * @memberOf XRegExp
       * @param {String} [flags] Any combination of XRegExp flags.
       * @returns {Function} Handler for template literals that construct regexes with XRegExp syntax.
       * @example
       *
       * const h12 = /1[0-2]|0?[1-9]/;
       * const h24 = /2[0-3]|[01][0-9]/;
       * const hours = XRegExp.tag('x')`${h12} : | ${h24}`;
       * const minutes = /^[0-5][0-9]$/;
       * // Note that explicitly naming the 'minutes' group is required for named backreferences
       * const time = XRegExp.tag('x')`^ ${hours} (?<minutes>${minutes}) $`;
       * time.test('10:59'); // -> true
       * XRegExp.exec('10:59', time).minutes; // -> '59'
       */


      XRegExp.tag = function (flags) {
        return function (literals) {
          var _context, _context2;

          for (var _len = arguments.length, substitutions = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            substitutions[_key - 1] = arguments[_key];
          }

          var subpatterns = (0, _reduce["default"])(_context = (0, _map["default"])(substitutions).call(substitutions, interpolate)).call(_context, reduceToSubpatternsObject, {});
          var pattern = (0, _map["default"])(_context2 = literals.raw).call(_context2, embedSubpatternAfter).join('');
          return XRegExp.build(pattern, subpatterns, flags);
        };
      };
      /**
       * Builds regexes using named subpatterns, for readability and pattern reuse. Backreferences in
       * the outer pattern and provided subpatterns are automatically renumbered to work correctly.
       * Native flags used by provided subpatterns are ignored in favor of the `flags` argument.
       *
       * @memberOf XRegExp
       * @param {String} pattern XRegExp pattern using `{{name}}` for embedded subpatterns. Allows
       *   `({{name}})` as shorthand for `(?<name>{{name}})`. Patterns cannot be embedded within
       *   character classes.
       * @param {Object} subs Lookup object for named subpatterns. Values can be strings or regexes. A
       *   leading `^` and trailing unescaped `$` are stripped from subpatterns, if both are present.
       * @param {String} [flags] Any combination of XRegExp flags.
       * @returns {RegExp} Regex with interpolated subpatterns.
       * @example
       *
       * const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
       *   hours: XRegExp.build('{{h12}} : | {{h24}}', {
       *     h12: /1[0-2]|0?[1-9]/,
       *     h24: /2[0-3]|[01][0-9]/
       *   }, 'x'),
       *   minutes: /^[0-5][0-9]$/
       * });
       * time.test('10:59'); // -> true
       * XRegExp.exec('10:59', time).minutes; // -> '59'
       */


      XRegExp.build = function (pattern, subs, flags) {
        flags = flags || ''; // Used with `asXRegExp` calls for `pattern` and subpatterns in `subs`, to work around how
        // some browsers convert `RegExp('\n')` to a regex that contains the literal characters `\`
        // and `n`. See more details at <https://github.com/slevithan/xregexp/pull/163>.

        var addFlagX = (0, _includes["default"])(flags).call(flags, 'x');
        var inlineFlags = /^\(\?([\w$]+)\)/.exec(pattern); // Add flags within a leading mode modifier to the overall pattern's flags

        if (inlineFlags) {
          flags = XRegExp._clipDuplicates(flags + inlineFlags[1]);
        }

        var data = {};

        for (var p in subs) {
          if (subs.hasOwnProperty(p)) {
            // Passing to XRegExp enables extended syntax and ensures independent validity,
            // lest an unescaped `(`, `)`, `[`, or trailing `\` breaks the `(?:)` wrapper. For
            // subpatterns provided as native regexes, it dies on octals and adds the property
            // used to hold extended regex instance data, for simplicity.
            var sub = asXRegExp(subs[p], addFlagX);
            data[p] = {
              // Deanchoring allows embedding independently useful anchored regexes. If you
              // really need to keep your anchors, double them (i.e., `^^...$$`).
              pattern: deanchor(sub.source),
              names: sub[REGEX_DATA].captureNames || []
            };
          }
        } // Passing to XRegExp dies on octals and ensures the outer pattern is independently valid;
        // helps keep this simple. Named captures will be put back.


        var patternAsRegex = asXRegExp(pattern, addFlagX); // 'Caps' is short for 'captures'

        var numCaps = 0;
        var numPriorCaps;
        var numOuterCaps = 0;
        var outerCapsMap = [0];
        var outerCapNames = patternAsRegex[REGEX_DATA].captureNames || [];
        var output = patternAsRegex.source.replace(parts, function ($0, $1, $2, $3, $4) {
          var subName = $1 || $2;
          var capName;
          var intro;
          var localCapIndex; // Named subpattern

          if (subName) {
            var _context3;

            if (!data.hasOwnProperty(subName)) {
              throw new ReferenceError("Undefined property ".concat($0));
            } // Named subpattern was wrapped in a capturing group


            if ($1) {
              capName = outerCapNames[numOuterCaps];
              outerCapsMap[++numOuterCaps] = ++numCaps; // If it's a named group, preserve the name. Otherwise, use the subpattern name
              // as the capture name

              intro = "(?<".concat(capName || subName, ">");
            } else {
              intro = '(?:';
            }

            numPriorCaps = numCaps;
            var rewrittenSubpattern = data[subName].pattern.replace(subParts, function (match, paren, backref) {
              // Capturing group
              if (paren) {
                capName = data[subName].names[numCaps - numPriorCaps];
                ++numCaps; // If the current capture has a name, preserve the name

                if (capName) {
                  return "(?<".concat(capName, ">");
                } // Backreference

              } else if (backref) {
                localCapIndex = +backref - 1; // Rewrite the backreference

                return data[subName].names[localCapIndex] ? // Need to preserve the backreference name in case using flag `n`
                "\\k<".concat(data[subName].names[localCapIndex], ">") : "\\".concat(+backref + numPriorCaps);
              }

              return match;
            });
            return (0, _concat["default"])(_context3 = "".concat(intro)).call(_context3, rewrittenSubpattern, ")");
          } // Capturing group


          if ($3) {
            capName = outerCapNames[numOuterCaps];
            outerCapsMap[++numOuterCaps] = ++numCaps; // If the current capture has a name, preserve the name

            if (capName) {
              return "(?<".concat(capName, ">");
            } // Backreference

          } else if ($4) {
            localCapIndex = +$4 - 1; // Rewrite the backreference

            return outerCapNames[localCapIndex] ? // Need to preserve the backreference name in case using flag `n`
            "\\k<".concat(outerCapNames[localCapIndex], ">") : "\\".concat(outerCapsMap[+$4]);
          }

          return $0;
        });
        return XRegExp(output, flags);
      };
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(build);

  var matchrecursive = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _slice = interopRequireDefault(slice$4);

    var _concat = interopRequireDefault(concat$2);

    var _includes = interopRequireDefault(includes$4);
    /*!
     * XRegExp.matchRecursive 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2009-present MIT License
     */


    var _default = function _default(XRegExp) {
      /**
       * Returns a match detail object composed of the provided values.
       *
       * @private
       */
      function row(name, value, start, end) {
        return {
          name: name,
          value: value,
          start: start,
          end: end
        };
      }
      /**
       * Returns an array of match strings between outermost left and right delimiters, or an array of
       * objects with detailed match parts and position data. An error is thrown if delimiters are
       * unbalanced within the data.
       *
       * @memberOf XRegExp
       * @param {String} str String to search.
       * @param {String} left Left delimiter as an XRegExp pattern.
       * @param {String} right Right delimiter as an XRegExp pattern.
       * @param {String} [flags] Any native or XRegExp flags, used for the left and right delimiters.
       * @param {Object} [options] Lets you specify `valueNames` and `escapeChar` options.
       * @returns {Array} Array of matches, or an empty array.
       * @example
       *
       * // Basic usage
       * let str = '(t((e))s)t()(ing)';
       * XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
       * // -> ['t((e))s', '', 'ing']
       *
       * // Extended information mode with valueNames
       * str = 'Here is <div> <div>an</div></div> example';
       * XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
       *   valueNames: ['between', 'left', 'match', 'right']
       * });
       * // -> [
       * // {name: 'between', value: 'Here is ',       start: 0,  end: 8},
       * // {name: 'left',    value: '<div>',          start: 8,  end: 13},
       * // {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
       * // {name: 'right',   value: '</div>',         start: 27, end: 33},
       * // {name: 'between', value: ' example',       start: 33, end: 41}
       * // ]
       *
       * // Omitting unneeded parts with null valueNames, and using escapeChar
       * str = '...{1}.\\{{function(x,y){return {y:x}}}';
       * XRegExp.matchRecursive(str, '{', '}', 'g', {
       *   valueNames: ['literal', null, 'value', null],
       *   escapeChar: '\\'
       * });
       * // -> [
       * // {name: 'literal', value: '...',  start: 0, end: 3},
       * // {name: 'value',   value: '1',    start: 4, end: 5},
       * // {name: 'literal', value: '.\\{', start: 6, end: 9},
       * // {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
       * // ]
       *
       * // Sticky mode via flag y
       * str = '<1><<<2>>><3>4<5>';
       * XRegExp.matchRecursive(str, '<', '>', 'gy');
       * // -> ['1', '<<2>>', '3']
       */


      XRegExp.matchRecursive = function (str, left, right, flags, options) {
        flags = flags || '';
        options = options || {};
        var global = (0, _includes["default"])(flags).call(flags, 'g');
        var sticky = (0, _includes["default"])(flags).call(flags, 'y'); // Flag `y` is controlled internally

        var basicFlags = flags.replace(/y/g, '');
        var _options = options,
            escapeChar = _options.escapeChar;
        var vN = options.valueNames;
        var output = [];
        var openTokens = 0;
        var delimStart = 0;
        var delimEnd = 0;
        var lastOuterEnd = 0;
        var outerStart;
        var innerStart;
        var leftMatch;
        var rightMatch;
        var esc;
        left = XRegExp(left, basicFlags);
        right = XRegExp(right, basicFlags);

        if (escapeChar) {
          var _context, _context2;

          if (escapeChar.length > 1) {
            throw new Error('Cannot use more than one escape character');
          }

          escapeChar = XRegExp.escape(escapeChar); // Example of concatenated `esc` regex:
          // `escapeChar`: '%'
          // `left`: '<'
          // `right`: '>'
          // Regex is: /(?:%[\S\s]|(?:(?!<|>)[^%])+)+/

          esc = new RegExp((0, _concat["default"])(_context = (0, _concat["default"])(_context2 = "(?:".concat(escapeChar, "[\\S\\s]|(?:(?!")).call(_context2, // Using `XRegExp.union` safely rewrites backreferences in `left` and `right`.
          // Intentionally not passing `basicFlags` to `XRegExp.union` since any syntax
          // transformation resulting from those flags was already applied to `left` and
          // `right` when they were passed through the XRegExp constructor above.
          XRegExp.union([left, right], '', {
            conjunction: 'or'
          }).source, ")[^")).call(_context, escapeChar, "])+)+"), // Flags `gy` not needed here
          flags.replace(/[^imu]+/g, ''));
        }

        while (true) {
          // If using an escape character, advance to the delimiter's next starting position,
          // skipping any escaped characters in between
          if (escapeChar) {
            delimEnd += (XRegExp.exec(str, esc, delimEnd, 'sticky') || [''])[0].length;
          }

          leftMatch = XRegExp.exec(str, left, delimEnd);
          rightMatch = XRegExp.exec(str, right, delimEnd); // Keep the leftmost match only

          if (leftMatch && rightMatch) {
            if (leftMatch.index <= rightMatch.index) {
              rightMatch = null;
            } else {
              leftMatch = null;
            }
          } // Paths (LM: leftMatch, RM: rightMatch, OT: openTokens):
          // LM | RM | OT | Result
          // 1  | 0  | 1  | loop
          // 1  | 0  | 0  | loop
          // 0  | 1  | 1  | loop
          // 0  | 1  | 0  | throw
          // 0  | 0  | 1  | throw
          // 0  | 0  | 0  | break
          // The paths above don't include the sticky mode special case. The loop ends after the
          // first completed match if not `global`.


          if (leftMatch || rightMatch) {
            delimStart = (leftMatch || rightMatch).index;
            delimEnd = delimStart + (leftMatch || rightMatch)[0].length;
          } else if (!openTokens) {
            break;
          }

          if (sticky && !openTokens && delimStart > lastOuterEnd) {
            break;
          }

          if (leftMatch) {
            if (!openTokens) {
              outerStart = delimStart;
              innerStart = delimEnd;
            }

            ++openTokens;
          } else if (rightMatch && openTokens) {
            if (! --openTokens) {
              if (vN) {
                if (vN[0] && outerStart > lastOuterEnd) {
                  output.push(row(vN[0], (0, _slice["default"])(str).call(str, lastOuterEnd, outerStart), lastOuterEnd, outerStart));
                }

                if (vN[1]) {
                  output.push(row(vN[1], (0, _slice["default"])(str).call(str, outerStart, innerStart), outerStart, innerStart));
                }

                if (vN[2]) {
                  output.push(row(vN[2], (0, _slice["default"])(str).call(str, innerStart, delimStart), innerStart, delimStart));
                }

                if (vN[3]) {
                  output.push(row(vN[3], (0, _slice["default"])(str).call(str, delimStart, delimEnd), delimStart, delimEnd));
                }
              } else {
                output.push((0, _slice["default"])(str).call(str, innerStart, delimStart));
              }

              lastOuterEnd = delimEnd;

              if (!global) {
                break;
              }
            }
          } else {
            throw new Error('Unbalanced delimiter found in string');
          } // If the delimiter matched an empty string, avoid an infinite loop


          if (delimStart === delimEnd) {
            ++delimEnd;
          }
        }

        if (global && !sticky && vN && vN[0] && str.length > lastOuterEnd) {
          output.push(row(vN[0], (0, _slice["default"])(str).call(str, lastOuterEnd), lastOuterEnd, str.length));
        }

        return output;
      };
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(matchrecursive);

  var unicodeBase = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _getIterator2 = interopRequireDefault(getIterator$1);

    var _includes = interopRequireDefault(includes$4);

    var _concat = interopRequireDefault(concat$2);

    var _forEach = interopRequireDefault(forEach$2);
    /*!
     * XRegExp Unicode Base 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2008-present MIT License
     */


    var _default = function _default(XRegExp) {
      /**
       * Adds base support for Unicode matching:
       * - Adds syntax `\p{..}` for matching Unicode tokens. Tokens can be inverted using `\P{..}` or
       *   `\p{^..}`. Token names ignore case, spaces, hyphens, and underscores. You can omit the
       *   braces for token names that are a single letter (e.g. `\pL` or `PL`).
       * - Adds flag A (astral), which enables 21-bit Unicode support.
       * - Adds the `XRegExp.addUnicodeData` method used by other addons to provide character data.
       *
       * Unicode Base relies on externally provided Unicode character data. Official addons are
       * available to provide data for Unicode categories, scripts, blocks, and properties.
       *
       * @requires XRegExp
       */
      // ==--------------------------==
      // Private stuff
      // ==--------------------------==
      // Storage for Unicode data
      var unicode = {}; // Reuse utils

      var dec = XRegExp._dec;
      var hex = XRegExp._hex;
      var pad4 = XRegExp._pad4; // Generates a token lookup name: lowercase, with hyphens, spaces, and underscores removed

      function normalize(name) {
        return name.replace(/[- _]+/g, '').toLowerCase();
      } // Gets the decimal code of a literal code unit, \xHH, \uHHHH, or a backslash-escaped literal


      function charCode(chr) {
        var esc = /^\\[xu](.+)/.exec(chr);
        return esc ? dec(esc[1]) : chr.charCodeAt(chr[0] === '\\' ? 1 : 0);
      } // Inverts a list of ordered BMP characters and ranges


      function invertBmp(range) {
        var output = '';
        var lastEnd = -1;
        (0, _forEach["default"])(XRegExp).call(XRegExp, range, /(\\x..|\\u....|\\?[\s\S])(?:-(\\x..|\\u....|\\?[\s\S]))?/, function (m) {
          var start = charCode(m[1]);

          if (start > lastEnd + 1) {
            output += "\\u".concat(pad4(hex(lastEnd + 1)));

            if (start > lastEnd + 2) {
              output += "-\\u".concat(pad4(hex(start - 1)));
            }
          }

          lastEnd = charCode(m[2] || m[1]);
        });

        if (lastEnd < 0xFFFF) {
          output += "\\u".concat(pad4(hex(lastEnd + 1)));

          if (lastEnd < 0xFFFE) {
            output += "-\\uFFFF";
          }
        }

        return output;
      } // Generates an inverted BMP range on first use


      function cacheInvertedBmp(slug) {
        var prop = 'b!';
        return unicode[slug][prop] || (unicode[slug][prop] = invertBmp(unicode[slug].bmp));
      } // Combines and optionally negates BMP and astral data


      function buildAstral(slug, isNegated) {
        var item = unicode[slug];
        var combined = '';

        if (item.bmp && !item.isBmpLast) {
          var _context;

          combined = (0, _concat["default"])(_context = "[".concat(item.bmp, "]")).call(_context, item.astral ? '|' : '');
        }

        if (item.astral) {
          combined += item.astral;
        }

        if (item.isBmpLast && item.bmp) {
          var _context2;

          combined += (0, _concat["default"])(_context2 = "".concat(item.astral ? '|' : '', "[")).call(_context2, item.bmp, "]");
        } // Astral Unicode tokens always match a code point, never a code unit


        return isNegated ? "(?:(?!".concat(combined, ")(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\0-\uFFFF]))") : "(?:".concat(combined, ")");
      } // Builds a complete astral pattern on first use


      function cacheAstral(slug, isNegated) {
        var prop = isNegated ? 'a!' : 'a=';
        return unicode[slug][prop] || (unicode[slug][prop] = buildAstral(slug, isNegated));
      } // ==--------------------------==
      // Core functionality
      // ==--------------------------==

      /*
       * Add astral mode (flag A) and Unicode token syntax: `\p{..}`, `\P{..}`, `\p{^..}`, `\pC`.
       */


      XRegExp.addToken( // Use `*` instead of `+` to avoid capturing `^` as the token name in `\p{^}`
      /\\([pP])(?:{(\^?)([^}]*)}|([A-Za-z]))/, function (match, scope, flags) {
        var ERR_DOUBLE_NEG = 'Invalid double negation ';
        var ERR_UNKNOWN_NAME = 'Unknown Unicode token ';
        var ERR_UNKNOWN_REF = 'Unicode token missing data ';
        var ERR_ASTRAL_ONLY = 'Astral mode required for Unicode token ';
        var ERR_ASTRAL_IN_CLASS = 'Astral mode does not support Unicode tokens within character classes'; // Negated via \P{..} or \p{^..}

        var isNegated = match[1] === 'P' || !!match[2]; // Switch from BMP (0-FFFF) to astral (0-10FFFF) mode via flag A

        var isAstralMode = (0, _includes["default"])(flags).call(flags, 'A'); // Token lookup name. Check `[4]` first to avoid passing `undefined` via `\p{}`

        var slug = normalize(match[4] || match[3]); // Token data object

        var item = unicode[slug];

        if (match[1] === 'P' && match[2]) {
          throw new SyntaxError(ERR_DOUBLE_NEG + match[0]);
        }

        if (!unicode.hasOwnProperty(slug)) {
          throw new SyntaxError(ERR_UNKNOWN_NAME + match[0]);
        } // Switch to the negated form of the referenced Unicode token


        if (item.inverseOf) {
          slug = normalize(item.inverseOf);

          if (!unicode.hasOwnProperty(slug)) {
            var _context3;

            throw new ReferenceError((0, _concat["default"])(_context3 = "".concat(ERR_UNKNOWN_REF + match[0], " -> ")).call(_context3, item.inverseOf));
          }

          item = unicode[slug];
          isNegated = !isNegated;
        }

        if (!(item.bmp || isAstralMode)) {
          throw new SyntaxError(ERR_ASTRAL_ONLY + match[0]);
        }

        if (isAstralMode) {
          if (scope === 'class') {
            throw new SyntaxError(ERR_ASTRAL_IN_CLASS);
          }

          return cacheAstral(slug, isNegated);
        }

        return scope === 'class' ? isNegated ? cacheInvertedBmp(slug) : item.bmp : "".concat((isNegated ? '[^' : '[') + item.bmp, "]");
      }, {
        scope: 'all',
        optionalFlags: 'A',
        leadChar: '\\'
      });
      /**
       * Adds to the list of Unicode tokens that XRegExp regexes can match via `\p` or `\P`.
       *
       * @memberOf XRegExp
       * @param {Array} data Objects with named character ranges. Each object may have properties
       *   `name`, `alias`, `isBmpLast`, `inverseOf`, `bmp`, and `astral`. All but `name` are
       *   optional, although one of `bmp` or `astral` is required (unless `inverseOf` is set). If
       *   `astral` is absent, the `bmp` data is used for BMP and astral modes. If `bmp` is absent,
       *   the name errors in BMP mode but works in astral mode. If both `bmp` and `astral` are
       *   provided, the `bmp` data only is used in BMP mode, and the combination of `bmp` and
       *   `astral` data is used in astral mode. `isBmpLast` is needed when a token matches orphan
       *   high surrogates *and* uses surrogate pairs to match astral code points. The `bmp` and
       *   `astral` data should be a combination of literal characters and `\xHH` or `\uHHHH` escape
       *   sequences, with hyphens to create ranges. Any regex metacharacters in the data should be
       *   escaped, apart from range-creating hyphens. The `astral` data can additionally use
       *   character classes and alternation, and should use surrogate pairs to represent astral code
       *   points. `inverseOf` can be used to avoid duplicating character data if a Unicode token is
       *   defined as the exact inverse of another token.
       * @example
       *
       * // Basic use
       * XRegExp.addUnicodeData([{
       *   name: 'XDigit',
       *   alias: 'Hexadecimal',
       *   bmp: '0-9A-Fa-f'
       * }]);
       * XRegExp('\\p{XDigit}:\\p{Hexadecimal}+').test('0:3D'); // -> true
       */

      XRegExp.addUnicodeData = function (data) {
        var ERR_NO_NAME = 'Unicode token requires name';
        var ERR_NO_DATA = 'Unicode token has no character data ';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator2["default"])(data), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (!item.name) {
              throw new Error(ERR_NO_NAME);
            }

            if (!(item.inverseOf || item.bmp || item.astral)) {
              throw new Error(ERR_NO_DATA + item.name);
            }

            unicode[normalize(item.name)] = item;

            if (item.alias) {
              unicode[normalize(item.alias)] = item;
            }
          } // Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and
          // flags might now produce different results

        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        XRegExp.cache.flush('patterns');
      };
      /**
       * @ignore
       *
       * Return a reference to the internal Unicode definition structure for the given Unicode
       * Property if the given name is a legal Unicode Property for use in XRegExp `\p` or `\P` regex
       * constructs.
       *
       * @memberOf XRegExp
       * @param {String} name Name by which the Unicode Property may be recognized (case-insensitive),
       *   e.g. `'N'` or `'Number'`. The given name is matched against all registered Unicode
       *   Properties and Property Aliases.
       * @returns {Object} Reference to definition structure when the name matches a Unicode Property.
       *
       * @note
       * For more info on Unicode Properties, see also http://unicode.org/reports/tr18/#Categories.
       *
       * @note
       * This method is *not* part of the officially documented API and may change or be removed in
       * the future. It is meant for userland code that wishes to reuse the (large) internal Unicode
       * structures set up by XRegExp.
       */


      XRegExp._getUnicodeProperty = function (name) {
        var slug = normalize(name);
        return unicode[slug];
      };
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(unicodeBase);

  var blocks = [{
    'name': 'InAdlam',
    'astral': "\uD83A[\uDD00-\uDD5F]"
  }, {
    'name': 'InAegean_Numbers',
    'astral': "\uD800[\uDD00-\uDD3F]"
  }, {
    'name': 'InAhom',
    'astral': "\uD805[\uDF00-\uDF3F]"
  }, {
    'name': 'InAlchemical_Symbols',
    'astral': "\uD83D[\uDF00-\uDF7F]"
  }, {
    'name': 'InAlphabetic_Presentation_Forms',
    'bmp': "\uFB00-\uFB4F"
  }, {
    'name': 'InAnatolian_Hieroglyphs',
    'astral': "\uD811[\uDC00-\uDE7F]"
  }, {
    'name': 'InAncient_Greek_Musical_Notation',
    'astral': "\uD834[\uDE00-\uDE4F]"
  }, {
    'name': 'InAncient_Greek_Numbers',
    'astral': "\uD800[\uDD40-\uDD8F]"
  }, {
    'name': 'InAncient_Symbols',
    'astral': "\uD800[\uDD90-\uDDCF]"
  }, {
    'name': 'InArabic',
    'bmp': "\u0600-\u06FF"
  }, {
    'name': 'InArabic_Extended_A',
    'bmp': "\u08A0-\u08FF"
  }, {
    'name': 'InArabic_Mathematical_Alphabetic_Symbols',
    'astral': "\uD83B[\uDE00-\uDEFF]"
  }, {
    'name': 'InArabic_Presentation_Forms_A',
    'bmp': "\uFB50-\uFDFF"
  }, {
    'name': 'InArabic_Presentation_Forms_B',
    'bmp': "\uFE70-\uFEFF"
  }, {
    'name': 'InArabic_Supplement',
    'bmp': "\u0750-\u077F"
  }, {
    'name': 'InArmenian',
    'bmp': "\u0530-\u058F"
  }, {
    'name': 'InArrows',
    'bmp': "\u2190-\u21FF"
  }, {
    'name': 'InAvestan',
    'astral': "\uD802[\uDF00-\uDF3F]"
  }, {
    'name': 'InBalinese',
    'bmp': "\u1B00-\u1B7F"
  }, {
    'name': 'InBamum',
    'bmp': "\uA6A0-\uA6FF"
  }, {
    'name': 'InBamum_Supplement',
    'astral': "\uD81A[\uDC00-\uDE3F]"
  }, {
    'name': 'InBasic_Latin',
    'bmp': '\0-\x7F'
  }, {
    'name': 'InBassa_Vah',
    'astral': "\uD81A[\uDED0-\uDEFF]"
  }, {
    'name': 'InBatak',
    'bmp': "\u1BC0-\u1BFF"
  }, {
    'name': 'InBengali',
    'bmp': "\u0980-\u09FF"
  }, {
    'name': 'InBhaiksuki',
    'astral': "\uD807[\uDC00-\uDC6F]"
  }, {
    'name': 'InBlock_Elements',
    'bmp': "\u2580-\u259F"
  }, {
    'name': 'InBopomofo',
    'bmp': "\u3100-\u312F"
  }, {
    'name': 'InBopomofo_Extended',
    'bmp': "\u31A0-\u31BF"
  }, {
    'name': 'InBox_Drawing',
    'bmp': "\u2500-\u257F"
  }, {
    'name': 'InBrahmi',
    'astral': "\uD804[\uDC00-\uDC7F]"
  }, {
    'name': 'InBraille_Patterns',
    'bmp': "\u2800-\u28FF"
  }, {
    'name': 'InBuginese',
    'bmp': "\u1A00-\u1A1F"
  }, {
    'name': 'InBuhid',
    'bmp': "\u1740-\u175F"
  }, {
    'name': 'InByzantine_Musical_Symbols',
    'astral': "\uD834[\uDC00-\uDCFF]"
  }, {
    'name': 'InCJK_Compatibility',
    'bmp': "\u3300-\u33FF"
  }, {
    'name': 'InCJK_Compatibility_Forms',
    'bmp': "\uFE30-\uFE4F"
  }, {
    'name': 'InCJK_Compatibility_Ideographs',
    'bmp': "\uF900-\uFAFF"
  }, {
    'name': 'InCJK_Compatibility_Ideographs_Supplement',
    'astral': "\uD87E[\uDC00-\uDE1F]"
  }, {
    'name': 'InCJK_Radicals_Supplement',
    'bmp': "\u2E80-\u2EFF"
  }, {
    'name': 'InCJK_Strokes',
    'bmp': "\u31C0-\u31EF"
  }, {
    'name': 'InCJK_Symbols_And_Punctuation',
    'bmp': "\u3000-\u303F"
  }, {
    'name': 'InCJK_Unified_Ideographs',
    'bmp': "\u4E00-\u9FFF"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_A',
    'bmp': "\u3400-\u4DBF"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_B',
    'astral': "[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF]"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_C',
    'astral': "\uD869[\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF3F]"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_D',
    'astral': "\uD86D[\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1F]"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_E',
    'astral': "\uD86E[\uDC20-\uDFFF]|[\uD86F-\uD872][\uDC00-\uDFFF]|\uD873[\uDC00-\uDEAF]"
  }, {
    'name': 'InCJK_Unified_Ideographs_Extension_F',
    'astral': "\uD873[\uDEB0-\uDFFF]|[\uD874-\uD879][\uDC00-\uDFFF]|\uD87A[\uDC00-\uDFEF]"
  }, {
    'name': 'InCarian',
    'astral': "\uD800[\uDEA0-\uDEDF]"
  }, {
    'name': 'InCaucasian_Albanian',
    'astral': "\uD801[\uDD30-\uDD6F]"
  }, {
    'name': 'InChakma',
    'astral': "\uD804[\uDD00-\uDD4F]"
  }, {
    'name': 'InCham',
    'bmp': "\uAA00-\uAA5F"
  }, {
    'name': 'InCherokee',
    'bmp': "\u13A0-\u13FF"
  }, {
    'name': 'InCherokee_Supplement',
    'bmp': "\uAB70-\uABBF"
  }, {
    'name': 'InChess_Symbols',
    'astral': "\uD83E[\uDE00-\uDE6F]"
  }, {
    'name': 'InCombining_Diacritical_Marks',
    'bmp': "\u0300-\u036F"
  }, {
    'name': 'InCombining_Diacritical_Marks_Extended',
    'bmp': "\u1AB0-\u1AFF"
  }, {
    'name': 'InCombining_Diacritical_Marks_For_Symbols',
    'bmp': "\u20D0-\u20FF"
  }, {
    'name': 'InCombining_Diacritical_Marks_Supplement',
    'bmp': "\u1DC0-\u1DFF"
  }, {
    'name': 'InCombining_Half_Marks',
    'bmp': "\uFE20-\uFE2F"
  }, {
    'name': 'InCommon_Indic_Number_Forms',
    'bmp': "\uA830-\uA83F"
  }, {
    'name': 'InControl_Pictures',
    'bmp': "\u2400-\u243F"
  }, {
    'name': 'InCoptic',
    'bmp': "\u2C80-\u2CFF"
  }, {
    'name': 'InCoptic_Epact_Numbers',
    'astral': "\uD800[\uDEE0-\uDEFF]"
  }, {
    'name': 'InCounting_Rod_Numerals',
    'astral': "\uD834[\uDF60-\uDF7F]"
  }, {
    'name': 'InCuneiform',
    'astral': "\uD808[\uDC00-\uDFFF]"
  }, {
    'name': 'InCuneiform_Numbers_And_Punctuation',
    'astral': "\uD809[\uDC00-\uDC7F]"
  }, {
    'name': 'InCurrency_Symbols',
    'bmp': "\u20A0-\u20CF"
  }, {
    'name': 'InCypriot_Syllabary',
    'astral': "\uD802[\uDC00-\uDC3F]"
  }, {
    'name': 'InCyrillic',
    'bmp': "\u0400-\u04FF"
  }, {
    'name': 'InCyrillic_Extended_A',
    'bmp': "\u2DE0-\u2DFF"
  }, {
    'name': 'InCyrillic_Extended_B',
    'bmp': "\uA640-\uA69F"
  }, {
    'name': 'InCyrillic_Extended_C',
    'bmp': "\u1C80-\u1C8F"
  }, {
    'name': 'InCyrillic_Supplement',
    'bmp': "\u0500-\u052F"
  }, {
    'name': 'InDeseret',
    'astral': "\uD801[\uDC00-\uDC4F]"
  }, {
    'name': 'InDevanagari',
    'bmp': "\u0900-\u097F"
  }, {
    'name': 'InDevanagari_Extended',
    'bmp': "\uA8E0-\uA8FF"
  }, {
    'name': 'InDingbats',
    'bmp': "\u2700-\u27BF"
  }, {
    'name': 'InDogra',
    'astral': "\uD806[\uDC00-\uDC4F]"
  }, {
    'name': 'InDomino_Tiles',
    'astral': "\uD83C[\uDC30-\uDC9F]"
  }, {
    'name': 'InDuployan',
    'astral': "\uD82F[\uDC00-\uDC9F]"
  }, {
    'name': 'InEarly_Dynastic_Cuneiform',
    'astral': "\uD809[\uDC80-\uDD4F]"
  }, {
    'name': 'InEgyptian_Hieroglyphs',
    'astral': "\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F]"
  }, {
    'name': 'InElbasan',
    'astral': "\uD801[\uDD00-\uDD2F]"
  }, {
    'name': 'InEmoticons',
    'astral': "\uD83D[\uDE00-\uDE4F]"
  }, {
    'name': 'InEnclosed_Alphanumeric_Supplement',
    'astral': "\uD83C[\uDD00-\uDDFF]"
  }, {
    'name': 'InEnclosed_Alphanumerics',
    'bmp': "\u2460-\u24FF"
  }, {
    'name': 'InEnclosed_CJK_Letters_And_Months',
    'bmp': "\u3200-\u32FF"
  }, {
    'name': 'InEnclosed_Ideographic_Supplement',
    'astral': "\uD83C[\uDE00-\uDEFF]"
  }, {
    'name': 'InEthiopic',
    'bmp': "\u1200-\u137F"
  }, {
    'name': 'InEthiopic_Extended',
    'bmp': "\u2D80-\u2DDF"
  }, {
    'name': 'InEthiopic_Extended_A',
    'bmp': "\uAB00-\uAB2F"
  }, {
    'name': 'InEthiopic_Supplement',
    'bmp': "\u1380-\u139F"
  }, {
    'name': 'InGeneral_Punctuation',
    'bmp': "\u2000-\u206F"
  }, {
    'name': 'InGeometric_Shapes',
    'bmp': "\u25A0-\u25FF"
  }, {
    'name': 'InGeometric_Shapes_Extended',
    'astral': "\uD83D[\uDF80-\uDFFF]"
  }, {
    'name': 'InGeorgian',
    'bmp': "\u10A0-\u10FF"
  }, {
    'name': 'InGeorgian_Extended',
    'bmp': "\u1C90-\u1CBF"
  }, {
    'name': 'InGeorgian_Supplement',
    'bmp': "\u2D00-\u2D2F"
  }, {
    'name': 'InGlagolitic',
    'bmp': "\u2C00-\u2C5F"
  }, {
    'name': 'InGlagolitic_Supplement',
    'astral': "\uD838[\uDC00-\uDC2F]"
  }, {
    'name': 'InGothic',
    'astral': "\uD800[\uDF30-\uDF4F]"
  }, {
    'name': 'InGrantha',
    'astral': "\uD804[\uDF00-\uDF7F]"
  }, {
    'name': 'InGreek_And_Coptic',
    'bmp': "\u0370-\u03FF"
  }, {
    'name': 'InGreek_Extended',
    'bmp': "\u1F00-\u1FFF"
  }, {
    'name': 'InGujarati',
    'bmp': "\u0A80-\u0AFF"
  }, {
    'name': 'InGunjala_Gondi',
    'astral': "\uD807[\uDD60-\uDDAF]"
  }, {
    'name': 'InGurmukhi',
    'bmp': "\u0A00-\u0A7F"
  }, {
    'name': 'InHalfwidth_And_Fullwidth_Forms',
    'bmp': "\uFF00-\uFFEF"
  }, {
    'name': 'InHangul_Compatibility_Jamo',
    'bmp': "\u3130-\u318F"
  }, {
    'name': 'InHangul_Jamo',
    'bmp': "\u1100-\u11FF"
  }, {
    'name': 'InHangul_Jamo_Extended_A',
    'bmp': "\uA960-\uA97F"
  }, {
    'name': 'InHangul_Jamo_Extended_B',
    'bmp': "\uD7B0-\uD7FF"
  }, {
    'name': 'InHangul_Syllables',
    'bmp': "\uAC00-\uD7AF"
  }, {
    'name': 'InHanifi_Rohingya',
    'astral': "\uD803[\uDD00-\uDD3F]"
  }, {
    'name': 'InHanunoo',
    'bmp': "\u1720-\u173F"
  }, {
    'name': 'InHatran',
    'astral': "\uD802[\uDCE0-\uDCFF]"
  }, {
    'name': 'InHebrew',
    'bmp': "\u0590-\u05FF"
  }, {
    'name': 'InHigh_Private_Use_Surrogates',
    'bmp': "\uDB80-\uDBFF"
  }, {
    'name': 'InHigh_Surrogates',
    'bmp': "\uD800-\uDB7F"
  }, {
    'name': 'InHiragana',
    'bmp': "\u3040-\u309F"
  }, {
    'name': 'InIPA_Extensions',
    'bmp': "\u0250-\u02AF"
  }, {
    'name': 'InIdeographic_Description_Characters',
    'bmp': "\u2FF0-\u2FFF"
  }, {
    'name': 'InIdeographic_Symbols_And_Punctuation',
    'astral': "\uD81B[\uDFE0-\uDFFF]"
  }, {
    'name': 'InImperial_Aramaic',
    'astral': "\uD802[\uDC40-\uDC5F]"
  }, {
    'name': 'InIndic_Siyaq_Numbers',
    'astral': "\uD83B[\uDC70-\uDCBF]"
  }, {
    'name': 'InInscriptional_Pahlavi',
    'astral': "\uD802[\uDF60-\uDF7F]"
  }, {
    'name': 'InInscriptional_Parthian',
    'astral': "\uD802[\uDF40-\uDF5F]"
  }, {
    'name': 'InJavanese',
    'bmp': "\uA980-\uA9DF"
  }, {
    'name': 'InKaithi',
    'astral': "\uD804[\uDC80-\uDCCF]"
  }, {
    'name': 'InKana_Extended_A',
    'astral': "\uD82C[\uDD00-\uDD2F]"
  }, {
    'name': 'InKana_Supplement',
    'astral': "\uD82C[\uDC00-\uDCFF]"
  }, {
    'name': 'InKanbun',
    'bmp': "\u3190-\u319F"
  }, {
    'name': 'InKangxi_Radicals',
    'bmp': "\u2F00-\u2FDF"
  }, {
    'name': 'InKannada',
    'bmp': "\u0C80-\u0CFF"
  }, {
    'name': 'InKatakana',
    'bmp': "\u30A0-\u30FF"
  }, {
    'name': 'InKatakana_Phonetic_Extensions',
    'bmp': "\u31F0-\u31FF"
  }, {
    'name': 'InKayah_Li',
    'bmp': "\uA900-\uA92F"
  }, {
    'name': 'InKharoshthi',
    'astral': "\uD802[\uDE00-\uDE5F]"
  }, {
    'name': 'InKhmer',
    'bmp': "\u1780-\u17FF"
  }, {
    'name': 'InKhmer_Symbols',
    'bmp': "\u19E0-\u19FF"
  }, {
    'name': 'InKhojki',
    'astral': "\uD804[\uDE00-\uDE4F]"
  }, {
    'name': 'InKhudawadi',
    'astral': "\uD804[\uDEB0-\uDEFF]"
  }, {
    'name': 'InLao',
    'bmp': "\u0E80-\u0EFF"
  }, {
    'name': 'InLatin_1_Supplement',
    'bmp': '\x80-\xFF'
  }, {
    'name': 'InLatin_Extended_A',
    'bmp': "\u0100-\u017F"
  }, {
    'name': 'InLatin_Extended_Additional',
    'bmp': "\u1E00-\u1EFF"
  }, {
    'name': 'InLatin_Extended_B',
    'bmp': "\u0180-\u024F"
  }, {
    'name': 'InLatin_Extended_C',
    'bmp': "\u2C60-\u2C7F"
  }, {
    'name': 'InLatin_Extended_D',
    'bmp': "\uA720-\uA7FF"
  }, {
    'name': 'InLatin_Extended_E',
    'bmp': "\uAB30-\uAB6F"
  }, {
    'name': 'InLepcha',
    'bmp': "\u1C00-\u1C4F"
  }, {
    'name': 'InLetterlike_Symbols',
    'bmp': "\u2100-\u214F"
  }, {
    'name': 'InLimbu',
    'bmp': "\u1900-\u194F"
  }, {
    'name': 'InLinear_A',
    'astral': "\uD801[\uDE00-\uDF7F]"
  }, {
    'name': 'InLinear_B_Ideograms',
    'astral': "\uD800[\uDC80-\uDCFF]"
  }, {
    'name': 'InLinear_B_Syllabary',
    'astral': "\uD800[\uDC00-\uDC7F]"
  }, {
    'name': 'InLisu',
    'bmp': "\uA4D0-\uA4FF"
  }, {
    'name': 'InLow_Surrogates',
    'bmp': "\uDC00-\uDFFF"
  }, {
    'name': 'InLycian',
    'astral': "\uD800[\uDE80-\uDE9F]"
  }, {
    'name': 'InLydian',
    'astral': "\uD802[\uDD20-\uDD3F]"
  }, {
    'name': 'InMahajani',
    'astral': "\uD804[\uDD50-\uDD7F]"
  }, {
    'name': 'InMahjong_Tiles',
    'astral': "\uD83C[\uDC00-\uDC2F]"
  }, {
    'name': 'InMakasar',
    'astral': "\uD807[\uDEE0-\uDEFF]"
  }, {
    'name': 'InMalayalam',
    'bmp': "\u0D00-\u0D7F"
  }, {
    'name': 'InMandaic',
    'bmp': "\u0840-\u085F"
  }, {
    'name': 'InManichaean',
    'astral': "\uD802[\uDEC0-\uDEFF]"
  }, {
    'name': 'InMarchen',
    'astral': "\uD807[\uDC70-\uDCBF]"
  }, {
    'name': 'InMasaram_Gondi',
    'astral': "\uD807[\uDD00-\uDD5F]"
  }, {
    'name': 'InMathematical_Alphanumeric_Symbols',
    'astral': "\uD835[\uDC00-\uDFFF]"
  }, {
    'name': 'InMathematical_Operators',
    'bmp': "\u2200-\u22FF"
  }, {
    'name': 'InMayan_Numerals',
    'astral': "\uD834[\uDEE0-\uDEFF]"
  }, {
    'name': 'InMedefaidrin',
    'astral': "\uD81B[\uDE40-\uDE9F]"
  }, {
    'name': 'InMeetei_Mayek',
    'bmp': "\uABC0-\uABFF"
  }, {
    'name': 'InMeetei_Mayek_Extensions',
    'bmp': "\uAAE0-\uAAFF"
  }, {
    'name': 'InMende_Kikakui',
    'astral': "\uD83A[\uDC00-\uDCDF]"
  }, {
    'name': 'InMeroitic_Cursive',
    'astral': "\uD802[\uDDA0-\uDDFF]"
  }, {
    'name': 'InMeroitic_Hieroglyphs',
    'astral': "\uD802[\uDD80-\uDD9F]"
  }, {
    'name': 'InMiao',
    'astral': "\uD81B[\uDF00-\uDF9F]"
  }, {
    'name': 'InMiscellaneous_Mathematical_Symbols_A',
    'bmp': "\u27C0-\u27EF"
  }, {
    'name': 'InMiscellaneous_Mathematical_Symbols_B',
    'bmp': "\u2980-\u29FF"
  }, {
    'name': 'InMiscellaneous_Symbols',
    'bmp': "\u2600-\u26FF"
  }, {
    'name': 'InMiscellaneous_Symbols_And_Arrows',
    'bmp': "\u2B00-\u2BFF"
  }, {
    'name': 'InMiscellaneous_Symbols_And_Pictographs',
    'astral': "\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]"
  }, {
    'name': 'InMiscellaneous_Technical',
    'bmp': "\u2300-\u23FF"
  }, {
    'name': 'InModi',
    'astral': "\uD805[\uDE00-\uDE5F]"
  }, {
    'name': 'InModifier_Tone_Letters',
    'bmp': "\uA700-\uA71F"
  }, {
    'name': 'InMongolian',
    'bmp': "\u1800-\u18AF"
  }, {
    'name': 'InMongolian_Supplement',
    'astral': "\uD805[\uDE60-\uDE7F]"
  }, {
    'name': 'InMro',
    'astral': "\uD81A[\uDE40-\uDE6F]"
  }, {
    'name': 'InMultani',
    'astral': "\uD804[\uDE80-\uDEAF]"
  }, {
    'name': 'InMusical_Symbols',
    'astral': "\uD834[\uDD00-\uDDFF]"
  }, {
    'name': 'InMyanmar',
    'bmp': "\u1000-\u109F"
  }, {
    'name': 'InMyanmar_Extended_A',
    'bmp': "\uAA60-\uAA7F"
  }, {
    'name': 'InMyanmar_Extended_B',
    'bmp': "\uA9E0-\uA9FF"
  }, {
    'name': 'InNKo',
    'bmp': "\u07C0-\u07FF"
  }, {
    'name': 'InNabataean',
    'astral': "\uD802[\uDC80-\uDCAF]"
  }, {
    'name': 'InNew_Tai_Lue',
    'bmp': "\u1980-\u19DF"
  }, {
    'name': 'InNewa',
    'astral': "\uD805[\uDC00-\uDC7F]"
  }, {
    'name': 'InNumber_Forms',
    'bmp': "\u2150-\u218F"
  }, {
    'name': 'InNushu',
    'astral': "\uD82C[\uDD70-\uDEFF]"
  }, {
    'name': 'InOgham',
    'bmp': "\u1680-\u169F"
  }, {
    'name': 'InOl_Chiki',
    'bmp': "\u1C50-\u1C7F"
  }, {
    'name': 'InOld_Hungarian',
    'astral': "\uD803[\uDC80-\uDCFF]"
  }, {
    'name': 'InOld_Italic',
    'astral': "\uD800[\uDF00-\uDF2F]"
  }, {
    'name': 'InOld_North_Arabian',
    'astral': "\uD802[\uDE80-\uDE9F]"
  }, {
    'name': 'InOld_Permic',
    'astral': "\uD800[\uDF50-\uDF7F]"
  }, {
    'name': 'InOld_Persian',
    'astral': "\uD800[\uDFA0-\uDFDF]"
  }, {
    'name': 'InOld_Sogdian',
    'astral': "\uD803[\uDF00-\uDF2F]"
  }, {
    'name': 'InOld_South_Arabian',
    'astral': "\uD802[\uDE60-\uDE7F]"
  }, {
    'name': 'InOld_Turkic',
    'astral': "\uD803[\uDC00-\uDC4F]"
  }, {
    'name': 'InOptical_Character_Recognition',
    'bmp': "\u2440-\u245F"
  }, {
    'name': 'InOriya',
    'bmp': "\u0B00-\u0B7F"
  }, {
    'name': 'InOrnamental_Dingbats',
    'astral': "\uD83D[\uDE50-\uDE7F]"
  }, {
    'name': 'InOsage',
    'astral': "\uD801[\uDCB0-\uDCFF]"
  }, {
    'name': 'InOsmanya',
    'astral': "\uD801[\uDC80-\uDCAF]"
  }, {
    'name': 'InPahawh_Hmong',
    'astral': "\uD81A[\uDF00-\uDF8F]"
  }, {
    'name': 'InPalmyrene',
    'astral': "\uD802[\uDC60-\uDC7F]"
  }, {
    'name': 'InPau_Cin_Hau',
    'astral': "\uD806[\uDEC0-\uDEFF]"
  }, {
    'name': 'InPhags_Pa',
    'bmp': "\uA840-\uA87F"
  }, {
    'name': 'InPhaistos_Disc',
    'astral': "\uD800[\uDDD0-\uDDFF]"
  }, {
    'name': 'InPhoenician',
    'astral': "\uD802[\uDD00-\uDD1F]"
  }, {
    'name': 'InPhonetic_Extensions',
    'bmp': "\u1D00-\u1D7F"
  }, {
    'name': 'InPhonetic_Extensions_Supplement',
    'bmp': "\u1D80-\u1DBF"
  }, {
    'name': 'InPlaying_Cards',
    'astral': "\uD83C[\uDCA0-\uDCFF]"
  }, {
    'name': 'InPrivate_Use_Area',
    'bmp': "\uE000-\uF8FF"
  }, {
    'name': 'InPsalter_Pahlavi',
    'astral': "\uD802[\uDF80-\uDFAF]"
  }, {
    'name': 'InRejang',
    'bmp': "\uA930-\uA95F"
  }, {
    'name': 'InRumi_Numeral_Symbols',
    'astral': "\uD803[\uDE60-\uDE7F]"
  }, {
    'name': 'InRunic',
    'bmp': "\u16A0-\u16FF"
  }, {
    'name': 'InSamaritan',
    'bmp': "\u0800-\u083F"
  }, {
    'name': 'InSaurashtra',
    'bmp': "\uA880-\uA8DF"
  }, {
    'name': 'InSharada',
    'astral': "\uD804[\uDD80-\uDDDF]"
  }, {
    'name': 'InShavian',
    'astral': "\uD801[\uDC50-\uDC7F]"
  }, {
    'name': 'InShorthand_Format_Controls',
    'astral': "\uD82F[\uDCA0-\uDCAF]"
  }, {
    'name': 'InSiddham',
    'astral': "\uD805[\uDD80-\uDDFF]"
  }, {
    'name': 'InSinhala',
    'bmp': "\u0D80-\u0DFF"
  }, {
    'name': 'InSinhala_Archaic_Numbers',
    'astral': "\uD804[\uDDE0-\uDDFF]"
  }, {
    'name': 'InSmall_Form_Variants',
    'bmp': "\uFE50-\uFE6F"
  }, {
    'name': 'InSogdian',
    'astral': "\uD803[\uDF30-\uDF6F]"
  }, {
    'name': 'InSora_Sompeng',
    'astral': "\uD804[\uDCD0-\uDCFF]"
  }, {
    'name': 'InSoyombo',
    'astral': "\uD806[\uDE50-\uDEAF]"
  }, {
    'name': 'InSpacing_Modifier_Letters',
    'bmp': "\u02B0-\u02FF"
  }, {
    'name': 'InSpecials',
    'bmp': "\uFFF0-\uFFFF"
  }, {
    'name': 'InSundanese',
    'bmp': "\u1B80-\u1BBF"
  }, {
    'name': 'InSundanese_Supplement',
    'bmp': "\u1CC0-\u1CCF"
  }, {
    'name': 'InSuperscripts_And_Subscripts',
    'bmp': "\u2070-\u209F"
  }, {
    'name': 'InSupplemental_Arrows_A',
    'bmp': "\u27F0-\u27FF"
  }, {
    'name': 'InSupplemental_Arrows_B',
    'bmp': "\u2900-\u297F"
  }, {
    'name': 'InSupplemental_Arrows_C',
    'astral': "\uD83E[\uDC00-\uDCFF]"
  }, {
    'name': 'InSupplemental_Mathematical_Operators',
    'bmp': "\u2A00-\u2AFF"
  }, {
    'name': 'InSupplemental_Punctuation',
    'bmp': "\u2E00-\u2E7F"
  }, {
    'name': 'InSupplemental_Symbols_And_Pictographs',
    'astral': "\uD83E[\uDD00-\uDDFF]"
  }, {
    'name': 'InSupplementary_Private_Use_Area_A',
    'astral': "[\uDB80-\uDBBF][\uDC00-\uDFFF]"
  }, {
    'name': 'InSupplementary_Private_Use_Area_B',
    'astral': "[\uDBC0-\uDBFF][\uDC00-\uDFFF]"
  }, {
    'name': 'InSutton_SignWriting',
    'astral': "\uD836[\uDC00-\uDEAF]"
  }, {
    'name': 'InSyloti_Nagri',
    'bmp': "\uA800-\uA82F"
  }, {
    'name': 'InSyriac',
    'bmp': "\u0700-\u074F"
  }, {
    'name': 'InSyriac_Supplement',
    'bmp': "\u0860-\u086F"
  }, {
    'name': 'InTagalog',
    'bmp': "\u1700-\u171F"
  }, {
    'name': 'InTagbanwa',
    'bmp': "\u1760-\u177F"
  }, {
    'name': 'InTags',
    'astral': "\uDB40[\uDC00-\uDC7F]"
  }, {
    'name': 'InTai_Le',
    'bmp': "\u1950-\u197F"
  }, {
    'name': 'InTai_Tham',
    'bmp': "\u1A20-\u1AAF"
  }, {
    'name': 'InTai_Viet',
    'bmp': "\uAA80-\uAADF"
  }, {
    'name': 'InTai_Xuan_Jing_Symbols',
    'astral': "\uD834[\uDF00-\uDF5F]"
  }, {
    'name': 'InTakri',
    'astral': "\uD805[\uDE80-\uDECF]"
  }, {
    'name': 'InTamil',
    'bmp': "\u0B80-\u0BFF"
  }, {
    'name': 'InTangut',
    'astral': "[\uD81C-\uD821][\uDC00-\uDFFF]"
  }, {
    'name': 'InTangut_Components',
    'astral': "\uD822[\uDC00-\uDEFF]"
  }, {
    'name': 'InTelugu',
    'bmp': "\u0C00-\u0C7F"
  }, {
    'name': 'InThaana',
    'bmp': "\u0780-\u07BF"
  }, {
    'name': 'InThai',
    'bmp': "\u0E00-\u0E7F"
  }, {
    'name': 'InTibetan',
    'bmp': "\u0F00-\u0FFF"
  }, {
    'name': 'InTifinagh',
    'bmp': "\u2D30-\u2D7F"
  }, {
    'name': 'InTirhuta',
    'astral': "\uD805[\uDC80-\uDCDF]"
  }, {
    'name': 'InTransport_And_Map_Symbols',
    'astral': "\uD83D[\uDE80-\uDEFF]"
  }, {
    'name': 'InUgaritic',
    'astral': "\uD800[\uDF80-\uDF9F]"
  }, {
    'name': 'InUnified_Canadian_Aboriginal_Syllabics',
    'bmp': "\u1400-\u167F"
  }, {
    'name': 'InUnified_Canadian_Aboriginal_Syllabics_Extended',
    'bmp': "\u18B0-\u18FF"
  }, {
    'name': 'InVai',
    'bmp': "\uA500-\uA63F"
  }, {
    'name': 'InVariation_Selectors',
    'bmp': "\uFE00-\uFE0F"
  }, {
    'name': 'InVariation_Selectors_Supplement',
    'astral': "\uDB40[\uDD00-\uDDEF]"
  }, {
    'name': 'InVedic_Extensions',
    'bmp': "\u1CD0-\u1CFF"
  }, {
    'name': 'InVertical_Forms',
    'bmp': "\uFE10-\uFE1F"
  }, {
    'name': 'InWarang_Citi',
    'astral': "\uD806[\uDCA0-\uDCFF]"
  }, {
    'name': 'InYi_Radicals',
    'bmp': "\uA490-\uA4CF"
  }, {
    'name': 'InYi_Syllables',
    'bmp': "\uA000-\uA48F"
  }, {
    'name': 'InYijing_Hexagram_Symbols',
    'bmp': "\u4DC0-\u4DFF"
  }, {
    'name': 'InZanabazar_Square',
    'astral': "\uD806[\uDE00-\uDE4F]"
  }, {
    'name': 'Inundefined',
    'astral': "\uD803[\uDFE0-\uDFFF]|\uD806[\uDDA0-\uDDFF]|\uD807[\uDFC0-\uDFFF]|\uD80D[\uDC30-\uDC3F]|\uD82C[\uDD30-\uDD6F]|\uD838[\uDD00-\uDD4F\uDEC0-\uDEFF]|\uD83B[\uDD00-\uDD4F]|\uD83E[\uDE70-\uDEFF]"
  }];

  var unicodeBlocks = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _blocks = interopRequireDefault(blocks);
    /*!
     * XRegExp Unicode Blocks 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2010-present MIT License
     * Unicode data by Mathias Bynens <mathiasbynens.be>
     */


    var _default = function _default(XRegExp) {
      /**
       * Adds support for all Unicode blocks. Block names use the prefix 'In'. E.g.,
       * `\p{InBasicLatin}`. Token names are case insensitive, and any spaces, hyphens, and
       * underscores are ignored.
       *
       * Uses Unicode 12.1.0.
       *
       * @requires XRegExp, Unicode Base
       */
      if (!XRegExp.addUnicodeData) {
        throw new ReferenceError('Unicode Base must be loaded before Unicode Blocks');
      }

      XRegExp.addUnicodeData(_blocks["default"]);
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(unicodeBlocks);

  var categories = [{
    'name': 'C',
    'alias': 'Other',
    'isBmpLast': true,
    'bmp': "\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08BE-\u08D2\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C76\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D04\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E50-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u4DB6-\u4DBF\u9FF0-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7C0\uA7C1\uA7C7-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB68-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF",
    'astral': "\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9C-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCBD\uDCC2-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD47-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC60-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD00-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE5-\uDDFF\uDE48-\uDE4F\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFBF\uDFF2-\uDFFE]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE4-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA0-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDD73-\uDD7A\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD50-\uDEBF\uDEFA-\uDEFE\uDF00-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDD00\uDD3E-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDD0D-\uDD0F\uDD6D-\uDD6F\uDDAD-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED6-\uDEDF\uDEED-\uDEEF\uDEFB-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFDF\uDFEC-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE-\uDCFF\uDD0C\uDD72\uDD77-\uDD79\uDDA3\uDDA4\uDDAB-\uDDAD\uDDCB\uDDCC\uDE54-\uDE5F\uDE6E\uDE6F\uDE74-\uDE77\uDE7B-\uDE7F\uDE83-\uDE8F\uDE96-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]"
  }, {
    'name': 'Cc',
    'alias': 'Control',
    'bmp': '\0-\x1F\x7F-\x9F'
  }, {
    'name': 'Cf',
    'alias': 'Format',
    'bmp': "\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB",
    'astral': "\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC38]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]"
  }, {
    'name': 'Cn',
    'alias': 'Unassigned',
    'bmp': "\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u05FF\u061D\u070E\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08BE-\u08D2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C76\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D04\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u2065\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E50-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u4DB6-\u4DBF\u9FF0-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7C0\uA7C1\uA7C7-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB68-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD\uFEFE\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE\uFFFF",
    'astral': "\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9C-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCC2-\uDCCC\uDCCE\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD47-\uDD4F\uDD77-\uDD7F\uDDCE\uDDCF\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5A\uDC5C\uDC60-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD00-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE5-\uDDFF\uDE48-\uDE4F\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFBF\uDFF2-\uDFFE]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD823-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F-\uDB3F\uDB41-\uDB7F][\uDC00-\uDFFF]|\uD80D[\uDC2F\uDC39-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE4-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD822[\uDEF3-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA4-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD50-\uDEBF\uDEFA-\uDEFE\uDF00-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDD00\uDD3E-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDD0D-\uDD0F\uDD6D-\uDD6F\uDDAD-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED6-\uDEDF\uDEED-\uDEEF\uDEFB-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFDF\uDFEC-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE-\uDCFF\uDD0C\uDD72\uDD77-\uDD79\uDDA3\uDDA4\uDDAB-\uDDAD\uDDCB\uDDCC\uDE54-\uDE5F\uDE6E\uDE6F\uDE74-\uDE77\uDE7B-\uDE7F\uDE83-\uDE8F\uDE96-\uDFFF]|\uD869[\uDED7-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uDB40[\uDC00\uDC02-\uDC1F\uDC80-\uDCFF\uDDF0-\uDFFF]|[\uDBBF\uDBFF][\uDFFE\uDFFF]"
  }, {
    'name': 'Co',
    'alias': 'Private_Use',
    'bmp': "\uE000-\uF8FF",
    'astral': "[\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uDBBF\uDBFF][\uDC00-\uDFFD]"
  }, {
    'name': 'Cs',
    'alias': 'Surrogate',
    'bmp': "\uD800-\uDFFF"
  }, {
    'name': 'L',
    'alias': 'Letter',
    'bmp': "A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",
    'astral': "\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]"
  }, {
    'name': 'LC',
    'alias': 'Cased_Letter',
    'bmp': "A-Za-z\xB5\xC0-\xD6\xD8-\xF6\xF8-\u01BA\u01BC-\u01BF\u01C4-\u0293\u0295-\u02AF\u0370-\u0373\u0376\u0377\u037B-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0560-\u0588\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FD-\u10FF\u13A0-\u13F5\u13F8-\u13FD\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2134\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C7B\u2C7E-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA640-\uA66D\uA680-\uA69B\uA722-\uA76F\uA771-\uA787\uA78B-\uA78E\uA790-\uA7BF\uA7C2-\uA7C6\uA7FA\uAB30-\uAB5A\uAB60-\uAB67\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A\uFF41-\uFF5A",
    'astral': "\uD801[\uDC00-\uDC4F\uDCB0-\uDCD3\uDCD8-\uDCFB]|\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD806[\uDCA0-\uDCDF]|\uD81B[\uDE40-\uDE7F]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDD00-\uDD43]"
  }, {
    'name': 'Ll',
    'alias': 'Lowercase_Letter',
    'bmp': "a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C3\uA7FA\uAB30-\uAB5A\uAB60-\uAB67\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A",
    'astral': "\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]"
  }, {
    'name': 'Lm',
    'alias': 'Modifier_Letter',
    'bmp': "\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C\uA69D\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E\uFF9F",
    'astral': "\uD81A[\uDF40-\uDF43]|\uD81B[\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD838[\uDD37-\uDD3D]|\uD83A\uDD4B"
  }, {
    'name': 'Lo',
    'alias': 'Other_Letter',
    'bmp': "\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05EF-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1100-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",
    'astral': "\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC50-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF4A\uDF50]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD838[\uDD00-\uDD2C\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]"
  }, {
    'name': 'Lt',
    'alias': 'Titlecase_Letter',
    'bmp': "\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC"
  }, {
    'name': 'Lu',
    'alias': 'Uppercase_Letter',
    'bmp': "A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C2\uA7C4-\uA7C6\uFF21-\uFF3A",
    'astral': "\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]"
  }, {
    'name': 'M',
    'alias': 'Mark',
    'bmp': "\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F",
    'astral': "\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDF46-\uDF50]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC7F-\uDC82\uDCB0-\uDCBA\uDD00-\uDD02\uDD27-\uDD34\uDD45\uDD46\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDDC9-\uDDCC\uDE2C-\uDE37\uDE3E\uDEDF-\uDEEA\uDF00-\uDF03\uDF3B\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC35-\uDC46\uDC5E\uDCB0-\uDCC3\uDDAF-\uDDB5\uDDB8-\uDDC0\uDDDC\uDDDD\uDE30-\uDE40\uDEAB-\uDEB7\uDF1D-\uDF2B]|\uD806[\uDC2C-\uDC3A\uDDD1-\uDDD7\uDDDA-\uDDE0\uDDE4\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE3E\uDE47\uDE51-\uDE5B\uDE8A-\uDE99]|\uD807[\uDC2F-\uDC36\uDC38-\uDC3F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD8A-\uDD8E\uDD90\uDD91\uDD93-\uDD97\uDEF3-\uDEF6]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF4F\uDF51-\uDF87\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD30-\uDD36\uDEEC-\uDEEF]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]"
  }, {
    'name': 'Mc',
    'alias': 'Spacing_Mark',
    'bmp': "\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E\u094F\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u1A19\u1A1A\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF7\u302E\u302F\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BE-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE\uAAEF\uAAF5\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC",
    'astral': "\uD804[\uDC00\uDC02\uDC82\uDCB0-\uDCB2\uDCB7\uDCB8\uDD2C\uDD45\uDD46\uDD82\uDDB3-\uDDB5\uDDBF\uDDC0\uDE2C-\uDE2E\uDE32\uDE33\uDE35\uDEE0-\uDEE2\uDF02\uDF03\uDF3E\uDF3F\uDF41-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63]|\uD805[\uDC35-\uDC37\uDC40\uDC41\uDC45\uDCB0-\uDCB2\uDCB9\uDCBB-\uDCBE\uDCC1\uDDAF-\uDDB1\uDDB8-\uDDBB\uDDBE\uDE30-\uDE32\uDE3B\uDE3C\uDE3E\uDEAC\uDEAE\uDEAF\uDEB6\uDF20\uDF21\uDF26]|\uD806[\uDC2C-\uDC2E\uDC38\uDDD1-\uDDD3\uDDDC-\uDDDF\uDDE4\uDE39\uDE57\uDE58\uDE97]|\uD807[\uDC2F\uDC3E\uDCA9\uDCB1\uDCB4\uDD8A-\uDD8E\uDD93\uDD94\uDD96\uDEF5\uDEF6]|\uD81B[\uDF51-\uDF87]|\uD834[\uDD65\uDD66\uDD6D-\uDD72]"
  }, {
    'name': 'Me',
    'alias': 'Enclosing_Mark',
    'bmp': "\u0488\u0489\u1ABE\u20DD-\u20E0\u20E2-\u20E4\uA670-\uA672"
  }, {
    'name': 'Mn',
    'alias': 'Nonspacing_Mark',
    'bmp': "\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u09FE\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C04\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9BD\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F",
    'astral': "\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDF46-\uDF50]|\uD804[\uDC01\uDC38-\uDC46\uDC7F-\uDC81\uDCB3-\uDCB6\uDCB9\uDCBA\uDD00-\uDD02\uDD27-\uDD2B\uDD2D-\uDD34\uDD73\uDD80\uDD81\uDDB6-\uDDBE\uDDC9-\uDDCC\uDE2F-\uDE31\uDE34\uDE36\uDE37\uDE3E\uDEDF\uDEE3-\uDEEA\uDF00\uDF01\uDF3B\uDF3C\uDF40\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC38-\uDC3F\uDC42-\uDC44\uDC46\uDC5E\uDCB3-\uDCB8\uDCBA\uDCBF\uDCC0\uDCC2\uDCC3\uDDB2-\uDDB5\uDDBC\uDDBD\uDDBF\uDDC0\uDDDC\uDDDD\uDE33-\uDE3A\uDE3D\uDE3F\uDE40\uDEAB\uDEAD\uDEB0-\uDEB5\uDEB7\uDF1D-\uDF1F\uDF22-\uDF25\uDF27-\uDF2B]|\uD806[\uDC2F-\uDC37\uDC39\uDC3A\uDDD4-\uDDD7\uDDDA\uDDDB\uDDE0\uDE01-\uDE0A\uDE33-\uDE38\uDE3B-\uDE3E\uDE47\uDE51-\uDE56\uDE59-\uDE5B\uDE8A-\uDE96\uDE98\uDE99]|\uD807[\uDC30-\uDC36\uDC38-\uDC3D\uDC3F\uDC92-\uDCA7\uDCAA-\uDCB0\uDCB2\uDCB3\uDCB5\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD90\uDD91\uDD95\uDD97\uDEF3\uDEF4]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF4F\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD30-\uDD36\uDEEC-\uDEEF]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]"
  }, {
    'name': 'N',
    'alias': 'Number',
    'bmp': "0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D78\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19",
    'astral': "\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDD30-\uDD39\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2]|\uD807[\uDC50-\uDC6C\uDD50-\uDD59\uDDA0-\uDDA9\uDFC0-\uDFD4]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD83A[\uDCC7-\uDCCF\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C]"
  }, {
    'name': 'Nd',
    'alias': 'Decimal_Number',
    'bmp': "0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19",
    'astral': "\uD801[\uDCA0-\uDCA9]|\uD803[\uDD30-\uDD39]|\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF39]|\uD806[\uDCE0-\uDCE9]|\uD807[\uDC50-\uDC59\uDD50-\uDD59\uDDA0-\uDDA9]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD83A[\uDD50-\uDD59]"
  }, {
    'name': 'Nl',
    'alias': 'Letter_Number',
    'bmp': "\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF",
    'astral': "\uD800[\uDD40-\uDD74\uDF41\uDF4A\uDFD1-\uDFD5]|\uD809[\uDC00-\uDC6E]"
  }, {
    'name': 'No',
    'alias': 'Other_Number',
    'bmp': "\xB2\xB3\xB9\xBC-\xBE\u09F4-\u09F9\u0B72-\u0B77\u0BF0-\u0BF2\u0C78-\u0C7E\u0D58-\u0D5E\u0D70-\u0D78\u0F2A-\u0F33\u1369-\u137C\u17F0-\u17F9\u19DA\u2070\u2074-\u2079\u2080-\u2089\u2150-\u215F\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA830-\uA835",
    'astral': "\uD800[\uDD07-\uDD33\uDD75-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54]|\uD804[\uDC52-\uDC65\uDDE1-\uDDF4]|\uD805[\uDF3A\uDF3B]|\uD806[\uDCEA-\uDCF2]|\uD807[\uDC5A-\uDC6C\uDFC0-\uDFD4]|\uD81A[\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD83A[\uDCC7-\uDCCF]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C]"
  }, {
    'name': 'P',
    'alias': 'Punctuation',
    'bmp': "!-#%-\\*,-\\/:;\\?@\\[-\\]_\\{\\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65",
    'astral': "\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDFFF]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]"
  }, {
    'name': 'Pc',
    'alias': 'Connector_Punctuation',
    'bmp': "_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F"
  }, {
    'name': 'Pd',
    'alias': 'Dash_Punctuation',
    'bmp': "\\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D"
  }, {
    'name': 'Pe',
    'alias': 'Close_Punctuation',
    'bmp': "\\)\\]\\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63"
  }, {
    'name': 'Pf',
    'alias': 'Final_Punctuation',
    'bmp': "\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21"
  }, {
    'name': 'Pi',
    'alias': 'Initial_Punctuation',
    'bmp': "\xAB\u2018\u201B\u201C\u201F\u2039\u2E02\u2E04\u2E09\u2E0C\u2E1C\u2E20"
  }, {
    'name': 'Po',
    'alias': 'Other_Punctuation',
    'bmp': "!-#%-'\\*,\\.\\/:;\\?@\\\xA1\xA7\xB6\xB7\xBF\u037E\u0387\u055A-\u055F\u0589\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u166E\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u1805\u1807-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203B-\u203E\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205E\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E06-\u2E08\u2E0B\u2E0E-\u2E16\u2E18\u2E19\u2E1B\u2E1E\u2E1F\u2E2A-\u2E2E\u2E30-\u2E39\u2E3C-\u2E3F\u2E41\u2E43-\u2E4F\u3001-\u3003\u303D\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFE10-\uFE16\uFE19\uFE30\uFE45\uFE46\uFE49-\uFE4C\uFE50-\uFE52\uFE54-\uFE57\uFE5F-\uFE61\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF07\uFF0A\uFF0C\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3C\uFF61\uFF64\uFF65",
    'astral': "\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDFFF]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]"
  }, {
    'name': 'Ps',
    'alias': 'Open_Punctuation',
    'bmp': "\\(\\[\\{\u0F3A\u0F3C\u169B\u201A\u201E\u2045\u207D\u208D\u2308\u230A\u2329\u2768\u276A\u276C\u276E\u2770\u2772\u2774\u27C5\u27E6\u27E8\u27EA\u27EC\u27EE\u2983\u2985\u2987\u2989\u298B\u298D\u298F\u2991\u2993\u2995\u2997\u29D8\u29DA\u29FC\u2E22\u2E24\u2E26\u2E28\u2E42\u3008\u300A\u300C\u300E\u3010\u3014\u3016\u3018\u301A\u301D\uFD3F\uFE17\uFE35\uFE37\uFE39\uFE3B\uFE3D\uFE3F\uFE41\uFE43\uFE47\uFE59\uFE5B\uFE5D\uFF08\uFF3B\uFF5B\uFF5F\uFF62"
  }, {
    'name': 'S',
    'alias': 'Symbol',
    'bmp': "\\$\\+<->\\^`\\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B98-\u2BFF\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD",
    'astral': "\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6C\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED5\uDEE0-\uDEEC\uDEF0-\uDEFA\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD0D-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95]"
  }, {
    'name': 'Sc',
    'alias': 'Currency_Symbol',
    'bmp': "\\$\xA2-\xA5\u058F\u060B\u07FE\u07FF\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BF\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6",
    'astral': "\uD807[\uDFDD-\uDFE0]|\uD838\uDEFF|\uD83B\uDCB0"
  }, {
    'name': 'Sk',
    'alias': 'Modifier_Symbol',
    'bmp': "\\^`\xA8\xAF\xB4\xB8\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u309B\u309C\uA700-\uA716\uA720\uA721\uA789\uA78A\uAB5B\uFBB2-\uFBC1\uFF3E\uFF40\uFFE3",
    'astral': "\uD83C[\uDFFB-\uDFFF]"
  }, {
    'name': 'Sm',
    'alias': 'Math_Symbol',
    'bmp': "\\+<->\\|~\xAC\xB1\xD7\xF7\u03F6\u0606-\u0608\u2044\u2052\u207A-\u207C\u208A-\u208C\u2118\u2140-\u2144\u214B\u2190-\u2194\u219A\u219B\u21A0\u21A3\u21A6\u21AE\u21CE\u21CF\u21D2\u21D4\u21F4-\u22FF\u2320\u2321\u237C\u239B-\u23B3\u23DC-\u23E1\u25B7\u25C1\u25F8-\u25FF\u266F\u27C0-\u27C4\u27C7-\u27E5\u27F0-\u27FF\u2900-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2AFF\u2B30-\u2B44\u2B47-\u2B4C\uFB29\uFE62\uFE64-\uFE66\uFF0B\uFF1C-\uFF1E\uFF5C\uFF5E\uFFE2\uFFE9-\uFFEC",
    'astral': "\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD83B[\uDEF0\uDEF1]"
  }, {
    'name': 'So',
    'alias': 'Other_Symbol',
    'bmp': "\xA6\xA9\xAE\xB0\u0482\u058D\u058E\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u09FA\u0B70\u0BF3-\u0BF8\u0BFA\u0C7F\u0D4F\u0D79\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116\u2117\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u214A\u214C\u214D\u214F\u218A\u218B\u2195-\u2199\u219C-\u219F\u21A1\u21A2\u21A4\u21A5\u21A7-\u21AD\u21AF-\u21CD\u21D0\u21D1\u21D3\u21D5-\u21F3\u2300-\u2307\u230C-\u231F\u2322-\u2328\u232B-\u237B\u237D-\u239A\u23B4-\u23DB\u23E2-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u25B6\u25B8-\u25C0\u25C2-\u25F7\u2600-\u266E\u2670-\u2767\u2794-\u27BF\u2800-\u28FF\u2B00-\u2B2F\u2B45\u2B46\u2B4D-\u2B73\u2B76-\u2B95\u2B98-\u2BFF\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA828-\uA82B\uA836\uA837\uA839\uAA77-\uAA79\uFDFD\uFFE4\uFFE8\uFFED\uFFEE\uFFFC\uFFFD",
    'astral': "\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFDC\uDFE1-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838\uDD4F|\uD83B[\uDCAC\uDD2E]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6C\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFA]|\uD83D[\uDC00-\uDED5\uDEE0-\uDEEC\uDEF0-\uDEFA\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD0D-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95]"
  }, {
    'name': 'Z',
    'alias': 'Separator',
    'bmp': " \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000"
  }, {
    'name': 'Zl',
    'alias': 'Line_Separator',
    'bmp': "\u2028"
  }, {
    'name': 'Zp',
    'alias': 'Paragraph_Separator',
    'bmp': "\u2029"
  }, {
    'name': 'Zs',
    'alias': 'Space_Separator',
    'bmp': " \xA0\u1680\u2000-\u200A\u202F\u205F\u3000"
  }];

  var unicodeCategories = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _categories = interopRequireDefault(categories);
    /*!
     * XRegExp Unicode Categories 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2010-present MIT License
     * Unicode data by Mathias Bynens <mathiasbynens.be>
     */


    var _default = function _default(XRegExp) {
      /**
       * Adds support for Unicode's general categories. E.g., `\p{Lu}` or `\p{Uppercase Letter}`. See
       * category descriptions in UAX #44 <http://unicode.org/reports/tr44/#GC_Values_Table>. Token
       * names are case insensitive, and any spaces, hyphens, and underscores are ignored.
       *
       * Uses Unicode 12.1.0.
       *
       * @requires XRegExp, Unicode Base
       */
      if (!XRegExp.addUnicodeData) {
        throw new ReferenceError('Unicode Base must be loaded before Unicode Categories');
      }

      XRegExp.addUnicodeData(_categories["default"]);
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(unicodeCategories);

  var properties = [{
    'name': 'ASCII',
    'bmp': '\0-\x7F'
  }, {
    'name': 'Alphabetic',
    'bmp': "A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0345\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0657\u0659-\u065F\u066E-\u06D3\u06D5-\u06DC\u06E1-\u06E8\u06ED-\u06EF\u06FA-\u06FC\u06FF\u0710-\u073F\u074D-\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0817\u081A-\u082C\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08DF\u08E3-\u08E9\u08F0-\u093B\u093D-\u094C\u094E-\u0950\u0955-\u0963\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C4\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09F0\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A51\u0A59-\u0A5C\u0A5E\u0A70-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC5\u0AC7-\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0-\u0AE3\u0AF9-\u0AFC\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D-\u0B44\u0B47\u0B48\u0B4B\u0B4C\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4C\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCC\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E46\u0E4D\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0ECD\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F71-\u0F81\u0F88-\u0F97\u0F99-\u0FBC\u1000-\u1036\u1038\u103B-\u103F\u1050-\u108F\u109A-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1713\u1720-\u1733\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17B3\u17B6-\u17C8\u17D7\u17DC\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u1938\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A1B\u1A20-\u1A5E\u1A61-\u1A74\u1AA7\u1B00-\u1B33\u1B35-\u1B43\u1B45-\u1B4B\u1B80-\u1BA9\u1BAC-\u1BAF\u1BBA-\u1BE5\u1BE7-\u1BF1\u1C00-\u1C36\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1DE7-\u1DF4\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u24B6-\u24E9\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA674-\uA67B\uA67F-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA805\uA807-\uA827\uA840-\uA873\uA880-\uA8C3\uA8C5\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FF\uA90A-\uA92A\uA930-\uA952\uA960-\uA97C\uA980-\uA9B2\uA9B4-\uA9BF\uA9CF\uA9E0-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA60-\uAA76\uAA7A-\uAABE\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABEA\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",
    'astral': "\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC45\uDC82-\uDCB8\uDCD0-\uDCE8\uDD00-\uDD32\uDD44-\uDD46\uDD50-\uDD72\uDD76\uDD80-\uDDBF\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE34\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEE8\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D-\uDF44\uDF47\uDF48\uDF4B\uDF4C\uDF50\uDF57\uDF5D-\uDF63]|\uD805[\uDC00-\uDC41\uDC43-\uDC45\uDC47-\uDC4A\uDC5F\uDC80-\uDCC1\uDCC4\uDCC5\uDCC7\uDD80-\uDDB5\uDDB8-\uDDBE\uDDD8-\uDDDD\uDE00-\uDE3E\uDE40\uDE44\uDE80-\uDEB5\uDEB8\uDF00-\uDF1A\uDF1D-\uDF2A]|\uD806[\uDC00-\uDC38\uDCA0-\uDCDF\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDDF\uDDE1\uDDE3\uDDE4\uDE00-\uDE32\uDE35-\uDE3E\uDE50-\uDE97\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC3E\uDC40\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD41\uDD43\uDD46\uDD47\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD96\uDD98\uDEE0-\uDEF6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9E]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD47\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]"
  }, {
    'name': 'Any',
    'isBmpLast': true,
    'bmp': "\0-\uFFFF",
    'astral': "[\uD800-\uDBFF][\uDC00-\uDFFF]"
  }, {
    'name': 'Default_Ignorable_Code_Point',
    'bmp': "\xAD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8",
    'astral': "\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|[\uDB40-\uDB43][\uDC00-\uDFFF]"
  }, {
    'name': 'Lowercase',
    'bmp': "a-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02B8\u02C0\u02C1\u02E0-\u02E4\u0345\u0371\u0373\u0377\u037A-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1DBF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u2071\u207F\u2090-\u209C\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2170-\u217F\u2184\u24D0-\u24E9\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA69D\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C3\uA7F8-\uA7FA\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A",
    'astral': "\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]"
  }, {
    'name': 'Noncharacter_Code_Point',
    'bmp': "\uFDD0-\uFDEF\uFFFE\uFFFF",
    'astral': "[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]"
  }, {
    'name': 'Uppercase',
    'bmp': "A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C2\uA7C4-\uA7C6\uFF21-\uFF3A",
    'astral': "\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]"
  }, {
    'name': 'White_Space',
    'bmp': "\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000"
  }];

  var unicodeProperties = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _properties = interopRequireDefault(properties);
    /*!
     * XRegExp Unicode Properties 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2012-present MIT License
     * Unicode data by Mathias Bynens <mathiasbynens.be>
     */


    var _default = function _default(XRegExp) {
      /**
       * Adds properties to meet the UTS #18 Level 1 RL1.2 requirements for Unicode regex support. See
       * <http://unicode.org/reports/tr18/#RL1.2>. Following are definitions of these properties from
       * UAX #44 <http://unicode.org/reports/tr44/>:
       *
       * - Alphabetic
       *   Characters with the Alphabetic property. Generated from: Lowercase + Uppercase + Lt + Lm +
       *   Lo + Nl + Other_Alphabetic.
       *
       * - Default_Ignorable_Code_Point
       *   For programmatic determination of default ignorable code points. New characters that should
       *   be ignored in rendering (unless explicitly supported) will be assigned in these ranges,
       *   permitting programs to correctly handle the default rendering of such characters when not
       *   otherwise supported.
       *
       * - Lowercase
       *   Characters with the Lowercase property. Generated from: Ll + Other_Lowercase.
       *
       * - Noncharacter_Code_Point
       *   Code points permanently reserved for internal use.
       *
       * - Uppercase
       *   Characters with the Uppercase property. Generated from: Lu + Other_Uppercase.
       *
       * - White_Space
       *   Spaces, separator characters and other control characters which should be treated by
       *   programming languages as "white space" for the purpose of parsing elements.
       *
       * The properties ASCII, Any, and Assigned are also included but are not defined in UAX #44. UTS
       * #18 RL1.2 additionally requires support for Unicode scripts and general categories. These are
       * included in XRegExp's Unicode Categories and Unicode Scripts addons.
       *
       * Token names are case insensitive, and any spaces, hyphens, and underscores are ignored.
       *
       * Uses Unicode 12.1.0.
       *
       * @requires XRegExp, Unicode Base
       */
      if (!XRegExp.addUnicodeData) {
        throw new ReferenceError('Unicode Base must be loaded before Unicode Properties');
      }

      var unicodeData = _properties["default"]; // Add non-generated data

      unicodeData.push({
        name: 'Assigned',
        // Since this is defined as the inverse of Unicode category Cn (Unassigned), the Unicode
        // Categories addon is required to use this property
        inverseOf: 'Cn'
      });
      XRegExp.addUnicodeData(unicodeData);
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(unicodeProperties);

  var scripts = [{
    'name': 'Adlam',
    'astral': "\uD83A[\uDD00-\uDD4B\uDD50-\uDD59\uDD5E\uDD5F]"
  }, {
    'name': 'Ahom',
    'astral': "\uD805[\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF3F]"
  }, {
    'name': 'Anatolian_Hieroglyphs',
    'astral': "\uD811[\uDC00-\uDE46]"
  }, {
    'name': 'Arabic',
    'bmp': "\u0600-\u0604\u0606-\u060B\u060D-\u061A\u061C\u061E\u0620-\u063F\u0641-\u064A\u0656-\u066F\u0671-\u06DC\u06DE-\u06FF\u0750-\u077F\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u08FF\uFB50-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE70-\uFE74\uFE76-\uFEFC",
    'astral': "\uD803[\uDE60-\uDE7E]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB\uDEF0\uDEF1]"
  }, {
    'name': 'Armenian',
    'bmp': "\u0531-\u0556\u0559-\u0588\u058A\u058D-\u058F\uFB13-\uFB17"
  }, {
    'name': 'Avestan',
    'astral': "\uD802[\uDF00-\uDF35\uDF39-\uDF3F]"
  }, {
    'name': 'Balinese',
    'bmp': "\u1B00-\u1B4B\u1B50-\u1B7C"
  }, {
    'name': 'Bamum',
    'bmp': "\uA6A0-\uA6F7",
    'astral': "\uD81A[\uDC00-\uDE38]"
  }, {
    'name': 'Bassa_Vah',
    'astral': "\uD81A[\uDED0-\uDEED\uDEF0-\uDEF5]"
  }, {
    'name': 'Batak',
    'bmp': "\u1BC0-\u1BF3\u1BFC-\u1BFF"
  }, {
    'name': 'Bengali',
    'bmp': "\u0980-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FE"
  }, {
    'name': 'Bhaiksuki',
    'astral': "\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC45\uDC50-\uDC6C]"
  }, {
    'name': 'Bopomofo',
    'bmp': "\u02EA\u02EB\u3105-\u312F\u31A0-\u31BA"
  }, {
    'name': 'Brahmi',
    'astral': "\uD804[\uDC00-\uDC4D\uDC52-\uDC6F\uDC7F]"
  }, {
    'name': 'Braille',
    'bmp': "\u2800-\u28FF"
  }, {
    'name': 'Buginese',
    'bmp': "\u1A00-\u1A1B\u1A1E\u1A1F"
  }, {
    'name': 'Buhid',
    'bmp': "\u1740-\u1753"
  }, {
    'name': 'Canadian_Aboriginal',
    'bmp': "\u1400-\u167F\u18B0-\u18F5"
  }, {
    'name': 'Carian',
    'astral': "\uD800[\uDEA0-\uDED0]"
  }, {
    'name': 'Caucasian_Albanian',
    'astral': "\uD801[\uDD30-\uDD63\uDD6F]"
  }, {
    'name': 'Chakma',
    'astral': "\uD804[\uDD00-\uDD34\uDD36-\uDD46]"
  }, {
    'name': 'Cham',
    'bmp': "\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA5C-\uAA5F"
  }, {
    'name': 'Cherokee',
    'bmp': "\u13A0-\u13F5\u13F8-\u13FD\uAB70-\uABBF"
  }, {
    'name': 'Common',
    'bmp': "\0-@\\[-`\\{-\xA9\xAB-\xB9\xBB-\xBF\xD7\xF7\u02B9-\u02DF\u02E5-\u02E9\u02EC-\u02FF\u0374\u037E\u0385\u0387\u0589\u0605\u060C\u061B\u061F\u0640\u06DD\u08E2\u0964\u0965\u0E3F\u0FD5-\u0FD8\u10FB\u16EB-\u16ED\u1735\u1736\u1802\u1803\u1805\u1CD3\u1CE1\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5-\u1CF7\u1CFA\u2000-\u200B\u200E-\u2064\u2066-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20BF\u2100-\u2125\u2127-\u2129\u212C-\u2131\u2133-\u214D\u214F-\u215F\u2189-\u218B\u2190-\u2426\u2440-\u244A\u2460-\u27FF\u2900-\u2B73\u2B76-\u2B95\u2B98-\u2BFF\u2E00-\u2E4F\u2FF0-\u2FFB\u3000-\u3004\u3006\u3008-\u3020\u3030-\u3037\u303C-\u303F\u309B\u309C\u30A0\u30FB\u30FC\u3190-\u319F\u31C0-\u31E3\u3220-\u325F\u327F-\u32CF\u32FF\u3358-\u33FF\u4DC0-\u4DFF\uA700-\uA721\uA788-\uA78A\uA830-\uA839\uA92E\uA9CF\uAB5B\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFEFF\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFF70\uFF9E\uFF9F\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFF9-\uFFFD",
    'astral': "\uD800[\uDD00-\uDD02\uDD07-\uDD33\uDD37-\uDD3F\uDD90-\uDD9B\uDDD0-\uDDFC\uDEE1-\uDEFB]|\uD81B[\uDFE2\uDFE3]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD66\uDD6A-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDEE0-\uDEF3\uDF00-\uDF56\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDFCB\uDFCE-\uDFFF]|\uD83B[\uDC71-\uDCB4\uDD01-\uDD3D]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD00-\uDD0C\uDD10-\uDD6C\uDD70-\uDDAC\uDDE6-\uDDFF\uDE01\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED5\uDEE0-\uDEEC\uDEF0-\uDEFA\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD0D-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95]|\uDB40[\uDC01\uDC20-\uDC7F]"
  }, {
    'name': 'Coptic',
    'bmp': "\u03E2-\u03EF\u2C80-\u2CF3\u2CF9-\u2CFF"
  }, {
    'name': 'Cuneiform',
    'astral': "\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC70-\uDC74\uDC80-\uDD43]"
  }, {
    'name': 'Cypriot',
    'astral': "\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F]"
  }, {
    'name': 'Cyrillic',
    'bmp': "\u0400-\u0484\u0487-\u052F\u1C80-\u1C88\u1D2B\u1D78\u2DE0-\u2DFF\uA640-\uA69F\uFE2E\uFE2F"
  }, {
    'name': 'Deseret',
    'astral': "\uD801[\uDC00-\uDC4F]"
  }, {
    'name': 'Devanagari',
    'bmp': "\u0900-\u0950\u0955-\u0963\u0966-\u097F\uA8E0-\uA8FF"
  }, {
    'name': 'Dogra',
    'astral': "\uD806[\uDC00-\uDC3B]"
  }, {
    'name': 'Duployan',
    'astral': "\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9C-\uDC9F]"
  }, {
    'name': 'Egyptian_Hieroglyphs',
    'astral': "\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E\uDC30-\uDC38]"
  }, {
    'name': 'Elbasan',
    'astral': "\uD801[\uDD00-\uDD27]"
  }, {
    'name': 'Elymaic',
    'astral': "\uD803[\uDFE0-\uDFF6]"
  }, {
    'name': 'Ethiopic',
    'bmp': "\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E"
  }, {
    'name': 'Georgian',
    'bmp': "\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u10FF\u1C90-\u1CBA\u1CBD-\u1CBF\u2D00-\u2D25\u2D27\u2D2D"
  }, {
    'name': 'Glagolitic',
    'bmp': "\u2C00-\u2C2E\u2C30-\u2C5E",
    'astral': "\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]"
  }, {
    'name': 'Gothic',
    'astral': "\uD800[\uDF30-\uDF4A]"
  }, {
    'name': 'Grantha',
    'astral': "\uD804[\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]"
  }, {
    'name': 'Greek',
    'bmp': "\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65",
    'astral': "\uD800[\uDD40-\uDD8E\uDDA0]|\uD834[\uDE00-\uDE45]"
  }, {
    'name': 'Gujarati',
    'bmp': "\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1\u0AF9-\u0AFF"
  }, {
    'name': 'Gunjala_Gondi',
    'astral': "\uD807[\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9]"
  }, {
    'name': 'Gurmukhi',
    'bmp': "\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A76"
  }, {
    'name': 'Han',
    'bmp': "\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9",
    'astral': "[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]"
  }, {
    'name': 'Hangul',
    'bmp': "\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC"
  }, {
    'name': 'Hanifi_Rohingya',
    'astral': "\uD803[\uDD00-\uDD27\uDD30-\uDD39]"
  }, {
    'name': 'Hanunoo',
    'bmp': "\u1720-\u1734"
  }, {
    'name': 'Hatran',
    'astral': "\uD802[\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDCFF]"
  }, {
    'name': 'Hebrew',
    'bmp': "\u0591-\u05C7\u05D0-\u05EA\u05EF-\u05F4\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFB4F"
  }, {
    'name': 'Hiragana',
    'bmp': "\u3041-\u3096\u309D-\u309F",
    'astral': "\uD82C[\uDC01-\uDD1E\uDD50-\uDD52]|\uD83C\uDE00"
  }, {
    'name': 'Imperial_Aramaic',
    'astral': "\uD802[\uDC40-\uDC55\uDC57-\uDC5F]"
  }, {
    'name': 'Inherited',
    'bmp': "\u0300-\u036F\u0485\u0486\u064B-\u0655\u0670\u0951-\u0954\u1AB0-\u1ABE\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u200C\u200D\u20D0-\u20F0\u302A-\u302D\u3099\u309A\uFE00-\uFE0F\uFE20-\uFE2D",
    'astral': "\uD800[\uDDFD\uDEE0]|\uD804\uDF3B|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD]|\uDB40[\uDD00-\uDDEF]"
  }, {
    'name': 'Inscriptional_Pahlavi',
    'astral': "\uD802[\uDF60-\uDF72\uDF78-\uDF7F]"
  }, {
    'name': 'Inscriptional_Parthian',
    'astral': "\uD802[\uDF40-\uDF55\uDF58-\uDF5F]"
  }, {
    'name': 'Javanese',
    'bmp': "\uA980-\uA9CD\uA9D0-\uA9D9\uA9DE\uA9DF"
  }, {
    'name': 'Kaithi',
    'astral': "\uD804[\uDC80-\uDCC1\uDCCD]"
  }, {
    'name': 'Kannada',
    'bmp': "\u0C80-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2"
  }, {
    'name': 'Katakana',
    'bmp': "\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D",
    'astral': "\uD82C[\uDC00\uDD64-\uDD67]"
  }, {
    'name': 'Kayah_Li',
    'bmp': "\uA900-\uA92D\uA92F"
  }, {
    'name': 'Kharoshthi',
    'astral': "\uD802[\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F-\uDE48\uDE50-\uDE58]"
  }, {
    'name': 'Khmer',
    'bmp': "\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u19E0-\u19FF"
  }, {
    'name': 'Khojki',
    'astral': "\uD804[\uDE00-\uDE11\uDE13-\uDE3E]"
  }, {
    'name': 'Khudawadi',
    'astral': "\uD804[\uDEB0-\uDEEA\uDEF0-\uDEF9]"
  }, {
    'name': 'Lao',
    'bmp': "\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF"
  }, {
    'name': 'Latin',
    'bmp': "A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uAB66\uAB67\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A"
  }, {
    'name': 'Lepcha',
    'bmp': "\u1C00-\u1C37\u1C3B-\u1C49\u1C4D-\u1C4F"
  }, {
    'name': 'Limbu',
    'bmp': "\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1940\u1944-\u194F"
  }, {
    'name': 'Linear_A',
    'astral': "\uD801[\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]"
  }, {
    'name': 'Linear_B',
    'astral': "\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA]"
  }, {
    'name': 'Lisu',
    'bmp': "\uA4D0-\uA4FF"
  }, {
    'name': 'Lycian',
    'astral': "\uD800[\uDE80-\uDE9C]"
  }, {
    'name': 'Lydian',
    'astral': "\uD802[\uDD20-\uDD39\uDD3F]"
  }, {
    'name': 'Mahajani',
    'astral': "\uD804[\uDD50-\uDD76]"
  }, {
    'name': 'Makasar',
    'astral': "\uD807[\uDEE0-\uDEF8]"
  }, {
    'name': 'Malayalam',
    'bmp': "\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4F\u0D54-\u0D63\u0D66-\u0D7F"
  }, {
    'name': 'Mandaic',
    'bmp': "\u0840-\u085B\u085E"
  }, {
    'name': 'Manichaean',
    'astral': "\uD802[\uDEC0-\uDEE6\uDEEB-\uDEF6]"
  }, {
    'name': 'Marchen',
    'astral': "\uD807[\uDC70-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]"
  }, {
    'name': 'Masaram_Gondi',
    'astral': "\uD807[\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]"
  }, {
    'name': 'Medefaidrin',
    'astral': "\uD81B[\uDE40-\uDE9A]"
  }, {
    'name': 'Meetei_Mayek',
    'bmp': "\uAAE0-\uAAF6\uABC0-\uABED\uABF0-\uABF9"
  }, {
    'name': 'Mende_Kikakui',
    'astral': "\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6]"
  }, {
    'name': 'Meroitic_Cursive',
    'astral': "\uD802[\uDDA0-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDDFF]"
  }, {
    'name': 'Meroitic_Hieroglyphs',
    'astral': "\uD802[\uDD80-\uDD9F]"
  }, {
    'name': 'Miao',
    'astral': "\uD81B[\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F]"
  }, {
    'name': 'Modi',
    'astral': "\uD805[\uDE00-\uDE44\uDE50-\uDE59]"
  }, {
    'name': 'Mongolian',
    'bmp': "\u1800\u1801\u1804\u1806-\u180E\u1810-\u1819\u1820-\u1878\u1880-\u18AA",
    'astral': "\uD805[\uDE60-\uDE6C]"
  }, {
    'name': 'Mro',
    'astral': "\uD81A[\uDE40-\uDE5E\uDE60-\uDE69\uDE6E\uDE6F]"
  }, {
    'name': 'Multani',
    'astral': "\uD804[\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA9]"
  }, {
    'name': 'Myanmar',
    'bmp': "\u1000-\u109F\uA9E0-\uA9FE\uAA60-\uAA7F"
  }, {
    'name': 'Nabataean',
    'astral': "\uD802[\uDC80-\uDC9E\uDCA7-\uDCAF]"
  }, {
    'name': 'Nandinagari',
    'astral': "\uD806[\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE4]"
  }, {
    'name': 'New_Tai_Lue',
    'bmp': "\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u19DE\u19DF"
  }, {
    'name': 'Newa',
    'astral': "\uD805[\uDC00-\uDC59\uDC5B\uDC5D-\uDC5F]"
  }, {
    'name': 'Nko',
    'bmp': "\u07C0-\u07FA\u07FD-\u07FF"
  }, {
    'name': 'Nushu',
    'astral': "\uD81B\uDFE1|\uD82C[\uDD70-\uDEFB]"
  }, {
    'name': 'Nyiakeng_Puachue_Hmong',
    'astral': "\uD838[\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDD4F]"
  }, {
    'name': 'Ogham',
    'bmp': "\u1680-\u169C"
  }, {
    'name': 'Ol_Chiki',
    'bmp': "\u1C50-\u1C7F"
  }, {
    'name': 'Old_Hungarian',
    'astral': "\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDCFF]"
  }, {
    'name': 'Old_Italic',
    'astral': "\uD800[\uDF00-\uDF23\uDF2D-\uDF2F]"
  }, {
    'name': 'Old_North_Arabian',
    'astral': "\uD802[\uDE80-\uDE9F]"
  }, {
    'name': 'Old_Permic',
    'astral': "\uD800[\uDF50-\uDF7A]"
  }, {
    'name': 'Old_Persian',
    'astral': "\uD800[\uDFA0-\uDFC3\uDFC8-\uDFD5]"
  }, {
    'name': 'Old_Sogdian',
    'astral': "\uD803[\uDF00-\uDF27]"
  }, {
    'name': 'Old_South_Arabian',
    'astral': "\uD802[\uDE60-\uDE7F]"
  }, {
    'name': 'Old_Turkic',
    'astral': "\uD803[\uDC00-\uDC48]"
  }, {
    'name': 'Oriya',
    'bmp': "\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77"
  }, {
    'name': 'Osage',
    'astral': "\uD801[\uDCB0-\uDCD3\uDCD8-\uDCFB]"
  }, {
    'name': 'Osmanya',
    'astral': "\uD801[\uDC80-\uDC9D\uDCA0-\uDCA9]"
  }, {
    'name': 'Pahawh_Hmong',
    'astral': "\uD81A[\uDF00-\uDF45\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]"
  }, {
    'name': 'Palmyrene',
    'astral': "\uD802[\uDC60-\uDC7F]"
  }, {
    'name': 'Pau_Cin_Hau',
    'astral': "\uD806[\uDEC0-\uDEF8]"
  }, {
    'name': 'Phags_Pa',
    'bmp': "\uA840-\uA877"
  }, {
    'name': 'Phoenician',
    'astral': "\uD802[\uDD00-\uDD1B\uDD1F]"
  }, {
    'name': 'Psalter_Pahlavi',
    'astral': "\uD802[\uDF80-\uDF91\uDF99-\uDF9C\uDFA9-\uDFAF]"
  }, {
    'name': 'Rejang',
    'bmp': "\uA930-\uA953\uA95F"
  }, {
    'name': 'Runic',
    'bmp': "\u16A0-\u16EA\u16EE-\u16F8"
  }, {
    'name': 'Samaritan',
    'bmp': "\u0800-\u082D\u0830-\u083E"
  }, {
    'name': 'Saurashtra',
    'bmp': "\uA880-\uA8C5\uA8CE-\uA8D9"
  }, {
    'name': 'Sharada',
    'astral': "\uD804[\uDD80-\uDDCD\uDDD0-\uDDDF]"
  }, {
    'name': 'Shavian',
    'astral': "\uD801[\uDC50-\uDC7F]"
  }, {
    'name': 'Siddham',
    'astral': "\uD805[\uDD80-\uDDB5\uDDB8-\uDDDD]"
  }, {
    'name': 'SignWriting',
    'astral': "\uD836[\uDC00-\uDE8B\uDE9B-\uDE9F\uDEA1-\uDEAF]"
  }, {
    'name': 'Sinhala',
    'bmp': "\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4",
    'astral': "\uD804[\uDDE1-\uDDF4]"
  }, {
    'name': 'Sogdian',
    'astral': "\uD803[\uDF30-\uDF59]"
  }, {
    'name': 'Sora_Sompeng',
    'astral': "\uD804[\uDCD0-\uDCE8\uDCF0-\uDCF9]"
  }, {
    'name': 'Soyombo',
    'astral': "\uD806[\uDE50-\uDEA2]"
  }, {
    'name': 'Sundanese',
    'bmp': "\u1B80-\u1BBF\u1CC0-\u1CC7"
  }, {
    'name': 'Syloti_Nagri',
    'bmp': "\uA800-\uA82B"
  }, {
    'name': 'Syriac',
    'bmp': "\u0700-\u070D\u070F-\u074A\u074D-\u074F\u0860-\u086A"
  }, {
    'name': 'Tagalog',
    'bmp': "\u1700-\u170C\u170E-\u1714"
  }, {
    'name': 'Tagbanwa',
    'bmp': "\u1760-\u176C\u176E-\u1770\u1772\u1773"
  }, {
    'name': 'Tai_Le',
    'bmp': "\u1950-\u196D\u1970-\u1974"
  }, {
    'name': 'Tai_Tham',
    'bmp': "\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD"
  }, {
    'name': 'Tai_Viet',
    'bmp': "\uAA80-\uAAC2\uAADB-\uAADF"
  }, {
    'name': 'Takri',
    'astral': "\uD805[\uDE80-\uDEB8\uDEC0-\uDEC9]"
  }, {
    'name': 'Tamil',
    'bmp': "\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA",
    'astral': "\uD807[\uDFC0-\uDFF1\uDFFF]"
  }, {
    'name': 'Tangut',
    'astral': "\uD81B\uDFE0|[\uD81C-\uD820][\uDC00-\uDFFF]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]"
  }, {
    'name': 'Telugu',
    'bmp': "\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C77-\u0C7F"
  }, {
    'name': 'Thaana',
    'bmp': "\u0780-\u07B1"
  }, {
    'name': 'Thai',
    'bmp': "\u0E01-\u0E3A\u0E40-\u0E5B"
  }, {
    'name': 'Tibetan',
    'bmp': "\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FD4\u0FD9\u0FDA"
  }, {
    'name': 'Tifinagh',
    'bmp': "\u2D30-\u2D67\u2D6F\u2D70\u2D7F"
  }, {
    'name': 'Tirhuta',
    'astral': "\uD805[\uDC80-\uDCC7\uDCD0-\uDCD9]"
  }, {
    'name': 'Ugaritic',
    'astral': "\uD800[\uDF80-\uDF9D\uDF9F]"
  }, {
    'name': 'Vai',
    'bmp': "\uA500-\uA62B"
  }, {
    'name': 'Wancho',
    'astral': "\uD838[\uDEC0-\uDEF9\uDEFF]"
  }, {
    'name': 'Warang_Citi',
    'astral': "\uD806[\uDCA0-\uDCF2\uDCFF]"
  }, {
    'name': 'Yi',
    'bmp': "\uA000-\uA48C\uA490-\uA4C6"
  }, {
    'name': 'Zanabazar_Square',
    'astral': "\uD806[\uDE00-\uDE47]"
  }];

  var unicodeScripts = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _scripts = interopRequireDefault(scripts);
    /*!
     * XRegExp Unicode Scripts 4.3.0
     * <xregexp.com>
     * Steven Levithan (c) 2010-present MIT License
     * Unicode data by Mathias Bynens <mathiasbynens.be>
     */


    var _default = function _default(XRegExp) {
      /**
       * Adds support for all Unicode scripts. E.g., `\p{Latin}`. Token names are case insensitive,
       * and any spaces, hyphens, and underscores are ignored.
       *
       * Uses Unicode 12.1.0.
       *
       * @requires XRegExp, Unicode Base
       */
      if (!XRegExp.addUnicodeData) {
        throw new ReferenceError('Unicode Base must be loaded before Unicode Scripts');
      }

      XRegExp.addUnicodeData(_scripts["default"]);
    };

    exports["default"] = _default;
    module.exports = exports["default"];
  });
  unwrapExports(unicodeScripts);

  var lib = createCommonjsModule(function (module, exports) {

    defineProperty$1(exports, "__esModule", {
      value: true
    });

    exports["default"] = void 0;

    var _xregexp = interopRequireDefault(xregexp);

    var _build = interopRequireDefault(build);

    var _matchrecursive = interopRequireDefault(matchrecursive);

    var _unicodeBase = interopRequireDefault(unicodeBase);

    var _unicodeBlocks = interopRequireDefault(unicodeBlocks);

    var _unicodeCategories = interopRequireDefault(unicodeCategories);

    var _unicodeProperties = interopRequireDefault(unicodeProperties);

    var _unicodeScripts = interopRequireDefault(unicodeScripts);

    (0, _build["default"])(_xregexp["default"]);
    (0, _matchrecursive["default"])(_xregexp["default"]);
    (0, _unicodeBase["default"])(_xregexp["default"]);
    (0, _unicodeBlocks["default"])(_xregexp["default"]);
    (0, _unicodeCategories["default"])(_xregexp["default"]);
    (0, _unicodeProperties["default"])(_xregexp["default"]);
    (0, _unicodeScripts["default"])(_xregexp["default"]);
    var _default = _xregexp["default"];
    exports["default"] = _default;
    module.exports = exports["default"];
  });
  var XRegExp = unwrapExports(lib);

  var topicModelling = /*#__PURE__*/function () {
    /**
     * 
     * @param {object} settings 
     * @param {array} sentences 
     * @param {array} dict 
     */
    function topicModelling(settings, sentences, dict) {
      var _this = this;

      _classCallCheck(this, topicModelling);

      this.settings = settings || {};

      if (dict) {
        this.dict = dict;
      }

      if (!isNaN(this.settings.numberTopics) && this.settings.numberTopics > 0) {
        this.numTopics = this.settings.numberTopics;
      } else {
        this.numTopics = 10;
      }

      this.documentTopicSmoothing = 0.1;
      this.topicWordSmoothing = 0.01;
      this.docSortSmoothing = 10.0;
      this.sumDocSortSmoothing = this.docSortSmoothing * this.numTopics;
      this.completeSweeps = 0;
      this.reqiestedSweeps = 0; // vocabulary

      this.vocabularySize = 0;
      this.vocabularyCounts = {};

      if (this.settings.displayingStopWords !== undefined) {
        this.displayingStopwords = settings.displayingStopWords;
      } //documents


      this.documents = [];
      this.wordTopicCounts = {};
      this.topicWordCounts = [];
      this.topicScores = this.zeros(this.numTopics);
      this.tokensPerTopic = this.zeros(this.numTopics);
      this.topicWeights = this.zeros(this.numTopics);
      this.stopwords = {};

      if (this.dict !== undefined) {
        this.dict.forEach(function (key) {
          _this.stopwords[key] = true;
        });
      }

      this.prepareData(sentences);

      if (this.settings.sweeps !== undefined) {
        this.requestedSweeps = this.settings.sweeps;
      } else {
        this.requestedSweeps = 500;
      }

      while (this.completeSweeps <= this.requestedSweeps) {
        this.sweep();
      }
    }

    _createClass(topicModelling, [{
      key: "prepareData",
      value: function prepareData(documents) {
        var _this2 = this;

        if (!documents || documents.length < 0) {
          return;
        }

        var wordPattern = XRegExp('\\p{L}[\\p{L}\\p{P}]*\\p{L}', 'g');

        var _iterator = _createForOfIteratorHelper(documents),
            _step;

        try {
          var _loop = function _loop() {
            var item = _step.value;

            if (item.text == '') {
              return "continue";
            }

            var sentence = Array.isArray(item.text) ? item.text : item.text.toLowerCase().match(wordPattern);
            var docID = item.id;
            var tokens = [];

            var topicCounts = _this2.zeros(_this2.numTopics);

            if (sentence == null) {
              return "continue";
            }

            sentence.forEach(function (word) {
              if (word !== '') {
                var topic = Math.floor(Math.random() * _this2.numTopics);

                if (word.length <= 2) {
                  _this2.stopwords[word] = 1;
                }

                var isStopword = _this2.stopwords[word];

                if (isStopword) {
                  // Record counts for stopwords, but nothing else
                  if (!_this2.vocabularyCounts[word]) {
                    _this2.vocabularyCounts[word] = 1;
                  } else {
                    _this2.vocabularyCounts[word] += 1;
                  }
                } else {
                  _this2.tokensPerTopic[topic]++;

                  if (!_this2.wordTopicCounts[word]) {
                    _this2.wordTopicCounts[word] = {};
                    _this2.vocabularySize++;
                    _this2.vocabularyCounts[word] = 0;
                  }

                  if (!_this2.wordTopicCounts[word][topic]) {
                    _this2.wordTopicCounts[word][topic] = 0;
                  }

                  _this2.wordTopicCounts[word][topic] += 1;
                  _this2.vocabularyCounts[word] += 1;
                  topicCounts[topic] += 1;
                }

                tokens.push({
                  word: word,
                  topic: topic,
                  isStopword: isStopword
                });
              }
            });

            _this2.documents.push({
              originalOrder: documents.length,
              id: docID,
              originalText: item.text,
              tokens: tokens,
              topicCounts: topicCounts
            });
          };

          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "sweep",
      value: function sweep() {
        var topicNormalizers = this.zeros(this.numTopics);

        for (var topic = 0; topic < this.numTopics; topic++) {
          topicNormalizers[topic] = 1.0 / (this.vocabularySize * this.topicWordSmoothing + this.tokensPerTopic[topic]);
        }

        for (var doc = 0; doc < this.documents.length; doc++) {
          var currentDoc = this.documents[doc];
          var docTopicCounts = currentDoc.topicCounts;

          for (var position = 0; position < currentDoc.tokens.length; position++) {
            var token = currentDoc.tokens[position];

            if (token.isStopword) {
              continue;
            }

            this.tokensPerTopic[token.topic]--;
            var currentWordTopicCounts = this.wordTopicCounts[token.word];
            currentWordTopicCounts[token.topic]--;

            if (currentWordTopicCounts[token.topic] == 0) ;

            docTopicCounts[token.topic]--;
            topicNormalizers[token.topic] = 1.0 / (this.vocabularySize * this.topicWordSmoothing + this.tokensPerTopic[token.topic]);
            var sum = 0.0;

            for (var _topic = 0; _topic < this.numTopics; _topic++) {
              if (currentWordTopicCounts[_topic]) {
                this.topicWeights[_topic] = (this.documentTopicSmoothing + docTopicCounts[_topic]) * (this.topicWordSmoothing + currentWordTopicCounts[_topic]) * topicNormalizers[_topic];
              } else {
                this.topicWeights[_topic] = (this.documentTopicSmoothing + docTopicCounts[_topic]) * this.topicWordSmoothing * topicNormalizers[_topic];
              }

              sum += this.topicWeights[_topic];
            } // Sample from an unnormalized discrete distribution


            var sample = sum * Math.random();
            var i = 0;
            sample -= this.topicWeights[i];

            while (sample > 0.0) {
              i++;
              sample -= this.topicWeights[i];
            }

            token.topic = i;
            this.tokensPerTopic[token.topic]++;

            if (!currentWordTopicCounts[token.topic]) {
              currentWordTopicCounts[token.topic] = 1;
            } else {
              currentWordTopicCounts[token.topic] += 1;
            }

            docTopicCounts[token.topic]++;
            topicNormalizers[token.topic] = 1.0 / (this.vocabularySize * this.topicWordSmoothing + this.tokensPerTopic[token.topic]);
          }
        } //console.log("sweep in " + (Date.now() - startTime) + " ms");


        this.completeSweeps += 1;

        if (this.completeSweeps >= this.requestedSweeps) {
          this.sortTopicWords();
        }
      }
    }, {
      key: "byCountDescending",
      value: function byCountDescending(a, b) {
        return b.count - a.count;
      }
    }, {
      key: "topNWords",
      value: function topNWords(wordCounts, n) {
        return wordCounts.slice(0, n).map(function (d) {
          return d.word;
        }).join(' ');
      }
    }, {
      key: "sortTopicWords",
      value: function sortTopicWords() {
        this.topicWordCounts = [];

        for (var topic = 0; topic < this.numTopics; topic++) {
          this.topicWordCounts[topic] = [];
        }

        for (var word in this.wordTopicCounts) {
          for (var _topic2 in this.wordTopicCounts[word]) {
            this.topicWordCounts[_topic2].push({
              word: word,
              count: this.wordTopicCounts[word][_topic2]
            });
          }
        }

        for (var _topic3 = 0; _topic3 < this.numTopics; _topic3++) {
          this.topicWordCounts[_topic3].sort(this.byCountDescending);
        }
      }
    }, {
      key: "getTopicWords",
      value: function getTopicWords() {
        var _this3 = this;

        var topicTopWords = [];

        for (var topic = 0; topic < this.numTopics; topic++) {
          topicTopWords.push(this.topNWords(this.topicWordCounts[topic], 10));
        }

        this.calcDominantTopic();
        var topicData = topicTopWords.map(function (words, index) {
          return {
            id: index,
            topicText: words,
            score: _this3.topicScores[index]
          };
        });
        return topicData;
      }
    }, {
      key: "calcDominantTopic",
      value: function calcDominantTopic() {
        var _this4 = this;

        this.documents.map(function (doc, i) {
          var topic = -1;
          var score = -1;

          for (var selectedTopic = 0; selectedTopic < _this4.numTopics; selectedTopic++) {
            var tempScore = (doc.topicCounts[selectedTopic] + _this4.docSortSmoothing) / (doc.tokens.length + _this4.sumDocSortSmoothing);

            if (tempScore >= score) {
              score = tempScore;
              topic = selectedTopic;
            }
          }

          _this4.topicScores[topic] += 1;
        });
        this.topicScores = this.topicScores.map(function (val) {
          return val / _this4.documents.length;
        });
      }
    }, {
      key: "getDocuments",
      value: function getDocuments() {
        var _this5 = this;

        var sentences = [];

        var _loop2 = function _loop2(selectedTopic) {
          var documentVocab = _this5.getVocab(selectedTopic, true);

          var scores = _this5.documents.map(function (doc, i) {
            return {
              docID: i,
              score: (doc.topicCounts[selectedTopic] + _this5.docSortSmoothing) / (doc.tokens.length + _this5.sumDocSortSmoothing)
            };
          });

          scores.sort(function (a, b) {
            return b.score - a.score;
          });
          var docinfo = [];

          var _iterator2 = _createForOfIteratorHelper(scores),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var val = _step2.value;

              if (_this5.documents[val.docID].topicCounts[selectedTopic] > 0) {
                docinfo.push({
                  id: _this5.documents[val.docID].id,
                  text: _this5.documents[val.docID].originalText,
                  score: val.score
                });
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          sentences.push({
            topic: selectedTopic,
            documents: docinfo,
            documentVocab: documentVocab
          });
        };

        for (var selectedTopic = 0; selectedTopic < this.numTopics; selectedTopic++) {
          _loop2(selectedTopic);
        }

        return sentences;
      } //
      // Vocabulary
      //

    }, {
      key: "mostFrequentWords",
      value: function mostFrequentWords(includeStops, sortByTopic, selectedTopic) {
        // Convert the random-access map to a list of word:count pairs that
        //  we can then sort.
        var wordCounts = [];

        if (sortByTopic) {
          for (var word in this.vocabularyCounts) {
            if (this.wordTopicCounts[word] && this.wordTopicCounts[word][selectedTopic]) {
              wordCounts.push({
                word: word,
                count: this.wordTopicCounts[word][selectedTopic]
              });
            }
          }
        } else {
          for (var _word in this.vocabularyCounts) {
            if (includeStops || !this.stopwords[_word]) {
              wordCounts.push({
                word: _word,
                count: this.vocabularyCounts[_word]
              });
            }
          }
        }

        wordCounts.sort(this.byCountDescending);
        return wordCounts;
      }
    }, {
      key: "entropy",
      value: function entropy(counts) {
        counts = counts.filter(function (x) {
          return x > 0.0;
        });
        var sum = this.sum(counts);
        return Math.log(sum) - 1.0 / sum * this.sum(counts.map(function (x) {
          return x * Math.log(x);
        }));
      }
    }, {
      key: "specificity",
      value: function specificity(word) {
        if (this.wordTopicCounts[word] == undefined) {
          return 0;
        }

        return 1.0 - this.entropy(Object.values(this.wordTopicCounts[word])) / Math.log(this.numTopics);
      }
    }, {
      key: "getVocab",
      value: function getVocab(selectedTopic, sortVocabByTopic) {
        var _this6 = this;

        var vocab = [];
        var wordFrequencies = this.mostFrequentWords(this.displayingStopwords, sortVocabByTopic, selectedTopic).slice(0, 499);
        wordFrequencies.forEach(function (d) {
          var isStopword = _this6.stopwords[d.word];

          var score = _this6.specificity(d.word);

          vocab.push({
            word: d.word,
            count: d.count,
            stopword: isStopword,
            specificity: score
          });
        });
        return vocab;
      }
    }, {
      key: "truncate",
      value: function truncate(s) {
        return s.length > 300 ? s.substring(0, 299) + '...' : s;
      }
    }, {
      key: "zeros",
      value: function zeros(n) {
        var x = new Array(n);

        for (var i = 0; i < n; i++) {
          x[i] = 0.0;
        }

        return x;
      }
    }, {
      key: "sum",
      value: function sum(arr) {
        return arr.reduce(function (sum, currentValue) {
          return sum + currentValue;
        });
      }
    }]);

    return topicModelling;
  }();

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
     * 	loadCorpus("goldbug");
     *
     * 	loadCorpus("goldbug", {
     * 		// if corpus ID "goldbug" isn't found, use the input
     * 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
     * 		inputRemoveUntil: 'THE GOLD-BUG',
     * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
     * 	});
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
       * 	[
          * 		{
          *   		"id": "ddac6b12c3f4261013c63d04e8d21b45",
          *   		"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
          *   		"tokensCount-lexical": "33559",
          *   		"lastTokenStartOffset-lexical": "259750",
          *   		"parent_modified": "1548457455000",
          *   		"typesCount-lexical": "4235",
          *   		"typesCountMean-lexical": "7.924203",
          *   		"lastTokenPositionIndex-lexical": "33558",
          *   		"index": "0",
          *   		"language": "en",
          *   		"sentencesCount": "1302",
          *   		"source": "stream",
          *   		"typesCountStdDev-lexical": "46.626404",
          *   		"title": "1790 Love And Freindship",
          *   		"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
          *   		"extra.Content-Type": "text/plain; charset=windows-1252",
          *   		"parentType": "expansion",
          *   		"extra.Content-Encoding": "windows-1252",
          *   		"parent_source": "file",
          *   		"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
          *   		"modified": "1432861756000",
          *   		"location": "1790 Love And Freindship.txt",
          *   		"parent_title": "Austen",
          *   		"parent_location": "Austen.zip"
          * 		}
          * 	]
       * 
       * In Corpus mode there's no reason to specify arguments. In documents mode you
       * can request specific documents in the config object:
       * 
       *  * **start**: the zero-based start of the list
       *  * **limit**: a limit to the number of items to return at a time
       *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
       *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
       *  * **query**: one or more term queries for the title, author or full-text
       *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
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
       * 	loadCorpus("austen").summary();
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
       *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
       * 
       * An example:
       *
       * 	loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
       *
       * @param {Object} config an Object specifying parameters (see list above) 
       * @returns {Promise|Array} a Promise for an Array of document titles  
       */

    }, {
      key: "titles",
      value: function titles(config) {
        return this.metadata({
          mode: "documents"
        }).then(function (data) {
          return data.map(function (doc) {
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
       * 	// fetch 1000 characters from each text in the corpus into a single string
       * 	loadCorpus("austen").text({limit:1000})
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
       * 	// fetch 1000 characters from each text in the corpus into an Array
       * 	loadCorpus("austen").texts({limit:1000})
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
       * 	{
       * 		"term": "the",
       * 		"inDocumentsCount": 8,
       * 		"rawFreq": 28292,
       * 		"relativeFreq": 0.036189996,
       * 		"comparisonRelativeFreqDifference": 0
       * 	}
       * 
       * The following is an example of Document Term (documents mode):
       * 
       * 	{
       * 		"term": "the",
       * 		"rawFreq": 1333,
       * 		"relativeFreq": 39721.086,
       * 		"zscore": 28.419,
       * 		"zscoreRatio": -373.4891,
       * 		"tfidf": 0.0,
       * 		"totalTermsCount": 33559,
      	 * 		"docIndex": 0,
       * 		"docId": "8a61d5d851a69c03c6ba9cc446713574"
       * 	}
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
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
       * 
       * The following are specific to corpus mode:
       * 
       *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
       *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
       *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
       *  * **sort**: the order of the terms, one of the following: `INDOCUMENTSCOUNT, RAWFREQ, TERM, RELATIVEPEAKEDNESS, RELATIVESKEWNESS, COMPARISONRELATIVEFREQDIFFERENCE`
       *  
       *  The following are specific to documents mode:
       * 
       *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
       *  * **sort**: the order of the terms, one of the following: `RAWFREQ, RELATIVEFREQ, TERM, TFIDF, ZSCORE`
       *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
       *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
       *  * **docId**: the document IDs to include (use commas to separate multiple values)
       *  
       * An example:
       * 
       * 	// show top 5 terms
        	 * 	loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
        	 *
        	 * 	// show top term for each document
        	 * 	loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
        	 * 
       * @param {Object} config an Object specifying parameters (see list above)
       * @returns {Promise|Array} a Promise for a Array of Terms
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
       * 	// load the first 20 tokens (don't include tags, spaces, etc.)
       * 	loadCorpus("austen").tokens({limit: 20, noOthers: true})
       *
       * @param {Object} config an Object specifying parameters (see above)
       * @returns {Promise|Array} a Promise for an Array of document tokens
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
       * 	// load the first 20 words in the corpus
       * 	loadCorpus("austen").tokens({limit: 20})
       *
       * @param {Object} config an Object specifying parameters (see above)
       * @returns {Promise|Array} a Promise for an Array of words
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
          * 	{
          *			"docIndex": 0,
          *			"query": "love",
          *			"term": "love",
          *			"position": 0,
          *			"left": "FREINDSHIP AND OTHER EARLY WORKS",
          *			"middle": "Love",
          *			"right": " And Friendship And Other Early"
          * 	}
          *  
          * The following are valid in the config parameter:
          * 
          *  * **start**: the zero-based start index of the list (for paging)
          *  * **limit**: the maximum number of terms to provide per request
          *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
          *  * **sort**: the order of the contexts: `TERM,, DOCINDEX, POSITION, LEFT, RIGHT`
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
          *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
          *  * **stripTags**: for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
          *  * **context**: the size of the context (the number of words on each size of the keyword)
          *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
          *  * **docId**: the document IDs to include (use commas to separate multiple values)
          *  * **overlapStrategy**: determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"; here are the options:
          *      * **none**: nevermind the overlap, keep all words
          *      	* {left: "to", middle: "be", right: "or not to be"} 
          *      	* {left: "to be or not to", middle: "be", right: ""} 
          *      * **first**: priority goes to the first occurrence (some may be dropped)
          *      	* {left: "to", middle: "be", right: "or not to be"} 
          *      * **merge**: balance the words between overlapping occurrences
          *      	* {left: "to", middle: "be", right: "or"} 
          *      	* {left: "not to", middle: "be", right: ""} 
          * 
          * An example:
          * 
          * 	// load the first 20 words in the corpus
          * 	loadCorpus("austen").contexts({query: "love", limit: 10})
          * 
          * @param {Object} config an Object specifying parameters (see above)
          * @returns {Promise|Array} a Promise for an Array of KWIC Objects
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
       * Get a Promise for an Array of collocates (either document or corpus collocates, depending on the specified mode).
       * 
       * The mode is set to "documents" when any of the following is true
       * 
       * * the `mode` parameter is set to "documents"
       * * a `docIndex` parameter being set
       * * a `docId` parameter being set
       * 
       * The following is an example a Corpus Collocate (corpus mode):
       * 
       * 	{
          *   		"term": "love",
          *   		"rawFreq": 568,
          *   		"contextTerm": "mr",
          *   		"contextTermRawFreq": 24
          * 	}
       * 
       * The following is an example of Document Collocate (documents mode):
       * 
       * 	{
          * 			"docIndex": 4,
          * 			"keyword": "love",
          * 			"keywordContextRawFrequency": 124,
          * 			"term": "fanny",
          * 			"termContextRawFrequency": 8,
          * 			"termContextRelativeFrequency": 0.021680217,
          * 			"termDocumentRawFrequency": 816,
          * 			"termDocumentRelativeFrequency": 0.0050853477,
          * 			"termContextDocumentRelativeFrequencyDifference": 0.01659487
          * 	}
       * 
       * The following config parameters are valid in both modes:
       * 
       *  * **start**: the zero-based start index of the list (for paging)
       *  * **limit**: the maximum number of terms to provide per request
       *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
       *  * **stopList** a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
       *  * **collocatesWhitelist**: collocates will be limited to this list
          *  * **context**: the size of the context (the number of words on each size of the keyword)
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
       * 
       * The following are specific to corpus mode:
       * 
       *  * **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, CONTEXTTERM, CONTEXTTERMRAWFREQ`
       *  
       *  The following are specific to documents mode:
       * 
       *  * **sort**: the order of the terms, one of the following: `TERM, REL, REL, RAW, DOCREL, DOCRAW, CONTEXTDOCRELDIFF`
       *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
       *  * **docId**: the document IDs to include (use commas to separate multiple values)
       *  
       * An example:
       * 
       * 	// show top 5 collocate terms
        	 * 	loadCorpus("austen").collocates({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
        	 * 
       * @param {Object} config an Object specifying parameters (see list above)
       * @returns {Promise|Array} a Promise for a Array of Terms
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

      /**
       * Get a Promise for an Array of phrases or n-grams (either document or corpus phrases, depending on the specified mode).
       * 
       * The mode is set to "documents" when any of the following is true
       * 
       * * the `mode` parameter is set to "documents"
       * * a `docIndex` parameter being set
       * * a `docId` parameter being set
       * 
       * The following is an example a Corpus phrase (corpus mode), without distributions requested:
       * 
       * 	{
          *  		"term": "love with",
          *  		"rawFreq": 103,
          *  		"length": 2
          * 	}
       * 
       * The following is an example of Document phrase (documents mode), without positions requested:
       * 
       * 	{
          *   		"term": "love with",
          *   		"rawFreq": 31,
          *   		"length": 2,
          *   		"docIndex": 5
          * 	}
       * 
       * The following config parameters are valid in both modes:
       * 
       *  * **start**: the zero-based start index of the list (for paging)
       *  * **limit**: the maximum number of terms to provide per request
       *  * **minLength**: the minimum length of the phrase
       *  * **maxLength**: the maximum length of the phrase
       *  * **minRawFreq**: the minimum raw frequency of the phrase
          * 	* **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
       *  * **overlapFilter**: it happens that phrases contain other phrases and we need a strategy for handling overlap:
          *      * **NONE**: nevermind the overlap, keep all phrases
          *      * **LENGTHFIRST**: priority goes to the longest phrases
          *      * **RAWFREQFIRST**: priority goes to the highest frequency phrases
          *      * **POSITIONFIRST**: priority goes to the first phrases
          * 
          * The following are specific to documents mode:
          * 
       *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
       *  * **docId**: the document IDs to include (use commas to separate multiple values)
          *  
          * An example:
          * 
          * 	// load the first 20 phrases in the corpus
          * 	loadCorpus("austen").phrases({query: "love", limit: 10})
          * 
          * @param {Object} config an Object specifying parameters (see above)
          * @returns {Promise|Array} a Promise for an Array of phrase Objects
          */

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
      /*
       * Create a Corpus and return the phrases
       * @param {object} config 
       * @param {object} api 
       */
      //	static phrases(config, api) {
      //		return Corpus.load(config).then(corpus => corpus.phrases(api || config));
      //	}

      /**
       * Get a Promise for an Array of correlations (either document or corpus correlations, depending on the specified mode).
       * 
       * The mode is set to "documents" when any of the following is true
       * 
       * * the `mode` parameter is set to "documents"
       * * a `docIndex` parameter being set
       * * a `docId` parameter being set
       * 
       * The following is an example a Corpus correlation (corpus mode):
       * 
       * 	{
          * 		"source": {
          * 			"term": "mrs",
          * 			"inDocumentsCount": 8,
          * 			"rawFreq": 2531,
          * 			"relativePeakedness": 0.46444246,
          * 			"relativeSkewness": -0.44197384
          * 		},
          * 		"target": {
          * 			"term": "love",
          * 			"inDocumentsCount": 8,
          * 			"rawFreq": 568,
          * 			"relativePeakedness": 5.763066,
          * 			"relativeSkewness": 2.2536576
          * 		},
          * 		"correlation": -0.44287738,
          * 		"significance": 0.08580014
          * 	}
       * 
       * The following is an example of Document correlation (documents mode), without positions requested:
       * 
       * 	{
          * 		"source": {
          * 			"term": "confide",
          * 			"rawFreq": 3,
          * 			"relativeFreq": 89.3948,
          * 			"zscore": -0.10560975,
          * 			"zscoreRatio": -0.7541012,
          * 			"tfidf": 1.1168874E-5,
          * 			"totalTermsCount": 33559,
          * 			"docIndex": 0,
          * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
          * 		},
          * 		"target": {
          * 			"term": "love",
          * 			"rawFreq": 54,
          * 			"relativeFreq": 1609.1063,
          * 			"zscore": 53.830048,
          * 			"zscoreRatio": -707.44696,
          * 			"tfidf": 0.0,
          * 			"totalTermsCount": 33559,
          * 			"docIndex": 0,
          * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
          * 		},
          * 		"correlation": 0.93527687,
          * 		"significance": 7.0970666E-5
          * 	}
       * 
       * The following config parameters are valid in both modes:
       * 
       *  * **start**: the zero-based start index of the list (for paging)
       *  * **limit**: the maximum number of terms to provide per request
       *  * **minRawFreq**: the minimum raw frequency of the collocate terms
       *  * **termsOnly**: a very compact data view of the correlations
          *  * **sort**: the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
       *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
          * 
          * The following are specific to documents mode:
          * 
       *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
       *  * **docId**: the document IDs to include (use commas to separate multiple values)
          *  
          * An example:
          * 
          * 	// load the first 10 phrases in the corpus
          * 	loadCorpus("austen").correlations({query: "love", limit: 10})
          * 
          * @param {Object} config an Object specifying parameters (see above)
          * @returns {Promise|Array} a Promise for an Array of phrase Objects
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
      /*
       * Create a Corpus and return the correlations
       * @param {object} config 
       * @param {object} api 
       */
      //	static correlations(config, api) {
      //		return Corpus.load(config).then(corpus => corpus.correlations(api || config));
      //	}

      /**
       * Get a promise for an LDA object that has two primary methods of use:
       * 
       * 	* **getTopicWords**: get a list of topics (words organized into bunches of a specified size
       * 	* **getDocuments**: get a list of documents and the signican words
       *
       * The config object as parameter can contain the following:
       *  * **numberTopics**: the number of topics to get (default is 10)
       *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
       *  * **language**: stopwords language to use, default is corpus language
       * @param {Object} config (see above)
       * @return {Promise} a promise for an LDA object
       */

    }, {
      key: "lda",
      value: function () {
        var _lda = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var config,
              options,
              data,
              stopwords,
              texts,
              words,
              wordsPerBin,
              ts,
              i,
              documents,
              _args = arguments;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  config = _args.length > 0 && _args[0] !== undefined ? _args[0] : {
                    numberTopics: 10,
                    sweeps: 100
                  };
                  options = {
                    displayingStopwords: false,
                    numberTopics: config.numberTopics || 10,
                    sweeps: config.sweeps || 100,
                    bins: parseInt(config.bins) || 10
                  };
                  _context.next = 4;
                  return Load.trombone({
                    tool: "resource.KeywordsManager",
                    stopList: config.language || "auto",
                    corpus: this.corpusid
                  });

                case 4:
                  data = _context.sent;
                  stopwords = data.keywords.keywords;
                  _context.next = 8;
                  return this.texts({
                    noMarkup: true,
                    compactSpace: true,
                    format: 'text'
                  });

                case 8:
                  texts = _context.sent;

                  // our corpus contains a single document, so split it into segments
                  if (texts.length == 1) {
                    words = texts[0].split(" ");
                    wordsPerBin = Math.ceil(words.length / options.bins);
                    ts = [];

                    for (i = 0; i < options.bins; i++) {
                      ts[i] = words.slice(i * wordsPerBin, i * wordsPerBin + wordsPerBin).join(" ");
                    }

                    texts = ts;
                  }

                  documents = [];
                  texts.forEach(function (text, index) {
                    documents.push({
                      id: index,
                      text: text
                    });
                  });
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    var lda = new topicModelling(options, documents, stopwords);
                    resolve(lda);
                  }));

                case 13:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function lda() {
          return _lda.apply(this, arguments);
        }

        return lda;
      }()
      /**
       * Get a promise for a list of LDA topics from the corpus.
       * 
       * The config object as parameter can contain the following:
       *  * **numberTopics**: the number of topics to get (default is 10)
       *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
       *  * **language**: stopwords language to use, default is corpus language
       * @param {Object} config (see above)
       * @return {Promise} a promise for an array of topics
       */

    }, {
      key: "ldaTopics",
      value: function () {
        var _ldaTopics = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var config,
              lda,
              _args2 = arguments;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  config = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {
                    numberTopics: 10,
                    sweeps: 100
                  };
                  _context2.next = 3;
                  return this.lda(config);

                case 3:
                  lda = _context2.sent;
                  return _context2.abrupt("return", lda.getTopicWords());

                case 5:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function ldaTopics() {
          return _ldaTopics.apply(this, arguments);
        }

        return ldaTopics;
      }()
      /**
       * Get a promise for a list of documents and associated words
       * 
       * The config object as parameter can contain the following:
       *  * **numberTopics**: the number of topics to get (default is 10)
       *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
       *  * **language**: stopwords language to use, default is corpus language
       * @param {Object} config (see above)
       * @return {Promise} a promise for an array of documents
       */

    }, {
      key: "ldaDocuments",
      value: function () {
        var _ldaDocuments = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var config,
              lda,
              _args3 = arguments;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  config = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {
                    numberTopics: 10,
                    sweeps: 100
                  };
                  _context3.next = 3;
                  return this.lda(config);

                case 3:
                  lda = _context3.sent;
                  return _context3.abrupt("return", lda.getDocuments());

                case 5:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function ldaDocuments() {
          return _ldaDocuments.apply(this, arguments);
        }

        return ldaDocuments;
      }()
      /**
       * Get a promise for the HTML snippet that will produce the specified Voyant tools to appear.
       * 
       * In its simplest form we can simply call the named tool:
       * 
       * 	loadCorpus("austen").tool("Cirrus");
       * 
       * Each tool supports some options (that are summarized below), and those can be specified as options:
       * 
       * 	loadCorpus("austen").tool("Trends", {query: "love"});
       * 
       * There are also parameters (width, height, style, float) that apply to the actual tool window:
       * 
       *  loadCorpus("austen").tool("Trends", {query: "love", style: "width: 500px; height: 500px"});
       * 
       * It's also possible to have several tools appear at once, though they won't be connected by events (clicking in a window won't modify the other windows):
       * 
       * 	loadCorpus("austen").tool("Cirrus", "Trends");
       * 
       * One easy way to get connected tools is to use the `CustomSet` tool and experiment with the layout:
       * 
       * 	loadCorpus("austen").tool("CustomSet", {tableLayout: "Cirrus,Trends", style: "width:800px; height: 500px"});
       * 
       * Here's a partial list of the tools available as well as their significant parameters:
       * 
       *  * <a href="./#!/guide/bubblelines" target="_blank">Bubblelines</a> visualizes the frequency and distribution of terms in a corpus.
       *  	* **bins**: number of bins to separate a document into
       *  	* **docIndex**: document index to restrict to (can be comma-separated list)
       *  	* **maxDocs**: maximum number of documents to show
       *  	* **query**: a query to search for in the corpus
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/bubbles" target="_blank">Bubbles</a> is a playful visualization of term frequencies by document.
       *  	* **audio**: whether or not to include audio
       *  	* **docIndex**: document index to restrict to (can be comma-separated list)
       *  	* **speed**: speed of the animation (0 to 60 lower is slower)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/cirrus" target="_blank">Cirrus</a> is a word cloud that visualizes the top frequency words of a corpus or document.
       *  	* **background**: set the background colour of the word cloud
       *  	* **categories**: set the categories for the word cloud (usually an ID of an existing categories definition)
       *  	* **docIndex**: document index to restrict to (can be comma-separated list)
       *  	* **fontFamily**: the default font to use for the words (default: "Palatino Linotype", "Book Antiqua", Palatino, serif),
       *  	* **inlineData**: user-defined data, most easily expressed like this: love:20,like:15,dear:10
       *  	* **limit**: the number of terms to load (that are available, see also `visible` which determines how many are displayed),
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  	* **visible**: the number of terms to display in the word cloud (default is 50)
       *  	* **whiteList**: a keyword list – terms will be limited to this list
       *  * <a href="./#!/guide/collocatesgraph" target="_blank">CollocateGraphs</a> represents keywords and terms that occur in close proximity as a force directed network graph.
      	 *  	* **centralize**: the term to use for centralize mode (where things are focused on a single word)
          *  	* **context**: the size of the context (the number of words on each size of the keyword)
       *  	* **limit**: the number of collocates to load for each keyword
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/corpuscollocates" target="_blank">CorpusCollocates</a> is a table view of which terms appear more frequently in proximity to keywords across the entire corpus.
          *  	* **context**: the size of the context (the number of words on each size of the keyword)
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **sort**: sort order of collocates, one of `contextTermRawFreq`, `contextTermRawFreq`, `rawFreq`, `term`
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/contexts" target="_blank">Contexts</a> (or Keywords in Context) tool shows each occurrence of a keyword with a bit of surrounding text (the context).
          *  	* **context**: the size of the context (the number of words on each size of the keyword)
       *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/correlations" target="_blank">Correlations</a> tool enables an exploration of the extent to which term frequencies vary in sync (terms whose frequencies rise and fall together or inversely).
       *  	* **minInDocumentsCountRatio**: the minimum percentage of documents in which the correlation must appear
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/documentterms" target="_blank">DocumentTerms</a> is a table view of document term frequencies.
          *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
       *  	* **docIndex**: document index to restrict to (can be comma-separated list)
       *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/corpusterms" target="_blank">CorpusTerms</a> is a table view of term frequencies in the entire corpus.
          *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
       *  	* **docIndex**: document index to restrict to (can be comma-separated list)
       *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each size of the keyword 
       *  	* **query**: a query for the keywords (can be comma-separated list)
       *  	* **stopList**: a named stopword list or comma-separated list of words
       *  * <a href="./#!/guide/documents" target="_blank">The</a> Documents tool shows a table of the documents in the corpus and includes functionality for modifying the corpus.
       *  * <a href="./#!/guide/knots" target="_blank">Knots</a> is a creative visualization that represents terms in a single document as a series of twisted lines.
       *  * <a href="./#!/guide/mandala" target="_blank">Mandala</a> is a conceptual visualization that shows the relationships between terms and documents.
       *  * <a href="./#!/guide/microsearch" target="_blank">Microsearch</a> visualizes the frequency and distribution of terms in a corpus.
       *  * <a href="./#!/guide/phrases" target="_blank">Phrases</a> shows repeating sequences of words organized by frequency of repetition or number of words in each repeated phrase.
       *  * <a href="./#!/guide/reader" target="_blank">Reader</a> provides a way of reading documents in the corpus, text is fetched on-demand as needed.
       *  * <a href="./#!/guide/scatterplot" target="_blank">ScatterPlot</a> is a graph visualization of how words cluster in a corpus using document similarity, correspondence analysis or principal component analysis.
       *  * <a href="./#!/guide/streamgraph" target="_blank">StreamGraph</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
       *  * <a href="./#!/guide/summary" target="_blank">Summary</a> provides a simple, textual overview of the current corpus, including including information about words and documents.
       *  * <a href="./#!/guide/termsradio" target="_blank">TermsRadio</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
       *  * <a href="./#!/guide/textualarc" target="_blank">TextualArc</a> is a visualization of the terms in a document that includes a weighted centroid of terms and an arc that follows the terms in document order.
       *  * <a href="./#!/guide/topics" target="_blank">Topics</a> provides a rudimentary way of generating term clusters from a document or corpus and then seeing how each topic (term cluster) is distributed across the document or corpus.
       *  * <a href="./#!/guide/trends" target="_blank">Trends</a> shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.
       *  * <a href="./#!/guide/veliza" target="_blank">Veliza</a> is an experimental tool for having a (limited) natural language exchange (in English) based on your corpus.
       *  * <a href="./#!/guide/wordtree" target="_blank">WordTree</a> is a tool that allows you to explore how words are used in phrases.
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
      /*
       * Create a Corpus and return the tool
       * @param {*} tool 
       * @param {*} config 
       * @param {*} api 
       */
      //	static tool(tool, config, api) {
      //		return Corpus.load(config).then(corpus => corpus.tool(tool, config, api));
      //	}

      /**
       * An alias for {@link #summary}.
       */

    }, {
      key: "toString",
      value: function toString() {
        return this.summary();
      }
      /*
       * Create a new Corpus using the provided config
       * @param {object} config 
       */
      //	static create(config) {
      //		return Corpus.load(config);
      //	}

      /**
       * Load a Corpus using the provided config and api
       * @param {object} config the Corpus config
       * @param {object} api any additional API values
       */

    }], [{
      key: "setBaseUrl",
      value: function setBaseUrl(baseUrl) {
        Load.setBaseUrl(baseUrl);
      }
    }, {
      key: "load",
      value: function load() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var promise = new Promise(function (resolve, reject) {
          if (config instanceof Corpus) {
            resolve(config);
          }

          if (typeof config === "string") {
            if (config.length > 0 && /\W/.test(config) === false) {
              config = {
                corpus: config
              };
            } else {
              config = {
                input: config
              };
            }
          } else if (config instanceof Array && config.length > 0 && typeof config[0] === 'string') {
            config = {
              input: config
            };
          } else if (config instanceof File || config instanceof Array && config[0] instanceof File) {
            var formData = new FormData();

            if (config instanceof File) {
              formData.append('input', config);
            } else {
              config.forEach(function (file) {
                formData.append('input', file);
              });
            } // append any other form options that may have been included


            if (api && _typeof(api) == "object") {
              for (var key in api) {
                formData.append(key, api[key]);
              }
            }

            formData.append('tool', 'corpus.CorpusMetadata');
            config = {
              body: formData,
              method: 'POST'
            };
          }

          Load.trombone(_objectSpread2({}, config, {}, api), {
            tool: "corpus.CorpusMetadata"
          }).then(function (data) {
            return resolve(new Corpus(data.corpus.metadata.id));
          });
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
          return this.then(function (corpus) {
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
        } // make sure we have enough rows for the new data


        var columns = this.columns();

        while (this._rows.length < data.length) {
          this._rows[this._rows.length] = new Array(columns);
        }

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
       * Same as {@link toString}.
       */

    }, {
      key: "toHtml",
      value: function toHtml() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return this.toString(config);
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

        if (typeof config == "number") {
          config = {
            limit: config
          };
        }

        if ("top" in config && !("limit" in config)) {
          config.limit = config.top;
        }

        if ("limit" in config && !("bottom" in config)) {
          config.bottom = 0;
        }

        if ("bottom" in config && !("limit" in config)) {
          config.limit = 0;
        }

        return "<table" + ("id" in config ? " id='" + config.id + "' " : " ") + "class='voyantTable'>" + (config && "caption" in config && typeof config.caption == "string" ? "<caption>" + config.caption + "</caption>" : "") + (config && "noHeaders" in config && config.noHeaders ? "" : "<thead><tr>" + this.headers(true).map(function (c) {
          return "<th>" + c + "</th>";
        }).join("") + "</tr></thead>") + "<tbody>" + this._rows.filter(function (row, i, arr) {
          return !("limit" in config) || i < config.limit || !("bottom" in config) || i > arr.length - 1 - config.bottom;
        }).map(function (row) {
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

            if (target.clientHeight === 0) {
              target.style.height = '400px'; // 400 is the default Highcharts height
            }
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

  /**
   * Class for working with categories and features.
   * Categories are groupings of terms.
   * Features are arbitrary properties (font, color) that are associated with each category.
   * @memberof Spyral
   * @class
   */

  var Categories = /*#__PURE__*/function () {
    /**
     * Construct a new Categories class
     */
    function Categories() {
      _classCallCheck(this, Categories);

      this._categories = {};
      this._features = {};
      this._featureDefaults = {};
    }
    /**
     * Get the categories
     * @returns {object}
     */


    _createClass(Categories, [{
      key: "getCategories",
      value: function getCategories() {
        return this._categories;
      }
      /**
       * Get category names as an array.
       * 
       * @returns {Array} of category names
       */

    }, {
      key: "getCategoryNames",
      value: function getCategoryNames() {
        return Object.keys(this.getCategories());
      }
      /**
       * Get the terms for a category
       * @param {string} name 
       * @returns {array}
       */

    }, {
      key: "getCategoryTerms",
      value: function getCategoryTerms(name) {
        return this._categories[name];
      }
      /**
       * Add a new category
       * @param {string} name 
       */

    }, {
      key: "addCategory",
      value: function addCategory(name) {
        if (this._categories[name] === undefined) {
          this._categories[name] = [];
        }
      }
      /**
       * Rename a category
       * @param {string} oldName 
       * @param {string} newName 
       */

    }, {
      key: "renameCategory",
      value: function renameCategory(oldName, newName) {
        var terms = this.getCategoryTerms(oldName);
        this.addTerms(newName, terms);

        for (var feature in this._features) {
          var value = this._features[feature][oldName];
          this.setCategoryFeature(newName, feature, value);
        }

        this.removeCategory(oldName);
      }
      /**
       * Remove a category
       * @param {string} name 
       */

    }, {
      key: "removeCategory",
      value: function removeCategory(name) {
        delete this._categories[name];

        for (var feature in this._features) {
          delete this._features[feature][name];
        }
      }
      /**
       * Add a term to a category
       * @param {string} category 
       * @param {string} term 
       */

    }, {
      key: "addTerm",
      value: function addTerm(category, term) {
        this.addTerms(category, [term]);
      }
      /**
       * Add multiple terms to a category
       * @param {string} category 
       * @param {array} terms 
       */

    }, {
      key: "addTerms",
      value: function addTerms(category, terms) {
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
      }
      /**
       * Remove a term from a category
       * @param {string} category 
       * @param {string} term 
       */

    }, {
      key: "removeTerm",
      value: function removeTerm(category, term) {
        this.removeTerms(category, [term]);
      }
      /**
       * Remove multiple terms from a category
       * @param {string} category 
       * @param {array} terms 
       */

    }, {
      key: "removeTerms",
      value: function removeTerms(category, terms) {
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
      }
      /**
       * Get the category that a term belongs to
       * @param {string} term 
       * @return {object}
       */

    }, {
      key: "getCategoryForTerm",
      value: function getCategoryForTerm(term) {
        for (var category in this._categories) {
          if (this._categories[category].indexOf(term) != -1) {
            return category;
          }
        }

        return undefined;
      }
      /**
       * Get the feature for a term
       * @param {string} feature 
       * @param {string} term 
       * @returns {*}
       */

    }, {
      key: "getFeatureForTerm",
      value: function getFeatureForTerm(feature, term) {
        return this.getCategoryFeature(this.getCategoryForTerm(term), feature);
      }
      /**
       * Get the features
       * @returns {object}
       */

    }, {
      key: "getFeatures",
      value: function getFeatures() {
        return this._features;
      }
      /**
       * Add a feature
       * @param {string} name 
       * @param {*} defaultValue 
       */

    }, {
      key: "addFeature",
      value: function addFeature(name, defaultValue) {
        if (this._features[name] === undefined) {
          this._features[name] = {};
        }

        if (defaultValue !== undefined) {
          this._featureDefaults[name] = defaultValue;
        }
      }
      /**
       * Remove a feature
       * @param {string} name 
       */

    }, {
      key: "removeFeature",
      value: function removeFeature(name) {
        delete this._features[name];
        delete this._featureDefaults[name];
      }
      /**
       * Set the feature for a category
       * @param {string} categoryName 
       * @param {string} featureName 
       * @param {*} featureValue 
       */

    }, {
      key: "setCategoryFeature",
      value: function setCategoryFeature(categoryName, featureName, featureValue) {
        if (this._features[featureName] === undefined) {
          this.addFeature(featureName);
        }

        this._features[featureName][categoryName] = featureValue;
      }
      /**
       * Get the feature for a category
       * @param {string} categoryName 
       * @param {string} featureName 
       * @returns {*}
       */

    }, {
      key: "getCategoryFeature",
      value: function getCategoryFeature(categoryName, featureName) {
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
      }
      /**
       * Get a copy of the category and feature data
       * @return {object}
       */

    }, {
      key: "getCategoryExportData",
      value: function getCategoryExportData() {
        return {
          categories: Object.assign({}, this._categories),
          features: Object.assign({}, this._features)
        };
      }
      /**
       * Save the categories (if we're in a recognized environment).
       * @param {Object} config for the network call (specifying if needed the location of Trombone, etc., see {@link #Load.trombone}
       * @return {Promise} this returns a promise which eventually resolves to a string that is the ID reference for the stored categories
       */

    }, {
      key: "save",
      value: function save() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var categoriesData = JSON.stringify(this.getCategoryExportData());
        return Load.trombone(api, Object.assign(config, {
          tool: "resource.StoredCategories",
          storeResource: categoriesData
        })).then(function (data) {
          return data.storedCategories.id;
        });
      }
      /**
       * Load the categories (if we're in a recognized environment).
       * 
       * In its simplest form this can be used with a single string ID to load:
       * 	new Spyral.Categories().load("categories.en.txt")
       * 
       * Which is equivalent to:
       * 	new Spyral.Categories().load({retrieveResourceId: "categories.en.txt"});
       * 
       * @param {Object|String} config an object specifying the parameters (see above)
       * @param {Object} api an object specifying any parameters for the trombone call
       * @return {Promise} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
       */

    }, {
      key: "load",
      value: function load() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var me = this;

        if (typeof config == "string") {
          config = {
            "retrieveResourceId": config
          };
        }

        if (!("retrieveResourceId" in config)) {
          throw Error("You must provide a value for the retrieveResourceId parameter");
        }

        return Load.trombone(api, Object.assign(config, {
          tool: "resource.StoredCategories"
        })).then(function (data) {
          var cats = JSON.parse(data.storedCategories.resource);
          me._features = cats.features;
          me._categories = cats.categories;
          return me;
        });
      }
    }]);

    return Categories;
  }();

  var check$1 = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global_1$1 =
    // eslint-disable-next-line no-undef
    check$1(typeof globalThis == 'object' && globalThis) ||
    check$1(typeof window == 'object' && window) ||
    check$1(typeof self == 'object' && self) ||
    check$1(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
    // eslint-disable-next-line no-new-func
    Function('return this')();

  var fails$1 = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var descriptors$1 = !fails$1(function () {
    return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
  });

  var nativePropertyIsEnumerable$2 = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG$1 = getOwnPropertyDescriptor$2 && !nativePropertyIsEnumerable$2.call({ 1: 2 }, 1);

  // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
  var f$7 = NASHORN_BUG$1 ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor$2(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable$2;

  var objectPropertyIsEnumerable$1 = {
  	f: f$7
  };

  var createPropertyDescriptor$1 = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString$2 = {}.toString;

  var classofRaw$1 = function (it) {
    return toString$2.call(it).slice(8, -1);
  };

  var split$1 = ''.split;

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var indexedObject$1 = fails$1(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw$1(it) == 'String' ? split$1.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible$1 = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings



  var toIndexedObject$1 = function (it) {
    return indexedObject$1(requireObjectCoercible$1(it));
  };

  var isObject$1 = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // `ToPrimitive` abstract operation
  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var toPrimitive$1 = function (input, PREFERRED_STRING) {
    if (!isObject$1(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject$1(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty$1 = {}.hasOwnProperty;

  var has$2 = function (it, key) {
    return hasOwnProperty$1.call(it, key);
  };

  var document$2 = global_1$1.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS$1 = isObject$1(document$2) && isObject$1(document$2.createElement);

  var documentCreateElement$1 = function (it) {
    return EXISTS$1 ? document$2.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty
  var ie8DomDefine$1 = !descriptors$1 && !fails$1(function () {
    return Object.defineProperty(documentCreateElement$1('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
  var f$8 = descriptors$1 ? nativeGetOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject$1(O);
    P = toPrimitive$1(P, true);
    if (ie8DomDefine$1) try {
      return nativeGetOwnPropertyDescriptor$2(O, P);
    } catch (error) { /* empty */ }
    if (has$2(O, P)) return createPropertyDescriptor$1(!objectPropertyIsEnumerable$1.f.call(O, P), O[P]);
  };

  var objectGetOwnPropertyDescriptor$1 = {
  	f: f$8
  };

  var anObject$1 = function (it) {
    if (!isObject$1(it)) {
      throw TypeError(String(it) + ' is not an object');
    } return it;
  };

  var nativeDefineProperty$2 = Object.defineProperty;

  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  var f$9 = descriptors$1 ? nativeDefineProperty$2 : function defineProperty(O, P, Attributes) {
    anObject$1(O);
    P = toPrimitive$1(P, true);
    anObject$1(Attributes);
    if (ie8DomDefine$1) try {
      return nativeDefineProperty$2(O, P, Attributes);
    } catch (error) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var objectDefineProperty$1 = {
  	f: f$9
  };

  var createNonEnumerableProperty$1 = descriptors$1 ? function (object, key, value) {
    return objectDefineProperty$1.f(object, key, createPropertyDescriptor$1(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal$1 = function (key, value) {
    try {
      createNonEnumerableProperty$1(global_1$1, key, value);
    } catch (error) {
      global_1$1[key] = value;
    } return value;
  };

  var SHARED$1 = '__core-js_shared__';
  var store$2 = global_1$1[SHARED$1] || setGlobal$1(SHARED$1, {});

  var sharedStore$1 = store$2;

  var functionToString$1 = Function.toString;

  // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
  if (typeof sharedStore$1.inspectSource != 'function') {
    sharedStore$1.inspectSource = function (it) {
      return functionToString$1.call(it);
    };
  }

  var inspectSource$1 = sharedStore$1.inspectSource;

  var WeakMap$2 = global_1$1.WeakMap;

  var nativeWeakMap$1 = typeof WeakMap$2 === 'function' && /native code/.test(inspectSource$1(WeakMap$2));

  var shared$1 = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore$1[key] || (sharedStore$1[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.6.5',
    mode:  'global',
    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id$1 = 0;
  var postfix$1 = Math.random();

  var uid$1 = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id$1 + postfix$1).toString(36);
  };

  var keys$1 = shared$1('keys');

  var sharedKey$1 = function (key) {
    return keys$1[key] || (keys$1[key] = uid$1(key));
  };

  var hiddenKeys$2 = {};

  var WeakMap$3 = global_1$1.WeakMap;
  var set$1, get$1, has$3;

  var enforce$1 = function (it) {
    return has$3(it) ? get$1(it) : set$1(it, {});
  };

  var getterFor$1 = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject$1(it) || (state = get$1(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (nativeWeakMap$1) {
    var store$3 = new WeakMap$3();
    var wmget$1 = store$3.get;
    var wmhas$1 = store$3.has;
    var wmset$1 = store$3.set;
    set$1 = function (it, metadata) {
      wmset$1.call(store$3, it, metadata);
      return metadata;
    };
    get$1 = function (it) {
      return wmget$1.call(store$3, it) || {};
    };
    has$3 = function (it) {
      return wmhas$1.call(store$3, it);
    };
  } else {
    var STATE$1 = sharedKey$1('state');
    hiddenKeys$2[STATE$1] = true;
    set$1 = function (it, metadata) {
      createNonEnumerableProperty$1(it, STATE$1, metadata);
      return metadata;
    };
    get$1 = function (it) {
      return has$2(it, STATE$1) ? it[STATE$1] : {};
    };
    has$3 = function (it) {
      return has$2(it, STATE$1);
    };
  }

  var internalState$1 = {
    set: set$1,
    get: get$1,
    has: has$3,
    enforce: enforce$1,
    getterFor: getterFor$1
  };

  var redefine$1 = createCommonjsModule(function (module) {
  var getInternalState = internalState$1.get;
  var enforceInternalState = internalState$1.enforce;
  var TEMPLATE = String(String).split('String');

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has$2(value, 'name')) createNonEnumerableProperty$1(value, 'name', key);
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
    if (O === global_1$1) {
      if (simple) O[key] = value;
      else setGlobal$1(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) O[key] = value;
    else createNonEnumerableProperty$1(O, key, value);
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource$1(this);
  });
  });

  var path$1 = global_1$1;

  var aFunction$2 = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn$1 = function (namespace, method) {
    return arguments.length < 2 ? aFunction$2(path$1[namespace]) || aFunction$2(global_1$1[namespace])
      : path$1[namespace] && path$1[namespace][method] || global_1$1[namespace] && global_1$1[namespace][method];
  };

  var ceil$1 = Math.ceil;
  var floor$1 = Math.floor;

  // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger
  var toInteger$1 = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor$1 : ceil$1)(argument);
  };

  var min$2 = Math.min;

  // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength
  var toLength$1 = function (argument) {
    return argument > 0 ? min$2(toInteger$1(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max$2 = Math.max;
  var min$3 = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
  var toAbsoluteIndex$1 = function (index, length) {
    var integer = toInteger$1(index);
    return integer < 0 ? max$2(integer + length, 0) : min$3(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation
  var createMethod$5 = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject$1($this);
      var length = toLength$1(O.length);
      var index = toAbsoluteIndex$1(fromIndex, length);
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

  var arrayIncludes$1 = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod$5(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod$5(false)
  };

  var indexOf$4 = arrayIncludes$1.indexOf;


  var objectKeysInternal$1 = function (object, names) {
    var O = toIndexedObject$1(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) !has$2(hiddenKeys$2, key) && has$2(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has$2(O, key = names[i++])) {
      ~indexOf$4(result, key) || result.push(key);
    }
    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys$1 = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];

  var hiddenKeys$3 = enumBugKeys$1.concat('length', 'prototype');

  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  var f$a = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal$1(O, hiddenKeys$3);
  };

  var objectGetOwnPropertyNames$1 = {
  	f: f$a
  };

  var f$b = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols$1 = {
  	f: f$b
  };

  // all object keys, includes non-enumerable and symbols
  var ownKeys$1 = getBuiltIn$1('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames$1.f(anObject$1(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols$1.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys$1(source);
    var defineProperty = objectDefineProperty$1.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor$1.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has$2(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement$1 = /#|\.prototype\./;

  var isForced$1 = function (feature, detection) {
    var value = data$1[normalize$1(feature)];
    return value == POLYFILL$1 ? true
      : value == NATIVE$1 ? false
      : typeof detection == 'function' ? fails$1(detection)
      : !!detection;
  };

  var normalize$1 = isForced$1.normalize = function (string) {
    return String(string).replace(replacement$1, '.').toLowerCase();
  };

  var data$1 = isForced$1.data = {};
  var NATIVE$1 = isForced$1.NATIVE = 'N';
  var POLYFILL$1 = isForced$1.POLYFILL = 'P';

  var isForced_1$1 = isForced$1;

  var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor$1.f;






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
  var _export$1 = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global_1$1;
    } else if (STATIC) {
      target = global_1$1[TARGET] || setGlobal$1(TARGET, {});
    } else {
      target = (global_1$1[TARGET] || {}).prototype;
    }
    if (target) for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$3(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];
      FORCED = isForced_1$1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || (targetProperty && targetProperty.sham)) {
        createNonEnumerableProperty$1(sourceProperty, 'sham', true);
      }
      // extend global
      redefine$1(target, key, sourceProperty, options);
    }
  };

  var aFunction$3 = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    } return it;
  };

  // optional / simple context binding
  var functionBindContext$1 = function (fn, that, length) {
    aFunction$3(fn);
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

  // `ToObject` abstract operation
  // https://tc39.github.io/ecma262/#sec-toobject
  var toObject$1 = function (argument) {
    return Object(requireObjectCoercible$1(argument));
  };

  // `IsArray` abstract operation
  // https://tc39.github.io/ecma262/#sec-isarray
  var isArray$4 = Array.isArray || function isArray(arg) {
    return classofRaw$1(arg) == 'Array';
  };

  var nativeSymbol$1 = !!Object.getOwnPropertySymbols && !fails$1(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var useSymbolAsUid$1 = nativeSymbol$1
    // eslint-disable-next-line no-undef
    && !Symbol.sham
    // eslint-disable-next-line no-undef
    && typeof Symbol.iterator == 'symbol';

  var WellKnownSymbolsStore$2 = shared$1('wks');
  var Symbol$1 = global_1$1.Symbol;
  var createWellKnownSymbol$1 = useSymbolAsUid$1 ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

  var wellKnownSymbol$1 = function (name) {
    if (!has$2(WellKnownSymbolsStore$2, name)) {
      if (nativeSymbol$1 && has$2(Symbol$1, name)) WellKnownSymbolsStore$2[name] = Symbol$1[name];
      else WellKnownSymbolsStore$2[name] = createWellKnownSymbol$1('Symbol.' + name);
    } return WellKnownSymbolsStore$2[name];
  };

  var SPECIES$3 = wellKnownSymbol$1('species');

  // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate
  var arraySpeciesCreate$1 = function (originalArray, length) {
    var C;
    if (isArray$4(originalArray)) {
      C = originalArray.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || isArray$4(C.prototype))) C = undefined;
      else if (isObject$1(C)) {
        C = C[SPECIES$3];
        if (C === null) C = undefined;
      }
    } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push$1 = [].push;

  // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
  var createMethod$6 = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject$1($this);
      var self = indexedObject$1(O);
      var boundFunction = functionBindContext$1(callbackfn, that, 3);
      var length = toLength$1(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate$1;
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
            case 2: push$1.call(target, value); // filter
          } else if (IS_EVERY) return false;  // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration$1 = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$6(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod$6(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod$6(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod$6(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod$6(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod$6(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$6(6)
  };

  var arrayMethodIsStrict$1 = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails$1(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () { throw 1; }, 1);
    });
  };

  var defineProperty$5 = Object.defineProperty;
  var cache$1 = {};

  var thrower$1 = function (it) { throw it; };

  var arrayMethodUsesToLength$1 = function (METHOD_NAME, options) {
    if (has$2(cache$1, METHOD_NAME)) return cache$1[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has$2(options, 'ACCESSORS') ? options.ACCESSORS : false;
    var argument0 = has$2(options, 0) ? options[0] : thrower$1;
    var argument1 = has$2(options, 1) ? options[1] : undefined;

    return cache$1[METHOD_NAME] = !!method && !fails$1(function () {
      if (ACCESSORS && !descriptors$1) return true;
      var O = { length: -1 };

      if (ACCESSORS) defineProperty$5(O, 1, { enumerable: true, get: thrower$1 });
      else O[1] = 1;

      method.call(O, argument0, argument1);
    });
  };

  var $forEach$2 = arrayIteration$1.forEach;



  var STRICT_METHOD$4 = arrayMethodIsStrict$1('forEach');
  var USES_TO_LENGTH$6 = arrayMethodUsesToLength$1('forEach');

  // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  var arrayForEach$1 = (!STRICT_METHOD$4 || !USES_TO_LENGTH$6) ? function forEach(callbackfn /* , thisArg */) {
    return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  _export$1({ target: 'Array', proto: true, forced: [].forEach != arrayForEach$1 }, {
    forEach: arrayForEach$1
  });

  var $indexOf$1 = arrayIncludes$1.indexOf;



  var nativeIndexOf$1 = [].indexOf;

  var NEGATIVE_ZERO$1 = !!nativeIndexOf$1 && 1 / [1].indexOf(1, -0) < 0;
  var STRICT_METHOD$5 = arrayMethodIsStrict$1('indexOf');
  var USES_TO_LENGTH$7 = arrayMethodUsesToLength$1('indexOf', { ACCESSORS: true, 1: 0 });

  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  _export$1({ target: 'Array', proto: true, forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$5 || !USES_TO_LENGTH$7 }, {
    indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
      return NEGATIVE_ZERO$1
        // convert -0 to +0
        ? nativeIndexOf$1.apply(this, arguments) || 0
        : $indexOf$1(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var DatePrototype = Date.prototype;
  var INVALID_DATE = 'Invalid Date';
  var TO_STRING = 'toString';
  var nativeDateToString = DatePrototype[TO_STRING];
  var getTime = DatePrototype.getTime;

  // `Date.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-date.prototype.tostring
  if (new Date(NaN) + '' != INVALID_DATE) {
    redefine$1(DatePrototype, TO_STRING, function toString() {
      var value = getTime.call(this);
      // eslint-disable-next-line no-self-compare
      return value === value ? nativeDateToString.call(this) : INVALID_DATE;
    });
  }

  var defineProperty$6 = objectDefineProperty$1.f;

  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // Function instances `.name` property
  // https://tc39.github.io/ecma262/#sec-function-instances-name
  if (descriptors$1 && !(NAME in FunctionPrototype)) {
    defineProperty$6(FunctionPrototype, NAME, {
      configurable: true,
      get: function () {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return '';
        }
      }
    });
  }

  var TO_STRING_TAG$4 = wellKnownSymbol$1('toStringTag');
  var test$2 = {};

  test$2[TO_STRING_TAG$4] = 'z';

  var toStringTagSupport$1 = String(test$2) === '[object z]';

  var TO_STRING_TAG$5 = wellKnownSymbol$1('toStringTag');
  // ES3 wrong here
  var CORRECT_ARGUMENTS$1 = classofRaw$1(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet$1 = function (it, key) {
    try {
      return it[key];
    } catch (error) { /* empty */ }
  };

  // getting tag from ES6+ `Object.prototype.toString`
  var classof$1 = toStringTagSupport$1 ? classofRaw$1 : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (tag = tryGet$1(O = Object(it), TO_STRING_TAG$5)) == 'string' ? tag
      // builtinTag case
      : CORRECT_ARGUMENTS$1 ? classofRaw$1(O)
      // ES3 arguments fallback
      : (result = classofRaw$1(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  // `Object.prototype.toString` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
  var objectToString$1 = toStringTagSupport$1 ? {}.toString : function toString() {
    return '[object ' + classof$1(this) + ']';
  };

  // `Object.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
  if (!toStringTagSupport$1) {
    redefine$1(Object.prototype, 'toString', objectToString$1, { unsafe: true });
  }

  var nativePromiseConstructor = global_1$1.Promise;

  var redefineAll = function (target, src, options) {
    for (var key in src) redefine$1(target, key, src[key], options);
    return target;
  };

  var defineProperty$7 = objectDefineProperty$1.f;



  var TO_STRING_TAG$6 = wellKnownSymbol$1('toStringTag');

  var setToStringTag$1 = function (it, TAG, STATIC) {
    if (it && !has$2(it = STATIC ? it : it.prototype, TO_STRING_TAG$6)) {
      defineProperty$7(it, TO_STRING_TAG$6, { configurable: true, value: TAG });
    }
  };

  var SPECIES$4 = wellKnownSymbol$1('species');

  var setSpecies = function (CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn$1(CONSTRUCTOR_NAME);
    var defineProperty = objectDefineProperty$1.f;

    if (descriptors$1 && Constructor && !Constructor[SPECIES$4]) {
      defineProperty(Constructor, SPECIES$4, {
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

  var iterators$1 = {};

  var ITERATOR$6 = wellKnownSymbol$1('iterator');
  var ArrayPrototype$9 = Array.prototype;

  // check on default Array iterator
  var isArrayIteratorMethod$1 = function (it) {
    return it !== undefined && (iterators$1.Array === it || ArrayPrototype$9[ITERATOR$6] === it);
  };

  var ITERATOR$7 = wellKnownSymbol$1('iterator');

  var getIteratorMethod$1 = function (it) {
    if (it != undefined) return it[ITERATOR$7]
      || it['@@iterator']
      || iterators$1[classof$1(it)];
  };

  // call something on iterator step with safe closing on error
  var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
    try {
      return ENTRIES ? fn(anObject$1(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (error) {
      var returnMethod = iterator['return'];
      if (returnMethod !== undefined) anObject$1(returnMethod.call(iterator));
      throw error;
    }
  };

  var iterate_1 = createCommonjsModule(function (module) {
  var Result = function (stopped, result) {
    this.stopped = stopped;
    this.result = result;
  };

  var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
    var boundFunction = functionBindContext$1(fn, that, AS_ENTRIES ? 2 : 1);
    var iterator, iterFn, index, length, result, next, step;

    if (IS_ITERATOR) {
      iterator = iterable;
    } else {
      iterFn = getIteratorMethod$1(iterable);
      if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
      // optimisation for array iterators
      if (isArrayIteratorMethod$1(iterFn)) {
        for (index = 0, length = toLength$1(iterable.length); length > index; index++) {
          result = AS_ENTRIES
            ? boundFunction(anObject$1(step = iterable[index])[0], step[1])
            : boundFunction(iterable[index]);
          if (result && result instanceof Result) return result;
        } return new Result(false);
      }
      iterator = iterFn.call(iterable);
    }

    next = iterator.next;
    while (!(step = next.call(iterator)).done) {
      result = callWithSafeIterationClosing$1(iterator, boundFunction, step.value, AS_ENTRIES);
      if (typeof result == 'object' && result && result instanceof Result) return result;
    } return new Result(false);
  };

  iterate.stop = function (result) {
    return new Result(true, result);
  };
  });

  var ITERATOR$8 = wellKnownSymbol$1('iterator');
  var SAFE_CLOSING$1 = false;

  try {
    var called$1 = 0;
    var iteratorWithReturn$1 = {
      next: function () {
        return { done: !!called$1++ };
      },
      'return': function () {
        SAFE_CLOSING$1 = true;
      }
    };
    iteratorWithReturn$1[ITERATOR$8] = function () {
      return this;
    };
    // eslint-disable-next-line no-throw-literal
    Array.from(iteratorWithReturn$1, function () { throw 2; });
  } catch (error) { /* empty */ }

  var checkCorrectnessOfIteration$1 = function (exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING$1) return false;
    var ITERATION_SUPPORT = false;
    try {
      var object = {};
      object[ITERATOR$8] = function () {
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

  var SPECIES$5 = wellKnownSymbol$1('species');

  // `SpeciesConstructor` abstract operation
  // https://tc39.github.io/ecma262/#sec-speciesconstructor
  var speciesConstructor = function (O, defaultConstructor) {
    var C = anObject$1(O).constructor;
    var S;
    return C === undefined || (S = anObject$1(C)[SPECIES$5]) == undefined ? defaultConstructor : aFunction$3(S);
  };

  var html$1 = getBuiltIn$1('document', 'documentElement');

  var engineUserAgent$1 = getBuiltIn$1('navigator', 'userAgent') || '';

  var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent$1);

  var location = global_1$1.location;
  var set$2 = global_1$1.setImmediate;
  var clear = global_1$1.clearImmediate;
  var process$1 = global_1$1.process;
  var MessageChannel = global_1$1.MessageChannel;
  var Dispatch = global_1$1.Dispatch;
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
    global_1$1.postMessage(id + '', location.protocol + '//' + location.host);
  };

  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!set$2 || !clear) {
    set$2 = function setImmediate(fn) {
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
    if (classofRaw$1(process$1) == 'process') {
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
      defer = functionBindContext$1(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (
      global_1$1.addEventListener &&
      typeof postMessage == 'function' &&
      !global_1$1.importScripts &&
      !fails$1(post) &&
      location.protocol !== 'file:'
    ) {
      defer = post;
      global_1$1.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in documentCreateElement$1('script')) {
      defer = function (id) {
        html$1.appendChild(documentCreateElement$1('script'))[ONREADYSTATECHANGE] = function () {
          html$1.removeChild(this);
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
    set: set$2,
    clear: clear
  };

  var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor$1.f;

  var macrotask = task.set;


  var MutationObserver = global_1$1.MutationObserver || global_1$1.WebKitMutationObserver;
  var process$2 = global_1$1.process;
  var Promise$1 = global_1$1.Promise;
  var IS_NODE = classofRaw$1(process$2) == 'process';
  // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
  var queueMicrotaskDescriptor = getOwnPropertyDescriptor$4(global_1$1, 'queueMicrotask');
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
        macrotask.call(global_1$1, flush);
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
    this.resolve = aFunction$3(resolve);
    this.reject = aFunction$3(reject);
  };

  // 25.4.1.5 NewPromiseCapability(C)
  var f$c = function (C) {
    return new PromiseCapability(C);
  };

  var newPromiseCapability = {
  	f: f$c
  };

  var promiseResolve = function (C, x) {
    anObject$1(C);
    if (isObject$1(x) && x.constructor === C) return x;
    var promiseCapability = newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var hostReportErrors = function (a, b) {
    var console = global_1$1.console;
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

  var process$3 = global_1$1.process;
  var versions$1 = process$3 && process$3.versions;
  var v8$1 = versions$1 && versions$1.v8;
  var match$1, version$1;

  if (v8$1) {
    match$1 = v8$1.split('.');
    version$1 = match$1[0] + match$1[1];
  } else if (engineUserAgent$1) {
    match$1 = engineUserAgent$1.match(/Edge\/(\d+)/);
    if (!match$1 || match$1[1] >= 74) {
      match$1 = engineUserAgent$1.match(/Chrome\/(\d+)/);
      if (match$1) version$1 = match$1[1];
    }
  }

  var engineV8Version$1 = version$1 && +version$1;

  var task$1 = task.set;










  var SPECIES$6 = wellKnownSymbol$1('species');
  var PROMISE = 'Promise';
  var getInternalState$3 = internalState$1.get;
  var setInternalState$3 = internalState$1.set;
  var getInternalPromiseState = internalState$1.getterFor(PROMISE);
  var PromiseConstructor = nativePromiseConstructor;
  var TypeError$1 = global_1$1.TypeError;
  var document$3 = global_1$1.document;
  var process$4 = global_1$1.process;
  var $fetch = getBuiltIn$1('fetch');
  var newPromiseCapability$1 = newPromiseCapability.f;
  var newGenericPromiseCapability = newPromiseCapability$1;
  var IS_NODE$1 = classofRaw$1(process$4) == 'process';
  var DISPATCH_EVENT = !!(document$3 && document$3.createEvent && global_1$1.dispatchEvent);
  var UNHANDLED_REJECTION = 'unhandledrejection';
  var REJECTION_HANDLED = 'rejectionhandled';
  var PENDING = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var HANDLED = 1;
  var UNHANDLED = 2;
  var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

  var FORCED$3 = isForced_1$1(PROMISE, function () {
    var GLOBAL_CORE_JS_PROMISE = inspectSource$1(PromiseConstructor) !== String(PromiseConstructor);
    if (!GLOBAL_CORE_JS_PROMISE) {
      // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // We can't detect it synchronously, so just check versions
      if (engineV8Version$1 === 66) return true;
      // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
    }
    // We can't use @@species feature detection in V8 since it causes
    // deoptimization and performance degradation
    // https://github.com/zloirock/core-js/issues/679
    if (engineV8Version$1 >= 51 && /native code/.test(PromiseConstructor)) return false;
    // Detect correctness of subclassing with @@species support
    var promise = PromiseConstructor.resolve(1);
    var FakePromise = function (exec) {
      exec(function () { /* empty */ }, function () { /* empty */ });
    };
    var constructor = promise.constructor = {};
    constructor[SPECIES$6] = FakePromise;
    return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
  });

  var INCORRECT_ITERATION$1 = FORCED$3 || !checkCorrectnessOfIteration$1(function (iterable) {
    PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
  });

  // helpers
  var isThenable = function (it) {
    var then;
    return isObject$1(it) && typeof (then = it.then) == 'function' ? then : false;
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
      event = document$3.createEvent('Event');
      event.promise = promise;
      event.reason = reason;
      event.initEvent(name, false, true);
      global_1$1.dispatchEvent(event);
    } else event = { promise: promise, reason: reason };
    if (handler = global_1$1['on' + name]) handler(event);
    else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
  };

  var onUnhandled = function (promise, state) {
    task$1.call(global_1$1, function () {
      var value = state.value;
      var IS_UNHANDLED = isUnhandled(state);
      var result;
      if (IS_UNHANDLED) {
        result = perform(function () {
          if (IS_NODE$1) {
            process$4.emit('unhandledRejection', value, promise);
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
    task$1.call(global_1$1, function () {
      if (IS_NODE$1) {
        process$4.emit('rejectionHandled', promise);
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
  if (FORCED$3) {
    // 25.4.3.1 Promise(executor)
    PromiseConstructor = function Promise(executor) {
      anInstance(this, PromiseConstructor, PROMISE);
      aFunction$3(executor);
      Internal.call(this);
      var state = getInternalState$3(this);
      try {
        executor(bind(internalResolve, this, state), bind(internalReject, this, state));
      } catch (error) {
        internalReject(this, state, error);
      }
    };
    // eslint-disable-next-line no-unused-vars
    Internal = function Promise(executor) {
      setInternalState$3(this, {
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
        reaction.domain = IS_NODE$1 ? process$4.domain : undefined;
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
      var state = getInternalState$3(promise);
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
      redefine$1(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          nativeThen.call(that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });

      // wrap fetch result
      if (typeof $fetch == 'function') _export$1({ global: true, enumerable: true, forced: true }, {
        // eslint-disable-next-line no-unused-vars
        fetch: function fetch(input /* , init */) {
          return promiseResolve(PromiseConstructor, $fetch.apply(global_1$1, arguments));
        }
      });
    }
  }

  _export$1({ global: true, wrap: true, forced: FORCED$3 }, {
    Promise: PromiseConstructor
  });

  setToStringTag$1(PromiseConstructor, PROMISE, false);
  setSpecies(PROMISE);

  PromiseWrapper = getBuiltIn$1(PROMISE);

  // statics
  _export$1({ target: PROMISE, stat: true, forced: FORCED$3 }, {
    // `Promise.reject` method
    // https://tc39.github.io/ecma262/#sec-promise.reject
    reject: function reject(r) {
      var capability = newPromiseCapability$1(this);
      capability.reject.call(undefined, r);
      return capability.promise;
    }
  });

  _export$1({ target: PROMISE, stat: true, forced:  FORCED$3 }, {
    // `Promise.resolve` method
    // https://tc39.github.io/ecma262/#sec-promise.resolve
    resolve: function resolve(x) {
      return promiseResolve( this, x);
    }
  });

  _export$1({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
    // `Promise.all` method
    // https://tc39.github.io/ecma262/#sec-promise.all
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability$1(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction$3(C.resolve);
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
        var $promiseResolve = aFunction$3(C.resolve);
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
  var regexpFlags$1 = function () {
    var that = anObject$1(this);
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

  var UNSUPPORTED_Y = fails$1(function () {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });

  var BROKEN_CARET = fails$1(function () {
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
      var flags = regexpFlags$1.call(re);
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

  _export$1({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
    exec: regexpExec
  });

  var TO_STRING$1 = 'toString';
  var RegExpPrototype$1 = RegExp.prototype;
  var nativeToString = RegExpPrototype$1[TO_STRING$1];

  var NOT_GENERIC = fails$1(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
  // FF44- RegExp#toString has a wrong name
  var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

  // `RegExp.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
  if (NOT_GENERIC || INCORRECT_NAME) {
    redefine$1(RegExp.prototype, TO_STRING$1, function toString() {
      var R = anObject$1(this);
      var p = String(R.source);
      var rf = R.flags;
      var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1) ? regexpFlags$1.call(R) : rf);
      return '/' + p + '/' + f;
    }, { unsafe: true });
  }

  var MATCH$2 = wellKnownSymbol$1('match');

  // `IsRegExp` abstract operation
  // https://tc39.github.io/ecma262/#sec-isregexp
  var isRegexp$1 = function (it) {
    var isRegExp;
    return isObject$1(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classofRaw$1(it) == 'RegExp');
  };

  var notARegexp$1 = function (it) {
    if (isRegexp$1(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    } return it;
  };

  var MATCH$3 = wellKnownSymbol$1('match');

  var correctIsRegexpLogic$1 = function (METHOD_NAME) {
    var regexp = /./;
    try {
      '/./'[METHOD_NAME](regexp);
    } catch (e) {
      try {
        regexp[MATCH$3] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (f) { /* empty */ }
    } return false;
  };

  var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor$1.f;






  var nativeEndsWith = ''.endsWith;
  var min$4 = Math.min;

  var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic$1('endsWith');
  // https://github.com/zloirock/core-js/pull/702
  var MDN_POLYFILL_BUG =  !CORRECT_IS_REGEXP_LOGIC && !!function () {
    var descriptor = getOwnPropertyDescriptor$5(String.prototype, 'endsWith');
    return descriptor && !descriptor.writable;
  }();

  // `String.prototype.endsWith` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.endswith
  _export$1({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
    endsWith: function endsWith(searchString /* , endPosition = @length */) {
      var that = String(requireObjectCoercible$1(this));
      notARegexp$1(searchString);
      var endPosition = arguments.length > 1 ? arguments[1] : undefined;
      var len = toLength$1(that.length);
      var end = endPosition === undefined ? len : min$4(toLength$1(endPosition), len);
      var search = String(searchString);
      return nativeEndsWith
        ? nativeEndsWith.call(that, search, end)
        : that.slice(end - search.length, end) === search;
    }
  });

  // TODO: Remove from `core-js@4` since it's moved to entry points







  var SPECIES$7 = wellKnownSymbol$1('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$1(function () {
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

  var REPLACE = wellKnownSymbol$1('replace');
  // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
    if (/./[REPLACE]) {
      return /./[REPLACE]('a', '$0') === '';
    }
    return false;
  })();

  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper
  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$1(function () {
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol$1(KEY);

    var DELEGATES_TO_SYMBOL = !fails$1(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$1(function () {
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
        re.constructor[SPECIES$7] = function () { return re; };
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

      redefine$1(String.prototype, KEY, stringMethod);
      redefine$1(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return regexMethod.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return regexMethod.call(string, this); }
      );
    }

    if (sham) createNonEnumerableProperty$1(RegExp.prototype[SYMBOL], 'sham', true);
  };

  // `String.prototype.{ codePointAt, at }` methods implementation
  var createMethod$7 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible$1($this));
      var position = toInteger$1(pos);
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

  var stringMultibyte$1 = {
    // `String.prototype.codePointAt` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$7(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$7(true)
  };

  var charAt$1 = stringMultibyte$1.charAt;

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

    if (classofRaw$1(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  // @@match logic
  fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
    return [
      // `String.prototype.match` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.match
      function match(regexp) {
        var O = requireObjectCoercible$1(this);
        var matcher = regexp == undefined ? undefined : regexp[MATCH];
        return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
      },
      // `RegExp.prototype[@@match]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
      function (regexp) {
        var res = maybeCallNative(nativeMatch, regexp, this);
        if (res.done) return res.value;

        var rx = anObject$1(regexp);
        var S = String(this);

        if (!rx.global) return regexpExecAbstract(rx, S);

        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        var result;
        while ((result = regexpExecAbstract(rx, S)) !== null) {
          var matchStr = String(result[0]);
          A[n] = matchStr;
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength$1(rx.lastIndex), fullUnicode);
          n++;
        }
        return n === 0 ? null : A;
      }
    ];
  });

  var max$3 = Math.max;
  var min$5 = Math.min;
  var floor$2 = Math.floor;
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
        var O = requireObjectCoercible$1(this);
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

        var rx = anObject$1(regexp);
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
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength$1(rx.lastIndex), fullUnicode);
        }

        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];

          var matched = String(result[0]);
          var position = max$3(min$5(toInteger$1(result.index), S.length), 0);
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
        namedCaptures = toObject$1(namedCaptures);
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
              var f = floor$2(n / 10);
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

  var arrayPush = [].push;
  var min$6 = Math.min;
  var MAX_UINT32 = 0xFFFFFFFF;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !fails$1(function () { return !RegExp(MAX_UINT32, 'y'); });

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
        var string = String(requireObjectCoercible$1(this));
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (separator === undefined) return [string];
        // If `separator` is not a regex, use native split
        if (!isRegexp$1(separator)) {
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
        var O = requireObjectCoercible$1(this);
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

        var rx = anObject$1(regexp);
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
            (e = min$6(toLength$1(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
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
  var domIterables$1 = {
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

  for (var COLLECTION_NAME$1 in domIterables$1) {
    var Collection$1 = global_1$1[COLLECTION_NAME$1];
    var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype$1 && CollectionPrototype$1.forEach !== arrayForEach$1) try {
      createNonEnumerableProperty$1(CollectionPrototype$1, 'forEach', arrayForEach$1);
    } catch (error) {
      CollectionPrototype$1.forEach = arrayForEach$1;
    }
  }

  var runtime_1$1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  /**
   * A helper for working with the Voyant Notebook app.
   * @memberof Spyral
   * @namespace
   */
  var Notebook = /*#__PURE__*/function () {
    function Notebook() {
      _classCallCheck(this, Notebook);
    }

    _createClass(Notebook, null, [{
      key: "getPreviousBlock",

      /**
       * Returns the previous block.
       * @static
       * @returns {string}
       */
      value: function getPreviousBlock(config) {
        return Spyral.Notebook.getBlock(-1, config);
      }
      /**
       * Returns the next block.
       * @static
       * @returns {string}
       */

    }, {
      key: "getNextBlock",
      value: function getNextBlock(config) {
        return Spyral.Notebook.getBlock(1, config);
      }
      /**
       * Returns the current block.
       * @static
       * @params {number} [offset] If specified, returns the block whose position is offset from the current block
       * @returns {string}
       */

    }, {
      key: "getBlock",
      value: function getBlock() {
        if (Voyant && Voyant.notebook) {
          return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments);
        }
      }
    }, {
      key: "setNextBlockFromFiles",
      value: function setNextBlockFromFiles(files, mode, config) {
        if (!mode) {
          if (files[0].name.endsWith("html")) {
            mode = "html";
          } else if (files[0].name.endsWith("xml")) {
            mode = "xml";
          } else if (files[0].name.endsWith("json")) {
            mode = "json";
          } else {
            mode = "text";
          }
        }

        return files[0].text().then(function (text) {
          return Spyral.Notebook.setNextBlock(text, mode, config);
        });
      }
    }, {
      key: "setNextBlock",
      value: function setNextBlock(data, mode, config) {
        return Spyral.Notebook.setBlock(data, 1, mode, config);
      }
    }, {
      key: "setBlock",
      value: function setBlock(data, offset, mode, config) {
        if (Voyant && Voyant.notebook) {
          return Voyant.notebook.Notebook.currentNotebook.setBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments);
        }
      }
      /**
       * 
       * @param {*} contents 
       * @param {*} config 
       */

    }, {
      key: "show",
      value: function show(contents, config) {
        var contents = Spyral.Util.toString(contents);

        if (contents instanceof Promise) {
          contents.then(function (c) {
            return Voyant.notebook.util.Show.show(c);
          });
        } else {
          Voyant.notebook.util.Show.show(contents);
        }
      }
      /**
       * Returns the target element
       * @returns {element}
       */

    }, {
      key: "getTarget",
      value: function getTarget() {
        if (Voyant && Voyant.notebook && Voyant.notebook.Notebook.currentBlock) {
          return Voyant.notebook.Notebook.currentBlock.results.getResultsEl().dom;
        } else {
          var target = document.createElement("div");
          document.body.appendChild(target);
          return target;
        }
      }
      /**
       * Fetch and return the content of a notebook or a particular cell in a notebook
       * @param {string} url
       */

    }, {
      key: "import",
      value: function () {
        var _import2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
          var isFullNotebook, isAbsoluteUrl, notebookId, cellId, urlParts, _url$split, _url$split2, json, notebook, parser, htmlDoc, code, error, cell, result;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  isFullNotebook = url.indexOf('#') === -1;
                  isAbsoluteUrl = url.indexOf('http') === 0;
                  notebookId = '';
                  cellId = undefined;

                  if (!isAbsoluteUrl) {
                    _context.next = 14;
                    break;
                  }

                  urlParts = url.match(/\/[\w-]+/g);

                  if (!(urlParts !== null)) {
                    _context.next = 10;
                    break;
                  }

                  notebookId = urlParts[urlParts.length - 1].replace('/', '');
                  _context.next = 11;
                  break;

                case 10:
                  return _context.abrupt("return");

                case 11:
                  if (!isFullNotebook) {
                    cellId = url.split('#')[1];
                  }

                  _context.next = 15;
                  break;

                case 14:
                  if (isFullNotebook) {
                    notebookId = url;
                  } else {
                    _url$split = url.split('#');
                    _url$split2 = _slicedToArray(_url$split, 2);
                    notebookId = _url$split2[0];
                    cellId = _url$split2[1];
                  }

                case 15:
                  _context.next = 17;
                  return Spyral.Load.trombone({
                    tool: 'notebook.NotebookManager',
                    action: 'load',
                    id: notebookId,
                    noCache: 1
                  });

                case 17:
                  json = _context.sent;
                  notebook = json.notebook.data;
                  parser = new DOMParser();
                  htmlDoc = parser.parseFromString(notebook, 'text/html');
                  code = '';
                  error = undefined;

                  if (cellId !== undefined) {
                    cell = htmlDoc.querySelector('#' + cellId);

                    if (cell !== null && cell.classList.contains('notebookcodeeditorwrapper')) {
                      code = cell.querySelector('pre').textContent;
                    } else {
                      error = 'No code found for cell: ' + cellId;
                    }
                  } else {
                    htmlDoc.querySelectorAll('section.notebook-editor-wrapper').forEach(function (cell, i) {
                      if (cell.classList.contains('notebookcodeeditorwrapper')) {
                        code += cell.querySelector('pre').textContent + "\n";
                      }
                    });
                  }

                  if (Ext) {
                    if (error === undefined) {
                      Ext.toast({
                        // quick tip that auto-destructs
                        html: 'Imported code from: ' + url,
                        width: 200,
                        align: 'b'
                      });
                    } else {
                      Ext.Msg.show({
                        title: 'Error importing code from: ' + url,
                        message: error,
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                      });
                    }
                  }

                  result = undefined;
                  _context.prev = 26;
                  result = eval.call(window, code);
                  _context.next = 33;
                  break;

                case 30:
                  _context.prev = 30;
                  _context.t0 = _context["catch"](26);
                  return _context.abrupt("return", _context.t0);

                case 33:
                  if (result !== undefined) {
                    console.log(result);
                  }

                  return _context.abrupt("return", result);

                case 35:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[26, 30]]);
        }));

        function _import(_x) {
          return _import2.apply(this, arguments);
        }

        return _import;
      }()
    }]);

    return Notebook;
  }();

  // `String.prototype.repeat` method implementation
  // https://tc39.github.io/ecma262/#sec-string.prototype.repeat
  var stringRepeat = ''.repeat || function repeat(count) {
    var str = String(requireObjectCoercible$1(this));
    var result = '';
    var n = toInteger$1(count);
    if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
    for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
    return result;
  };

  // https://github.com/tc39/proposal-string-pad-start-end




  var ceil$2 = Math.ceil;

  // `String.prototype.{ padStart, padEnd }` methods implementation
  var createMethod$8 = function (IS_END) {
    return function ($this, maxLength, fillString) {
      var S = String(requireObjectCoercible$1($this));
      var stringLength = S.length;
      var fillStr = fillString === undefined ? ' ' : String(fillString);
      var intMaxLength = toLength$1(maxLength);
      var fillLen, stringFiller;
      if (intMaxLength <= stringLength || fillStr == '') return S;
      fillLen = intMaxLength - stringLength;
      stringFiller = stringRepeat.call(fillStr, ceil$2(fillLen / fillStr.length));
      if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
      return IS_END ? S + stringFiller : stringFiller + S;
    };
  };

  var stringPad = {
    // `String.prototype.padStart` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.padstart
    start: createMethod$8(false),
    // `String.prototype.padEnd` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.padend
    end: createMethod$8(true)
  };

  var padStart = stringPad.start;

  var abs = Math.abs;
  var DatePrototype$1 = Date.prototype;
  var getTime$1 = DatePrototype$1.getTime;
  var nativeDateToISOString = DatePrototype$1.toISOString;

  // `Date.prototype.toISOString` method implementation
  // https://tc39.github.io/ecma262/#sec-date.prototype.toisostring
  // PhantomJS / old WebKit fails here:
  var dateToIsoString = (fails$1(function () {
    return nativeDateToISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
  }) || !fails$1(function () {
    nativeDateToISOString.call(new Date(NaN));
  })) ? function toISOString() {
    if (!isFinite(getTime$1.call(this))) throw RangeError('Invalid time value');
    var date = this;
    var year = date.getUTCFullYear();
    var milliseconds = date.getUTCMilliseconds();
    var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
    return sign + padStart(abs(year), sign ? 6 : 4, 0) +
      '-' + padStart(date.getUTCMonth() + 1, 2, 0) +
      '-' + padStart(date.getUTCDate(), 2, 0) +
      'T' + padStart(date.getUTCHours(), 2, 0) +
      ':' + padStart(date.getUTCMinutes(), 2, 0) +
      ':' + padStart(date.getUTCSeconds(), 2, 0) +
      '.' + padStart(milliseconds, 3, 0) +
      'Z';
  } : nativeDateToISOString;

  // `Date.prototype.toISOString` method
  // https://tc39.github.io/ecma262/#sec-date.prototype.toisostring
  // PhantomJS / old WebKit has a broken implementations
  _export$1({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== dateToIsoString }, {
    toISOString: dateToIsoString
  });

  /**
   * A class for storing Notebook metadata
   * @memberof Spyral
   */
  var Metadata = /*#__PURE__*/function () {
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
    function Metadata(config) {
      var _this = this;

      _classCallCheck(this, Metadata);

      ['title', 'author', 'description', 'keywords', 'modified', 'created', 'language', 'license'].forEach(function (key) {
        _this[key] = undefined;
      });
      this.version = "0.1"; // may be changed by config

      if (config instanceof HTMLDocument) {
        config.querySelectorAll("meta").forEach(function (meta) {
          var name = meta.getAttribute("name");

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

      if (!this.created) {
        this.setDateNow("created");
      }
    }
    /**
     * Set metadata properties.
     * @param {object} config A config object
     */


    _createClass(Metadata, [{
      key: "set",
      value: function set(config) {
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

    }, {
      key: "setDateNow",
      value: function setDateNow(field) {
        this[field] = new Date().toISOString();
      }
      /**
       * Gets the specified field as a short date.
       * @param {string} field
       * @returns {string|undefined}
       */

    }, {
      key: "shortDate",
      value: function shortDate(field) {
        return this[field] ? new Date(Date.parse(this[field])).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : undefined;
      }
      /**
       * Gets the fields as a set of HTML meta tags.
       * @returns {string}
       */

    }, {
      key: "getHeaders",
      value: function getHeaders() {
        var quotes = /"/g,
            newlines = /(\r\n|\r|\n)/g,
            tags = /<\/?\w+.*?>/g,
            headers = "<title>" + (this.title || "").replace(tags, "") + "</title>\n";

        for (var key in this) {
          if (this[key]) {
            headers += '<meta name="' + key + '" content="' + this[key].replace(quotes, "&quot;").replace(newlines, " ") + '">';
          }
        }

        return headers;
      }
    }]);

    return Metadata;
  }();

  /**
   * @namespace Spyral
   */

  var Spyral$1 = {
    Notebook: Notebook,
    Util: Util,
    Metadata: Metadata,
    Corpus: Corpus,
    Table: Table,
    Load: Load,
    Chart: Chart,
    Categories: Categories
  };

  return Spyral$1;

}());
//# sourceMappingURL=spyral.js.map
