import { Router } from 'express';
import { locateClientTools, Workunit, Topology, DFUService, WorkunitsService } from "@hpcc-js/comms";
import {Guid} from "guid-typescript";
import * as superagent from "superagent";
//import * as fs from "fs";
var fs = require('fs');

let router = Router();



router.get('/testCall1', function (request, response, next) {
    try {
        console.log("Calling testCall1...");
        //Topology.fetchTargetClusters();
        // SampleFile.getUserByName('test')
        //     .then(results => {
        //         console.log('User: ', results);
        // 		response.json(results);
        //     })
        //     .catch(error => {
        // 		console.log(error);
        // 		response.json(error);
        // 	});
    } catch (err) {
        console.log('err', err);
        next(err);
    }
});

router.post('/getThorList', function (request, response) {
    try {
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
        let myTopology = new Topology({ baseUrl: url, userID: username, password: password });
        myTopology.fetchTargetClusters().then((targetClusterList) => {
            response.json(targetClusterList);
        });

    } catch (err) {
        console.log('err', err);
    }
});

router.post('/getFileListForSearch', function (request, response) {
    try {
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
        let pattern = request.body.pattern;
        let contentType = request.body.contentType;
        let myDFUService = new DFUService({ baseUrl: url, userID: username, password: password });
        myDFUService.DFUQuery({ LogicalName: pattern, ContentType: contentType }).then((filelist) => {
            response.json(filelist);
        });

    } catch (err) {
        console.log('err', err);
    }
});

router.get('/callForFileDetails', function (request, response) {
    try {
        let url = request.query.eclIP;
        let filename = request.query.selectedFile;
        url = url + "/WsDfu/DFUInfo.json";
        //filename = (filename.startsWith('~') === false ? '~' : '') + filename;
        superagent
            .get(url)
            .query({ Name: filename })
            .end((err, res1) => {
                if (err) { return console.log('Error: ', err); }
                console.log('Body: ', res1.body);
                response.json(res1.body);
            });
    } catch (err) {
        console.log('err', err);
    }
});

router.post('/getWorkunitInfo', function (request, response) {
    try {
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
        let wuid = request.body.wuid;
        let myWorkunitsService = new WorkunitsService({ baseUrl: url, userID: username, password: password });
        myWorkunitsService.WUInfo({ Wuid: wuid }).then((winfo) => {
           // console.log(`${winfo.Workunit.Wuid}`);
            response.json(winfo);
        });
    } catch (err) {
        console.log('err', err);
    }
});
router.post('/workUnitCreateandUpdate', function (request, response) {
    try {
        console.log("Workunit Create and Update");
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
        let QueryText = request.body.QueryText;
        console.log("//////////",QueryText);
        let recLimit = request.body.ResultLimit;
        let ClusterId = request.body.ClusterId;
        //let wuid = request.body.wuid;
        let myWorkunitsService = new WorkunitsService({ baseUrl: url, userID: username, password: password });
        myWorkunitsService.WUCreate().then((wunit) => {
            myWorkunitsService.WUUpdate({ Wuid: wunit.Workunit.Wuid, QueryText: QueryText, ResultLimit: recLimit, Jobname: 'HPCCInfoRequest' }).then((workunits) => {
                myWorkunitsService.WUSubmit({ Wuid: workunits.Workunit.Wuid, Cluster: ClusterId }).then((workunit) => {
                    console.log(workunit);
                });
            });
            response.json(wunit);
        });
    } catch (err) {
        console.log('err', err);
    }
});
router.post('/workUnitResult', function (request, response) {
    try {
        console.log("Workunit Result");
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
        //let QueryText = request.body.QueryText;
        let wuid = request.body.wuid;
        let recLimit = request.body.ResultLimit;
        let ClusterId = request.body.ClusterId;
        let resultName = request.body.ResultName;
        console.log("...................................",resultName);
        let myWorkunitsService = new WorkunitsService({ baseUrl: url, userID: username, password: password });
        myWorkunitsService.WUResult({ Wuid: wuid, Cluster: ClusterId, Start: 0, ResultName: resultName, Count: recLimit }).then((wunit) => {
            response.json(wunit);
        });
    } catch (err) {
        console.log('err', err);
    }
});
router.post('/ajaxCreateECLFIle', function (request, response) {
    try {
        let url = request.body.eclIP;
        let username = request.body.username;
        let password = request.body.password;
       let QueryText = request.body.eclQuery;
       let ClusterId = request.body.clusterid;       
       console.log("ajaxCreateECLFIle===================", QueryText);
       var id = Guid.create();
    fs.writeFile('./lib/temp/In/'+id+'.ecl',QueryText, 'UTF8',(err) => {
        if (err) throw err;
        console.log('====----====The file has been saved!',ClusterId);
      });
      locateClientTools(undefined, undefined, ".").then((clientTools) => {
        return clientTools.createArchive('./lib/temp/In/'+id+'.ecl');
    }).then(archive => {
        return Workunit.submit({ baseUrl: url, userID: username, password: password }, ClusterId, archive.content);
    }).then((wu) => {
        console.log("watchuntilcomplete");
        return wu.watchUntilComplete();
    }).then((wu) => {
        console.log("wt then", wu);
        return wu.fetchResults().then((results) => {
            let wt = results[0].fetchRows();
            console.log('wt',results);
            return wt;
        }).then((rows) => {
            console.log('wu',wu);
            return wu;
        }).then((rs)=>{
            console.log("File is deleted",rs);
            fs.unlinkSync('./lib/temp/In/'+id+'.ecl' );           
            response.json(rs); 
        });         
    });
    } catch (err) {
        console.log('err', err);
    }
});

export { router };  