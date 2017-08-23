'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const host='https://www2.pcrecruiter.net';
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

function getRequest(urlpath) {
    var https=require('https');
    var options = {
      host: host,
      port: 443,
      path: urlpath,
      method: 'GET'
    };

    https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    }).end();
    
}

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});


