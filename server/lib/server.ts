// Dependencies
import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
//import * as logger from "./utils/logger";

import { Request, Response } from "express";
import * as hpccRouter from "./routes/HpccRouter";
import * as userDetailsRouter from "./routes/UserDetailsRouter";
import * as projectDetailsRouter from "./routes/ProjectDetailsRouter";
import * as clusterDetailsRouter from "./routes/ClusterDetailsRouter";

class Server{
    constructor(){
        this.server = express();
        this.parse();
        this.routes();
        this.static();
        this.startserver();
        this.render();
    }
    
public server: express.Application;

private parse(): void{
// Body Parser MiddleWare
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({
    extended: false
    }));
}
private routes(): void {
    const router = express.Router();
    router.use('/hpcc', hpccRouter.router);
    router.use('/userDetails',userDetailsRouter.router);
    router.use('/projectDetails',projectDetailsRouter.router);
    router.use('/clusterDetails',clusterDetailsRouter.router);
    this.server.use('/', router);
}

private static():void{
// Set static path
this.server.use(express.static(path.join(__dirname, '../../client')));

//const clusterDetailsRouter = require('./routes/ClusterDetailsRouter');

//const projectDetailsRouter = require('./routes/ProjectDetailsRouter');
//const userDetailsRouter = require('./routes/UserDetailsRouter');

//this.server.use('/clusterDetails', clusterDetailsRouter);

//this.server.use('/projectDetails', projectDetailsRouter);
//this.server.use('/userDetails', userDetailsRouter);
}
private startserver() : void {
    //Start Server
    this.server.listen(3000, function() {
        console.log('server started at port 3000');
       // logger.info("Listening on port 3000");
    });
    
}
private render():void{
// Render index.html on the main page
this.server.get('*', function(req, res) {
	res.sendFile("index.html", {root: '../client'});
});
}

}
export default new Server().server