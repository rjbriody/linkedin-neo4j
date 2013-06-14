var request = require('superagent');
var JSONStream = require('JSONStream');
var es = require('event-stream');

// cypher url
var url = "http://localhost:7474/db/data/cypher";

// sigma.js expects the response to look something like this:
// {nodes: [{id: <id>, labe: <label>, etc}, ... ], edges: [{sourceID: <source>, targetID: <target>, etc}, ...]}

sendRels = function(res){
	// query all relationships. add id trick to make sure we don't get each relationship twice
	var q = 'START n=node(*) MATCH n-[:linkedin]-m WHERE id(n) < id(m) RETURN n.name, m.name;';

	// parse the data field
	var parser = JSONStream.parse(['data', true]);
	var first = true;

	var writer = es.mapSync(function (data) {
		// parse the cypher response stream and translate data so it can be easily loaded into sigma.js
		if (!first){
			res.write(',');
		}else {
			first = false;
		}

		var rel = '{';
		rel += '"sourceID": "' + data[0] + '", ';
		rel += '"targetID": "' + data[1] + '", ';
		rel += '"size": 1}';
		res.write(rel);
	});

	res.write('"edges": [');
	// the cypher response is piped through the JSON parser and then through the writer
	request.post(url).send({query: q}).pipe(parser);
	parser.pipe(writer , { end: false });
	parser.on("end", function() {
		// finish response
		res.end("]}"); 
	});
}


sendGraph = function(res) {
	// query for all the nodes
	var q = 'START n=node(*) RETURN n.name;';

	// parse the data field
	var parser = JSONStream.parse(['data', true]);
	var first = true;

	var writer = es.mapSync(function (data) {
		// parse the cypher response stream and translate data so it can be easily loaded into sigma.js
		if (!first){
			res.write(',');
		}else {
			first = false;
		}

		var node = '{';
		node += '"id": "' + data[0] + '", ';
		node += '"label": "' + data[0] + '", ';
		node += '"x": ' + 100 * Math.random() + ', ';
		node += '"y": ' + 100 * Math.random() + ', ';
		node += '"size": 10, ';
		node += '"color": "#7bb045"';
		node += '}';
		res.write(node);
	});

	res.write('{"nodes": [');
	// the cypher response is piped through the JSON parser and then through the writer
	request.post(url).send({query: q}).pipe(parser);
	parser.pipe(writer , { end: false });
	parser.on("end", function() {
		// all nodes have been sent. now send the edges
		res.write('], ')
	 	sendRels(res);
	});
}

exports.index = function(req, res){
	sendGraph(res);
};
