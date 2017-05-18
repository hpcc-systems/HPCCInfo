// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// Body Parser MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Set static path
app.use(express.static(path.join(__dirname, '../client')));

// Render index.html on the main page
app.get('*', function(req, res) {
	res.sendFile("index.html", {root: '../client'});
});

var clusterDetailsRouter = require('./routes/ClusterDetailsRouter');

var projectDetailsRouter = require('./routes/ProjectDetailsRouter');

app.use('/clusterDetails', clusterDetailsRouter);

app.use('/projectDetails', projectDetailsRouter);

//Start Server
app.listen(3000, function() {
	console.log('server started at port 3000');
});