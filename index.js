'use strict';
const http = require('https');
const host = 'www.pcrecruiter.net';
let request = require('request');

exports.hook = (req, res) => {
  // Get the city and date from the request
  let FirstName = req.body.result.parameters['FirstName']; // first name required
  let LastName = req.body.result.parameters['LastName']; // last name required
  let UserId=req.headers.userid;
  let DatabaseId=req.headers.databaseid;
  let Password=req.headers.password;
  let AppId=req.headers.appid;
  let ApplicationKey=req.headers.applicationkey;

  var AuthURL=encodeURI(host + '/rest/api/access-token?DatabaseId=' + DatabaseId + '&Username=' + UserId + '&Password=' + Password + '&AppId=' + AppId + '&ApiKey=' + ApplicationKey);      
        
  getRequest(AuthURL).then(function (body1) {
     let authResponse = JSON.parse(body1);
     let SearchCandidateURL=encodeURI(host + '/rest/api/candidates?Query=FirstName eq ' + FirstName + ' and LastName eq ' + LastName + '&ResultsPerPage=25&SessionId=' + authResponse.SessionId);
     return getRequest(SearchCandidateURL);
  }).then(function (body2) {
     //Count the number of candididates that came back
     let objCandidates=JSON.parse(body2);
     let ResultCount=objCanidates.TotalRecords;
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
