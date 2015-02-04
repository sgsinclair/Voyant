Ext.define('Voyant.data.store.StatisticalAnalysis', {
	extend: 'Ext.data.Store',
	mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.StatisticalAnalysis',
	config: {
		corpus: undefined
	},
	
	constructor : function(config) {
		
		config = config || {};
		
		// create proxy in constructor so we can set the Trombone URL
// Ext.apply(config, {
// proxy: {
// type: 'ajax',
// url: Voyant.application.getTromboneUrl(),
// extraParams: {
// tool: 'corpus.DocumentTokens',
// corpus: config && config.corpus ? (Ext.isString(config.corpus) ?
// config.corpus : config.corpus.getId()) : undefined,
// stripTags: config.stripTags
//		         },
//		         reader: {
//		             type: 'json',
//		             rootProperty: 'documentTokens.tokens',
//		             totalProperty: 'documentTokens.total'
//		         },
//		         simpleSortMode: true
//		     }
//		});
		
		this.callParent([config]);

	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}
	
	,data: [{
		dimensions : [{
			"percentage" : "25.387630934766864"
		},{
			"percentage" : "16.618244355517973"
		},{
			"percentage" : "13.855780153204652"
		},{
			"percentage" : "12.63996334541429"
		},{
			"percentage" : "10.458533967582744"
		},{
			"percentage" : "8.396959812243352"
		},{
			"percentage" : "5.063603562857294"
		},{
			"percentage" : "4.316508604522014"
		},{
			"percentage" : "3.2627752638907803"
		},{
			"percentage" : "0.0"
		}],
		tokens : [ {
			"term" : "king",
			"category" : "word",
			"rawFreq" : "2088",
			"relativeFreq" : "0.008067819138659846",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.1617592, 0.06241437 ]
		}, {
			"term" : "lord",
			"category" : "word",
			"rawFreq" : "1255",
			"relativeFreq" : "0.004849192058916717",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.11560112, 0.020708583 ]
		}, {
			"term" : "shall",
			"category" : "word",
			"rawFreq" : "1155",
			"relativeFreq" : "0.004462802253425346",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.119538315, 0.06768155 ]
		}, {
			"term" : "henry",
			"category" : "word",
			"rawFreq" : "1118",
			"relativeFreq" : "0.004319838025393538",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.26603508, -0.061711688 ]
		}, {
			"term" : "good",
			"category" : "word",
			"rawFreq" : "784",
			"relativeFreq" : "0.0030292960750523557",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.3314167, 0.040177736 ]
		}, {
			"term" : "enter",
			"category" : "word",
			"rawFreq" : "637",
			"relativeFreq" : "0.002461303060980039",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.08585831, 0.06872018 ]
		}, {
			"term" : "come",
			"category" : "word",
			"rawFreq" : "624",
			"relativeFreq" : "0.0024110723862661608",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.25591722, -0.06262241 ]
		}, {
			"term" : "let",
			"category" : "word",
			"rawFreq" : "581",
			"relativeFreq" : "0.002244924769904871",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.1265006, 0.07043255 ]
		}, {
			"term" : "queen",
			"category" : "word",
			"rawFreq" : "576",
			"relativeFreq" : "0.0022256052796303023",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.6297107, -0.04131309 ]
		}, {
			"term" : "york",
			"category" : "word",
			"rawFreq" : "576",
			"relativeFreq" : "0.0022256052796303023",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.50170994, 0.060283467 ]
		}, {
			"term" : "hath",
			"category" : "word",
			"rawFreq" : "571",
			"relativeFreq" : "0.0022062857893557337",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.06569119, 0.044333663 ]
		}, {
			"term" : "gloucester",
			"category" : "word",
			"rawFreq" : "523",
			"relativeFreq" : "0.002020818682719875",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.75818586, -0.1650426 ]
		}, {
			"term" : "richard",
			"category" : "word",
			"rawFreq" : "521",
			"relativeFreq" : "0.002013090886610048",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.620333, 0.11647469 ]
		}, {
			"term" : "like",
			"category" : "word",
			"rawFreq" : "519",
			"relativeFreq" : "0.00200536309050022",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.16701885, 0.008555776 ]
		}, {
			"term" : "prince",
			"category" : "word",
			"rawFreq" : "497",
			"relativeFreq" : "0.0019203573332921184",
			"cluster" : "1",
			"clusterCenter" : "false",
			"vector" : [ -0.88290733, -0.6765495 ]
		}, {
			"term" : "sir",
			"category" : "word",
			"rawFreq" : "464",
			"relativeFreq" : "0.0017928486974799656",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.77197, -0.14475253 ]
		}, {
			"term" : "make",
			"category" : "word",
			"rawFreq" : "451",
			"relativeFreq" : "0.0017426180227660874",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.045886844, 0.06571402 ]
		}, {
			"term" : "say",
			"category" : "word",
			"rawFreq" : "440",
			"relativeFreq" : "0.0017001151441620363",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.031933833, 0.16322488 ]
		}, {
			"term" : "duke",
			"category" : "word",
			"rawFreq" : "435",
			"relativeFreq" : "0.0016807956538874677",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.35888946, 0.5698943 ]
		}, {
			"term" : "i'll",
			"category" : "word",
			"rawFreq" : "435",
			"relativeFreq" : "0.0016807956538874677",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.10062285, -0.1351297 ]
		}, {
			"term" : "man",
			"category" : "word",
			"rawFreq" : "433",
			"relativeFreq" : "0.0016730678577776405",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.288129, 0.08431026 ]
		}, {
			"term" : "god",
			"category" : "word",
			"rawFreq" : "432",
			"relativeFreq" : "0.0016692039597227266",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.04121249, 0.024388792 ]
		}, {
			"term" : "falstaff",
			"category" : "word",
			"rawFreq" : "408",
			"relativeFreq" : "0.0015764704064047974",
			"cluster" : "1",
			"clusterCenter" : "false",
			"vector" : [ -1.605524, -0.94490486 ]
		}, {
			"term" : "warwick",
			"category" : "word",
			"rawFreq" : "406",
			"relativeFreq" : "0.00156874261029497",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.8052508, -0.94973916 ]
		}, {
			"term" : "john",
			"category" : "word",
			"rawFreq" : "364",
			"relativeFreq" : "0.0014064588919885939",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.631902, 0.057438497 ]
		}, {
			"term" : "death",
			"category" : "word",
			"rawFreq" : "350",
			"relativeFreq" : "0.0013523643192198016",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.26412544, 0.11119425 ]
		}, {
			"term" : "edward",
			"category" : "word",
			"rawFreq" : "348",
			"relativeFreq" : "0.0013446365231099744",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 1.1851336, -1.2408718 ]
		}, {
			"term" : "france",
			"category" : "word",
			"rawFreq" : "340",
			"relativeFreq" : "0.0013137253386706646",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.11649067, 0.32482705 ]
		}, {
			"term" : "know",
			"category" : "word",
			"rawFreq" : "336",
			"relativeFreq" : "0.0012982697464510096",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.24979769, 0.17545442 ]
		}, {
			"term" : "love",
			"category" : "word",
			"rawFreq" : "330",
			"relativeFreq" : "0.0012750863581215274",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.06887099, 0.033768732 ]
		}, {
			"term" : "tis",
			"category" : "word",
			"rawFreq" : "322",
			"relativeFreq" : "0.0012441751736822176",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.051535554, 0.17237638 ]
		}, {
			"term" : "doth",
			"category" : "word",
			"rawFreq" : "317",
			"relativeFreq" : "0.001224855683407649",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.1984007, -0.073107086 ]
		}, {
			"term" : "exeunt",
			"category" : "word",
			"rawFreq" : "313",
			"relativeFreq" : "0.001209400091187994",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.001047494, 0.064964496 ]
		}, {
			"term" : "men",
			"category" : "word",
			"rawFreq" : "309",
			"relativeFreq" : "0.0011939444989683393",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.16384067, 0.101856396 ]
		}, {
			"term" : "speak",
			"category" : "word",
			"rawFreq" : "307",
			"relativeFreq" : "0.0011862167028585118",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.09497574, -0.01245919 ]
		}, {
			"term" : "tell",
			"category" : "word",
			"rawFreq" : "300",
			"relativeFreq" : "0.0011591694164741157",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.12939277, -0.15607034 ]
		}, {
			"term" : "blood",
			"category" : "word",
			"rawFreq" : "292",
			"relativeFreq" : "0.001128258232034806",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.022935638, 0.047482774 ]
		}, {
			"term" : "hand",
			"category" : "word",
			"rawFreq" : "288",
			"relativeFreq" : "0.0011128026398151511",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.088664696, 0.10675611 ]
		}, {
			"term" : "cardinal",
			"category" : "word",
			"rawFreq" : "281",
			"relativeFreq" : "0.001085755353430755",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.113669656, 0.9344131 ]
		}, {
			"term" : "time",
			"category" : "word",
			"rawFreq" : "281",
			"relativeFreq" : "0.001085755353430755",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.20455243, 0.063296415 ]
		}, {
			"term" : "grace",
			"category" : "word",
			"rawFreq" : "280",
			"relativeFreq" : "0.0010818914553758414",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.0023266042, 0.1758966 ]
		}, {
			"term" : "day",
			"category" : "word",
			"rawFreq" : "278",
			"relativeFreq" : "0.001074163659266014",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.09494399, 0.11309527 ]
		}, {
			"term" : "life",
			"category" : "word",
			"rawFreq" : "277",
			"relativeFreq" : "0.0010702997612111003",
			"cluster" : "0",
			"clusterCenter" : "true",
			"vector" : [ -0.05032312, 0.08443261 ]
		}, {
			"term" : "away",
			"category" : "word",
			"rawFreq" : "273",
			"relativeFreq" : "0.0010548441689914453",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.026057266, -0.0041799634 ]
		}, {
			"term" : "heart",
			"category" : "word",
			"rawFreq" : "270",
			"relativeFreq" : "0.0010432524748267042",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.1201523, 0.07829111 ]
		}, {
			"term" : "father",
			"category" : "word",
			"rawFreq" : "268",
			"relativeFreq" : "0.0010355246787168767",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.1039175, -0.4111936 ]
		}, {
			"term" : "great",
			"category" : "word",
			"rawFreq" : "267",
			"relativeFreq" : "0.001031660780661963",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.15658356, 0.28015283 ]
		}, {
			"term" : "lady",
			"category" : "word",
			"rawFreq" : "262",
			"relativeFreq" : "0.0010123412903873944",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.10094089, -0.051925495 ]
		}, {
			"term" : "son",
			"category" : "word",
			"rawFreq" : "262",
			"relativeFreq" : "0.0010123412903873944",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.07929384, -0.2055039 ]
		}, {
			"term" : "art",
			"category" : "word",
			"rawFreq" : "258",
			"relativeFreq" : "9.968856981677396E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.27185306, -0.10379698 ]
		}, {
			"term" : "lords",
			"category" : "word",
			"rawFreq" : "258",
			"relativeFreq" : "9.968856981677396E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.27265844, 0.17638063 ]
		}, {
			"term" : "margaret",
			"category" : "word",
			"rawFreq" : "255",
			"relativeFreq" : "9.852940040029983E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.9134241, -0.27862486 ]
		}, {
			"term" : "think",
			"category" : "word",
			"rawFreq" : "252",
			"relativeFreq" : "9.737023098382573E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.22843915, 0.058348317 ]
		}, {
			"term" : "buckingham",
			"category" : "word",
			"rawFreq" : "250",
			"relativeFreq" : "9.659745137284298E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.65500325, 0.198503 ]
		}, {
			"term" : "iv",
			"category" : "word",
			"rawFreq" : "243",
			"relativeFreq" : "9.389272273440338E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.1859049, -1.0675392 ]
		}, {
			"term" : "suffolk",
			"category" : "word",
			"rawFreq" : "242",
			"relativeFreq" : "9.3506332928912E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.42912808, 0.67067975 ]
		}, {
			"term" : "peace",
			"category" : "word",
			"rawFreq" : "239",
			"relativeFreq" : "9.234716351243789E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.2366663, 0.13310732 ]
		}, {
			"term" : "hear",
			"category" : "word",
			"rawFreq" : "234",
			"relativeFreq" : "9.041521448498103E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.18239535, -0.12500827 ]
		}, {
			"term" : "scene",
			"category" : "word",
			"rawFreq" : "230",
			"relativeFreq" : "8.886965526301554E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.04122017, 0.046887256 ]
		}, {
			"term" : "vi",
			"category" : "word",
			"rawFreq" : "228",
			"relativeFreq" : "8.809687565203279E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.8934295, -0.299696 ]
		}, {
			"term" : "noble",
			"category" : "word",
			"rawFreq" : "227",
			"relativeFreq" : "8.771048584654143E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.0999211, 0.33679554 ]
		}, {
			"term" : "unto",
			"category" : "word",
			"rawFreq" : "227",
			"relativeFreq" : "8.771048584654143E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.3761161, -0.057074156 ]
		}, {
			"term" : "heaven",
			"category" : "word",
			"rawFreq" : "224",
			"relativeFreq" : "8.65513164300673E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.10173538, 0.3947198 ]
		}, {
			"term" : "exit",
			"category" : "word",
			"rawFreq" : "219",
			"relativeFreq" : "8.461936740261045E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.03499426, 0.045690756 ]
		}, {
			"term" : "fear",
			"category" : "word",
			"rawFreq" : "218",
			"relativeFreq" : "8.423297759711908E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.0025046004, 0.051810887 ]
		}, {
			"term" : "true",
			"category" : "word",
			"rawFreq" : "217",
			"relativeFreq" : "8.38465877916277E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.20799983, 0.027270623 ]
		}, {
			"term" : "iii",
			"category" : "word",
			"rawFreq" : "211",
			"relativeFreq" : "8.152824895867948E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.7067244, -0.13380574 ]
		}, {
			"term" : "head",
			"category" : "word",
			"rawFreq" : "208",
			"relativeFreq" : "8.036907954220536E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.008106176, -0.08170856 ]
		}, {
			"term" : "leave",
			"category" : "word",
			"rawFreq" : "208",
			"relativeFreq" : "8.036907954220536E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.10087095, -0.016651146 ]
		}, {
			"term" : "look",
			"category" : "word",
			"rawFreq" : "208",
			"relativeFreq" : "8.036907954220536E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.13902238, 0.07741448 ]
		}, {
			"term" : "england",
			"category" : "word",
			"rawFreq" : "207",
			"relativeFreq" : "7.998268973671399E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.100631915, 0.33083707 ]
		}, {
			"term" : "clarence",
			"category" : "word",
			"rawFreq" : "203",
			"relativeFreq" : "7.84371305147485E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.85141814, -0.98540294 ]
		}, {
			"term" : "fair",
			"category" : "word",
			"rawFreq" : "201",
			"relativeFreq" : "7.766435090376575E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.10423658, 0.26980478 ]
		}, {
			"term" : "honour",
			"category" : "word",
			"rawFreq" : "196",
			"relativeFreq" : "7.573240187630889E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.19244215, 0.30839324 ]
		}, {
			"term" : "soul",
			"category" : "word",
			"rawFreq" : "194",
			"relativeFreq" : "7.495962226532615E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.19178247, 0.20930476 ]
		}, {
			"term" : "brother",
			"category" : "word",
			"rawFreq" : "191",
			"relativeFreq" : "7.380045284885203E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.3135213, -0.55696875 ]
		}, {
			"term" : "dead",
			"category" : "word",
			"rawFreq" : "191",
			"relativeFreq" : "7.380045284885203E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.02386533, -0.0048352024 ]
		}, {
			"term" : "old",
			"category" : "word",
			"rawFreq" : "189",
			"relativeFreq" : "7.302767323786929E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.5653218, 0.09177048 ]
		}, {
			"term" : "crown",
			"category" : "word",
			"rawFreq" : "186",
			"relativeFreq" : "7.186850382139518E-4",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.44582272, -0.30146584 ]
		}, {
			"term" : "majesty",
			"category" : "word",
			"rawFreq" : "185",
			"relativeFreq" : "7.148211401590381E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.12961985, 0.24394809 ]
		}, {
			"term" : "world",
			"category" : "word",
			"rawFreq" : "183",
			"relativeFreq" : "7.070933440492106E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.1465644, 0.14149427 ]
		}, {
			"term" : "live",
			"category" : "word",
			"rawFreq" : "176",
			"relativeFreq" : "6.800460576648146E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.18890555, 0.09957525 ]
		}, {
			"term" : "stand",
			"category" : "word",
			"rawFreq" : "176",
			"relativeFreq" : "6.800460576648146E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.12837382, -0.04940075 ]
		}, {
			"term" : "hast",
			"category" : "word",
			"rawFreq" : "175",
			"relativeFreq" : "6.761821596099008E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.103611544, -0.071676455 ]
		}, {
			"term" : "sweet",
			"category" : "word",
			"rawFreq" : "175",
			"relativeFreq" : "6.761821596099008E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.008253517, -0.16847217 ]
		}, {
			"term" : "poor",
			"category" : "word",
			"rawFreq" : "173",
			"relativeFreq" : "6.684543635000734E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.027613314, -0.029489173 ]
		}, {
			"term" : "set",
			"category" : "word",
			"rawFreq" : "173",
			"relativeFreq" : "6.684543635000734E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.16272542, -0.014585349 ]
		}, {
			"term" : "ye",
			"category" : "word",
			"rawFreq" : "172",
			"relativeFreq" : "6.645904654451597E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.27123404, 0.45849594 ]
		}, {
			"term" : "bardolph",
			"category" : "word",
			"rawFreq" : "171",
			"relativeFreq" : "6.607265673902459E-4",
			"cluster" : "1",
			"clusterCenter" : "true",
			"vector" : [ -1.4023579, -0.74019235 ]
		}, {
			"term" : "bolingbroke",
			"category" : "word",
			"rawFreq" : "171",
			"relativeFreq" : "6.607265673902459E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.0158073, 1.1163964 ]
		}, {
			"term" : "bear",
			"category" : "word",
			"rawFreq" : "168",
			"relativeFreq" : "6.491348732255048E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.059011992, -0.05903675 ]
		}, {
			"term" : "till",
			"category" : "word",
			"rawFreq" : "168",
			"relativeFreq" : "6.491348732255048E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.04870092, 0.0601174 ]
		}, {
			"term" : "ii",
			"category" : "word",
			"rawFreq" : "167",
			"relativeFreq" : "6.452709751705911E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.047806602, 0.93224037 ]
		}, {
			"term" : "talbot",
			"category" : "word",
			"rawFreq" : "166",
			"relativeFreq" : "6.414070771156774E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.5071364, 0.7876366 ]
		}, {
			"term" : "die",
			"category" : "word",
			"rawFreq" : "163",
			"relativeFreq" : "6.298153829509362E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.18527763, 0.060431242 ]
		}, {
			"term" : "better",
			"category" : "word",
			"rawFreq" : "162",
			"relativeFreq" : "6.259514848960226E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.31250897, -0.124948524 ]
		}, {
			"term" : "eyes",
			"category" : "word",
			"rawFreq" : "162",
			"relativeFreq" : "6.259514848960226E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.073783, 0.12330746 ]
		}, {
			"term" : "little",
			"category" : "word",
			"rawFreq" : "161",
			"relativeFreq" : "6.220875868411088E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.2650393, 0.29650763 ]
		}, {
			"term" : "long",
			"category" : "word",
			"rawFreq" : "160",
			"relativeFreq" : "6.182236887861951E-4",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.06268866, 0.24041416 ]
		}, {
			"term" : "ay",
			"category" : "word",
			"rawFreq" : "158",
			"relativeFreq" : "6.104958926763676E-4",
			"cluster" : "2",
			"clusterCenter" : "true",
			"vector" : [ 0.5749841, -0.30968413 ]
		}, {
			"term" : "Henry IV, part 1: Entire Play",
			"category" : "part",
			"rawFreq" : "25918",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.66166246, -0.299192 ]
		}, {
			"term" : "Henry IV, part 2: Entire Play",
			"category" : "part",
			"rawFreq" : "27708",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.6545244, -0.32713738 ]
		}, {
			"term" : "Henry V: Entire Play",
			"category" : "part",
			"rawFreq" : "27370",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.14387849, 0.14307028 ]
		}, {
			"term" : "Henry VI, part 1: Entire Play",
			"category" : "part",
			"rawFreq" : "22753",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.20803662, 0.2627687 ]
		}, {
			"term" : "Henry VI, part 2: Entire Play",
			"category" : "part",
			"rawFreq" : "26676",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.27874616, 0.1557461 ]
		}, {
			"term" : "Henry VI, part 3: Entire Play",
			"category" : "part",
			"rawFreq" : "25820",
			"relativeFreq" : "0.0",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.55408967, -0.56867635 ]
		}, {
			"term" : "Henry VIII: Entire Play",
			"category" : "part",
			"rawFreq" : "25866",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.15848403, 0.40847567 ]
		}, {
			"term" : "King John: Entire Play",
			"category" : "part",
			"rawFreq" : "21654",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ -0.20123087, 0.18711764 ]
		}, {
			"term" : "Richard II: Entire Play",
			"category" : "part",
			"rawFreq" : "23795",
			"relativeFreq" : "0.0",
			"cluster" : "0",
			"clusterCenter" : "false",
			"vector" : [ 0.045348376, 0.45550078 ]
		}, {
			"term" : "Richard III: Entire Play",
			"category" : "part",
			"rawFreq" : "31246",
			"relativeFreq" : "0.0",
			"cluster" : "2",
			"clusterCenter" : "false",
			"vector" : [ 0.3857436, -0.061959907 ]
		} ]
	}]

});
