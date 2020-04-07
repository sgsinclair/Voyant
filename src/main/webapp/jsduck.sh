jsduck --config resources/voyant/current/docs/en/config.json --output docs --ignore-global app; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js; jsduck --config resources/voyant/current/docs/en/config.json --output docs/ace --export=full --ignore-global app

jsduck --config resources/voyant/current/docs/en/config.json --output docs --ignore-global; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js;

jsduck --verbose -processes=1 --config resources/voyant/current/docs/en/config.json --output docs --ignore-global app; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js

python3 resources/spyral/src-jsduck/jsdocs.py --input-dir ../../../../voyantjs/src resources/spyral/src --output-file resources/spyral/src-jsduck/spyral.js --exclude-file resources/spyral/src/index.js

jsduck --no-source --verbose --processes=1 --config resources/voyant/current/docs/en/config.json --output docs --ignore-global resources/spyral/src-jsduck/; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js
