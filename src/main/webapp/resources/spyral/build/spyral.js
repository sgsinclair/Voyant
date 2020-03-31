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

  function isNativeReflectConstruct() {
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
    if (isNativeReflectConstruct()) {
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
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

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

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
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
    }]);

    return Load;
  }();

  _defineProperty(Load, "baseUrl", void 0);

  function isDocumentsMode(config) {
    return config && (config.mode && config.mode === "documents" || config.documents);
  }
  /**
   * Class representing a Corpus.
   * @memberof Spyral
   * @class
   */


  var Corpus = /*#__PURE__*/function () {
    /**
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
       * Get the ID
       * @return {string} The ID
       */
      value: function id() {
        var me = this;
        return new Promise(function (resolve) {
          return resolve(me.corpusid);
        });
      }
      /**
       * Create a Corpus and return the ID
       * @param {object} config 
       * @param {object} api 
       */

    }, {
      key: "metadata",

      /**
       * Load the metadata
       * @param {*} config 
       * @param {*} params 
       */
      value: function metadata(config, params) {
        return Load.trombone(config, {
          tool: isDocumentsMode(config) ? "corpus.DocumentsMetadata" : "corpus.CorpusMetadata",
          corpus: this.corpusid
        }).then(function (data) {
          return isDocumentsMode(config) ? data.documentsMetadata.documents : data.corpus.metadata;
        });
      }
      /**
       * Create a Corpus and return the metadata
       * @param {*} config 
       * @param {*} api 
       */

    }, {
      key: "summary",
      value: function summary(config) {
        return this.metadata().then(function (data) {
          // TODO: make this a template
          return "This corpus (".concat(data.alias ? data.alias : data.id, ") has ").concat(data.documentsCount.toLocaleString(), " documents with ").concat(data.lexicalTokensCount.toLocaleString(), " total words and ").concat(data.lexicalTypesCount.toLocaleString(), " unique word forms.");
        });
      }
      /**
       * Create a Corpus and return the summary
       * @param {*} config 
       * @param {*} api 
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
      /**
       * Create a Corpus and return the titles
       * @param {*} config 
       * @param {*} api 
       */

    }, {
      key: "text",

      /**
       * Get the text
       * @param {*} config 
       */
      value: function text(config) {
        return this.texts(config).then(function (data) {
          return data.join("\n");
        });
      }
      /**
       * Create a Corpus and return the text
       * @param {*} config 
       * @param {*} api 
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
      /**
       * Create a Corpus and return the texts
       * @param {*} config 
       * @param {*} api 
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
      /**
       * Create a Corpus and return the terms
       * @param {*} config 
       * @param {*} api 
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
      /**
       * Create a Corpus and return the tokens
       * @param {*} config 
       * @param {*} api 
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
      /**
       * Create a Corpus and return an array of lexical forms (words) in document order.
       * @param {object} config 
       * @param {object} api 
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
      /**
       * Create a Corpus and return the contexts
       * @param {object} config 
       * @param {object} api 
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
      /**
       * Create a Corpus and return the collocates
       * @param {object} config 
       * @param {object} api 
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
      key: "id",
      value: function id(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.id(api || config);
        });
      }
    }, {
      key: "metadata",
      value: function metadata(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.metadata(api || config);
        });
      }
    }, {
      key: "summary",
      value: function summary(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.summary(api || config);
        });
      }
    }, {
      key: "titles",
      value: function titles(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.titles(api || config);
        });
      }
    }, {
      key: "text",
      value: function text(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.text(api || config);
        });
      }
    }, {
      key: "texts",
      value: function texts(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.texts(api || config);
        });
      }
    }, {
      key: "terms",
      value: function terms(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.terms(api || config);
        });
      }
    }, {
      key: "tokens",
      value: function tokens(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.tokens(api || config);
        });
      }
    }, {
      key: "words",
      value: function words(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.words(api || config);
        });
      }
    }, {
      key: "contexts",
      value: function contexts(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.contexts(api || config);
        });
      }
    }, {
      key: "collocates",
      value: function collocates(config, api) {
        return Corpus.load(config).then(function (corpus) {
          return corpus.collocates(api || config);
        });
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
    typeof module === "object" ? module.exports : {}
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
      value: function getPreviousBlock() {
        return Spyral.Notebook.getBlock(-1);
      }
      /**
       * Returns the next block.
       * @static
       * @returns {string}
       */

    }, {
      key: "getNextBlock",
      value: function getNextBlock() {
        return Spyral.Notebook.getBlock(1);
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
      /**
       * 
       * @param {*} contents 
       * @param {*} config 
       */

    }, {
      key: "show",
      value: function show(contents, config) {
        var contents = Spyral.Util.toString(contents, config);

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
          return Voyant.notebook.Notebook.currentBlock.results.getEl().dom;
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
                      Ext.Msg.show({
                        title: 'Imported code from: ' + url,
                        message: '<pre>' + code + '</pre>',
                        buttons: Ext.Msg.OK
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
                  eval.call(window, code);
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

                case 34:
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
      value: function id(len) {
        len = len || 8; // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

        return Math.random().toString(36).substring(2, 2 + len) + Math.random().toString(36).substring(2, 2 + len);
      }
      /**
       * 
       * @static
       * @param {*} contents 
       * @param {*} config 
       * @returns {string}
       */

    }, {
      key: "toString",
      value: function toString(contents, config) {
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
       * @param {*} before 
       * @param {*} more 
       * @param {*} after 
       */

    }, {
      key: "more",
      value: function more(before, _more, after) {
        return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' + contents.substring(0, 500) + " <a href=''>+</a><div style='display: none'>" + contents.substring(501) + "</div>";
      }
    }]);

    return Util;
  }();

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
    Chart: Chart
  };

  return Spyral$1;

}());
//# sourceMappingURL=spyral.js.map
