//reference of dbconnection.js
var mysql_pool = require('../DBConnection');

// REST API calls for tbl_projectdetails
var ProjectDetails = {

		getProjectByName: function(title, callback) {
			return mysql_pool.query("select * from projectdetails where title = ?", [title], callback);
		},

		getProjectByemail: function(updatedby, callback) {
			return mysql_pool.query("select * from projectdetails where updatedby = ?", [updatedby], callback);
		},

		getProjectByid: function(projectid, callback) {
			return mysql_pool.query("select * from projectdetails where projectid = ?", [projectid], callback);
		},
		getAll: function(callback){
			return mysql_pool.query("Select * from projectdetails", callback);
		},
		
		updateProject: function(projectid, projectDetails, callback) {
	    	return  mysql_pool.query("update projectdetails set projectdata = ?,  dateupdate = ?, title = ?, file = ? where projectid = ?",
	    		[projectDetails.projectdata, projectDetails.dateupdated, projectDetails.title, projectDetails.file, projectid], callback);
		},

		addProject: function(projectDetails, callback) {
			return mysql_pool.query("Insert into projectdetails values(?,?,?,?, ?, ?)", 
				[projectDetails.projectdata,
				projectDetails.projectid,
				projectDetails.title,
				 projectDetails.updatedby,
				  projectDetails.dateupdated,
				   projectDetails.file], callback);
		},

		deleteProject: function(title, callback){
			return mysql_pool.query('DELETE FROM projectdetails WHERE title = ?', [title], callback);
		}
};

module.exports = ProjectDetails;