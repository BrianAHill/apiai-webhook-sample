'use strict';

const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');
//test
    try {

        console.log('here');
        console.log(req.headers);
        var speech = 'empty speech';
        /*var UserId=req.headers.UserId;
        var DatabaseId=req.headers.DatabaseId;
        var Password=req.headers.Password;
        var AppId=req.headers.AppId;
        var ApplicationKey=req.headers.ApplicationKey;
        */

        
        
        if (req.body) {
            var requestBody = req.body;

            //var AuthURL='https://www.pcrecruiter.net/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey;
            
            /*var request = require('request');
            request(AuthURL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) 
                 }
            })*/
            
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
