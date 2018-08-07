import * as mysql from "mysql";
//MySQL Connection
const pool = mysql.createPool({
	connectionLimit : 100, //important
	host:'localhost',
 	user:'root',
 	password:'root',
 	database:'hpccinfo'
});
export = pool;

