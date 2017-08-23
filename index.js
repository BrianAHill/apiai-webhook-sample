'use strict';
const http = require('https');
const host = 'www.pcrecruiter.net';


exports.hook = (req, res) => {
  console.log('here');
     

};

function getRequest(url) {
  let request = require('request');  
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
