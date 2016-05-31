"use strict";
var OAuth = require('oauth');
var qs = require('querystring');
var moment = require('moment');
var Withings = (function () {
    function Withings(config) {
        this.config = config;
        this.oauth = new OAuth.OAuth(Withings.requestToken, Withings.accessToken, config.consumerKey, config.consumerSecret, '1.0', config.callbackUrl, 'HMAC-SHA1');
        // Store authenticated access if it exists
        if (config.accessToken) {
            this.accessToken = config.accessToken;
            this.accessTokenSecret = config.accessTokenSecret;
        }
        // Store a user ID if it exists
        if (config.userID) {
            this.userID = config.userID;
        }
    }
    Withings.prototype.getRequestToken = function (cb) {
        this.oauth.getOAuthRequestToken(cb);
    };
    Withings.prototype.authorizeUrl = function (token, tokenSecret) {
        return this.oauth.signUrl(Withings.authorize, token, tokenSecret);
    };
    Withings.prototype.getAccessToken = function (token, tokenSecret, verifier, cb) {
        this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
    };
    Withings.prototype.apiCall = function (url, method, cb) {
        var that = this;
        if (!this.accessToken || !this.accessTokenSecret) {
            throw new Error('Authenticate before making API calls');
        }
        if (!this.userID) {
            throw new Error('API calls require a user ID');
        }
        var signedUrl = this.oauth.signUrl(url, this.accessToken, this.accessTokenSecret);
        if (method === 'get') {
            this.oauth.get(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
                cb.call(that, err, data);
            });
        }
        if (method === 'post') {
            this.oauth.post(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
                cb.call(that, err, data);
            });
        }
    };
    Withings.prototype.get = function (service, action, params, cb) {
        if (!cb) {
            cb = params;
            params = {};
        }
        params.action = action;
        params.userid = this.userID;
        var baseUrl;
        if (action === 'getmeas' || service === 'notify') {
            baseUrl = 'http://wbsapi.withings.net/';
        }
        else {
            baseUrl = 'http://wbsapi.withings.net/v2/';
        }
        var url = baseUrl + service + '?' + qs.stringify(params);
        this.apiCall(url, 'get', cb);
    };
    Withings.prototype.post = function (service, action, params, cb) {
        if (!cb) {
            cb = params;
            params = {};
        }
        params.action = action;
        params.userid = this.userID;
        var baseUrl = 'http://wbsapi.withings.net/';
        var url = baseUrl + service + '?' + qs.stringify(params);
        this.apiCall(url, 'post', cb);
    };
    Withings.prototype.getDailyActivity = function (date, cb) {
        var params = {
            date: moment(date).format('YYYY-MM-DD')
        };
        this.get('measure', 'getactivity', params, cb);
    };
    Withings.prototype.getDailySteps = function (date, cb) {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.steps);
        });
    };
    Withings.prototype.getDailyCalories = function (date, cb) {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.calories);
        });
    };
    Withings.prototype.getMeasures = function (measType, startDate, endDate, cb) {
        var params = {
            startdate: moment(startDate).unix(),
            enddate: moment(endDate).unix(),
            meastype: measType
        };
        this.get('measure', 'getmeas', params, cb);
    };
    Withings.prototype.getWeightMeasures = function (startDate, endDate, cb) {
        this.getMeasures(1, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.measuregrps);
        });
    };
    Withings.prototype.getPulseMeasures = function (startDate, endDate, cb) {
        this.getMeasures(11, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.measuregrps);
        });
    };
    Withings.prototype.getSleepSummary = function (startDate, endDate, cb) {
        var params = {
            startdateymd: moment(startDate).format('YYYY-MM-DD'),
            enddateymd: moment(endDate).format('YYYY-MM-DD')
        };
        this.get('sleep', 'getsummary', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.series);
        });
    };
    Withings.prototype.createNotification = function (callbackUrl, comment, appli, cb) {
        var params = {
            callbackurl: callbackUrl,
            comment: comment,
            appli: appli
        };
        this.get('notify', 'subscribe', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data);
        });
    };
    Withings.prototype.getNotification = function (callbackUrl, appli, cb) {
        if (!cb) {
            cb = appli;
            appli = null;
        }
        var params = {
            callbackurl: callbackUrl,
            appli: null
        };
        if (appli) {
            params.appli = appli;
        }
        this.get('notify', 'get', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body);
        });
    };
    Withings.prototype.listNotifications = function (appli, cb) {
        if (!cb) {
            cb = appli;
            appli = null;
        }
        var params = {
            appli: null
        };
        if (appli) {
            params.appli = appli;
        }
        this.get('notify', 'list', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data.body.profiles);
        });
    };
    Withings.prototype.revokeNotification = function (callbackUrl, appli, cb) {
        if (!cb) {
            cb = appli;
            appli = null;
        }
        var params = {
            callbackurl: callbackUrl,
            appli: null
        };
        if (appli) {
            params.appli = appli;
        }
        this.get('notify', 'revoke', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            }
            catch (error) {
            }
            cb(null, data);
        });
    };
    //API EndPoints
    Withings.requestToken = "https://oauth.withings.com/account/request_token";
    Withings.accessToken = "https://oauth.withings.com/account/access_token";
    Withings.authorize = "https://oauth.withings.com/account/authorize";
    return Withings;
}());
exports.Withings = Withings;

//# sourceMappingURL=Withings.js.map
