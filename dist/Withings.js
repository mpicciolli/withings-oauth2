"use strict";
var OAuth = require('oauth');
var qs = require('querystring');
var moment = require('moment');
class Withings {
    constructor(config) {
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
    getRequestToken(cb) {
        this.oauth.getOAuthRequestToken(cb);
    }
    getRequestTokenAsync() {
        return new Promise((resolve, reject) => {
            this.oauth.getOAuthRequestToken(function (err, token, tokenSecret) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ "token": token, "tokenSecret": tokenSecret });
                }
            });
        });
    }
    authorizeUrl(token, tokenSecret) {
        return this.oauth.signUrl(Withings.authorize, token, tokenSecret);
    }
    getAccessToken(token, tokenSecret, verifier, cb) {
        this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
    }
    getAccessTokenAsync(token, tokenSecret, verifier) {
        return new Promise((resolve, reject) => {
            this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, function (err, accessToken, accesstokenSecret) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ "token": accessToken, "tokenSecret": accesstokenSecret });
                }
            });
        });
    }
    apiCall(url, method, cb) {
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
                try {
                    data = JSON.parse(data);
                }
                catch (error) {
                    cb.call(that, err, err);
                }
                cb.call(that, err, data);
            });
        }
        if (method === 'post') {
            this.oauth.post(signedUrl, this.accessToken, this.accessTokenSecret, function (err, data, res) {
                cb.call(that, err, data);
            });
        }
    }
    apiCallAsync(url, method, cb) {
        return new Promise((resolve, reject) => {
            this.apiCall(url, method, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    get(service, action, params, cb) {
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
    }
    getAsync(service, action, params) {
        return new Promise((resolve, reject) => {
            this.get(service, action, params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    post(service, action, params, cb) {
        if (!cb) {
            cb = params;
            params = {};
        }
        params.action = action;
        params.userid = this.userID;
        var baseUrl = 'http://wbsapi.withings.net/';
        var url = baseUrl + service + '?' + qs.stringify(params);
        this.apiCall(url, 'post', cb);
    }
    postAsync(service, action, params, cb) {
        return new Promise((resolve, reject) => {
            this.post(service, action, params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getDailyActivity(date, cb) {
        var params = {
            date: moment(date).format('YYYY-MM-DD')
        };
        this.get('measure', 'getactivity', params, cb);
    }
    getDailyActivityAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailyActivity(date, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getDailySteps(date, cb) {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.steps);
        });
    }
    getDailyStepsAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailySteps(date, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getDailyCalories(date, cb) {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.calories);
        });
    }
    getDailyCaloriesAsync(date) {
        return new Promise((resolve, reject) => {
            this.getDailyCalories(date, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getMeasures(measType, startDate, endDate, cb) {
        var params = {
            startdate: moment(startDate).unix(),
            enddate: moment(endDate).unix(),
            meastype: measType
        };
        this.get('measure', 'getmeas', params, cb);
    }
    getMeasuresAsync(measType, startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.getMeasures(measType, startDate, endDate, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getWeightMeasures(startDate, endDate, cb) {
        this.getMeasures(1, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.measuregrps);
        });
    }
    getWeightMeasuresAsync(startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.getWeightMeasures(startDate, endDate, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getPulseMeasures(startDate, endDate, cb) {
        this.getMeasures(11, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.measuregrps);
        });
    }
    getPulseMeasuresAsync(startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.getPulseMeasures(startDate, endDate, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getSleepSummary(startDate, endDate, cb) {
        var params = {
            startdateymd: moment(startDate).format('YYYY-MM-DD'),
            enddateymd: moment(endDate).format('YYYY-MM-DD')
        };
        this.get('sleep', 'getsummary', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.series);
        });
    }
    getSleepSummaryAsync(startDate, endDate) {
        return new Promise((resolve, reject) => {
            this.getSleepSummary(startDate, endDate, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    createNotification(callbackUrl, comment, appli, cb) {
        var params = {
            callbackurl: callbackUrl,
            comment: comment,
            appli: appli
        };
        this.get('notify', 'subscribe', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data);
        });
    }
    createNotificationAsync(callbackUrl, comment, appli) {
        return new Promise((resolve, reject) => {
            this.createNotification(callbackUrl, comment, appli, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    getNotification(callbackUrl, appli, cb) {
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
            cb(null, data.body);
        });
    }
    getNotificationAsync(callbackUrl, appli) {
        return new Promise((resolve, reject) => {
            this.getNotification(callbackUrl, appli, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    listNotifications(appli, cb) {
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
            cb(null, data.body.profiles);
        });
    }
    listNotificationsAsync(appli) {
        return new Promise((resolve, reject) => {
            this.listNotifications(appli, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    revokeNotification(callbackUrl, appli, cb) {
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
            cb(null, data);
        });
    }
    revokeNotificationAsync(callbackUrl, appli) {
        return new Promise((resolve, reject) => {
            this.revokeNotification(callbackUrl, appli, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}
//API EndPoints
Withings.requestToken = "https://oauth.withings.com/account/request_token";
Withings.accessToken = "https://oauth.withings.com/account/access_token";
Withings.authorize = "https://oauth.withings.com/account/authorize";
exports.Withings = Withings;

//# sourceMappingURL=Withings.js.map
