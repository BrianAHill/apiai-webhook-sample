'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var host="www.pcrecruiter.net"
var port=443

const restService = express();
restService.use(bodyParser.json());


//Gets the session tokena and returns it as a string to use for other calls
function GetSessionToken(req)
{
        var UserId=req.headers.userid;
        var DatabaseId=req.headers.databaseid;
        var Password=req.headers.password;
        var AppId=req.headers.appid;
        var ApplicationKey=req.headers.applicationkey;
    
        var https = require('https');

        // options for GET
        var optionsget = {
            host : host, // here only the domain name
            port : port,
            path : '/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey, // the rest of the url with parameters if needed
            method : 'GET' // do GET
        };

        console.info('Options prepared:');
        console.info(optionsget);
        console.info('Do the GET call');

        // do the GET request
        var reqGet = https.request(optionsget, function(res) {
            console.log("statusCode: ", res.statusCode);
            // uncomment it for header details
        //  console.log("headers: ", res.headers);


            res.on('data', function(d) {
                console.info('GET result:\n');
                process.stdout.write(d);
                var results = JSON.parse(d);
                console.info('\n\nCall completed');
            });

        });

        reqGet.end();    
    
        return results.SessionId;
    
}

restService.post('/hook', function (req, res) {

    console.log('hook request');
    try {

        var speech = 'empty speech';
   
        var SessionId=GetSessionToken(req);
        console.log('Session Id',SessionId)
            
         if (req.body) {
            var requestBody = req.body;
       
    
            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
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

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
