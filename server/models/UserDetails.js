//reference of dbconnection.js
var mysql_pool = require('../DBConnection');

// REST API calls for tbl_projectdetails
var UserDetails = {

		getUserByName: function(userdtls, callback) {
			return mysql_pool.query("select * from hpccinfo.userDetails where username = ? and pwd = ?", [userdtls.username, userdtls.pwd], callback);
		}
};

module.exports = UserDetails;