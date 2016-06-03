var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {


    describe('Get Sleep summary:', function () {

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

        it('getSleepSummary', function (done) {
            var data = {
                body: {
                    series: [{
                        "data": {
                            "wakeupduration": 1800,
                            "lightsleepduration": 18540,
                            "deepsleepduration": 8460,
                            "remsleepduration": 10460,
                            "durationtosleep": 420,
                            "durationtowakeup": 360,
                            "wakeupcount": 3
                        },
                        "modified": 1412087110
                    }]
                }
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getSleepSummary(new Date(), new Date(), function (err, series) {
                expect(series).to.eq(data.body.series);
            });

            client.oauth.get.restore();
            done();
        });

        it('getSleepSummary error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getSleepSummary(new Date(), new Date(), function (err, series) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

    });


});