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
            cities: "Cities",
            connections: "Connections",
            animations: "Animations",
            animate: "Animate",
            add: "Add Filter",
            allNCitiesShown: "All {0} available cities shown.",
            citiesMaxCount: "maximum count",
            citiesMinPopulation: "minimum population",
            citiesMinFreq: "minimum occurrences",
            connectionsMaxCount: "maximum count",
            connectionsMinFreq: "minimum occurrences",
            millisPerAnimation: "milliseconds per animation"
        },
        api: {
            stopList: 'auto',
            hide: [],
            author: undefined,
            title: undefined,
            keyword: undefined,
            pubDate: undefined,
            citiesMaxCount: 500,
            minPopulation: 10000,
            citiesMinFreq: 1,
            connectionsMaxCount: 2500,
            connectionsMinFreq: 1,
            millisPerAnimation: 2000
        },
        glyph: 'xf124@FontAwesome'
    },
    config: {
        map: undefined, // OL object, should be set during init
        overlay: undefined, // OL object, should be set during init
        contentEl: undefined, // EXTJS Element, where info is shown
        isOpenLayersLoaded: false,
        isArcLoaded: false,
        animationDelay: 25, // determines the delay between animation calls

        filterWidgets: new Ext.util.MixedCollection()
    },

    html: '<div class="map"></div><div class="ticker"></div>',

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
        this.mixins['Voyant.util.Api'].constructor.apply(this, arguments); // we need api
        var hide = this.getApiParam("hide");
        if (Ext.isString(hide)) {
            hide = hide.split(',');
            this.setApiParam('hide');
        }
        Ext.apply(this, {
            title: this.localize('title'),
            bodyBorder: true,
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                itemId: 'bottomToolbar',
                overflowHandler: 'scroller',
                items: [
                    {
                        text: this.localize('show'),
                        tooltip: this.localize('showTip'),
                        menu: {
                            defaults: {
                                xtype: 'menucheckitem',
                                checkHandler: function(item, checked) {
                                    var map = this.getMap(), id = item.getItemId();
                                    this.getFilterWidgets().each(function(filter) {
                                        map.getLayer(filter.getId()+"-"+id).setVisible(checked);
                                    })
                                    var hide = Ext.Array.from(this.getApiParam('hide'));
                                    if (checked) {
                                        hide = Ext.Array.remove(hide, id);
                                    } else {
                                        hide.push(id);
                                        hide = Ext.Array.unique(hide);
                                    }
                                    this.setApiParam("hide", hide);
                                    item.getMenu().setDisabled(checked==false);
                                },
                                scope: this,
                                checked: true
                            },
                            items: [{
                                text: this.localize('cities'),
                                checked: Ext.Array.contains(hide, "cities")==false,
                                itemId: 'cities',
                                menu: {
                                    defaults: {
                                        labelAlign: 'right',
                                        labelWidth: 140
                                    },
                                    items: [{
                                        xtype: 'numberfield',
                                        fieldLabel: this.localize('citiesMaxCount'),
                                        minValue: 1,
                                        value: parseInt(this.getApiParam('citiesMaxCount')),
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    this.setApiParam('citiesMaxCount', newVal);
                                                    var currentCitiesCount = filter.getGeonames().getCitiesCount();
                                                    if (newVal<oldVal || newVal<=currentCitiesCount) {
                                                        this.filterUpdate(filter);
                                                    } else if (filter.getGeonames().hasMoreCities()) {
                                                        filter.loadGeonames()
                                                    } else {
                                                        cmp.setValue(currentCitiesCount); // will call change
                                                        this.toastInfo(new Ext.XTemplate(this.localize("allNCitiesShown")).apply([currentCitiesCount]))
                                                    }
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    },{
                                        xtype: 'numberfield',
                                        fieldLabel: this.localize('citiesMinPopulation'),
                                        minValue: 1,
                                        value: parseInt(this.getApiParam('minPopulation')),
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    this.setApiParam('minPopulation', newVal);
                                                    if (newVal>oldVal) {
                                                        this.filterUpdate(filter);
                                                    } else {
                                                        filter.loadGeonames()
                                                    }
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    },{
                                        xtype: 'numberfield',
                                        fieldLabel: this.localize('citiesMinFreq'),
                                        minValue: 1,
                                        value: parseInt(this.getApiParam('citiesMinFreq')),
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    this.setApiParam('citiesMinFreq', newVal);
                                                    if (newVal>oldVal) {
                                                        this.filterUpdate(filter);
                                                    } else {
                                                        filter.loadGeonames()
                                                    }
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    }]
                                }
                            },{
                                text: this.localize('connections'),
                                checked: Ext.Array.contains(hide, "connections")==false,
                                itemId: 'connections',
                                menu: {
                                    defaults: {
                                        labelWidth: 140,
                                        labelAlign: 'right'
                                    },
                                    items: [{
                                        xtype: 'numberfield',
                                        fieldLabel: this.localize('connectionsMaxCount'),
                                        minValue: 1,
                                        value: parseInt(this.getApiParam('connectionsMaxCount')),
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    this.setApiParam('connectionsMaxCount', newVal);
                                                    if (newVal>oldVal) {
                                                        this.filterUpdate(filter);
                                                    } else {
                                                        filter.loadGeonames()
                                                    }
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    },{
                                        xtype: 'numberfield',
                                        fieldLabel: this.localize('connectionsMinFreq'),
                                        minValue: 1,
                                        value: parseInt(this.getApiParam('connectionsMinFreq')),
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    this.setApiParam('connectionsMinFreq', newVal);
                                                    if (newVal>oldVal) {
                                                        this.filterUpdate(filter);
                                                    } else {
                                                        filter.loadGeonames()
                                                    }
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    }]
                                }

                            },{
                                xtype: 'menucheckitem',
                                checked: Ext.Array.contains(hide, "animation")==false,
                                text: this.localize('animations'),
                                itemId: 'animation',
                                menu: {
                                    defaults: {
                                        labelWidth: 170,
                                        labelAlign: 'right',
                                        width: 280
                                    },
                                    items: [{
                                        xtype: 'sliderfield',
                                        fieldLabel: this.localize('millisPerAnimation'),
                                        value: parseInt(this.getApiParam('millisPerAnimation')),
                                        minValue: this.getAnimationDelay(),
                                        maxValue: 10000,
                                        listeners: {
                                            change: function(cmp, newVal, oldVal) {
                                                this.getFilterWidgets().each(function(filter) {
                                                    filter.setMillisPerAnimation(newVal);
                                                    filter.animate();
                                                }, this);
                                            },
                                            scope: this
                                        }
                                    }]
                                }
                            }]
                        }
                    },'-', {
                        text: this.localize('add'),
                        itemId: 'addFilter',
                        handler: function(cmp) {
                            var colors = this.getApplication().getColorPalette(undefined, true),
                                color = colors[0]; // default to first

                            // find an available color
                            for (var i=0, len=colors.length; i<len; i++) {
                                var hasMatch = false;
                                this.getFilterWidgets().each(function(filter) {
                                    if (filter.getColor()==colors[i]) {
                                        hasMatch = true;
                                        return false;
                                    }
                                })
                                if (hasMatch==false) {
                                    color = colors[i];
                                    break;
                                }
                            }
                            var filter = cmp.ownerCt.add({
                                xtype: 'geonamesfilter',
                                corpus: this.getCorpus(),
                                color: color,
                                listeners: {
                                    removeFilterWidget: function(filter) {
                                        var map = this.getMap(), id = filter.getItemId(), filters = this.getFilterWidgets();
                                        ["connections","cities","animation"].forEach(function(layer) {
                                            map.removeLayer(map.getLayer(id+"-"+layer));
                                        })
                                        filters.remove(filter);
                                        if (filters.getCount()==0) { // we always want at least one filter
                                            // simulate adding a filter
                                            this.getDockedComponent('bottomToolbar').getComponent('addFilter').click();
                                        }
                                    },
                                    filterUpdate: this.filterUpdate,
                                    scope: this
                                }
                            })
                            this.getFilterWidgets().add(filter.getId(), filter);

                            var map = this.getMap();

                            var connectionsLayer = new ol.layer.Vector({
                                source: new ol.source.Vector({
                                    wrapX: false,
                                    useSpatialIndex: true // needed to call getExtent()
                                }),
                                id: filter.getId()+"-connections",
                                visible: true,
                                opacity: 0.2,
                                style: this.travelStyleFunction.bind(this),
                                updateWhileAnimating: true, // optional, for instant visual feedback
                                updateWhileInteracting: true // optional, for instant visual feedback
                            });
                            map.addLayer(connectionsLayer);

                            var citiesLayer = new ol.layer.Vector({
                                source: new ol.source.Vector({
                                    wrapX: false,
                                    useSpatialIndex: true // needed to call getExtent()
                                }),
                                id: filter.getId()+"-cities",
                                opacity: 0.5,
                                style: this.cityStyleFunction.bind(this)
                            });
                            map.addLayer(citiesLayer);

                            var animationLayer = new ol.layer.Vector({
                                source: new ol.source.Vector({
                                    wrapX: false,
                                    useSpatialIndex: true // needed to call getExtent()
                                }),
                                id: filter.getId()+"-animation",
                                style:  this.animationStyleFunction.bind(this)
                            });
                            map.addLayer(animationLayer);
                        },
                        scope: this
                    }]
            }]
        });

        this.on("loadedCorpus", function(src, corpus) {
            this.tryInit();
        }, this);

        this.callParent();
    },

    tryInit: function() {
        if (this.getIsOpenLayersLoaded() && this.getIsArcLoaded()) {

            var el = this.body.down('.map').setId(Ext.id());
            var ticker = this.body.down(".ticker");
            ticker.setTop(this.getTargetEl().getHeight()-ticker.getHeight()-4)

            var panel = this;
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
                view: new ol.View({
                    center: [1500000, 6000000],
                    maxResolution: 40075016.68557849 / panel.body.dom.offsetWidth,
                    zoom: 0
                })
            });

            // Add a click handler to the map to render the popup
            map.on('singleclick', function(event) {
                var pixel = event.pixel;
                var features = map.getFeaturesAtPixel(pixel);
                if(features) {
                    features.forEach( function(feature) {
                        if( feature.getGeometry().getType() === "Circle" && feature.get("selected")) { // city
                            panel.dispatchEvent("termsClicked", panel, [feature.get("forms").join("|")])
                        }
                    }, this);
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
                            forms: feature.get("forms"),
                            selected: true,
                            coordinates: feature.get("coordinates"),
                            width: feature.get("width"),
                            visible: feature.get("visible"),
                            color: feature.get("color")
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

                        // Highlight all connection where selected city is source or target
                        if(geometry.getType() === "Circle") {
                            var layers = panel.getMap().getLayers();
                            layers.forEach(function (layer) {
                                var layerId = layer.get("id");
                                if (layerId && layerId.indexOf("connections") !== -1) {
                                    connections = layer.getSource().getFeatures();
                                    connections.forEach(function (connection) {
                                        if(connection.get("target") === feature.get("cityId") || connection.get("source") === feature.get("cityId")) {
                                            selectedLayer.getSource().addFeature(new ol.Feature({
                                                geometry: connection.getGeometry(),
                                                selected: true,
                                                coordinates: connection.get("coordinates"),
                                                width: connection.get("width"),
                                                visible: connection.get("visible"),
                                                color: connection.get("color")
                                            }));
                                        }
                                    })
                                }
                            })
                        }
                    }

                }
            });

            this.setMap(map);

            // simulate adding a filter
            this.getDockedComponent('bottomToolbar').getComponent('addFilter').click();

            //this.addFilter();
        } else {
            Ext.defer(this.tryInit, 500, this); // try again in a half second
        }
    },

    // Style for vector after animation
    travelStyleFunction: function(feature, resolution) {

        var stroke = new ol.style.Stroke({
            color: feature.get('color'),
            width: feature.get('width')
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
        if(feature.get("visible")) {
            return (new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: feature.get("color"),
                    width: feature.get("width")
                })
            }));
        } else {
            return false;
        }
    },

    // Style for vector during animation
    animationStyleFunction: function (feature) {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: feature.get("color"),
                width: 5
            })
        }), new ol.style.Style({
            geometry: new ol.geom.Circle(feature.getGeometry().getFirstCoordinate()),
            stroke: new ol.style.Stroke({
                color: "white",
                width: 10
            })
        }), new ol.style.Style({
            geometry: new ol.geom.Circle(feature.getGeometry().getLastCoordinate()),
            stroke: new ol.style.Stroke({
                color: "white",
                width: 10
            })
        })];
    },

    showTermInCorpus: function(docIndex, position, location) {
        var term = Ext.create("Voyant.data.model.Context", {
            docIndex: docIndex,
            position: position,
            term: location
        });
        this.getApplication().dispatchEvent('termLocationClicked', this, [term]);
    },

    filterUpdate: function(filter) {

        filter.clearAnimation();

        var map = this.getMap(), color = filter.getColor();

        var citiesMaxCount = parseInt(this.getApiParam("citiesMaxCount"));

        // determine max rawFreq for sizing
        var max = 0;
        filter.getGeonames().eachCity(function(city) {if (city.rawFreq>max) {max=city.rawFreq;}}, this, citiesMaxCount);

        // generate cities
        var layerSource = map.getLayer(filter.getId()+"-cities").getSource();

        var hide = Ext.Array.from(this.getApiParam("hide"));

        layerSource.clear();
        var minPopulation = parseInt(this.getApiParam("minPopulation"));
        var citiesMinFreq = parseInt(this.getApiParam("citiesMinFreq"));
        var validCitiesHash = {};
        filter.getGeonames().eachCity(function(city) {
            if ((!minPopulation || city.population>=minPopulation) && (!citiesMinFreq || city.rawFreq>=citiesMinFreq)) {
                validCitiesHash[city.id]=true;
                var coordinates = [parseFloat(city.longitude), parseFloat(city.latitude)]
                var feature = new ol.Feature({
                    geometry: new ol.geom.Circle(coordinates).transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857')),
                    text: city.label + " ("+city.rawFreq+")",
                    description: city.label,
                    color: color,
                    selected: false,
                    width: 3+ (Math.sqrt(city.rawFreq/max)*20),
                    visible: true,
                    coordinates: coordinates,
                    forms: city.forms,
                    cityId: city.id
                });
                layerSource.addFeature(feature);
            }
        }, this, citiesMaxCount);

        if (layerSource.getFeatures().length>0) {
            map.getView().fit(layerSource.getExtent());
        }

        map.getLayer(filter.getId()+"-cities").setVisible(Ext.Array.contains(hide, "cities")==false);

        layerSource = map.getLayer(filter.getId()+"-connections").getSource();
        layerSource.clear();

        if (Object.keys(validCitiesHash).length==0) {
            this.toastInfo("No cities available for current criteria.");
        }

        max = 0;
        filter.getGeonames().eachConnection(function(connection) {
            if (connection.rawFreq>max) {max=connection.rawFreq;}
        }, this);

        // we'll go through all collections to see if we have valid cities
        var counter = 0,
            maxConnectionsCount = parseInt(this.getApiParam('connectionsMaxCount')),
            connectionsMinFreq = parseInt(this.getApiParam('connectionsMinFreq'));
        filter.getGeonames().eachConnection(function(connection) {
            if ((!connectionsMinFreq || connection.rawFreq>=connectionsMinFreq) && (!maxConnectionsCount || counter<maxConnectionsCount) && connection.source.id in validCitiesHash && connection.target.id in validCitiesHash && (!minPopulation || (connection.source.population>=minPopulation && connection.target.population>=minPopulation))) {
                var arcGenerator = new arc.GreatCircle(
                    {x: connection.source.longitude, y: connection.source.latitude},
                    {x: connection.target.longitude, y: connection.target.latitude});
                var arcLine = arcGenerator.Arc(100, {offset: 100});
                var label = connection.source.label+" -> "+connection.target.label + " ("+connection.rawFreq+")"
                arcLine.geometries.forEach(function(geometry) {
                    var line = new ol.geom.LineString(geometry.coords);
                    line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                    var feature = new ol.Feature({
                        geometry: line,
                        text: label,
                        color: color,
                        width: 3+ (Math.sqrt(connection.rawFreq/max)*10),
                        source: connection.source.id,
                        target: connection.target.id
                    });
                    layerSource.addFeature(feature);
                }, this);
                counter++;
            }
        }, this);

        map.getLayer(filter.getId()+"-connections").setVisible(Ext.Array.contains(hide, "connections")==false)

        //filter.animate();

    }

});

Ext.define('Voyant.widget.GeonamesFilter', {
    extend: 'Ext.Button',
    xtype: 'geonamesfilter',
    mixins: ['Voyant.util.Localization'],
    statics: {
        i18n: {
            filter: 'Filter',
            authorLabel: 'authors',
            titleLabel: 'titles',
            loading: "Loading geographical information…",
//            loadedAll: "All available cities and connections have been loaded (see options under the <i>Show</i> menu in the toolbar).",
//            loadedSome: "Loaded {currentCitiesCount} of {totalCitiesCount} available locations and {currentConnectionsCount} of {totalConnectionsCount} available connections (see options under the <b>Show</b> menu in the toolbar).",
//            disclaimer: "Please note that geographical information is generated automatically and may be inaccurate (<a href='{url}' target='_blank'>more information</a>).</p>",
            disclaimer: "This is an experimental tool and the accuracy of the data is variable (<a href='{url}' target='_blank'>see help</a>).",
            noDataForField: "No data seems to be available for this field so it will be disabled.",
            close: "Close"
        }
    },
    config: {
        corpus: undefined, // used by querysearchfields among other things
        geonames: undefined,
        color: "#f00",
        timeout: undefined,
        currentConnectionOccurrence: undefined,
        animationLayer: undefined,
        millisPerAnimation: 2000,
        stepByStepMode: false
    },
    constructor: function(config) {
        config = config || {};
        var geonames = new Voyant.data.util.Geonames({
            corpus: config.corpus
        });
        this.setGeonames(geonames);
        var me = this;
        Ext.applyIf(config,
            {
                tooltip: this.localize('filterTip'),
                style: "background-color: white; color: "+config.color,
                glyph: 'xf0b0@FontAwesome',
                menu: {
                    defaults: {
                        xtype: 'querysearchfield',
                        labelWidth: 60,
                        labelAlign: 'right',
                        width: 250,
                        maxWidth: 250,
                        listeners: { // don't set scope to this so that load keeps the widget scope

                            change: function(cmp, vals) {
                                me.loadGeonames();
                            },
                            load: function(store, records, success, operation) {
                                if (records.length==0 && operation.getParams().query=="") {
                                    Ext.Msg.show({
                                        buttonText: {ok: me.localize('close')},
                                        icon: Ext.MessageBox.INFO,
                                        message: me.localize("noDataForField"),
                                        buttons: Ext.Msg.OK
                                    });
                                    this.disable();
                                }
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
                    }, {
                        xtype: 'button',
                        text: 'remove',
                        scope:this,
                        handler: function(cmp) {
                            // assumes coupling with dreamscape
                            this.fireEvent("removeFilterWidget", this);
                            cmp.ownerCt.ownerCmp.destroy();
                        }
                    }, {
                        xtype: 'button',
                        text: 'Play',
                        scope:this,
                        handler: function(cmp) {
                            // assumes coupling with dreamscape
                            this.animate();
                        }
                    }, {
                        xtype: 'button',
                        text: 'Stop/Reset',
                        scope:this,
                        handler: function(cmp) {
                            this.getAnimationLayer().getSource().clear();
                            this.clearAnimation();
                            this.setCurrentConnectionOccurrence(this.getGeonames().getConnectionOccurrence(0));
                        }
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: 'Connection nb',
                        minValue: 0,
                        // TODO bind value to index of current connections so it changes when updated
                        value:0,
                        listeners: {
                            change: function(cmp, newVal, oldVal) {
                                this.setCurrentConnectionOccurrence(this.getGeonames().getConnectionOccurrence(newVal));
                                this.animate();
                            },
                            scope: this
                        }
                    },{
                        xtype: 'button',
                        text: me.getStepByStepMode()?'Continuous Mode':'Step-by-Step Mode',
                        handler: function(cmp) {
                            me.setStepByStepMode(!me.getStepByStepMode());
                            me.animate();
                            this.setText(me.getStepByStepMode()?'Continuous Mode':'Step-by-Step Mode');
                        }
                    }]
                }
            });
        this.callParent([config]);
        this.on("afterrender", function(cmp) {
            cmp.getTargetEl().down('.x-btn-glyph').setStyle('color', this.getColor());
            var panel = cmp.up("panel")
            panel.mask(cmp.localize("loading"));
            cmp.loadGeonames().then(function(geonames) {
                panel.unmask();
                if (panel.getFilterWidgets().getCount()==1) {
                    var currentCitiesCount = geonames.getCitiesCount(),
                        totalCitiesCount = geonames.getTotalCitiesCount(),
                        currentConnectionsCount = geonames.getConnectionsCount(),
                        totalConnectionsCount = geonames.getTotalConnectionsCount();
                    message = cmp.localize(currentCitiesCount==totalCitiesCount && currentConnectionsCount==totalConnectionsCount ? "loadedAll" : "loadedSome") +
                        "<br><br>"+cmp.localize("disclaimer");
                    panel.toastInfo({
//        				autoCloseDelay: 5000,
                        closable: true,
                        maxWidth: '90%',
                        html: new Ext.Template(cmp.localize("disclaimer")).apply({
                            currentCitiesCount: currentCitiesCount,
                            totalCitiesCount: totalCitiesCount,
                            currentConnectionsCount: currentConnectionsCount,
                            totalConnectionsCount: totalConnectionsCount,
                            url: panel.getBaseUrl()+"docs/#!/guide/dreamscape"
                        })

                    });
                }
            })
        }, this);
    },
    loadGeonames: function(params) {
        var me = this;
        params = params || {};

        // add queries
        var queries  = [];
        this.query('querysearchfield').forEach(function(querysearchfield) {
            var id = querysearchfield.getItemId();
            querysearchfield.getValue().forEach(function(query) {
                queries.push(id+":"+query);
            })
        });
        if (queries.length>0 && !("query" in params)) {params.query=queries;}

        // add params from tool
        var panel  = this.up('panel');
        if (panel && panel.getApiParams) {
            Ext.applyIf(params, panel.getApiParams(["minPopulation","connectionsMaxCount","connectionsMinFreq"]))
        }

        this.mask("…");
        var geonames = this.getGeonames();
        return geonames.load(params).then(function() {
            me.unmask();
            me.fireEvent("filterUpdate", me, geonames);
            return geonames;
        });
    },

    clearAnimation: function() {
        if (this.getTimeout()) {clearTimeout(this.getTimeout());}
    },

    animate: function() {
        this.clearAnimation();
        var currentConnectionOccurrence = this.getCurrentConnectionOccurrence();
        if (currentConnectionOccurrence) {
            var animationLayer = this.getAnimationLayer();
            if (!animationLayer) {
                animationLayer = this.up('panel').getMap().getLayer(this.getId()+"-animation");
                this.setAnimationLayer(animationLayer);
            }
            if (animationLayer) {
                var features = animationLayer.getSource().getFeatures();
                if (features.length==0) {
                    var panel =  this.up('panel');
                    if (!panel) {return;}
                    var connectionsLayerSource = panel.getMap().getLayer(this.getId()+"-connections").getSource();
                    var connectionsFeatures = connectionsLayerSource.getFeatures();
                    var hasMatch = false;
                    for (var i=0, len=connectionsFeatures.length; i<len; i++) {
                        if (currentConnectionOccurrence.source.id==connectionsFeatures[i].get("source") && currentConnectionOccurrence.target.id==connectionsFeatures[i].get("target")) {
                            hasMatch = true;
                            break;
                        }
                    }
                    if (hasMatch) {
                        var arcGenerator = new arc.GreatCircle(
                            {x: currentConnectionOccurrence.source.longitude, y: currentConnectionOccurrence.source.latitude},
                            {x: currentConnectionOccurrence.target.longitude, y: currentConnectionOccurrence.target.latitude});
                        var arcLine = arcGenerator.Arc(100, {offset: 100});
                        var label = currentConnectionOccurrence.source.label+" -> "+currentConnectionOccurrence.target.label;
                        arcLine.geometries.forEach(function(geometry) {
                            var line = new ol.geom.LineString([]); // can be empty since we generate a line during next animate call
                            line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                            var feature = new ol.Feature({
                                geometry: line,
                                allcoords: geometry.coords ,
                                text: label,
                                color: this.getColor(),
                                width: 5,
                                start: new Date().getTime()
                            });
                            animationLayer.getSource().addFeature(feature);
                        }, this);
                        var ticker = panel.body.down(".ticker");

                        panel.body.down(".ticker").setHtml(
                            currentConnectionOccurrence.source.left+" <span class='keyword'>"+currentConnectionOccurrence.source.middle+"</span> "+currentConnectionOccurrence.source.right+" … "+
                            currentConnectionOccurrence.target.left+" <span class='keyword'>"+currentConnectionOccurrence.target.middle+"</span> "+currentConnectionOccurrence.target.right
                        )
                        return this.setTimeout(setTimeout(this.animate.bind(this), 1));

                    } else {
                        if (!this.getGeonames()) {return;}
                        currentConnectionOccurrence = this.getGeonames().getConnectionOccurrence(currentConnectionOccurrence.index+1);
                        this.setCurrentConnectionOccurrence(currentConnectionOccurrence);
                        animationLayer.getSource().clear();
                        return this.setTimeout(setTimeout(this.animate.bind(this), 1));

                    }
                } else if (features.length>0) {
                    var coords = features[0].getGeometry().getCoordinates(),
                        allcoords = features[0].get("allcoords");
                    if (coords.length<allcoords.length) {
                        var elapsed = new Date().getTime()-features[0].get('start'),
                            len = elapsed*allcoords.length/this.getMillisPerAnimation()
                        line = new ol.geom.LineString(allcoords.slice(0,len));
                        line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                        features[0].set("geometry", line);
                        return this.setTimeout(setTimeout(this.animate.bind(this), 25));

                    }
                    // if we get here, all features should have been changed
                    currentConnectionOccurrence = this.getGeonames().getConnectionOccurrence(currentConnectionOccurrence.index+1);
                    this.setCurrentConnectionOccurrence(currentConnectionOccurrence);
                    animationLayer.getSource().clear();
                    if(!this.getStepByStepMode()) {
                        return this.setTimeout(setTimeout(this.animate.bind(this), 1));
                    }
                }
            }
        } else {
            if (!this.getGeonames()) {return;}
            currentConnectionOccurrence = this.getGeonames().getConnectionOccurrence(0);
            if (currentConnectionOccurrence) {
                this.setCurrentConnectionOccurrence(currentConnectionOccurrence);
                return this.setTimeout(setTimeout(this.animate.bind(this), 1));
            }
        }
    }

});
