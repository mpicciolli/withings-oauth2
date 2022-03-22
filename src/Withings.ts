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
    getRequestTokenAsync():Promise<any>
    authorizeUrl(token:string, tokenSecret:string):string;
    getAccessToken(token:string, tokenSecret:string, verifier:string, cb:(err:any, token:string, tokenSecret:string)=>any):void;
    getAccessTokenAsync(token:string, tokenSecret:string, verifier:string):Promise<any>

    //API Base Methods
    apiCall(url:string, method:string, cb:(err:any, data:any)=>any):void
    apiCallAsync(url:string, method:string, cb:any):Promise<any>
    get(service:string, action:string, params:(err:any, data:any)=>any, cb:any):void
    getAsync(service:string, action:string, params:any):Promise<any>
    post(service:string, action:string, params:(err:any, data:any)=>any, cb:any):void
    postAsync(service:string, action:string, params:any, cb:any):Promise<any>

    //Measures
    getDailyActivity(date:string|Date, cb:(err:any, data:any)=>any):void;
    getDailyActivityAsync(date:string|Date):Promise<any>;
    getDailySteps(date:string|Date, cb:(err:any, data:any)=>any):void;
    getDailyStepsAsync(date:string|Date):Promise<any>;
    getDailyCalories(date:string|Date, cb:(err:any, data:any)=>any):void;
    getDailyCaloriesAsync(date:string|Date):Promise<any>;
    getMeasures(measType:number, startDate:string|Date, endDate:string|Date, cb:(err:any, data:any)=>any):void
    getMeasuresAsync(measType:number, startDate:string|Date, endDate:string|Date):Promise<any>;
    getWeightMeasures(startDate:string|Date, endDate:string|Date, cb:(err:any, data:any)=>any):void;
    getWeightMeasuresAsync(startDate:string|Date, endDate:string|Date):Promise<any>;
    getPulseMeasures(startDate:string|Date, endDate:string|Date, cb:(err:any, data:any)=>any):void;
    getPulseMeasuresAsync(startDate:string|Date, endDate:string|Date):Promise<any>;
    getSleepSummary(startDate:string|Date, endDate:string|Date, cb:(err:any, data:any)=>any):void;
    getSleepSummaryAsync(startDate:string|Date, endDate:string|Date):Promise<any>;

    //Notifications
    createNotification(callbackUrl:string, comment:string, appli:number, cb:(err:any, data:any)=>any):void;
    createNotificationAsync(callbackUrl:string, comment:string, appli:number):Promise<any>;
    getNotification(callbackUrl:string, appli:number, cb:(err:any, data:any)=>any):void;
    getNotificationAsync(callbackUrl:string, appli:number):Promise<any>;
    listNotifications(appli:number, cb:(err:any, data:any)=>any):void;
    listNotificationsAsync(appli:number):Promise<any>;
    revokeNotification(callbackUrl:string, appli:number, cb:(err:any, data:any)=>any):void;
    revokeNotificationAsync(callbackUrl:string, appli:number):Promise<any>;

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
    public static requestToken:string = "https://wbsapi.withings.net/v2/oauth2";
    public static accessToken:string = "https://wbsapi.withings.net/v2/oauth2";
    public static authorize:string = "https://account.withings.com/oauth2_user/authorize2";

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

    getRequestTokenAsync():Promise<any> {
        return new Promise((resolve, reject) => {
            this.oauth.getOAuthRequestToken(function (err:any, token:string, tokenSecret:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({"token": token, "tokenSecret": tokenSecret});
                }
            });
        });
    }

    authorizeUrl(token:string, tokenSecret:string):string {
        return this.oauth.signUrl(Withings.authorize, token, tokenSecret);
    }

    getAccessToken(token, tokenSecret, verifier, cb:any):void {
        this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, cb);
    }

    getAccessTokenAsync(token, tokenSecret, verifier):Promise<any> {
        return new Promise((resolve, reject) => {
            this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, function (err:any, accessToken:string, accesstokenSecret:string) {
                if (err) {
                    reject(err);
                } else {
                    resolve({"token": accessToken, "tokenSecret": accesstokenSecret});
                }
            });
        });
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
                try {
                    data = JSON.parse(data);
                } catch (error) {
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

    apiCallAsync(url:string, method:string, cb:any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.apiCall(url, method, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
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

    getAsync(service:string, action:string, params:any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.get(service, action, params,function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
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

    postAsync(service:string, action:string, params:any, cb:any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.post(service, action, params,function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    getDailyActivity(date:string|Date, cb:any):void {
        var params = {
            date: moment(date).format('YYYY-MM-DD')
        };
        this.get('measure', 'getactivity', params, cb);
    }

    getDailyActivityAsync(date:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getDailyActivity(date, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    getDailySteps(date:string|Date, cb:any):void {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.steps);
        });
    }

    getDailyStepsAsync(date:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getDailySteps(date, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    getDailyCalories(date:string|Date, cb:any):void {
        this.getDailyActivity(date, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.calories);
        });
    }

    getDailyCaloriesAsync(date:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getDailyCalories(date, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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

    getMeasuresAsync(measType:number, startDate:string|Date, endDate:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getMeasures(measType, startDate, endDate, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    getWeightMeasures(startDate:string|Date, endDate:string|Date, cb:any):void {
        this.getMeasures(1, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.measuregrps);
        });
    }

    getWeightMeasuresAsync(startDate:string|Date, endDate:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getWeightMeasures(startDate, endDate, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    getPulseMeasures(startDate:string|Date, endDate:string|Date, cb:any):void {
        this.getMeasures(11, startDate, endDate, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data.body.measuregrps);
        });
    }

    getPulseMeasuresAsync(startDate:string|Date, endDate:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getPulseMeasures(startDate, endDate, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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
            cb(null, data.body.series);
        });
    }

    getSleepSummaryAsync(startDate:string|Date, endDate:string|Date):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getSleepSummary(startDate, endDate, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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
            cb(null, data);
        });
    }

    createNotificationAsync(callbackUrl:string, comment:string, appli:number):Promise<any> {
        return new Promise((resolve, reject) => {
            this.createNotification(callbackUrl, comment, appli, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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
            cb(null, data.body);
        });
    }

    getNotificationAsync(callbackUrl:string, appli:number):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getNotification(callbackUrl, appli, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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
            cb(null, data.body.profiles);
        });
    }

    listNotificationsAsync(appli:number):Promise<any> {
        return new Promise((resolve, reject) => {
            this.listNotifications(appli, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
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
            cb(null, data);
        });
    }

    revokeNotificationAsync(callbackUrl:string, appli:number):Promise<any> {
        return new Promise((resolve, reject) => {
            this.revokeNotification(callbackUrl, appli, function (err,data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }
}