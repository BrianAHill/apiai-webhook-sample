'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const host='www.pcrecruiter.net';
const restService = express();
restService.use(bodyParser.json());


restService.post('/hook', function (req, res) {

    console.log('hook request');
    var FirstName = req.body.result.parameters['FirstName']; // first name required
    var LastName = req.body.result.parameters['LastName']; // last name required
    var UserId=req.headers.userid;
    var DatabaseId=req.headers.databaseid;
    var Password=req.headers.password;
    var AppId=req.headers.appid;
    var ApplicationKey=req.headers.applicationkey;
        
    try {
        var speech = 'empty speech';
        
        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                      var AuthURL=encodeURI('/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey);      
                      console.log('Before Auth Request',AuthURL);
                      getRequest(AuthURL).then(function (body1) {
                         console.log('Making Auth Request');
                         console.log(body1);
                          let authResponse = JSON.parse(body1);
                         let SearchCandidateURL=encodeURI('/rest/api/candidates?Query=FirstName eq ' + FirstName + ' and LastName eq ' + LastName + '&ResultsPerPage=25&SessionId=' + authResponse.SessionId);
                         console.log(SearchCandidateURL);
                         return getRequest(SearchCandidateURL);
                      }).then(function (body2) {
                         //Count the number of candididates that came back
                         console.log(body2);
                         let objCandidates=JSON.parse(body2);
                         let ResultCount=objCanidates.TotalRecords;
                         if(ResultCount>1)
                         {
                            speech='Too many results returned, please narrow down your results by Company.';
                         }
                         else if(ResultCount==0)
                         {
                            speech='We could not find that record.';
                         }
                         else
                         {
                            speech='RecordFound';
                         }
                    });  
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            source: 'apiai-webhook-sample'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

function getRequest(strpath) {
    return new Promise(function (success, failure) {
        var buffer='';
        var https = require('https');

        var optionsget = {
            host : host,
            port : 443,
            path : strpath,
            method : 'GET'
        };


        console.info('Options prepared:');
        console.info(optionsget);
        console.info('Do the GET call');

        var reqGet = https.get(optionsget, function(res,cb) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);



            res.on('data', function(d) {
                //console.info('GET result:\n');
                //process.stdout.write(d);
                buffer += d.toString();
                //console.info('\n\nCall completed');
            });

            res.on('end', function() {
                console.info('GET result:\n');
                console.log(buffer);
                console.info('\n\nCall completed');
            });
        });
        reqGet.on('error', function(e) {
            console.error(e);
        });

        reqGet.end();
        success(buffer);
    });
}

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});


