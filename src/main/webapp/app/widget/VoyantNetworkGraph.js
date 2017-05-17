Ext.define('Voyant.widget.VoyantNetworkGraph', {
    extend: 'Ext.panel.Panel',
    mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.notebook.util.Embed'],
    embeddable: ['Voyant.widget.VoyantNetworkGraph'],
    alias: 'widget.voyantnetworkgraph',
    statics: {
        i18n: {
        },
        api: {
            jsonData: undefined,
            docId: undefined,
            docIndex: undefined,
            json: undefined
        }
    },
    config: {
        edges: undefined,
        nodes: undefined,
        json: undefined,
        
        vis: undefined, // svg > g el
        visLayout: undefined, // layout algo
        
        nodeSelection: undefined, // d3 selection for nodes
        linkSelection: undefined, // d3 selection for links
        
        currentNode: undefined,
        currentLink: undefined,
        
        scaleExtent: [0.25, 8],
        
        graphStyle: {
    		node: {
    			normal: {
    				fill: '#c6dbef',
    				stroke: '#6baed6'
    			},
    			highlight: {
    				fill: '#9ecae1',
    				stroke: '#3182bd'
    			}
    		},
    		link: {
    			normal: {
    				stroke: '#000000',
    				strokeOpacity: 0.1
    			},
    			highlight: {
    				stroke: '#000000',
    				strokeOpacity: 0.5
    			}
    		}
    	}
    },
    constructor: function(config) {
        config = config || {};
        
        this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
    },
    initComponent: function(config) {
        this.on('boxready', function(src, corpus) {
            this.initGraph();
            this.buildGraph();
        }, this);
        
        this.on('resize', function(panel, width, height) {
            var vis = this.body.down('svg');
            if (vis) {
                var el = this.body;
                var elHeight = el.getHeight();
                var elWidth = el.getWidth();
                vis.dom.setAttribute('width', elWidth);
                vis.dom.setAttribute('height', elHeight);
                this.getVisLayout()
                    .force('center', d3.forceCenter(elWidth/2, elHeight/2))
                    .alpha(1).restart();
            }
        }, this);
        
        this.callParent(arguments);
    },
    
    getJsonResourcefully: function() {
//        return {'nodes': [{'term': 'Myriel', 'group': 1},{'term': 'Napoleon', 'group': 1},{'term': 'Mlle.Baptistine', 'group': 1},{'term': 'Mme.Magloire', 'group': 1},{'term': 'CountessdeLo', 'group': 1},{'term': 'Geborand', 'group': 1},{'term': 'Champtercier', 'group': 1},{'term': 'Cravatte', 'group': 1},{'term': 'Count', 'group': 1},{'term': 'OldMan', 'group': 1},{'term': 'Labarre', 'group': 2},{'term': 'Valjean', 'group': 2},{'term': 'Marguerite', 'group': 3},{'term': 'Mme.deR', 'group': 2},{'term': 'Isabeau', 'group': 2},{'term': 'Gervais', 'group': 2},{'term': 'Tholomyes', 'group': 3},{'term': 'Listolier', 'group': 3},{'term': 'Fameuil', 'group': 3},{'term': 'Blacheville', 'group': 3},{'term': 'Favourite', 'group': 3},{'term': 'Dahlia', 'group': 3},{'term': 'Zephine', 'group': 3},{'term': 'Fantine', 'group': 3},{'term': 'Mme.Thenardier', 'group': 4},{'term': 'Thenardier', 'group': 4},{'term': 'Cosette', 'group': 5},{'term': 'Javert', 'group': 4},{'term': 'Fauchelevent', 'group': 0},{'term': 'Bamatabois', 'group': 2},{'term': 'Perpetue', 'group': 3},{'term': 'Simplice', 'group': 2},{'term': 'Scaufflaire', 'group': 2},{'term': 'Woman1', 'group': 2},{'term': 'Judge', 'group': 2},{'term': 'Champmathieu', 'group': 2},{'term': 'Brevet', 'group': 2},{'term': 'Chenildieu', 'group': 2},{'term': 'Cochepaille', 'group': 2},{'term': 'Pontmercy', 'group': 4},{'term': 'Boulatruelle', 'group': 6},{'term': 'Eponine', 'group': 4},{'term': 'Anzelma', 'group': 4},{'term': 'Woman2', 'group': 5},{'term': 'MotherInnocent', 'group': 0},{'term': 'Gribier', 'group': 0},{'term': 'Jondrette', 'group': 7},{'term': 'Mme.Burgon', 'group': 7},{'term': 'Gavroche', 'group': 8},{'term': 'Gillenormand', 'group': 5},{'term': 'Magnon', 'group': 5},{'term': 'Mlle.Gillenormand', 'group': 5},{'term': 'Mme.Pontmercy', 'group': 5},{'term': 'Mlle.Vaubois', 'group': 5},{'term': 'Lt.Gillenormand', 'group': 5},{'term': 'Marius', 'group': 8},{'term': 'BaronessT', 'group': 5},{'term': 'Mabeuf', 'group': 8},{'term': 'Enjolras', 'group': 8},{'term': 'Combeferre', 'group': 8},{'term': 'Prouvaire', 'group': 8},{'term': 'Feuilly', 'group': 8},{'term': 'Courfeyrac', 'group': 8},{'term': 'Bahorel', 'group': 8},{'term': 'Bossuet', 'group': 8},{'term': 'Joly', 'group': 8},{'term': 'Grantaire', 'group': 8},{'term': 'MotherPlutarch', 'group': 9},{'term': 'Gueulemer', 'group': 4},{'term': 'Babet', 'group': 4},{'term': 'Claquesous', 'group': 4},{'term': 'Montparnasse', 'group': 4},{'term': 'Toussaint', 'group': 5},{'term': 'Child1', 'group': 10},{'term': 'Child2', 'group': 10},{'term': 'Brujon', 'group': 4},{'term': 'Mme.Hucheloup', 'group': 8}], 'links': [{'source': 'Napoleon', 'target': 'Myriel', 'value': 1},{'source': 'Mlle.Baptistine', 'target': 'Myriel', 'value': 8},{'source': 'Mme.Magloire', 'target': 'Myriel', 'value': 10},{'source': 'Mme.Magloire', 'target': 'Mlle.Baptistine', 'value': 6},{'source': 'CountessdeLo', 'target': 'Myriel', 'value': 1},{'source': 'Geborand', 'target': 'Myriel', 'value': 1},{'source': 'Champtercier', 'target': 'Myriel', 'value': 1},{'source': 'Cravatte', 'target': 'Myriel', 'value': 1},{'source': 'Count', 'target': 'Myriel', 'value': 2},{'source': 'OldMan', 'target': 'Myriel', 'value': 1},{'source': 'Valjean', 'target': 'Labarre', 'value': 1},{'source': 'Valjean', 'target': 'Mme.Magloire', 'value': 3},{'source': 'Valjean', 'target': 'Mlle.Baptistine', 'value': 3},{'source': 'Valjean', 'target': 'Myriel', 'value': 5},{'source': 'Marguerite', 'target': 'Valjean', 'value': 1},{'source': 'Mme.deR', 'target': 'Valjean', 'value': 1},{'source': 'Isabeau', 'target': 'Valjean', 'value': 1},{'source': 'Gervais', 'target': 'Valjean', 'value': 1},{'source': 'Listolier', 'target': 'Tholomyes', 'value': 4},{'source': 'Fameuil', 'target': 'Tholomyes', 'value': 4},{'source': 'Fameuil', 'target': 'Listolier', 'value': 4},{'source': 'Blacheville', 'target': 'Tholomyes', 'value': 4},{'source': 'Blacheville', 'target': 'Listolier', 'value': 4},{'source': 'Blacheville', 'target': 'Fameuil', 'value': 4},{'source': 'Favourite', 'target': 'Tholomyes', 'value': 3},{'source': 'Favourite', 'target': 'Listolier', 'value': 3},{'source': 'Favourite', 'target': 'Fameuil', 'value': 3},{'source': 'Favourite', 'target': 'Blacheville', 'value': 4},{'source': 'Dahlia', 'target': 'Tholomyes', 'value': 3},{'source': 'Dahlia', 'target': 'Listolier', 'value': 3},{'source': 'Dahlia', 'target': 'Fameuil', 'value': 3},{'source': 'Dahlia', 'target': 'Blacheville', 'value': 3},{'source': 'Dahlia', 'target': 'Favourite', 'value': 5},{'source': 'Zephine', 'target': 'Tholomyes', 'value': 3},{'source': 'Zephine', 'target': 'Listolier', 'value': 3},{'source': 'Zephine', 'target': 'Fameuil', 'value': 3},{'source': 'Zephine', 'target': 'Blacheville', 'value': 3},{'source': 'Zephine', 'target': 'Favourite', 'value': 4},{'source': 'Zephine', 'target': 'Dahlia', 'value': 4},{'source': 'Fantine', 'target': 'Tholomyes', 'value': 3},{'source': 'Fantine', 'target': 'Listolier', 'value': 3},{'source': 'Fantine', 'target': 'Fameuil', 'value': 3},{'source': 'Fantine', 'target': 'Blacheville', 'value': 3},{'source': 'Fantine', 'target': 'Favourite', 'value': 4},{'source': 'Fantine', 'target': 'Dahlia', 'value': 4},{'source': 'Fantine', 'target': 'Zephine', 'value': 4},{'source': 'Fantine', 'target': 'Marguerite', 'value': 2},{'source': 'Fantine', 'target': 'Valjean', 'value': 9},{'source': 'Mme.Thenardier', 'target': 'Fantine', 'value': 2},{'source': 'Mme.Thenardier', 'target': 'Valjean', 'value': 7},{'source': 'Thenardier', 'target': 'Mme.Thenardier', 'value': 13},{'source': 'Thenardier', 'target': 'Fantine', 'value': 1},{'source': 'Thenardier', 'target': 'Valjean', 'value': 12},{'source': 'Cosette', 'target': 'Mme.Thenardier', 'value': 4},{'source': 'Cosette', 'target': 'Valjean', 'value': 31},{'source': 'Cosette', 'target': 'Tholomyes', 'value': 1},{'source': 'Cosette', 'target': 'Thenardier', 'value': 1},{'source': 'Javert', 'target': 'Valjean', 'value': 17},{'source': 'Javert', 'target': 'Fantine', 'value': 5},{'source': 'Javert', 'target': 'Thenardier', 'value': 5},{'source': 'Javert', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Javert', 'target': 'Cosette', 'value': 1},{'source': 'Fauchelevent', 'target': 'Valjean', 'value': 8},{'source': 'Fauchelevent', 'target': 'Javert', 'value': 1},{'source': 'Bamatabois', 'target': 'Fantine', 'value': 1},{'source': 'Bamatabois', 'target': 'Javert', 'value': 1},{'source': 'Bamatabois', 'target': 'Valjean', 'value': 2},{'source': 'Perpetue', 'target': 'Fantine', 'value': 1},{'source': 'Simplice', 'target': 'Perpetue', 'value': 2},{'source': 'Simplice', 'target': 'Valjean', 'value': 3},{'source': 'Simplice', 'target': 'Fantine', 'value': 2},{'source': 'Simplice', 'target': 'Javert', 'value': 1},{'source': 'Scaufflaire', 'target': 'Valjean', 'value': 1},{'source': 'Woman1', 'target': 'Valjean', 'value': 2},{'source': 'Woman1', 'target': 'Javert', 'value': 1},{'source': 'Judge', 'target': 'Valjean', 'value': 3},{'source': 'Judge', 'target': 'Bamatabois', 'value': 2},{'source': 'Champmathieu', 'target': 'Valjean', 'value': 3},{'source': 'Champmathieu', 'target': 'Judge', 'value': 3},{'source': 'Champmathieu', 'target': 'Bamatabois', 'value': 2},{'source': 'Brevet', 'target': 'Judge', 'value': 2},{'source': 'Brevet', 'target': 'Champmathieu', 'value': 2},{'source': 'Brevet', 'target': 'Valjean', 'value': 2},{'source': 'Brevet', 'target': 'Bamatabois', 'value': 1},{'source': 'Chenildieu', 'target': 'Judge', 'value': 2},{'source': 'Chenildieu', 'target': 'Champmathieu', 'value': 2},{'source': 'Chenildieu', 'target': 'Brevet', 'value': 2},{'source': 'Chenildieu', 'target': 'Valjean', 'value': 2},{'source': 'Chenildieu', 'target': 'Bamatabois', 'value': 1},{'source': 'Cochepaille', 'target': 'Judge', 'value': 2},{'source': 'Cochepaille', 'target': 'Champmathieu', 'value': 2},{'source': 'Cochepaille', 'target': 'Brevet', 'value': 2},{'source': 'Cochepaille', 'target': 'Chenildieu', 'value': 2},{'source': 'Cochepaille', 'target': 'Valjean', 'value': 2},{'source': 'Cochepaille', 'target': 'Bamatabois', 'value': 1},{'source': 'Pontmercy', 'target': 'Thenardier', 'value': 1},{'source': 'Boulatruelle', 'target': 'Thenardier', 'value': 1},{'source': 'Eponine', 'target': 'Mme.Thenardier', 'value': 2},{'source': 'Eponine', 'target': 'Thenardier', 'value': 3},{'source': 'Anzelma', 'target': 'Eponine', 'value': 2},{'source': 'Anzelma', 'target': 'Thenardier', 'value': 2},{'source': 'Anzelma', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Woman2', 'target': 'Valjean', 'value': 3},{'source': 'Woman2', 'target': 'Cosette', 'value': 1},{'source': 'Woman2', 'target': 'Javert', 'value': 1},{'source': 'MotherInnocent', 'target': 'Fauchelevent', 'value': 3},{'source': 'MotherInnocent', 'target': 'Valjean', 'value': 1},{'source': 'Gribier', 'target': 'Fauchelevent', 'value': 2},{'source': 'Mme.Burgon', 'target': 'Jondrette', 'value': 1},{'source': 'Gavroche', 'target': 'Mme.Burgon', 'value': 2},{'source': 'Gavroche', 'target': 'Thenardier', 'value': 1},{'source': 'Gavroche', 'target': 'Javert', 'value': 1},{'source': 'Gavroche', 'target': 'Valjean', 'value': 1},{'source': 'Gillenormand', 'target': 'Cosette', 'value': 3},{'source': 'Gillenormand', 'target': 'Valjean', 'value': 2},{'source': 'Magnon', 'target': 'Gillenormand', 'value': 1},{'source': 'Magnon', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Mlle.Gillenormand', 'target': 'Gillenormand', 'value': 9},{'source': 'Mlle.Gillenormand', 'target': 'Cosette', 'value': 2},{'source': 'Mlle.Gillenormand', 'target': 'Valjean', 'value': 2},{'source': 'Mme.Pontmercy', 'target': 'Mlle.Gillenormand', 'value': 1},{'source': 'Mme.Pontmercy', 'target': 'Pontmercy', 'value': 1},{'source': 'Mlle.Vaubois', 'target': 'Mlle.Gillenormand', 'value': 1},{'source': 'Lt.Gillenormand', 'target': 'Mlle.Gillenormand', 'value': 2},{'source': 'Lt.Gillenormand', 'target': 'Gillenormand', 'value': 1},{'source': 'Lt.Gillenormand', 'target': 'Cosette', 'value': 1},{'source': 'Marius', 'target': 'Mlle.Gillenormand', 'value': 6},{'source': 'Marius', 'target': 'Gillenormand', 'value': 12},{'source': 'Marius', 'target': 'Pontmercy', 'value': 1},{'source': 'Marius', 'target': 'Lt.Gillenormand', 'value': 1},{'source': 'Marius', 'target': 'Cosette', 'value': 21},{'source': 'Marius', 'target': 'Valjean', 'value': 19},{'source': 'Marius', 'target': 'Tholomyes', 'value': 1},{'source': 'Marius', 'target': 'Thenardier', 'value': 2},{'source': 'Marius', 'target': 'Eponine', 'value': 5},{'source': 'Marius', 'target': 'Gavroche', 'value': 4},{'source': 'BaronessT', 'target': 'Gillenormand', 'value': 1},{'source': 'BaronessT', 'target': 'Marius', 'value': 1},{'source': 'Mabeuf', 'target': 'Marius', 'value': 1},{'source': 'Mabeuf', 'target': 'Eponine', 'value': 1},{'source': 'Mabeuf', 'target': 'Gavroche', 'value': 1},{'source': 'Enjolras', 'target': 'Marius', 'value': 7},{'source': 'Enjolras', 'target': 'Gavroche', 'value': 7},{'source': 'Enjolras', 'target': 'Javert', 'value': 6},{'source': 'Enjolras', 'target': 'Mabeuf', 'value': 1},{'source': 'Enjolras', 'target': 'Valjean', 'value': 4},{'source': 'Combeferre', 'target': 'Enjolras', 'value': 15},{'source': 'Combeferre', 'target': 'Marius', 'value': 5},{'source': 'Combeferre', 'target': 'Gavroche', 'value': 6},{'source': 'Combeferre', 'target': 'Mabeuf', 'value': 2},{'source': 'Prouvaire', 'target': 'Gavroche', 'value': 1},{'source': 'Prouvaire', 'target': 'Enjolras', 'value': 4},{'source': 'Prouvaire', 'target': 'Combeferre', 'value': 2},{'source': 'Feuilly', 'target': 'Gavroche', 'value': 2},{'source': 'Feuilly', 'target': 'Enjolras', 'value': 6},{'source': 'Feuilly', 'target': 'Prouvaire', 'value': 2},{'source': 'Feuilly', 'target': 'Combeferre', 'value': 5},{'source': 'Feuilly', 'target': 'Mabeuf', 'value': 1},{'source': 'Feuilly', 'target': 'Marius', 'value': 1},{'source': 'Courfeyrac', 'target': 'Marius', 'value': 9},{'source': 'Courfeyrac', 'target': 'Enjolras', 'value': 17},{'source': 'Courfeyrac', 'target': 'Combeferre', 'value': 13},{'source': 'Courfeyrac', 'target': 'Gavroche', 'value': 7},{'source': 'Courfeyrac', 'target': 'Mabeuf', 'value': 2},{'source': 'Courfeyrac', 'target': 'Eponine', 'value': 1},{'source': 'Courfeyrac', 'target': 'Feuilly', 'value': 6},{'source': 'Courfeyrac', 'target': 'Prouvaire', 'value': 3},{'source': 'Bahorel', 'target': 'Combeferre', 'value': 5},{'source': 'Bahorel', 'target': 'Gavroche', 'value': 5},{'source': 'Bahorel', 'target': 'Courfeyrac', 'value': 6},{'source': 'Bahorel', 'target': 'Mabeuf', 'value': 2},{'source': 'Bahorel', 'target': 'Enjolras', 'value': 4},{'source': 'Bahorel', 'target': 'Feuilly', 'value': 3},{'source': 'Bahorel', 'target': 'Prouvaire', 'value': 2},{'source': 'Bahorel', 'target': 'Marius', 'value': 1},{'source': 'Bossuet', 'target': 'Marius', 'value': 5},{'source': 'Bossuet', 'target': 'Courfeyrac', 'value': 12},{'source': 'Bossuet', 'target': 'Gavroche', 'value': 5},{'source': 'Bossuet', 'target': 'Bahorel', 'value': 4},{'source': 'Bossuet', 'target': 'Enjolras', 'value': 10},{'source': 'Bossuet', 'target': 'Feuilly', 'value': 6},{'source': 'Bossuet', 'target': 'Prouvaire', 'value': 2},{'source': 'Bossuet', 'target': 'Combeferre', 'value': 9},{'source': 'Bossuet', 'target': 'Mabeuf', 'value': 1},{'source': 'Bossuet', 'target': 'Valjean', 'value': 1},{'source': 'Joly', 'target': 'Bahorel', 'value': 5},{'source': 'Joly', 'target': 'Bossuet', 'value': 7},{'source': 'Joly', 'target': 'Gavroche', 'value': 3},{'source': 'Joly', 'target': 'Courfeyrac', 'value': 5},{'source': 'Joly', 'target': 'Enjolras', 'value': 5},{'source': 'Joly', 'target': 'Feuilly', 'value': 5},{'source': 'Joly', 'target': 'Prouvaire', 'value': 2},{'source': 'Joly', 'target': 'Combeferre', 'value': 5},{'source': 'Joly', 'target': 'Mabeuf', 'value': 1},{'source': 'Joly', 'target': 'Marius', 'value': 2},{'source': 'Grantaire', 'target': 'Bossuet', 'value': 3},{'source': 'Grantaire', 'target': 'Enjolras', 'value': 3},{'source': 'Grantaire', 'target': 'Combeferre', 'value': 1},{'source': 'Grantaire', 'target': 'Courfeyrac', 'value': 2},{'source': 'Grantaire', 'target': 'Joly', 'value': 2},{'source': 'Grantaire', 'target': 'Gavroche', 'value': 1},{'source': 'Grantaire', 'target': 'Bahorel', 'value': 1},{'source': 'Grantaire', 'target': 'Feuilly', 'value': 1},{'source': 'Grantaire', 'target': 'Prouvaire', 'value': 1},{'source': 'MotherPlutarch', 'target': 'Mabeuf', 'value': 3},{'source': 'Gueulemer', 'target': 'Thenardier', 'value': 5},{'source': 'Gueulemer', 'target': 'Valjean', 'value': 1},{'source': 'Gueulemer', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Gueulemer', 'target': 'Javert', 'value': 1},{'source': 'Gueulemer', 'target': 'Gavroche', 'value': 1},{'source': 'Gueulemer', 'target': 'Eponine', 'value': 1},{'source': 'Babet', 'target': 'Thenardier', 'value': 6},{'source': 'Babet', 'target': 'Gueulemer', 'value': 6},{'source': 'Babet', 'target': 'Valjean', 'value': 1},{'source': 'Babet', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Babet', 'target': 'Javert', 'value': 2},{'source': 'Babet', 'target': 'Gavroche', 'value': 1},{'source': 'Babet', 'target': 'Eponine', 'value': 1},{'source': 'Claquesous', 'target': 'Thenardier', 'value': 4},{'source': 'Claquesous', 'target': 'Babet', 'value': 4},{'source': 'Claquesous', 'target': 'Gueulemer', 'value': 4},{'source': 'Claquesous', 'target': 'Valjean', 'value': 1},{'source': 'Claquesous', 'target': 'Mme.Thenardier', 'value': 1},{'source': 'Claquesous', 'target': 'Javert', 'value': 1},{'source': 'Claquesous', 'target': 'Eponine', 'value': 1},{'source': 'Claquesous', 'target': 'Enjolras', 'value': 1},{'source': 'Montparnasse', 'target': 'Javert', 'value': 1},{'source': 'Montparnasse', 'target': 'Babet', 'value': 2},{'source': 'Montparnasse', 'target': 'Gueulemer', 'value': 2},{'source': 'Montparnasse', 'target': 'Claquesous', 'value': 2},{'source': 'Montparnasse', 'target': 'Valjean', 'value': 1},{'source': 'Montparnasse', 'target': 'Gavroche', 'value': 1},{'source': 'Montparnasse', 'target': 'Eponine', 'value': 1},{'source': 'Montparnasse', 'target': 'Thenardier', 'value': 1},{'source': 'Toussaint', 'target': 'Cosette', 'value': 2},{'source': 'Toussaint', 'target': 'Javert', 'value': 1},{'source': 'Toussaint', 'target': 'Valjean', 'value': 1},{'source': 'Child1', 'target': 'Gavroche', 'value': 2},{'source': 'Child2', 'target': 'Gavroche', 'value': 2},{'source': 'Child2', 'target': 'Child1', 'value': 3},{'source': 'Brujon', 'target': 'Babet', 'value': 3},{'source': 'Brujon', 'target': 'Gueulemer', 'value': 3},{'source': 'Brujon', 'target': 'Thenardier', 'value': 3},{'source': 'Brujon', 'target': 'Gavroche', 'value': 1},{'source': 'Brujon', 'target': 'Eponine', 'value': 1},{'source': 'Brujon', 'target': 'Claquesous', 'value': 1},{'source': 'Brujon', 'target': 'Montparnasse', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Bossuet', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Joly', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Grantaire', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Bahorel', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Courfeyrac', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Gavroche', 'value': 1},{'source': 'Mme.Hucheloup', 'target': 'Enjolras', 'value': 1}]};
        if (this.getEdges()) {
            return {edges: this.getEdges(), nodes: this.getNodes()};
        } else if (this.getApiParam('jsonData')) {
            return Ext.decode(this.getApiParam('jsonData'));
        } else if (this.getApiParam('json')) {
            return  this.getApiParam('json');
        } else {
            return {edges: this.getEdges(), nodes: this.getNodes()};
        }
    },
    
    processJson: function(json) {
    	if (!json || !json.links) {
            if (json && json.edges) {
                json.links = json.edges;
                delete json.edges;
            }
            if (!json || !json.links) {
                json = json || {};
                json.links = [];
            }
        }
        
        if (!json.nodes) {
            var wordFreq = {};
            json.nodes = [];
            json.links.forEach(function(edge) {
                ['source', 'target'].forEach(function(loc) {
                    if (edge[loc] in wordFreq == false) {
                        wordFreq[edge[loc]] = 1;
                        json.nodes.push({term: edge[loc]});
                    } else {
                        wordFreq[edge[loc]]++;
                    }
                    edge.value = 1;
                });
          });
          json.nodes.forEach(function(node) {
              Ext.applyIf(node, {value: wordFreq[node.term]});
          });
        }
        
        json.nodes.forEach(function(node) {
            node.id = node.term;
        });
        json.links.forEach(function(link) {
            link.id = link.source+'-'+link.target;
        });
        
        return json;
    },
    
    initGraph: function() {
        var el = this.getLayout().getRenderTarget();
        el.update('');
        var width = el.getWidth();
        var height = el.getHeight();
        
        this.setVisLayout(d3.forceSimulation().force('center', d3.forceCenter(width/2, height/2)));
        
        this.getVisLayout()
            .force('link', d3.forceLink().id(function(d) { return d.id; }).distance(30).strength(1))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('collide', d3.forceCollide(function(d) { return Math.sqrt(d.bbox.width * d.bbox.height)*2; }));
        
        var svg = d3.select(el.dom).append('svg').attr('width', width).attr('height', height);
        var g = svg.append('g');
        
        svg.call(d3.zoom().scaleExtent(this.getScaleExtent()).on('zoom', function() {
            g.attr('transform', d3.event.transform);
        }));
        
        this.setLinkSelection(g.append('g').attr('class', 'links').selectAll('.link'));
        this.setNodeSelection(g.append('g').attr('class', 'nodes').selectAll('.node'));
        this.setVis(g);
    },
    
    buildGraph: function(json) {
        json = json || this.getJsonResourcefully();
        
        this.processJson(json);

        var link = this.getLinkSelection().data(json.links, function(d) { return d.id; });
        link.exit().remove();
        var linkEnter = link.enter().append('line').attr('class', 'link');
        
        var linkUpdate = linkEnter.merge(link);
        linkUpdate.call(this.applyLinkStyle.bind(this));
        
        var node = this.getNodeSelection().data(json.nodes, function(d) { return d.id; });
        node.exit().remove();
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', function(d) {
                    if (!d3.event.active) this.getVisLayout().alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    d.fixed = true;
            	}.bind(this))
                .on('drag', function(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                })
                .on('end', function(d) {
                	if (!d3.event.active) this.getVisLayout().alphaTarget(0);
                	if (d.fixed != true) {
                		d.fx = null;
                		d.fy = null;
                	}
                }.bind(this))
            );

        nodeEnter.append('circle').attr('r', 5);
        
        var vals = json.nodes.map(function(d) {
            var val = d.value;
            if (d.value == undefined) {
                d.value = val = 1;
            }
            return val;
        });
        vals.sort();

        var fontscale = d3.scaleLog()
            .domain([vals[0], vals[vals.length-1]])
            .range([8, 36]);
                
        nodeEnter.append('text')
            .attr('dx', 0)
            .attr('dy', 0)
            .text(function(d) { return d.term; })
            .attr('font-size', function(d) {return fontscale(d.value)+'px';})
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
			.attr('alignment-baseline', 'middle')
            .each(function(d) { d.bbox = this.getBBox(); });
        
        var nodeUpdate = nodeEnter.merge(node);
        nodeUpdate.selectAll('circle').call(this.applyNodeStyle.bind(this));

        this.getVisLayout().nodes(json.nodes).on('tick', function() {
            linkUpdate
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
    
            nodeUpdate.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        });
        
        this.getVisLayout().force('link').links(json.links);
        
        this.getVisLayout().alpha(1).restart();
    },
    
    applyNodeStyle: function(sel, nodeState) {
		var state = nodeState === undefined ? 'normal' : nodeState;
    	sel.style('fill', function(d) { return this.getGraphStyle().node[state].fill; }.bind(this));
    	sel.style('stroke', function(d) { return this.getGraphStyle().node[state].stroke; }.bind(this));
    },
    
    applyLinkStyle: function(sel, linkState) {
    	var state = linkState === undefined ? 'normal' : linkState;
    	sel.style('stroke', function(d) { return this.getGraphStyle().link[state].stroke; }.bind(this));
    	sel.style('stroke-opacity', function(d) { return this.getGraphStyle().link[state].strokeOpacity; }.bind(this));
    }
});