//Dependencies
var express = require('express');
var router = express.Router();
var userDetails = require('../models/UserDetails');
const logger = require("../utils/logger");

//Routes
router.post('/',function(req, res, next) {
	    userDetails.getUserByName(req.body, function(err, rows) {
	        if(err) {
	        	logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
				logger.error("ERROR MESSAGE: "+ err);
				console.log('error');
	        	res.json(err);
				
	        } else {
				logger.error('I am here');
				console.log('success' + rows);
	            res.json(rows);
	        }
	    });
});
//Return router
module.exports = router;