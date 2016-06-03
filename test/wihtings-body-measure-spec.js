var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {


    describe('Get Body measures:', function () {

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

        it('getWeightMeasures', function (done) {
            var data = {
                body: {
                    measuregrps: [{
                        "measures": [{
                            "value": 79300,
                            "type": 1,
                            "unit": -3
                        }]
                    }]
                }
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getWeightMeasures(new Date(), new Date(), function (err, weights) {
                expect(weights).to.eq(data.body.measuregrps);
            });

            client.oauth.get.restore();
            done();
        });

        it('getWeightMeasures error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getWeightMeasures(new Date(), new Date(), function (err, weights) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

        it('getPulseMeasures', function (done) {
            var data = {
                body: {
                    measuregrps: [{
                        "measures": [{
                            "value": 600,
                            "type": 11,
                            "unit": -1
                        }]
                    }]
                }
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, null, data);
            });
            client.getPulseMeasures(new Date(), new Date(), function (err, pulses) {
                expect(pulses).to.eq(data.body.measuregrps);
            });

            client.oauth.get.restore();
            done();
        });

        it('getPulseMeasures error', function (done) {
            var error = new Error('ERROR');
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                cb.call(void 0, error);
            });
            client.getPulseMeasures(new Date(), new Date(), function (err, pulses) {
                expect(err.message).to.eq('ERROR');
            });

            client.oauth.get.restore();
            done();
        });

    });


});