'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const host='www.pcrecruiter.net';
const restService = express();
restService.use(bodyParser.json());


restService.post('/hook', function (req, res) {

    console.log('hook request');

        
    try {
        
        if (req.body) {
            var requestBody = req.body;
            console.log(requestBody);
            
            
            if (requestBody.result) {


                if (requestBody.result.fulfillment) {
                    FindCandidate(req);
                }

            }
        }

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

function FindCandidate(req)
{
    var FirstName = req.body.result.parameters['FirstName']; // first name required
    var LastName = req.body.result.parameters['LastName']; // last name required
    var UserId=req.headers.userid;
    var DatabaseId=req.headers.databaseid;
    var Password=req.headers.password;
    var AppId=req.headers.appid;
    var ApplicationKey=req.headers.applicationkey;

    var speech = '';
    
    var AuthURL=encodeURI('/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey);      
                      console.log('Before Auth Request',AuthURL);
                      getRequest(AuthURL).then(function (body1) {
                         console.log('Auth Body:',body1);
                         var authResponse = JSON.parse(body1);
                         var SearchCandidateURL=encodeURI('/rest/api/candidates?Query=FirstName eq ' + FirstName + ' and LastName eq ' + LastName + '&ResultsPerPage=25&SessionId=' + authResponse.SessionId);
                         console.log('Search Candidate URL',SearchCandidateURL);
                         return getRequest(SearchCandidateURL);
                      }).then(function (body2) {
                         //Count the number of candididates that came back
                         console.log('Search Candidate Results:',body2);
                         var objCandidates=JSON.parse(body2);
                         var ResultCount=objCandidates.TotalRecords;
                         console.log('Result Count:',ResultCount);
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
                             var FirstName=objCandidates.Results[0].FirstName;
                             var LastName=objCandidates.Results[0].LastName;
                             var Title=objCandidates.Results[0].Title;
                             var Address=objCandidates.Results[0].Address;
                             
                             speech='I think I found the person, what would you like to do?:\n' + FirstName + ' ' + LastName + '\n' + Title + '\n' + Address;
                         }
                          
                        console.log('Speech:',speech);
                        
                     
                          
                         return res.json({
                            speech: speech,
                            displayText: speech,
                            source: 'apiai-webhook-sample',
                            contextOut:[{name:'Candidate',parameters: {'CandidateId':objCandidates.Results[0].CandidateId}}]
                        });
                      });
    
}

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


        //console.info('Options prepared:');
        //console.info(optionsget);
        //console.info('Do the GET call');

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
                //console.info('GET result:\n');
                //console.log(buffer);
                //console.log('Logging Buffer:',buffer);
                success(buffer);
                //console.info('\n\nCall completed');
            });
        });
        reqGet.on('error', function(e) {
            console.error(e);
        });

        reqGet.end();


    });
}

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});


