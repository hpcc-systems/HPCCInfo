// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Body Parser MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Set static path
app.use(express.static(path.join(__dirname, '../client')));

const clusterDetailsRouter = require('./routes/ClusterDetailsRouter');

const projectDetailsRouter = require('./routes/ProjectDetailsRouter');

app.use('/clusterDetails', clusterDetailsRouter);

app.use('/projectDetails', projectDetailsRouter);

//Start Server
app.listen(3000, function() {
	console.log('server started at port 3000');
});

// Render index.html on the main page
app.get('*', function(req, res) {
	res.sendFile("index.html", {root: '../client'});
});