//Dependencies
import * as express from "express";
import {Router} from "express";
let router = Router();
import * as rp from "request-promise";
import * as logger from "../utils/logger";

//Routes
router.post('/checkConnection', function(req, res, next) {
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
		logger.info("REQUEST URL: "+ req.url +", REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
		const statusCode = res.statusCode;
		return res.status(statusCode).json(data);
	})
	.catch((err) => {
		logger.info("REQUEST URL: "+ req.url +", REQUEST IP:  "+ req.ip +", RESPONSE STATUS CODE: " +res.statusCode);
		logger.error("ERROR MESSAGE: "+ err.message);
		return res.status(400).json(err.message);
	});
});

//Return router
export {router};