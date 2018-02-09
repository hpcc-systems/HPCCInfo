//reference of dbconnection.js
var mysql_pool = require('../DBConnection');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
	service: 'gmail',
	port:587,
	secure:false,
	auth: {
	user: 'polymerdemo2017@gmail.com',
	pass: 'polymerdemo_2017'
	}
});

// REST API calls for tbl_userdetails
var UserDetails = {
		sendMail: function (mailOptions, callback){
			transporter.sendMail(mailOptions, callback);
		},

		addUser: function(userDetails, callback) {
			return mysql_pool.query("Insert into user (FirstName,LastName,UserName,Password,Email,IsDeleted,CreatedDate,ModifiedDate)values(?,?,?,?,?, 0,?, ?)", 
				[userDetails.fname,
                    userDetails.lname,
                    userDetails.uname,
                    userDetails.password,
                    userDetails.emailid,
                    userDetails.dateupdated,
                    userDetails.datemodified], callback);
		},
		
        getUserByLogin: function(loginDetails,callback) {
            return mysql_pool.query("select * from user where UserName = ? and IsDeleted=0", [loginDetails], callback);
        },

        checkLoginDetails: function(username, encrypted_pwd) {
			return new Promise( (resolve, reject) => {
				mysql_pool.query(" SELECT username,Email FROM " +
								 " user WHERE UserName = ? AND Password = ? AND IsDeleted = 0",
						 		 [ username, encrypted_pwd ], (error, result) => {
					if(error) {
						return reject(error);
					}

					return resolve(result);
				});
			});
		},
		updatePassword: function(username, userDetails, callback) {
	    	return  mysql_pool.query("update user set Password = ?,  ModifiedDate = ? where UserName = ?",
	    		[userDetails.password, userDetails.dateupdated, username], callback);
		}
};

module.exports = UserDetails;