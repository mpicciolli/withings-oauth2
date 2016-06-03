var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {


    describe('Get Activity measures:', function () {

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

        it('getDailySteps', function (done) {
            var data = {
                body: {
                    steps: '5000'
                }
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(steps).to.eq(data.body.steps);
            });

            client.oauth.get.restore();
            done();
        });

        it('getDailySteps error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getDailySteps(new Date(), function (err, steps) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

        it('getDailyCalories', function (done) {
            var data = {
                body: {
                    calories: '3000'
                }
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getDailyCalories(new Date(), function (err, cals) {
                expect(cals).to.eq(data.body.calories);
            });

            client.oauth.get.restore();
            done();
        });

        it('getDailyCalories error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getDailyCalories(new Date(), function (err, cals) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

    });


});