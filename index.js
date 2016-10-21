'use strict';

var request = require('request');
var AuthService = require('./services/authService');

function Sap(credentials) {
  var authService = new AuthService(credentials);
  this.tokenPromise = authService.tokenPromise;

  this.httpUri    = 'https://api-eu.sapanywhere.com:443';
  this.version    = 'v1';
}

Sap.prototype.execute = function (args, callback) {
  var that = this;
  var requestParams = formatParams(args.params);

  that.tokenPromise
    .then(function (accessToken) {
      var options = {
        method: args.method,
        url: that.httpUri + '/' + that.version + '/' + args.path
          + '?' + requestParams + 'access_token=' + accessToken,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(args.body),
      };

      request(options, function (err, res, body) {
        var data;

        if (body) { data = JSON.parse(body); }

        if (err) {
          callback(err);
        } else if (!err && res.statusCode !== 200) {
          callback(new Error(res.statusCode + ' error: ' + data.error));
        } else {
          callback(null, data);
        }
      });
    })
    .catch(function (error) {
      callback(error);
    });
};

function formatParams(params) {
  var requestParams = '';
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      requestParams += key + '=' + params[key] + '&';
    }
  }
  return requestParams;
}

module.exports = function (credentials) {
  return new Sap(credentials);
};
