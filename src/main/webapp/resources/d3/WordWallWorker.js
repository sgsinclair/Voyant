/* global importScripts, d3 */

importScripts('https://d3js.org/d3.v4.min.js');
importScripts('http://localhost:8080/voyant/resources/d3/d3-bboxCollide.min.js');//https://raw.githubusercontent.com/emeeks/d3-bboxCollide/master/build/d3-bboxCollide.min.js');

onmessage = function(event) {
	
	var terms = event.data.terms;
	var height = event.data.height;
	var width = event.data.width;
	var minFreq = event.data.minFreq;
	var maxFreq = event.data.maxFreq;
	var xForceStrength = event.data.xForceStrength;
	var yForceStrength = event.data.yForceStrength;
	var chargeStrength = event.data.chargeStrength;
	var chargeDistance = event.data.chargeDistance;
	var letterDistribution = event.data.letterDistribution;

	var nodeData = [];

	var frequencyScale = d3.scaleLog().domain([minFreq, maxFreq]).range([0, 1]);

	var getXPosition = function(d) {
		var percentPosition = 0;
		for (var i = 0, len = letterDistribution.length; i < len; i++) {
			var letterData = letterDistribution[i];
			if (letterData.letter === d.letter) {
				percentPosition += letterData.percent/2;
				break;
			}
			percentPosition += letterData.percent;
		}

		var val = width * percentPosition;
		return val;
	};

	var getYPosition = function(d) {
		var val = height*0.025 + Math.abs(frequencyScale(d.value)-1)*(height*0.9);
		return val;
	};

	var simulation = d3.forceSimulation()
	//.alphaMin(0.05)
	.force('x', d3.forceX(function(d) {
		return getXPosition(d);
	})
		.strength(function(d) {
			return d3.scaleLinear().domain([minFreq, maxFreq]).range([xForceStrength, xForceStrength*0.1])(d.value);
		})
	)
	.force('y', d3.forceY(function(d) {
		return getYPosition(d);
	})
		.strength(function(d) {
			return d3.scaleLinear().domain([minFreq, maxFreq]).range([yForceStrength, yForceStrength*0.1])(d.value);
		})
	)
	.force('charge', d3.forceManyBody()
		.strength(function(d) {
			return d3.scaleLinear().domain([minFreq, maxFreq]).range([chargeStrength, chargeStrength*10])(d.value);
		})
		.distanceMax(function(d) {
			return d3.scaleLinear().domain([minFreq, maxFreq]).range([chargeDistance, chargeDistance*3])(d.value);
		}))
	.force('collide', d3.bboxCollide(function(d) {
		return [[d.bbox.x, d.bbox.y], [d.bbox.x+d.bbox.width, d.bbox.y+d.bbox.height]];
	}).strength(1).iterations(1))
	.stop();

	var totalTicks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
	var ticksTicked = 0;

	var addNodes = function(numToAdd) {
		var index = nodeData.length;
		if (index+numToAdd > terms.length) {
			numToAdd = terms.length - index;
		}
		var termsToAdd = terms.slice(index, index+numToAdd);

		var t1 = termsToAdd.length / terms.length;

		var ticks = totalTicks*t1;
		ticksTicked += ticks;

		nodeData = nodeData.concat(termsToAdd);
		
		var t2 = nodeData.length / terms.length;

		postMessage({type: 'progress', progress: t2});

		runSim(ticks);
		
		if (nodeData.length < terms.length) {
			numToAdd = Math.ceil(numToAdd*1.15);
			addNodes(numToAdd);
		}
	};

	var runSim = function(numTicks) {
		simulation.nodes(nodeData);
		
		for (var i = 0; i < numTicks; ++i) {
			// postMessage({type: "msg", msg: "tick: "+(i/numTicks)});
			simulation.tick();
			simulation.nodes().forEach(function(d) {
				// constrain to window
				d.x = Math.max(0, Math.min(width-d.bbox.width, d.x));
				d.y = Math.max(d.bbox.height*0.5, Math.min(height-d.bbox.height, d.y));
			});
		}
	};

	terms.forEach(function(d) {
		d.x = getXPosition(d);
		d.y = getYPosition(d);
	});

	addNodes(1);

	postMessage({type: 'end', nodes: nodeData});
};