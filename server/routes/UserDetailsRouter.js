//Dependencies
var express = require('express');
var router = express.Router();
var UserDetails = require('../models/UserDetails');
const logger = require("../utils/logger");
var Utils = require('../utils/GenericFunctions');
var crypto = require('crypto');

router.get('/:userName?', function (req, res, next) {
	UserDetails.getUserByLogin(req.params.userName, function (err, rows) {
		if (err) {
			logger.error("REQUEST URL: " + req.url + " , REQUEST IP:  " + req.ip + ", RESPONSE STATUS CODE: " + res.statusCode);
			logger.error("ERROR MESSAGE: " + err);
			res.json(err);
		} else {
			var UserName = rows[0].UserName;
			var cipher = crypto.createCipher('aes-256-ctr', 'd6F3Efeq');
			var myUser = cipher.update(UserName, 'utf8', 'hex');
			myUser += cipher.final('hex');
			var Body = '<body>' +
				'<div style="font-family: sans-serif; color:#333333; border:2pt solid #ff7043;padding: 0pt 25pt;">' +
				'<div style="width:100%; height:25px;">&nbsp;</div>' +
				'<h2 style="margin-top: 0;margin-bottom:0;">Password Reset</h2>' +
				'<div style="margin-top: 10pt;margin-bottom:0;border-bottom:1pt solid #666;line-height:0;">&nbsp;</div>' +
				'<div style="font-size: 12pt;margin-top:25pt;margin-bottom:0;">' +
				'<p style="margin: 0 0 8pt;"><strong>Seems like you forgot your password for HPCC Info.</strong></p>' +
				'<p style="margin: 0 0 25pt;">If that sounds right, you can enter new password by clicking on the link below.</p>' +
				'<p style="margin: 0 0 5pt;">' +
				'<a href="http://127.0.0.1:3000/reset?Key=' + myUser + '" style="color: #ffffff;text-decoration: none;border: 6pt solid #ff7043;background: #ff7043;">http://127.0.0.1:3000/reset?Key=' + myUser + '</a>' +
				'</p>' +
				'</div>' +
				'<div style="width:100%; height:35px;">&nbsp;</div>' +
				'</div>' +
				'</body>';


			var mailOptions = {
				from: 'polymerdemo2017@gmail.com',
				to: rows[0].Email,
				subject: 'Reset Password for HPCC Info',
				html: Body
			};
			console.log("Email: " + mailOptions.to);
			UserDetails.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
			res.json(rows);
		}
	});
});

router.post('/', function (req, res, next) {
	UserDetails.addUser(req.body, function (err, count) {
		if (err) {
			logger.error("REQUEST URL: " + req.url + " , REQUEST IP:  " + req.ip + ", RESPONSE STATUS CODE: " + res.statusCode);
			logger.error("ERROR MESSAGE: " + err);
			res.json(err);
		} else {
			res.json(req.body); //TODO: Return count for 1 & 0		
			logger.error("success MESSAGE: " + req.body.count);
		}
	});
});

router.post('/login', function (req, res) {
	var username, password;
	if (!Utils.empty(req.body.username) && !Utils.empty(req.body.password)) {
		username = req.body.username;
		password = req.body.password;
	}
	var userObj = {};

	UserDetails.checkLoginDetails(username, password)
		.then(results => {
			console.log(results);
			if (results.length === 0) {
				throw new Error("No User Found");
			} else {
				userObj = results[0];
				return userObj;
			}
		})
		.then(results => {
			res.json(userObj);
		})
		.catch(error => {
			console.log(error.message);
			// Return empty arry indicating No User Found
			res.json([]);
		})
});

router.put('/:userName', function (req, res, next) {
	var crypted = req.params.userName;
	var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq');
	var dec = decipher.update(crypted, 'hex', 'utf8');
	dec += decipher.final('utf8');
	UserDetails.updatePassword(dec, req.body, function (err, rows) {
		if (err) {
			logger.error("REQUEST URL: " + req.url + " , REQUEST IP:  " + req.ip + ", RESPONSE STATUS CODE: " + res.statusCode);
			logger.error("ERROR MESSAGE: " + err);
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});
router.put('/changePassword/:userName', function (req, res, next) {
	var username, oldpassword;
	username = req.params.userName;
	if (!Utils.empty(req.body.oldpassword)) {		
		oldpassword = req.body.oldpassword;
	}
	var userObj = {};
	UserDetails.checkLoginDetails(username, oldpassword)
		.then(results => {
			console.log(results);
			if (results.length === 0) {
				throw new Error("No User Found");
			} else {
				UserDetails.updatePassword(username, req.body, function (err, rows) {
					if (err) {
						logger.error("REQUEST URL: " + req.url + " , REQUEST IP:  " + req.ip + ", RESPONSE STATUS CODE: " + res.statusCode);
						logger.error("ERROR MESSAGE: " + err);
						res.json(err);
					} else {
						res.json(rows);
					}
				});
			}
		});
});


//Return router
module.exports = router;