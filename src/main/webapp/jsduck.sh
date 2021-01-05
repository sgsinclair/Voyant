# generate docs (no spyral)
#/home/andrew/.gem/bin/solvas-jsduck --config resources/voyant/current/docs/en/config.json --output docs; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js;
#
# generate spyral source for api
python3 resources/spyral/src-jsduck/jsdocs.py --input-dir ../../../../voyantjs/src resources/spyral/src --output-file resources/spyral/src-jsduck/spyral.js --exclude-file resources/spyral/src/index.js
#
# generate docs (with spyral)
/home/andrew/.gem/bin/solvas-jsduck --no-source --verbose --processes=1 --config resources/voyant/current/docs/en/config.json --output docs --ignore-global resources/spyral/src-jsduck/; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js;