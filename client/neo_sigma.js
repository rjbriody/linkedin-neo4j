function init() {
	// Instanciate sigma.js and customize rendering :
	var sigInst = sigma.init(document.getElementById('sigma-example')).drawingProperties({
		defaultLabelColor: '#fff',
		defaultLabelSize: 14,
		defaultLabelBGColor: '#fff',
		defaultLabelHoverColor: '#000',
		labelThreshold: 6,
		defaultEdgeType: 'curve'
	}).graphProperties({
		minNodeSize: 0.5,
		maxNodeSize: 5,
		minEdgeSize: 1,
		maxEdgeSize: 1
	}).mouseProperties({
		maxRatio: 4
	});

	sigInst.parseJson('http://localhost:8080/', function (){
		// Bind events :
		sigInst.bind('overnodes',function(event){
		var nodes = event.content;
		var neighbors = {};
		sigInst.iterEdges(function(e){
			if(nodes.indexOf(e.source)>=0 || nodes.indexOf(e.target)>=0){
				neighbors[e.source] = 1;
				neighbors[e.target] = 1;
			}
		}).iterNodes(function(n){
			if(!neighbors[n.id]){
				n.hidden = 1;
			}else{
				n.hidden = 0;
			}
		}).draw(2,2,2);
	}).bind('outnodes',function(){
		sigInst.iterEdges(function(e){
			e.hidden = 0;
		}).iterNodes(function(n){
			n.hidden = 0;
		}).draw(2,2,2);
	});

	// Draw the graph :
	sigInst.draw();
	sigInst.startForceAtlas2();

	var isRunning = true;
	document.getElementById('stop-layout').addEventListener('click',function(){
		if(isRunning){
			isRunning = false;
			sigInst.stopForceAtlas2();
			document.getElementById('stop-layout').childNodes[0].nodeValue = 'Start Layout';
		}else{
			isRunning = true;
			sigInst.startForceAtlas2();
			document.getElementById('stop-layout').childNodes[0].nodeValue = 'Stop Layout';
		}
	},true);
	document.getElementById('rescale-graph').addEventListener('click',function(){
		sigInst.position(0,0,1).draw();
	},true);

	});
}

if (document.addEventListener) {
	document.addEventListener("DOMContentLoaded", init, false);
} else {
	window.onload = init;
}
