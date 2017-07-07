//Dependencies
var express = require('express');
var router = express.Router();
var ProjectDetails = require('../models/ProjectDetails');

router.get('/:name?',function(req, res, next) {
	if(!req.params.name.includes('.')){
	    ProjectDetails.getProjectByid(req.params.name, function(err, rows) {
	        if(err) {
	        	res.json(err);
	        } else {
	            res.json(rows);
	        }
	    });
	} else {
		ProjectDetails.getProjectByemail(req.params.name, function(err, rows) {
		    if(err) {
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
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});

router.post('/', function(req, res, next){
	ProjectDetails.addProject(req.body, function(err, count) {
    	if(err) {
            res.json(err);
        } else {
            res.json(req.body); //TODO: Return count for 1 & 0
        }
    });
});

router.delete('/:name',function(req, res, next){
	ProjectDetails.deleteProject(req.params.name, function(err, count) {
	    if(err) {
	        res.json(err);
	    } else {
	        res.json(count);
	    }
    });
});

//Return router
module.exports = router;