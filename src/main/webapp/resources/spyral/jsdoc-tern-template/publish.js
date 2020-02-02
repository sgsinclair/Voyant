var fs = require('fs');
var helper = require("jsdoc/util/templateHelper");

/**
 * Publish hook for the JSDoc template.  Writes to JSON stdout.
 * @param {function} data The root of the Taffy DB containing doclet records.
 * @param {Object} opts Options.
 */
exports.publish = function(data, opts, tutorials) {
    data({ undocumented: true }).remove();

    var docs = data().get();

    const pkg = (helper.find(data, { kind: 'package' }) || [])[0];

    var output = {
        "!name": pkg.name,
        "!define": {
        }
    };

    var library = {};

    function convertType(typeObj, returnString) {
        if (typeObj) {
            var type = typeObj.type.names.join('|');
            //pipes
            if (type.indexOf('|') !== -1) {
                type = '?';
            }
            //arrays
            else if (type.indexOf('Array.<') !== -1) {
                type = type.replace(/Array\.\</g, '[').replace(/\>/g, ']');
            }
            //arraylike
            else if (type.indexOf('ArrayLike.<') !== -1) {
                type = '?';
            }
            //any
            else if (type === '*' || type === 'any') {
                type = type.replace(/\*/g, '?');
            }
            //functions
            else if (type.indexOf('function') !== -1) {
                type = type.replace(/function/g, 'fn()');
            }
            else if ((output[type] && output[type].prototype) || /[A-Z]/.test(type[0])) {
                type = '+' + type;
            }

            if (returnString) {
                return type;
            } else {
                var convertedObj = {
                    "!type": type
                };
                if (typeObj.description) {
                    convertedObj["!doc"] = convertDescription(typeObj.description);
                }
                return convertedObj;
            }
        }
    }

    function convertDescription(desc) {
        if (desc) {
            desc = desc.replace(/\<p\>/g, '').replace(/\<\/p\>/g, '');
            desc = convertLinks(desc);
        }
        return desc;
    }

    function convertLinks(strWithLinks) {
        if (strWithLinks) {
            return strWithLinks.replace(/(?:{@link\s)(.*?)(?:(?:\|.*?})|})/g, '$1');  // extract the actual link from the link tag
        }   
    }

    function convertSee(sees) {
        if (sees) {
            var see = sees[0];
            if (see) {
                return convertLinks(see);
            }
        }
    }

    function convertParams(params) {
        var ret = [];
        if (params) {

            // TODO add handling parameters with properties, tern doesn't support them so need to only show parent param
            // https://discuss.ternjs.net/t/functions-optional-parameters-overloads/59

            // filter out param properties
            var nonProps = params.filter(param => param.name.indexOf('.') === -1);

            nonProps.forEach((param) => {
                ret.push(param.name + (param.optional ? '?' : '') + ': ' + convertType(param, true));
            });

            return 'fn(' + ret.join(', ') + ')';
        }
        return 'fn()';
    }

    function convertReturns(returns) {
        if (returns && returns[0].type.names.join('|') === 'void')
            return '';
        return returns ? ' -> ' + convertType(returns[0], true) : '';
    }

    function createEntriesForName(name, context) {
        var namepath = name.split('.');
        namepath.forEach((namepart, index) => {
            if (context[namepart] === undefined) {
                context[namepart] = {}
            }
            context = context[namepart];
        })
        return context;
    }

    for (var d in docs) {
        var doc = docs[d];

        var convertedEntry = undefined;

        if (doc.kind && doc.kind === 'namespace') {
            createEntriesForName(doc.longname, output);

        } else if (doc.kind && (doc.kind === 'module' || doc.kind === 'class' || doc.kind === 'typedef')) {

            if (doc.kind === 'class') {

                var context = createEntriesForName(doc.longname, output);

                context['!type'] = convertParams(doc.params);
                context['prototype'] = {};

                convertedEntry = context;

            } else if (doc.kind === 'typedef' && doc.properties) {

                var obj = {};
                for (var p in doc.properties) {
                    var dp = doc.properties[p];
                    obj[dp.name] = convertType(dp);
                }
                output['!define'][doc.name] = obj;

                convertedEntry = output['!define'][doc.name];

            } else if (doc.kind === 'typedef' && doc.params) {

                output[doc.name] = {
                    "!type": convertParams(doc.params) + convertReturns(doc.returns)
                };

                convertedEntry = output[doc.name]

            }

        } else if (doc.memberof && (doc.kind === 'member' || doc.kind === 'function')) {

            var memberName = doc.memberof.replace('module:', '');
            if (memberName === pkg.name) {
                library[doc.name] = {
                    "!type": convertParams(doc.params) + convertReturns(doc.returns)
                };
                convertedEntry = library[doc.name];
            } else {
                var context = createEntriesForName(memberName, output);
                
                var name = doc.name.replace('exports.', '');
                var isStatic = doc.scope === 'static';
                
                if (isStatic === false) {
                    if (context.prototype === undefined) {
                        context.prototype = {};
                    }
                    context = context.prototype;
                }
                
                context[name] = {
                    "!type": doc.kind === 'function' ? convertParams(doc.params) + convertReturns(doc.returns) : convertType(doc.type.names.join('|'))
                }

                convertedEntry = context[name];
            }
        } else {
            // unhandled kind
        }

        if (convertedEntry !== undefined) {
            var desc = convertDescription(doc.description);
            if (desc) {
                convertedEntry['!doc'] = desc;
            }

            var url = convertSee(doc.see);
            if (url) {
                // TODO ace tern doesn't support !url
                // convertedEntry['!url'] = url;

                // append to docs, for now
                convertedEntry['!doc'] += "\n"+url;
            }
        }
    }

    if (Object.keys(library).length > 0) {
        output[pkg.name] = library;
    }

    fs.writeFileSync(opts.destination + '/' + pkg.name + '.json', JSON.stringify(output, null, 2));

};