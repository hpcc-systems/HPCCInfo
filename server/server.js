// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require("./utils/logger");

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
const userDetailsRouter = require('./routes/UserDetailsRouter');

app.use('/clusterDetails', clusterDetailsRouter);

app.use('/projectDetails', projectDetailsRouter);
app.use('/userDetails', userDetailsRouter);

//Start Server
app.listen(3000, function() {
	console.log('server started at port 3000');
	logger.info("Listening on port 3000");
});

// Render index.html on the main page
app.get('*', function(req, res) {
	res.sendFile("index.html", {root: '../client'});
});