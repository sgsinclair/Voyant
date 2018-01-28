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
	    		pubDate: undefined
	    	},
		glyph: 'xf124@FontAwesome'
    },
	config: {
		map: undefined, // OL object, should be set during init
		overlay: undefined, // OL object, should be set during init
		contentEl: undefined, // EXTJS Element, where info is shown
		isOpenLayersLoaded: false,
		isArcLoaded: false,
		
		// Constant that changes how zoomed the map must be for cities with less occurences to appear
		// The higher the value, the sooner small cities will appear
		zoomTreshold: 1000,
		
		// Constant that changes how bigger cities with more occurences are compared to cities with fewer
		// The higher the value, the bigger the difference will be
		sizeRatio: 50000,
    
		nbOfEntries: 0,
    
		// Speed of vectors drawing
		pointsPerMs: 0.3,
		
		pointsPerArc: 500,
		
		// Time between vectors drawing
		delayBetweenVectors: .3 / 500,
		
		// Used to keep track of number of filters
		filterCount: 1,
		
		timedEvents: [[]],
		
		cities: {},

		
		// Colors of the different filters
		colors: [
		    "rgb(230, 25, 75)",
		    "rgb(0,92,49)",
		    "rgb(145, 30, 180)",
		    "rgb(128, 0, 0)",
		    "rgb(0, 0, 128)",
		    "rgb(60, 180, 75)",
		    "rgb(143,124,0)",
		    "rgb(157,204,0)",
		],
		
		

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
    				        let layer = undefined;
    				        this.getLayers().forEach((lyr) => {
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
	    			        			var map = this.getMap().getLayer(item.getItemId()+"1");
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
				        			change: function(cmp, vals) {
				        				console.warn(cmp, vals)
				        			}
				        		}
		                	
		                },
	    					items: [{
		    		        		fieldLabel: this.localize('authorLabel'),
		    		        		tokenType: 'author',
		    		        		itemId: 'author',
		    		        		hidden: true
	            			},{
		    		        		fieldLabel: this.localize('titleLabel'),
		    		        		tokenType: 'title'
	            			},{
		    		        		fieldLabel: this.localize('keywordLabel')
	            			},{
		    		        		xtype: 'multislider',
		    		        		fieldLabel: this.localize('pubDateLabel'),
		    		        		itemId: 'pubDate',
		    		        		hidden: true
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
    			        zoom: 2
    			    })
    			});
    			
    			// Add a click handler to the map to render the popup
        		var panel = this;
    			map.on('singleclick', (event) => {
    			    const pixel = event.pixel;
    			    const features = map.getFeaturesAtPixel(pixel);
    			    if(features) {
    			        let infos = "<ul>";
    			        let i = 0;
    			        while(features[i].get("selected")){
    			            i++;
    			        }
    			        const feature = features[i];
    			        const featureInfos = feature.get("infos");
    			        featureInfos.forEach((info) => {
    			            infos += `<li>${info.author}, <a href=${info.url} target='_blank'>${info.title}</a>, ${info.year}</li>`;
    			        });
    			        const header = feature.get("text");
    			        infos += "</ul>";
    			        const coordinate = event.coordinate;
    			        panel.getContentEl().setHtml(`<h3>${header}</h3>${infos}`);
    			        panel.getOverlay().setPosition(coordinate);
    			    }
    			});
    			
    			// Layer for selected vector
    			const selectedLayer = new ol.layer.Vector({
    			    map: map,
    			    source: new ol.source.Vector({
    			        wrapX: false,
    			        useSpatialIndex: false // optional, might improve performance
    			    }),
    			    zIndex: 10,
    			    selected: true,
    			    style: (feature) => {
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
    			map.on('pointermove', (event) => {
    			    selectedLayer.getSource().clear();
    			    const coordinate = event.coordinate;
    			    const pixel = event.pixel;
    			    const features = map.getFeaturesAtPixel(pixel);
    			    if(features) {
    			        let i = 0;
    			        while(features[i].get("selected") || features[i].getGeometry().getType() !== "Circle"){
    			            i++;
    			            if (i === features.length) break;
    			        }
    			        if (i < features.length) {
    			            const feature = features[i];

    			            const baseTextStyle = {
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

    			            const textOverlayStyle = new ol.style.Style({
    			                text: new ol.style.Text(baseTextStyle),
    			                zIndex: 1
    			            });

    			            const selectedFeature = new ol.Feature({
    			                geometry: feature.getGeometry(),
    			                occurences: feature.get("occurences"),
    			                selected: true,
    			            });
    			            selectedLayer.getSource().addFeature(selectedFeature);
    			            const geometry = feature.getGeometry();
    			            const point = geometry.getClosestPoint(coordinate);
    			            const textFeature = new ol.Feature({
    			                geometry: new ol.geom.Point(point),
    			                selected: true,
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
        let color = "rgb(255, 0, 0)";
        if (feature.get("selected")) {
            color = "rgb(0, 0, 255)";
        } else if (feature.get("color")) {
            color = feature.get("color");
        }

        const stroke = new ol.style.Stroke({
            color: color,
            width: 3
        });

        const styles = [
            new ol.style.Style({
                stroke: stroke
            })];

        // Add arrow at the end of vectors
        const geometry = feature.getGeometry();
        const end = geometry.getLastCoordinate();
        const beforeEnd = geometry.getCoordinateAt(0.9);
        const dx = end[0] - beforeEnd[0];
        const dy = end[1] - beforeEnd[1];
        const rotation = Math.atan2(dy, dx);

        const lineStr1 = new ol.geom.LineString([end, [end[0] - 10 * resolution, end[1] + 10 * resolution]]);
        lineStr1.rotate(rotation, end);
        const lineStr2 = new ol.geom.LineString([end, [end[0] - 10 * resolution, end[1] - 10 * resolution]]);
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
        let color = "rgb(255, 0, 0)";
        if (feature.get("selected")) {
            color = "rgb(0, 0, 255)";
        } else if (feature.get("color")) {
            color = feature.get("color");
        }
        const width = 5 + Math.sqrt(feature.get("occurences")/parseFloat(this.getNbOfEntries()) * this.getSizeRatio());
        if (width * this.getZoomTreshold() > resolution){
            return (new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: width,
                })
            }));
        } else {
            return false;
        }
    },
    
    // Style for vector during animation
    animationStyleFunction: function (feature) {
        let color = "rgb(255, 0, 0)";
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
        const timedEvent = window.setTimeout(() => {
            feature.set('start', new Date().getTime());
            const layer = map.getLayer("animation" + filterId);
            const source = layer.getSource();
            source.addFeature(feature);
        }, timeout);
        this.getTimedEvents()[filterId].push(timedEvent);
    },
    
    // Animate travels for a layer
    animateTravels: function(event, filterId) {
        var map = this.getMap(), panel = this;
        const vectorContext = event.vectorContext;
        const frameState = event.frameState;
        const layer = map.getLayer("animation" + filterId);
        const features = layer.getSource().getFeatures();
        features.forEach( (feature) => {
            if (!feature.get('finished')) {
                if(feature.getGeometry().getType() === "Circle"){
                    feature.set('finished', true);
                } else {
                    // only draw the lines for which the animation has not finished yet
                    const coords = feature.getGeometry().getCoordinates();
                    const elapsedTime = frameState.time - feature.get('start');
                    const elapsedPoints = elapsedTime * panel.getPointsPerMs();

                    if (elapsedPoints >= coords.length) {
                        feature.set('finished', true);
                    }

                    const maxIndex = Math.min(elapsedPoints, coords.length);
                    const currentLine = new ol.geom.LineString(coords.slice(0, maxIndex));
                    vectorContext.setStyle(animationStyleFunction(feature));
                    // directly draw the line with the vector context
                    vectorContext.drawGeometry(currentLine);
                }
            }
        } );
        // tell OpenLayers to continue the animation
        map.render();
    },
    
    // Called when the filter button is pressed
    filter: function(filterId) {
    		var timedEvents = this.getTimedEvents(), cities = this.getCities(),
    			map = this.getMap(), colors = this.getColors();
    		
        timedEvents[filterId].forEach(event => window.clearTimeout(event));
        cities[filterId] = {};
        const citiesLayer = map.getLayer("cities" + filterId);
        citiesLayer.getSource().clear();
        const vectorLayer = map.getLayer("layer" + filterId);
        vectorLayer.setVisible(true);
//        document.getElementById("showHideButton" + filterId).innerText = "Hide travels";
//        document.getElementById("showHideCitiesButton" + filterId).innerText = "Hide cities";
        vectorLayer.getSource().clear();
        const url = this.getBaseUrl()+'resources/dreamscape/cities3.json';
        var panel = this;
        fetch(url).then((response) => response.json()).then((json) => {
            const citiesData = json.cities;
            panel.setNbOfEntries(citiesData.length);
            let previousCity = false;
            citiesData.forEach((city) => {
//                const author = document.getElementById("author" + filterId).value.toLowerCase();
//                const title = document.getElementById("title" + filterId).value.toLowerCase();
//                const yearBegin = document.getElementById("yearBegin" + filterId).value;
//                const yearEnd = document.getElementById("yearEnd" + filterId).value;
//                if(city.infos[0].author.toLowerCase().includes(author) &&
//                    city.infos[0].title.toLowerCase().includes(title) &&
//                    (yearBegin === "" || city.infos[0].year >= yearBegin) &&
//                    (yearEnd === "" || city.infos[0].year <= yearEnd)) {
                    const coordinates = [parseFloat(city.coordinates[1]), parseFloat(city.coordinates[0])];
                    if(!cities[filterId][city.coordinates]) {
                        const circle = new ol.geom.Circle(coordinates);
                        circle.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                        const color = colors[filterId];
                        const feature = new ol.Feature({
                            geometry: circle,
                            text: city.description + "(1)",
                            finished: true,
                            infos: city.infos,
                            color: color,
                            occurences: 1,
                            filterId: filterId
                        });
                        citiesLayer.getSource().addFeature(feature);
                        cities[filterId][city.coordinates] = feature;
                    } else {
                        const feature = cities[filterId][city.coordinates];
                        const occurences = feature.get("occurences") + 1;
                        const infos = feature.get("infos");
                        const text = city.description + "("+occurences+")";
                        infos.push(city.infos[0]);
                        feature.set("occurences", occurences);
                        feature.set("infos", infos);
                        feature.set("text", text);
                    }
                    /**
                    if(previousCity &&
                        (previousCity.coordinates[0] !== coordinates[0] || previousCity.coordinates[1] !== coordinates[1])) {
                        const text = `${previousCity.description}-${city.description}`;
                        // create an arc circle between the two locations
                        const arcGenerator = new arc.GreatCircle(
                            {x: previousCity.coordinates[0], y: previousCity.coordinates[1]},
                            {x: coordinates[0], y: coordinates[1]});

                        const arcLine = arcGenerator.Arc(pointsPerArc, {offset: 100});
                        arcLine.geometries.forEach(geometry => {
                            const line = new ol.geom.LineString(geometry.coords);
                            line.transform(ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
                            const color = colors[filterId];
                            const feature = new ol.Feature({
                                geometry: line,
                                text: text,
                                finished: true,
                                infos: city.infos,
                                color: color
                            });
                            vectorLayer.getSource().addFeature(feature);
                        })
                    }
                    previousCity = {coordinates:coordinates, description: city.description};
                     **/
//                }
            });
            this.animateLayer(filterId);
        });
//        document.getElementById("showHideButton" + filterId).disabled = false;
//        document.getElementById("showHideCitiesButton" + filterId).disabled = false;
//        const button = document.getElementById("animateButton"+filterId);
//        button.disabled = false;
//        button.innerText = "Animate";
//        button.onclick = () => animateLayer(filterId);
    },
    
    // Called when the Add Filter button is pressed. Create new fields and layer.
    addFilter: function() {
    		var timedEvents = this.getTimedEvents(), filterCount = this.getFilterCount();
    			map = this.getMap();
    		
        timedEvents[filterCount] = [];

        const filterLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: false // optional, might improve performance
            }),
            id: "layer" + filterCount,
            visible: false,
            opacity: 0.4,
            style: this.travelStyleFunction.bind(this),
            updateWhileAnimating: false, // optional, for instant visual feedback
            updateWhileInteracting: false // optional, for instant visual feedback
        });
        map.addLayer(filterLayer);

        const citiesLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: false // optional, might improve performance
            }),
            id: "cities" + filterCount,
            opacity: 0.7,
            style: this.cityStyleFunction.bind(this)
        });
        map.addLayer(citiesLayer);

        const animationLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                wrapX: false,
                useSpatialIndex: false // optional, might improve performance
            }),
            id: "animation" + filterCount,
            style: null
        });
        map.addLayer(animationLayer);

        /*
        const para = document.createElement("div");
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
        const element = document.getElementById("filters");
        element.appendChild(para);
        */
        this.setFilterCount(filterCount+1);
        this.filter(filterCount);
    },
    
    // Called when the animate button is pressed
    animateLayer: function(filterId) {
    		var timedEvents = this.getTimedEvents(), map = this.getMap();
        timedEvents[filterId].forEach(event => window.clearTimeout(event));
        const filterLayer = map.getLayer("layer" + filterId);
        let i = 0;
        let crossedDateLine = false;
        let secondPartDelay = 0;
        filterLayer.getSource().getFeatures().forEach( (feature) => {
            const animationFeature = new ol.Feature({
                geometry: feature.getGeometry(),
                color: feature.get("color"),
                finished: false,
            });

            // This fix animation for travels crossing the date line
            if(animationFeature.getGeometry().getCoordinates().length < this.getPointsPerArc()) {
                if (crossedDateLine) {
                    crossedDateLine = false;
                    this.addLater(animationFeature, secondPartDelay, filterId);
                    i++;
                } else {
                    this.addLater(animationFeature, i * delayBetweenVectors, filterId);
                    crossedDateLine = true;
                    secondPartDelay = i * delayBetweenVectors + animationFeature.getGeometry().getCoordinates().length / pointsPerMs;
                }
            } else {
                this.addLater(animationFeature, i * delayBetweenVectors, filterId);
                i++;
            }
        }, this);
        map.on('postcompose', function(event) {
        		this.animateTravels(event, filterId);
        }, this);
//        const button = document.getElementById("animateButton"+filterId);
//        button.innerText = "Stop";
//        button.onclick = () => stopAnimation(filterId);
//        // event to swich back button to animate once animation is done
//        const restoreAnimate = window.setTimeout(() => {
//            button.innerText = "Animate";
//            button.onclick = () => animateLayer(filterId);
//        }, delayBetweenVectors * (filterLayer.getSource().getFeatures().length - 1) );
//        timedEvents[filterId].push(restoreAnimate);
    }
});