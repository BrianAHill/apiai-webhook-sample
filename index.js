'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var host="www.pcrecruiter.net"
var port=443

const restService = express();
restService.use(bodyParser.json());
var https = require('https');

function GetJSON(options,cb)
{
        https.request(options,function(res){
                var body='';
                
                res.on('data',function(chunk){
                        body+=chunk;
                });
                              
                res.on('end',function(){
                        var result=JSON.parse(body);
                        cb(null,result);
                });    
                
                res.on('error',cb);
                
                }).end();                
}

//Gets the session tokena and returns it as a string to use for other calls
function GetSessionToken(req,cb)
{
        var UserId=req.headers.userid;
        var DatabaseId=req.headers.databaseid;
        var Password=req.headers.password;
        var AppId=req.headers.appid;
        var ApplicationKey=req.headers.applicationkey;
        var TokenReturn;


        // options for GET
        var optionsget = {
            host : host, // here only the domain name
            port : port,
            path : '/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey, // the rest of the url with parameters if needed
            method : 'GET' // do GET
        };

        GetJSON(optionsget,function(err,result){
                if(err){
                        return console.log('Error getting Token: ',err);       
                }
                cb(null,result);
        });
        
       
   
}

restService.post('/hook', function (req, res) {

    var Token;
    var FirstName;
    var LastName;
        
    console.log('hook request');
    try {

        var speech = 'empty speech';
   
        GetSessionToken(req,function(err,result){

                if(err){
                        return console.log('Error getting Token: ',err);       
                }
        
                Token=result.SessionId;
                              
                
                 if (req.body) {
                    var requestBody = req.body;
                    console.log(requestBody.result);
                    FirstName=requestBody.result.parameters.FirstName;
                    LastName=requestBody.result.parameters.LastName;

                      
                    if (requestBody.result) {
                        speech = '';
                        console.log('About To Add Note1');

                            
                        if (requestBody.result.fulfillment) {
                            speech += requestBody.result.fulfillment.speech;
                            speech += 'You would like to add a note to ' + FirstName + ' ' + LastName + '?';
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
