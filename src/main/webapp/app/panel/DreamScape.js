Ext.define('Voyant.panel.DreamScape', {
    extend: 'Ext.Panel',
    xtype: 'dreamscape',
    mixins: ['Voyant.panel.Panel'],
    statics: {
        i18n: {
            title: 'DreamScape',
            show: "Show",
            showTip: "Determine what information to display.",
            filter: "Filter",
            filterTip: "Determine any filters to use.",
            authorLabel: 'authors',
            noauthor: "No authors defined in this corpus.",
            titleLabel: 'titles',
            keywordLabel: 'keywords',
            pubDateLabel: 'years',
            nopubDate: "No publication years defined in this corpus.",
            animationSpeed: "Speed",
            cities: "cities",
            connections: "connections"
        },
        api: {
            stopList: 'auto',
            author: undefined,
            title: undefined,
            keyword: undefined,
            pubDate: undefined,
            minPopulation: 15000
        },
        glyph: 'xf124@FontAwesome'
    },
    config: {
        map: undefined, // OL object, should be set during init
        overlay: undefined, // OL object, should be set during init
        contentEl: undefined, // EXTJS Element, where info is shown
        isOpenLayersLoaded: false,
        isArcLoaded: false,

        // Maximum number of locations to be returned by the server
        maxResults: 400,

        // Constant that changes how zoomed the map must be for cities with less occurences to appear
        // The lower the value, the sooner small cities will appear
        zoomTreshold: 80,

        // Constant that changes how bigger cities with more occurences are compared to cities with fewer
        // The higher the value, the bigger the difference will be
        sizeRatio: 50000,

        // global variable for number of location occurences found in corpus
        totalEntries: 0,
        nbOfEntries: [],

        // Speed of vectors drawing
        pointsPerMs: 0.3,

        // Number of points per arc. More points means more dense and rounded arcs but may affect performance
        pointsPerArc: 100,

        // Time between vectors drawing
        delayBetweenVectors: 100 / 0.3,

        // Used to keep track of number of filters
        filterCount: 0,

        // Array to keep track of delayed event for animation
        timedEvents: [[]],

        // Array to contain city features
        cities: [],

        coordinatesSequence: [],

        travels: [],

        // Array to contain texts infos
        texts: [],

        // Colors of the different filters
        colors : [
            "rgb(230, 25, 75)",
            "rgb(0,92,49)",
            "rgb(145, 30, 180)",
            "rgb(128, 0, 0)",
            "rgb(0, 0, 128)",
            "rgb(60, 180, 75)",
            "rgb(143,124,0)",
            "rgb(157,204,0)"
        ],

        filters: [],
        
        corpus: undefined
    },

    html: '<div class="map"></div><div class="ol-popup"><a href="#" class="ol-popup-closer"></a><div class="popup-content"></div></div>',

    cls: 'dreamscape',

    constructor: function(config) {
        this.callParent(arguments);
        this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
        Ext.Loader.loadScript({
            url: this.getBaseUrl()+"resources/openlayers/ol.js",
            onLoad: function() {
                // Utility function to get layer by id
                if (ol.Map.prototype.getLayer === undefined) {
                    ol.Map.prototype.getLayer = function (id) {
                        var layer = undefined;
                        this.getLayers().forEach(function(lyr) {
                            if (id === lyr.get('id')) {
                                layer = lyr;
                            }
                        });
                        return layer;
                    }
                }
                this.setIsOpenLayersLoaded(true);
            },
            scope: this
        });
        Ext.Loader.loadScript({
            url: this.getBaseUrl()+"resources/dreamscape/arc.js",
            onLoad: function() {
                this.setIsArcLoaded(true);
            },
            scope: this
        });
    },
    initComponent: function() {
        var me = this;

        Ext.apply(this, {
            title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    text: this.localize('show'),
                    tooltip: this.localize('showTip'),
                    menu: {
                        defaults: {
                            xtype: 'menucheckitem',
                            checkHandler: function(item, checked) {
                                var map = this.getMap().getLayer(item.getItemId()+"0");
                                map.setVisible(checked)
                            },
                            scope: this,
                            checked: true
                        },
                        items: [{
                            text: this.localize('cities'),
                            itemId: 'cities'
                        },{
                            text: this.localize('connections'),
                            itemId: 'layer'
                        }]
                    }
                },{
                    text: this.localize('filter'),
                    tooltip: this.localize('filterTip'),
                    menu: {
                        defaults: {
                            xtype: 'querysearchfield',
                            labelWidth: 60,
                            labelAlign: 'right',
                            width: 250,
                            maxWidth: 250,
                            listeners: {
                                scope: this,
                                change: function(cmp, vals) {
                                    filters = this.getFilters();
                                    filter = filters[0];
                                    filter[cmp.getItemId()] = vals[0];
                                    console.warn(cmp, vals)
                                }
                            }

                        },
                        items: [{
                            fieldLabel: this.localize('authorLabel'),
                            tokenType: 'author',
                            itemId: 'author'
                        },{
                            fieldLabel: this.localize('titleLabel'),
                            itemId: 'title',
                            tokenType: 'title'
                        },{
                            fieldLabel: this.localize('keywordLabel'),
                            hidden: true
                        },{
                            xtype: 'multislider',
                            fieldLabel: this.localize('pubDateLabel'),
                            itemId: 'pubDate',
                            hidden: true
                        },{
                            xtype: 'button',
                            text: 'filter',
                            scope:this,
                            handler: function() {
                                var filters = this.getFilters();
                                var filter = filters[0];
                                var author = filter.author ? filter.author : "";
                                var title = filter.title ? filter.title : "";
                                var yearBegin = filter.yearBegin ? filter.yearBegin : "";
                                var yearEnd = filter.yearEnd ? filter.yearEnd : "";
                                this.filter(0, author, title, yearBegin, yearEnd);
                            }
                        }]
                    }


                }/*,'-',{
                        xtype: 'slider',
                        fieldLabel: this.localize('animationSpeed'),
                        minValue: 1,
                        maxValue: 40,
                        value: 2,
                        width: 150,
                        listeners: {
                            changecomplete: function(slider, val) {
                                this.setPointsPerMs(val / 40.0);
                                this.setDelayBetweenVectors(this.getPointsPerArc() / this.getPointsPerMs());
                            },
                            scope: this
                        }
                    }*/]
            }]
        })

        this.on("loadedCorpus", function(src, corpus) {

            // see if we have any authors
            new Voyant.data.store.CorpusTerms({corpus: corpus}).load({
                params: {
                    tokenType: "author",
                    limit: 1
                },
                callback: function(records, operation, success) {
                    if (success && records && records.length==1) {
                        this.down('toolbar').getComponent("author").show();
                    } else {
                        this.toastInfo(this.localize('noauthor'));
                    }
                },
                scope: this
            });

            // figure out pubDate limits (or hide if needed)
            new Voyant.data.store.CorpusTerms({corpus: corpus}).load({
                params: {
                    tokenType: "pubDate",
                    sort: "TERMASC",
                    limit: 1
                },
                callback: function(records, operation, success) {
                    if (success && !records && records.length==1) {
                        var min = parseInt(records[0].getTerm());
                        new Voyant.data.store.CorpusTerms({corpus: corpus}).load({
                            params: {
                                tokenType: "pubDate",
                                sort: "TERMDESC",
                                limit: 1
                            },
                            callback: function(records, operation, success) {
                                if (success && !records && records.length==1) {
                                    var max = parseInt(records[0].getTerm());
                                    var pubDate = this.down('toolbar').getComponent("pubDate");
                                    pubDate.setMinValue(min);
                                    pubDate.setMaxValue(max);
                                    pubDate.show();
                                }
                            },
                            scope: this
                        });
                    } else {
                        this.toastInfo(this.localize('nopubDate'));
                    }
                },
                scope: this
            });

            this.tryInit();


        }, this);

        this.callParent();
    },

    tryInit: function() {
        if (this.getIsOpenLayersLoaded() && this.getIsArcLoaded()) {
            var el = this.body.down('.map').setId(Ext.id());
            var overlayEl = this.body.down('.ol-popup');
            var overlay = new ol.Overlay({
                element: overlayEl.dom,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });
            this.setOverlay(overlay);

            // Add a click handler to hide the popup
            var closer = overlayEl.down(".ol-popup-closer").dom;
            closer.onclick = function() {
                overlay.setPosition(undefined);
                closer.blur();
                return false;
            };

            this.setContentEl(overlayEl.down('.popup-content'));
            var map = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        preload: Infinity,
                        source: new ol.source.Stamen({
                            //cacheSize: 2048,
                            layer: 'watercolor'
                        })
                    }),

                    new ol.layer.Tile({
                        preload: Infinity,
                        source: new ol.source.Stamen({
                            cacheize: 2048,
                            layer: 'toner-hybrid'
                        })
                    })
                ],
                target: el.getId(),
                loadTilesWhileInteracting: true,
                overlays: [overlay],
                view: new ol.View({
                    center: [1500000, 6000000],
                    minResolution: 50,
                    zoom: 0
                })
            });

            // Add a click handler to the map to render the popup
            var panel = this;
            map.on('singleclick', function(event) {
                var pixel = event.pixel;
                var features = map.getFeaturesAtPixel(pixel);
                texts = panel.getTexts();
                if(features) {
                    var infos = "<ul>";
                    features.forEach( function(feature) {
                        if( feature.getGeometry().getType() === "Circle" && feature.get("selected")) {
                            var featureOccurences = feature.get("occurences");
                            featureOccurences.forEach(function(entry) {
                                infos += '<li>'+entry.name+' : '+texts[entry.docIndex].authors+', <a href="#" onclick="console.log(\'triggerEventHere\'+'+entry.offset+');return false;">'+texts[entry.docIndex].title+'</a>, '+texts[entry.docIndex].year+' '+entry.offset+'</li>';
                            });
                            var header = feature.get("text");
                            infos += "</ul>";
                            if(feature.get("alternates").length > 0) {
                                header += ' ('+feature.get("alternates")+')';
                            }
                            var coordinate = event.coordinate;
                            panel.getContentEl().setHtml('<h3>'+header+'</h3>'+infos);
                            panel.getOverlay().setPosition(coordinate);
                        } else if(feature.get("selected")) {
                            var featureOccurences = feature.get("occurences");
                            featureOccurences.forEach(function(travel) {
                                infos += '<li>from : '+travel.from.name+' : '+texts[travel.from.docIndex].authors+', <a href="#" onclick="console.log(\'triggerEventHere\'+'+travel.from.offset+');return false;">'+texts[travel.from.docIndex].title+'</a>, '+texts[travel.from.docIndex].year+', '+
                                    'to: '+travel.to.name+' : '+texts[travel.to.docIndex].authors+' , <a href="#" onclick="console.log(\'triggerEventHere\'+'+travel.to.offset+');return false;">'+texts[travel.to.docIndex].title+'</a>, '+texts[travel.to.docIndex].year+'</li>';
                            });
                            var header = feature.get("text");
                            infos += "</ul>";
                            var coordinate = event.coordinate;
                            panel.getContentEl().setHtml('<h3>'+header+'</h3>'+infos);
                            panel.getOverlay().setPosition(coordinate);
                        }
                    });
                }
            });

            // Layer for selected vector
            var selectedLayer = new ol.layer.Vector({
                map: map,
                source: new ol.source.Vector({
                    wrapX: false,
                    useSpatialIndex: false // optional, might improve performance
                }),
                zIndex: 10,
                selected: true,
                style: function(feature) {
                    if(feature.getGeometry().getType() === "Circle")
                    {
                        return panel.cityStyleFunction(feature, map.getView().getResolution());
                    } else {
                        return panel.travelStyleFunction(feature, map.getView().getResolution());
                    }
                },
                updateWhileAnimating: true, // optional, for instant visual feedback
                updateWhileInteracting: true // optional, for instant visual feedback
            });

            // Add handler to update selected vector when mouse is moved
            map.on('pointermove', function(event) {
                selectedLayer.getSource().clear();
                var coordinate = event.coordinate;
                var pixel = event.pixel;
                var features = map.getFeaturesAtPixel(pixel);
                if(features) {
                    var i = 0;
                    while(features[i].get("selected")){
                        i++;
                        if (i === features.length) break;
                    }
                    if (i < features.length) {
                        var feature = features[i];

                        var baseTextStyle = {
                            font: '12px Calibri,sans-serif',
                            textAlign: 'center',
                            offsetY: -15,
                            fill: new ol.style.Fill({
                                color: [0,0,0,1]
                            }),
                            stroke: new ol.style.Stroke({
                                color: [255,255,255,0.5],
                                width: 4
                            })
                        };

                        baseTextStyle.text = feature.get("text");

                        var textOverlayStyle = new ol.style.Style({
                            text: new ol.style.Text(baseTextStyle),
                            zIndex: 1
                        });

                        var selectedFeature = new ol.Feature({
                            text: feature.get("text"),
                            geometry: feature.getGeometry(),
                            occurences: feature.get("occurences"),
                            alternates: feature.get("alternates"),
                            selected: true,
                            filterId: feature.get("filterId"),
                            coordinates: feature.get("coordinates"),
                            width: feature.get("width"),
                            visible: feature.get("visible")
                        });
                        selectedLayer.getSource().addFeature(selectedFeature);
                        var geometry = feature.getGeometry();
                        var point = geometry.getClosestPoint(coordinate);
                        var textFeature = new ol.Feature({
                            geometry: new ol.geom.Point(point),
                            selected: true
                        });
                        textFeature.setStyle(textOverlayStyle);
                        selectedLayer.getSource().addFeature(textFeature);
                    }

                }
            });

            this.setMap(map);

            this.addFilter();
                        
        } else {
            Ext.defer(this.tryInit, 500, this); // try again in a half second
        }
    },

    // Style for vector after animation
    travelStyleFunction: function(feature, resolution) {
        // default color is red, selected feature is blue and first 8 layers have pre-defined colors
        var color = "rgb(255, 0, 0)";
        if (feature.get("selected")) {
            color = "rgb(0, 0, 255)";
        } else if (feature.get("color")) {
            color = feature.get("color");
        }

        var width = 0.5 + Math.sqrt(feature.get("occurences").length/parseFloat(this.getTotalEntries()) * this.getSizeRatio() * 0.2);

        var stroke = new ol.style.Stroke({
            color: color,
            width: width
        });

        var styles = [
            new ol.style.Style({
                stroke: stroke
            })];

        // Add arrow at the end of vectors
        var geometry = feature.getGeometry();
        var end = geometry.getLastCoordinate();
        var beforeEnd = geometry.getCoordinateAt(0.9);
        var dx = end[0] - beforeEnd[0];
        var dy = end[1] - beforeEnd[1];
        var rotation = Math.atan2(dy, dx);

        var lineStr1 = new ol.geom.LineString([end, [end[0] - 10 * resolution, end[1] + 10 * resolution]]);
        lineStr1.rotate(rotation, end);
        var lineStr2 = new ol.geom.LineString([end, [end[0] - 10 * resolution, end[1] - 10 * resolution]]);
        lineStr2.rotate(rotation, end);

        styles.push(new ol.style.Style({
            geometry: lineStr1,
            stroke: stroke
        }));
        styles.push(new ol.style.Style({
            geometry: lineStr2,
            stroke: stroke
        }));

        return styles;
    },

    // Style for cities
    cityStyleFunction: function(feature, resolution) {
        // default color is red, selected feature is blue and first 8 layers have pre-defined colors
        var color = "rgb(255, 0, 0)";
        if (feature.get("selected")) {
            color = "rgb(0, 0, 255)";
        } else if (feature.get("color")) {
            color = feature.get("color");
        }
        if(feature.get("visible")) {
            return (new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: feature.get("width")
                })
            }));
        } else {
            return false;
        }
    },

    // Style for vector during animation
    animationStyleFunction: function (feature) {
        var color = "rgb(255, 0, 0)";
        if (feature.get("color")) {
            color = feature.get("color");
        }
        return (new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 6
            })
        }));
    },

    // Add feature to animation layer with a delay
    addLater: function(feature, timeout, filterId) {
        var map = this.getMap();
        var timedEvent = window.setTimeout(function() {
            feature.set('start', new Date().getTime());
            var layer = map.getLayer("animation" + filterId);
            var source = layer.getSource();
            source.addFeature(feature);
        }, timeout);
        this.getTimedEvents()[filterId].push(timedEvent);
    },

    // Animate travels for a layer
    animateTravels: function(event, filterId) {
        var map = this.getMap(), panel = this;
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;
        var layer = map.getLayer("animation" + filterId);
        var features = layer.getSource().getFeatures();
        features.forEach( function(feature) {
            if (!feature.get('finished')) {
                if(feature.getGeometry().getType() === "Circle"){
                    feature.set('finished', true);
                } else {
                    // only draw the lines for which the animation has not finished yet
                    var coords = feature.getGeometry().getCoordinates();
                    var elapsedTime = frameState.time - feature.get('start');
                    var elapsedPoints = elapsedTime * panel.getPointsPerMs();

                    if (elapsedPoints >= coords.length) {
                        feature.set('finished', true);
                    }

                    var maxIndex = Math.min(elapsedPoints, coords.length);
                    var currentLine = new ol.geom.LineString(coords.slice(0, maxIndex));
                    vectorContext.setStyle(this.animationStyleFunction(feature));
                    // directly draw the line with the vector context
                    vectorContext.drawGeometry(currentLine);
                }
            }
        }, this);
        // tell OpenLayers to continue the animation
        map.render();
    },
    
    fetchDataFromStaticFile: function() {
        var dataFile = this.getBaseUrl()+'resources/dreamscape/datafile.json';
    		return fetch(dataFile).then(function(response) {return response.json()})
    },
    
    fetchDataFromServer: function(author, title, yearBegin, yearEnd, maxResults) {
        var me = this, params = {};
        Ext.apply(params, {
        		minPopulation: this.getApiParam('minPopulation')
        });
        var queries = [];
        if (author) {queries.push("author:"+title)}
        if (title) {queries.push("title:"+title)}
        if (yearBegin && yearEnd) {queries.push("pubDate:["+yearBegin+"-"+yearEnd+"]")}
        if (queries) {params.query=queries;}
        if (maxResults) {params.limit = maxResults;}
        return new Voyant.data.util.Geonames({
        		corpus: this.getCorpus()
        }).load(params).then(function(geonames) {
        		// the data file actually doesn't specify each city occurrence, it already groups them by connection
        		// so we'll go through and look at each source and also the final target
        		var occurrencesByDocument = [];
        		me.getCorpus().each(function(doc) {
        			occurrencesByDocument.push({
        				locs: [],
        				filename: doc.get("location"),
        				URL: '',
        				title: doc.getTitle(),
        				year: parseInt(doc.getTitle()), // only works for austen
        				authors: doc.getAuthor()
        			})
        		})
        		geonames.eachConnectionOccurrence(function(connectionOccurrence) {
        			occurrencesByDocument[connectionOccurrence.docIndex].locs.push({
        				long: connectionOccurrence.source.longitude,
        				lat: connectionOccurrence.source.latitude,
        				conf: Math.random(), // random for now
        				offset: connectionOccurrence.source.position, // N.B. token position, not offset
        				name:connectionOccurrence.source.label
        			});
        		});
        		return {AnnotatedCollection: occurrencesByDocument}
        })

    	
    },
    
    // Filtering that should be done server side
    serverSideFiltering: function(author, title, yearBegin, yearEnd, maxResults) {
        //return this.fetchDataFromStaticFile().then(function(json) {
        return this.fetchDataFromServer(author, title, yearBegin, yearEnd, maxResults).then(function(json) {
            var annotatedCollection = json.AnnotatedCollection;
            var locations = [];
            var entries = [];
            var texts = [];
            var docIndex = 0;
            annotatedCollection.forEach(function(text) {
                if (text.authors.toLowerCase().includes(author.toLowerCase()) &&
                    text.title.toLowerCase().includes(title.toLowerCase()) &&
                    (yearBegin === "" || text.year >= yearBegin) &&
                    (yearEnd === "" || text.year <= yearEnd)) {
                    texts[docIndex] = {
                        authors: text.authors,
                        title: text.title,
                        year: text.year
                    };
                    text.locs.forEach(function(loc) {
                        coordinates = [loc.lat, loc.long];
                        if(!locations[coordinates]) {
                            locations[coordinates] = {
                                name: loc.name,
                                alternates: [],
                                coordinates: coordinates,
                                occurences: [{name: loc.name, coordinates: coordinates, docIndex: docIndex, offset: loc.offset, conf: loc.conf}]
                            };
                        } else {
                            var locObject = locations[coordinates];
                            locObject.occurences.push({name: loc.name, coordinates: locObject.coordinates, docIndex: docIndex, offset: loc.offset, conf: loc.conf});
                            if (loc.name !== locObject.name && locObject.alternates.indexOf(loc.name) < 0) {
                                locObject.alternates.push(loc.name);
                            }
                        }
                    })
                }
                docIndex++;
            });

            // Transform key-value array to regular array so it can be sorted
            var locationsWithoutKey = [];
            for(coords in locations) {
                locationsWithoutKey.push(locations[coords]);
            }
            locationsWithoutKey.sort(function(a, b) {
                return (b.occurences.length - a.occurences.length)
            });

            // Keep only the most common location up to maxResults number
            var locationsResults = locationsWithoutKey.splice(0, maxResults);

            var textsResults = [];

            // Place all occurences of most common locations in an array and sort them by their order of appearance
            locationsResults.forEach(function(location) {
                location.occurences.forEach(function(entry) {
                    entries.push(entry);
                    if(!textsResults[entry.docIndex]){
                        textsResults[entry.docIndex] = texts[entry.docIndex];
                    }
                });
            });
            entries.sort(function(a, b) {
                var x = a.docIndex - b.docIndex;
                return x == 0? a.offset - b.offset : x;
            });
            var results = {locations: locationsResults, entries: entries, texts: textsResults};

            // return both lists as a JSON string
            return resultsJson = JSON.stringify(results);
        })
    },
    // Called when the filter button is pressed
    filter: function(filterId, author, title, yearBegin, yearEnd) {
        author = typeof author !== 'undefined' ? author : "";
        title = typeof title !== 'undefined' ? title : "";
        yearBegin = typeof yearBegin !== 'undefined' ? yearBegin : "";
        yearEnd = typeof yearEnd !== 'undefined' ? yearEnd : "";
        var timedEvents = this.getTimedEvents(), cities = this.getCities(),
            map = this.getMap(), colors = this.getColors();

        timedEvents[filterId].forEach(function(event) { window.clearTimeout(event)});
        cities[filterId] = [];
        var citiesLayer = map.getLayer("cities" + filterId);
        citiesLayer.getSource().clear();
        var vectorLayer = map.getLayer("layer" + filterId);
        vectorLayer.setVisible(true);
        vectorLayer.getSource().clear();
        var panel = this;
        map.getView().on("change:resolution",function () {
            citiesLayer.getSource().getFeatures().forEach(function(feature) {
                var zoom = map.getView().getZoom();
                var width = 5 + Math.sqrt(feature.get("occurences").length/parseFloat(panel.getTotalEntries()) * panel.getSizeRatio());
                feature.set("width", width);
                feature.set("visible", width * zoom > panel.getZoomTreshold());
            });
            panel.generateTravels(filterId);
        });
        this.serverSideFiltering(author, title, yearBegin, yearEnd, this.getMaxResults()).then(function(results) {return JSON.parse(results)}).then(function(results) {
            console.log(results);
            panel.setTexts(results.texts);
            nbOfEntries = panel.getNbOfEntries();
            nbOfEntries[filterId] = results.entries.length;
            var totalEntries = 0;
            nbOfEntries.forEach(function(entries) {totalEntries += entries});
            panel.setTotalEntries(totalEntries);
            coordinatesSequence = panel.getCoordinatesSequence();
            coordinatesSequence[filterId] = results.entries;
            results.locations.forEach(function(location) {
                var coordinates = [parseFloat(location.coordinates[1]), parseFloat(location.coordinates[0])];
                var circle = new ol.geom.Circle(coordinates);
                circle.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                var color = colors[filterId];
                var feature = new ol.Feature({
                    geometry: circle,
                    description: location.name,
                    alternates: location.alternates,
                    text: location.name + "(" + location.occurences.length + ")",
                    finished: true,
                    occurences: location.occurences,
                    color: color,
                    filterId: filterId,
                    coordinates: coordinates
                });
                citiesLayer.getSource().addFeature(feature);
                cities[filterId][coordinates] = feature;
            });
        }).then(function() {
            // Trigger calculation if feature sizes
            var resolution = map.getView().getResolution() + 1;
            map.getView().setResolution(resolution);
            // Adjust view to show newly filtered citiesç
            if(citiesLayer.getSource().getFeatures().length > 0){
                map.getView().fit(citiesLayer.getSource().getExtent())
            }
            panel.animateLayer(filterId);
        });
        //document.getElementById("showHideButton" + filterId).disabled = false;
        //document.getElementById("showHideCitiesButton" + filterId).disabled = false;
        //var button = document.getElementById("animateButton"+filterId);
        //button.disabled = false;
        //button.innerText = "Animate";
        //button.onclick = () => animateLayer(filterId);
    },

    // Called when the Add Filter button is pressed. Create new fields and layer.
    addFilter: function() {
        var timedEvents = this.getTimedEvents(), filterCount = this.getFilterCount();
        map = this.getMap();
        var filters = this.getFilters();
        filters[filterCount] = {};
        timedEvents[filterCount] = [];

        var filterLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: true // needed to call getExtent()
            }),
            id: "layer" + filterCount,
            visible: false,
            opacity: 0.4,
            style: this.travelStyleFunction.bind(this),
            updateWhileAnimating: false, // optional, for instant visual feedback
            updateWhileInteracting: false // optional, for instant visual feedback
        });
        map.addLayer(filterLayer);

        var citiesLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: true // needed to call getExtent()
            }),
            id: "cities" + filterCount,
            opacity: 0.7,
            style: this.cityStyleFunction.bind(this)
        });
        map.addLayer(citiesLayer);

        var animationLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: true // needed to call getExtent()
            }),
            id: "animation" + filterCount,
            style: null
        });
        map.addLayer(animationLayer);

        /*
        var para = document.createElement("div");
        para.id = "filter" + filterCount;
        para.style.color = colors[filterCount];
        para.innerHTML = `<label for="author${filterCount}">Author :</label>
                <input type="text" id="author${filterCount}">
                <label for="title${filterCount}">Title :</label>
                <input type="text" id="title${filterCount}">
                <label for="yearBegin${filterCount}">Between :</label>
                <input type="number" id="yearBegin${filterCount}">
                <label for="yearEnd${filterCount}">and :</label>
                <input type="number" id="yearEnd${filterCount}">
                <button onclick="filter(${filterCount})">Filter</button>
                <button onclick="clearFilter(${filterCount})">Clear</button>
                <button onclick="toggleTravelsVisibility(${filterCount})" disabled id="showHideButton${filterCount}">Show travels</button>
                <button onclick="toggleCitiesVisibility(${filterCount})" disabled id="showHideCitiesButton${filterCount}">Show cities</button>
                <button onclick="animateLayer(${filterCount})" disabled id="animateButton${filterCount}">Animate</button>`;
        var element = document.getElementById("filters");
        element.appendChild(para);
        */
        this.setFilterCount(filterCount+1);
        this.filter(filterCount);
    },
    generateTravels: function (filterId) {
        var cities = this.getCities();
        if(Object.keys(cities[filterId]).length > 0){
            var vectorLayer = map.getLayer("layer" + filterId);
            vectorLayer.getSource().clear();
            var travels = this.getTravels();
            travels[filterId] = [];
            var previousCoordinates = undefined;
            var foundStart = false;
            var previousEntry = undefined;
            for (var i = 0; i < coordinatesSequence[filterId].length; i++) {
                var entry = coordinatesSequence[filterId][i];
                if (!foundStart) {
                    previousCoordinates = [entry.coordinates[1], entry.coordinates[0]];
                    if (cities[filterId][previousCoordinates].get("visible")) {
                        previousEntry = entry;
                        foundStart = true;
                    }
                } else {
                    var coordinates = [entry.coordinates[1], entry.coordinates[0]];
                    var key = [previousCoordinates, coordinates];
                    if ((previousCoordinates[0] !== coordinates[0] || previousCoordinates[1] !== coordinates[1]) &&
                        cities[filterId][coordinates].get("visible")) {
                        if (!travels[filterId][key]) {
                            var previousCity = cities[filterId][previousCoordinates].get("description");
                            var nextCity = cities[filterId][coordinates].get("description");
                            var description = previousCity+'-'+nextCity;
                            // create an arc circle between the two locations
                            var arcGenerator = new arc.GreatCircle(
                                {x: previousCoordinates[0], y: previousCoordinates[1]},
                                {x: coordinates[0], y: coordinates[1]});

                            var arcLine = arcGenerator.Arc(this.getPointsPerArc(), {offset: 100});
                            arcLine.geometries.forEach(function(geometry) {
                                var line = new ol.geom.LineString(geometry.coords);
                                line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                                var colors = this.getColors();
                                var color = colors[filterId];
                                var feature = new ol.Feature({
                                    geometry: line,
                                    description: description,
                                    text: description + "(1)",
                                    finished: true,
                                    occurences: [{from: previousEntry, to: entry}],
                                    color: color,
                                    filterId: filterId,
                                    start: previousCoordinates,
                                    end: coordinates
                                });
                                vectorLayer.getSource().addFeature(feature);
                                travels[filterId][key] = feature;
                            }, this);
                            previousCoordinates = coordinates;
                            previousEntry = entry;
                        } else {
                            var occurences = travels[filterId][key].get("occurences");
                            occurences.push({from: previousEntry, to: entry});
                            var text = travels[filterId][key].get("description") + "(" + occurences.length + ")";
                            travels[filterId][key].set("text", text);
                        }

                    }
                }
            }
        }
    },
    // Called when the animate button is pressed
    animateLayer: function(filterId) {
        var timedEvents = this.getTimedEvents(), map = this.getMap();
        timedEvents[filterId].forEach(function(event) {window.clearTimeout(event)});
        var filterLayer = map.getLayer("layer" + filterId);
        var i = 0;
        var crossedDateLine = false;
        var secondPartDelay = 0;
        filterLayer.getSource().getFeatures().forEach( function(feature) {
            var animationFeature = new ol.Feature({
                geometry: feature.getGeometry(),
                color: feature.get("color"),
                finished: false
            });
            var delayBetweenVectors = this.getDelayBetweenVectors();
            // This fixes animation for travels crossing the date line
            if(animationFeature.getGeometry().getCoordinates().length < this.getPointsPerArc()) {
                if (crossedDateLine) {
                    crossedDateLine = false;
                    this.addLater(animationFeature, secondPartDelay, filterId);
                    i++;
                } else {
                    this.addLater(animationFeature, i * delayBetweenVectors, filterId);
                    crossedDateLine = true;
                    secondPartDelay = i * delayBetweenVectors + animationFeature.getGeometry().getCoordinates().length / this.getPointsPerMs();
                }
            } else {
                this.addLater(animationFeature, i * delayBetweenVectors, filterId);
                i++;
            }
        }, this);
        map.on('postcompose', function(event) {
            this.animateTravels(event, filterId);
        }, this);
//        var button = document.getElementById("animateButton"+filterId);
//        button.innerText = "Stop";
//        button.onclick = () => stopAnimation(filterId);
//        // event to swich back button to animate once animation is done
//        var restoreAnimate = window.setTimeout(() => {
//            button.innerText = "Animate";
//            button.onclick = () => animateLayer(filterId);
//        }, delayBetweenVectors * (filterLayer.getSource().getFeatures().length - 1) );
//        timedEvents[filterId].push(restoreAnimate);
    }
});