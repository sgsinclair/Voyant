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
     * 		new Corpus("goldbug");
     * 
     * 		new Corpus("goldbug", {
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
     * 		new Corpus("Hello Voyant!"); // one document with this string
     * 
     * 		new Corpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
     * 
     * 		new Corpus("http://hermeneuti.ca/"); // one document from URL
     * 
     * 		new Corpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
     * 
     * 		new Corpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
     * 
     * 		new Corpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
     * 			inputRemoveUntil: 'THE GOLD-BUG',
     * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
     * 		});
     * 
     * 		// use a corpus ID but also specify an input source if the corpus can't be found
     * 		new Corpus("goldbug", {
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
     * 		new Corpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
     * 			 xmlContentXpath: "//body"
     * 		}); // document would be: "This is Voyant!"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
     * 			 xmlTitleXpath: "//title"
     * 		}); // title would be: "Hello world!"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
     * 			 xmlAuthorXpath: "//author"
     * 		}); // author would be: "Stéfan Sinclair"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
     * 			 xmlPubPlaceXpath: "//pubPlace"
     * 		}); // publication place would be: "Montreal"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
     * 			 xmlPublisherXpath: "//publisher"
     * 		}); // publisher would be: "The Owl"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
     * 			 xmlKeywordXpath: "//keyword"
     * 		}); // publisher would be: "text analysis"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
     * 			 xmlCollectionXpath: "//collection"
     * 		}); // publisher would be: "documentation"
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
     * 			 xmlDocumentsXPath: '//sp',
     *           xmlGroupByXpath: "//@s"
     * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
     * 
     * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
     */

    /**
     * @cfg {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
     * 
     * 		new Corpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
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
     * 		new Corpus("Hello world! This is Voyant!", {
     * 			 inputRemoveUntil: "This"
     * 		}); // document would be: "This is Voyant!"
     * 
     * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
     */

    /**
     * @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
     * 
     * 		new Corpus("Hello world! This is Voyant!", {
     * 			 inputRemoveUntilAfter: "world!"
     * 		}); // document would be: "This is Voyant!"
     * 
     * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
     */

    /**
     * @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
     * 
     * 		new Corpus("Hello world! This is Voyant!", {
     * 			 inputRemoveFrom: "This"
     * 		}); // document would be: "Hello world!"
     * 
     * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
     */

    /**
     * @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
     * 
     * 		new Corpus("Hello world! This is Voyant!", {
     * 			 inputRemoveFromAfter: "world!"
     * 		}); // document would be: "Hello world!"
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
    * @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface
    *
    * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
    *
    *   	 p    	 paragraph
    *   	 ref[@target*="religion"]    	 religion
    *
     * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
    */

    /*
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
