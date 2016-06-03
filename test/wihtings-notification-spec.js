var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {


    describe('Notifications:', function (done) {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'amida-tech.com',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
                userID: 'userID'
            };
            client = new Withings(options);
            done();
        });

        it('createNotification', function (done) {
            var data = {
                "status": 0
            };
            var cbUrl = 'http://test.url';
            var comment = 'test comment';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.createNotification(cbUrl, comment, appli, function (err, status) {
                expect(status).to.eq(data);
            });

            client.oauth.get.restore();
            done();
        });

        it('createNotification error', function (done) {
            var cbUrl = 'http://test.url';
            var comment = 'test comment';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.createNotification(cbUrl, comment, appli, function (err, status) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

        it('getNotifications', function (done) {
            var data = {
                "status": 0,
                "body": {
                    "expires": 2147483647,
                    "comment": "test comment"
                }
            };
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getNotification(cbUrl, appli, function (err, body) {
                expect(body).to.eq(data.body);
            });

            client.oauth.get.restore();
            done();
        });

        it('getNotifications error with optional params', function (done) {
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getNotification(cbUrl, function (err, body) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

        it('listNotifications', function (done) {
            var data = {
                "status": 0,
                "body": {
                    "profiles": [{
                        "expires": 2147483647,
                        "comment": "http:\/\/www.withings.com"
                    }, {
                        "expires": 2147483647,
                        "comment": "http:\/\/www.corp.withings.com"
                    }]
                }
            };
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.listNotifications(appli, function (err, profiles) {
                expect(profiles).to.eq(data.body.profiles);
            });

            client.oauth.get.restore();
            done();
        });

        it('listNotifications error with optional params', function (done) {
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.listNotifications(function (err, profiles) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

        it('revokeNotifications', function (done) {
            var data = {
                "status": 0
            };
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.revokeNotification(cbUrl, appli, function (err, status) {
                expect(status).to.eq(data);
            });

            client.oauth.get.restore();
            done();
        });

        it('revokeNotifications error with optional params', function (done) {
            var cbUrl = 'http://test.url';
            var appli = 1;
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.revokeNotification(cbUrl, function (err, status) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

    });


});