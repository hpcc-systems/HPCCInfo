//Dependencies
import { Router } from 'express'
let router = Router();


var ProjectDetails = require('../models/ProjectDetails');
const logger = require("../utils/logger");

router.get('/:name?',function(req, res, next) {
	if(!req.params.name.includes('.')){
	    ProjectDetails.getProjectByid(req.params.name, function(err, rows) {
	        if(err) {
	        	logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
				logger.error("ERROR MESSAGE: "+ err);
	        	res.json(err);
	        } else {
	            res.json(rows);
	        }
	    });
	} else {
		ProjectDetails.getProjectByemail(req.params.name, function(err, rows) {
		    if(err) {
		    	logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
				logger.error("ERROR MESSAGE: "+ err);
		    	res.json(err);
		    } else {
		        res.json(rows);
		    }
	    });
	}
});

router.put('/:name',function(req, res, next) {
    ProjectDetails.updateProject(req.params.name, req.body, function(err, rows) {
        if(err) {
        	logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
			logger.error("ERROR MESSAGE: "+ err);
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});

router.post('/', function(req, res, next){
	ProjectDetails.addProject(req.body, function(err, count) {
    	if(err) {
    		logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
			logger.error("ERROR MESSAGE: "+ err);
            res.json(err);
        } else {
            res.json(req.body); //TODO: Return count for 1 & 0
        }
    });
});

router.delete('/:name',function(req, res, next){
	ProjectDetails.deleteProject(req.params.name, function(err, count) {
	    if(err) {
	    	logger.error("REQUEST URL: "+req.url+" , REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
			logger.error("ERROR MESSAGE: "+ err);
	        res.json(err);
	    } else {
	        res.json(count);
	    }
    });
});

//Return router
export {router};