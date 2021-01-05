:: generate docs (no spyral)
@REM ruby C:\Ruby27-x64\lib\ruby\gems\2.7.0\gems\solvas-jsduck-6.0.0.30539\bin\solvas-jsduck --config resources\voyant\current\docs\en\config.json --output docs && copy docs\index.html docs\index.jsp

:: generate spyral source for api
python resources\spyral\src-jsduck\jsdocs.py --input-dir ..\..\..\..\voyantjs\src resources\spyral\src --output-file resources\spyral\src-jsduck\spyral.js --exclude-file resources\spyral\src\index.js

:: generate docs (with spyral)
ruby C:\Ruby27-x64\lib\ruby\gems\2.7.0\gems\solvas-jsduck-6.0.0.30539\bin\solvas-jsduck --no-source --verbose --config resources\voyant\current\docs\en\config.json --output docs --ignore-global resources\spyral\src-jsduck\ && copy docs\index.html docs\index.jsp