var express = require('express');
var app = express();
 
// Config 
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
 
// set up the RESTful API
var mainGraphApi = require('./controllers/graph.js');
app.get('/', mainGraphApi.index);

app.listen(8080);
console.log("Express server listening at http://localhost:8080");





