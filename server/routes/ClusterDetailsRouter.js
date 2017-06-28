//Dependencies
var express = require('express');
var router = express.Router();
const rp = require('request-promise');

//Routes
router.post('/checkConnection', function(req, res, next) {
	console.log('req.body.password: ', req.body.password);
	console.log('req.body.url: ', req.body.url);
	const password = req.body.password;
	const url = req.body.url;
	rp({
		uri: url,
		json: true,
		headers: {
			'User-Agent': 'Request-Promise',
			"Authorization": "Basic " + password
		}
	})
	.then((data) => {
		console.log(data);
		const statusCode = res.statusCode;
		return res.status(statusCode).json(data);
	})
	.catch((err) => {
		console.log(err);
		return res.status(400).json(err.message);
	})
});

//Return router
module.exports = router;