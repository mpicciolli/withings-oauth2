export interface IWithings {
    getRequestToken(cb: (err: any, token: string, tokenSecret: string) => any): void;
    authorizeUrl(token: string, tokenSecret: string): string;
    getAccessToken(token: any, tokenSecret: any, verifier: any, cb: any): void;
    apiCall(url: string, method: string, cb: any): void;
    get(service: string, action: string, params: any, cb: any): void;
    post(service: string, action: string, params: any, cb: any): void;
    getDailyActivity(date: string | Date, cb: any): void;
    getDailySteps(date: string | Date, cb: any): void;
    getDailyCalories(date: string | Date, cb: any): void;
    getMeasures(measType: number, startDate: string | Date, endDate: string | Date, cb: any): void;
    getWeightMeasures(startDate: string | Date, endDate: string | Date, cb: any): void;
    getPulseMeasures(startDate: string | Date, endDate: string | Date, cb: any): void;
    getSleepSummary(startDate: string | Date, endDate: string | Date, cb: any): void;
    createNotification(callbackUrl: string, comment: string, appli: number, cb: any): void;
    getNotification(callbackUrl: string, appli: number, cb: any): void;
    listNotifications(appli: number, cb: any): void;
    revokeNotification(callbackUrl: string, appli: number, cb: any): void;
}
export interface WhitingsOptionModel {
    consumerKey: string;
    consumerSecret: string;
    callbackUrl?: string;
    accessToken?: string;
    accessTokenSecret?: string;
    userID?: string;
}
export declare class Withings implements IWithings {
    private config;
    static requestToken: string;
    static accessToken: string;
    static authorize: string;
    private accessToken;
    private accessTokenSecret;
    private userID;
    private oauth;
    constructor(config: WhitingsOptionModel);
    getRequestToken(cb: any): void;
    authorizeUrl(token: string, tokenSecret: string): string;
    getAccessToken(token: any, tokenSecret: any, verifier: any, cb: any): void;
    apiCall(url: string, method: string, cb: any): void;
    get(service: string, action: string, params: any, cb: any): void;
    post(service: string, action: string, params: any, cb: any): void;
    getDailyActivity(date: string | Date, cb: any): void;
    getDailySteps(date: string | Date, cb: any): void;
    getDailyCalories(date: string | Date, cb: any): void;
    getMeasures(measType: number, startDate: string | Date, endDate: string | Date, cb: any): void;
    getWeightMeasures(startDate: string | Date, endDate: string | Date, cb: any): void;
    getPulseMeasures(startDate: string | Date, endDate: string | Date, cb: any): void;
    getSleepSummary(startDate: string | Date, endDate: string | Date, cb: any): void;
    createNotification(callbackUrl: string, comment: string, appli: number, cb: any): void;
    getNotification(callbackUrl: string, appli: number, cb: any): void;
    listNotifications(appli: number, cb: any): void;
    revokeNotification(callbackUrl: string, appli: number, cb: any): void;
}
