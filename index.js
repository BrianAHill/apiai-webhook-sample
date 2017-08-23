'use strict';
const http = require('https');
const host = 'www.pcrecruiter.net';


exports.hook = (req, res) => {
  console.log('here');

    // Get the city and date from the request
  var FirstName = req.body.result.parameters['FirstName']; // first name required
  var LastName = req.body.result.parameters['LastName']; // last name required
  var UserId=req.headers.userid;
  var DatabaseId=req.headers.databaseid;
  var Password=req.headers.password;
  var AppId=req.headers.appid;
  var ApplicationKey=req.headers.applicationkey;

  var AuthURL=encodeURI(host + '/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey);      
        
  getRequest(AuthURL).then(function (body1) {
     var authResponse = JSON.parse(body1);
     var SearchCandidateURL=encodeURI(host + '/rest/api/candidates?Query=FirstName eq ' + FirstName + ' and LastName eq ' + LastName + '&ResultsPerPage=25&SessionId=' + authResponse.SessionId);
     return getRequest(SearchCandidateURL);
  }).then(function (body2) {
     //Count the number of candididates that came back
     var objCandidates=JSON.parse(body2);
     var ResultCount=objCanidates.TotalRecords;
     if(ResultCount>1)
     {
        output="Too many results returned, please narrow down your results by Company.";
     }
     else if(ResultCount==0)
     {
        output="We could not find that record.";
     }
     else
     {
        output="RecordFound";
     }

     res.setHeader('Content-Type', 'application/json');
     res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
          
  }).catch((error) => {
     // If there is an error let the user know
     res.setHeader('Content-Type', 'application/json');
     res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });   

};

function getRequest(url) {
  var request = require('request');  
  return new Promise(function (success, failure) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                success(body);
            } else {
                failure(error);
            }
        });
    });
}
