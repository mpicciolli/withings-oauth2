var OAuth = require('oauth');
var qs = require('querystring');
var moment = require('moment');

/*
 * Available API methods:
 *
 * - OAuth
 *   - getRequestToken
 *   - authorizeUrl
 *   - getAccessToken
 *
 * - Measures
 *   - getDailySteps
 *   - getDailyCalories
 *   - getWeightMeasures
 *   - getPulseMeasures
 *   - getSleepSummary
 *
 * - Notifications
 *   - createNotification
 *   - getNotification
 *   - listNotifications
 *   - revokeNotification
 */
export interface IWithings {
    //OAuth
    getRequestToken(cb:(err:any, token:string, tokenSecret:string) => any):void;
    authorizeUrl(token:string, tokenSecret:string):string;
    getAccessToken(token, tokenSecret, verifier, cb:any):void;

    //API Base Methods
    apiCall(url:string, method:string, cb:any):void
    get(service:string, action:string, params:any, cb:any):void
    post(service:string, action:string, params:any, cb:any):void

    //Measures
    getDailyActivity(date:string|Date, cb:any):void;
    getDailySteps(date:string|Date, cb:any):void;
    getDailyCalories(date:string|Date, cb:any):void;
    getMeasures(measType:number, startDate:string|Date, endDate:string|Date, cb:any):void
    getWeightMeasures(startDate:string|Date, endDate:string|Date, cb:any):void;
    getPulseMeasures(startDate:string|Date, endDate:string|Date, cb:any):void;
    getSleepSummary(startDate:string|Date, endDate:string|Date, cb:any):void;

    //Notifications
    createNotification(callbackUrl:string, comment:string, appli:number, cb:any):void;
    getNotification(callbackUrl:string, appli:number, cb:any):void;
    listNotifications(appli:number, cb:any):void;
    revokeNotification(callbackUrl:string, appli:number, cb:any):void;
}

export interface WhitingsOptionModel {
    consumerKey:string;
    consumerSecret:string;
    callbackUrl?:string;
    accessToken?:string;
    accessTokenSecret?:string;
    userID?:string;
}

export class Withings implements IWithings {
    //API EndPoints
    public static requestToken:string = "https://oauth.withings.com/account/request_token";
    public static accessToken:string = "https://oauth.withings.com/account/access_token";
    public static authorize:string = "https://oauth.withings.com/account/authorize";

    private accessToken:string;
    private accessTokenSecret:string;
    private userID:string;
    private oauth:any;

    constructor(private config:WhitingsOptionModel) {
        this.oauth = new OAuth.OAuth(
            Withings.requestToken,
            Withings.accessToken,
            config.consumerKey,
            config.consumerSecret,
            '1.0',
            config.callbackUrl,
            'HMAC-SHA1'
        );

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

    getRequestToken(cb:any):void {
        this.oauth.getOAuthRequestToken(cb);
    }

    authorizeUrl(token:string, tokenSecret:string):string {
        return this.oauth.signUrl(Withings.authorize, token, tokenSecret);
    }

    getAccessToken(token, tokenSecret, verifier, cb:any):void {
        this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
    }

    apiCall(url:string, method:string, cb:any):void {
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
    }

    get(service:string, action:string, params:any, cb:any):void {
        if (!cb) {
            cb = params;
            params = {};
        }
        params.action = action;
        params.userid = this.userID;

        var baseUrl;
        if (action === 'getmeas' || service === 'notify') {
            baseUrl = 'http://wbsapi.withings.net/';
        } else {
            baseUrl = 'http://wbsapi.withings.net/v2/';
        }

        var url = baseUrl + service + '?' + qs.stringify(params);
        this.apiCall(url, 'get', cb);
    }

    post(service:string, action:string, params:any, cb:any):void {
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

    getDailyActivity(date:string|Date, cb:any):void {
        var params = {
            date: moment(date).format('YYYY-MM-DD')
        };
        this.get('measure', 'getactivity', params, cb);
    }

    getDailySteps(date:string|Date, cb:any):void {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.steps);
        });
    }

    getDailyCalories(date:string|Date, cb:any):void {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.calories);
        });
    }

    getMeasures(measType:number, startDate:string|Date, endDate:string|Date, cb:any):void {
        var params = {
            startdate: moment(startDate).unix(),
            enddate: moment(endDate).unix(),
            meastype: measType
        };
        this.get('measure', 'getmeas', params, cb);
    }

    getWeightMeasures(startDate:string|Date, endDate:string|Date, cb:any):void {
        this.getMeasures(1, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.measuregrps);
        });
    }

    getPulseMeasures(startDate:string|Date, endDate:string|Date, cb:any):void {
        this.getMeasures(11, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.measuregrps);
        });
    }

    getSleepSummary(startDate:string|Date, endDate:string|Date, cb:any):void {
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
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.series);
        });
    }

    createNotification(callbackUrl:string, comment:string, appli:number, cb:any):void {
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
            } catch (error) {
                // leave data as-is
            }
            cb(null, data);
        });
    }

    getNotification(callbackUrl:string, appli:number, cb:any):void {
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
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body);
        });
    }

    listNotifications(appli:number, cb:any):void {
        if (!cb) {
            cb = appli;
            appli = null;
        }
        var params = {
            appli: null
    }
        ;
        if (appli) {
            params.appli = appli;
        }
        this.get('notify', 'list', params, function (err, data) {
            if (err) {
                return cb(err);
            }
            try {
                data = JSON.parse(data);
            } catch (error) {
                // leave data as-is
            }
            cb(null, data.body.profiles);
        });
    }

    revokeNotification(callbackUrl:string, appli:number, cb:any):void {
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
            } catch (error) {
                // leave data as-is
            }
            cb(null, data);
        });
    }

}