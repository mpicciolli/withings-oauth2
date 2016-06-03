var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {


    describe('API calls:', function () {

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

        it('make an API call', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('https://test.api.endpoint');
                expect(t).to.eq('accessToken');
                expect(ts).to.eq('accessTokenSecret');
                cb.call(void 0, null, data);
            });
            client.apiCall('https://test.api.endpoint', 'get', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client.oauth.get.restore();
            done();
        });

        it('make a GET request', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            var params = {
                date: 'YYYY-MM-DD'
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/v2/measure');
                cb.call(void 0, null, data);
            });
            client.get('measure', 'getactivity', params, callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client.oauth.get.restore();
            done();
        });

        it('make a GET request with no params', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client.oauth, 'get', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/v2/measure');
                cb.call(void 0, null, data);
            });
            client.get('measure', 'getactivity', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client.oauth.get.restore();
            done();
        });

        it('make a POST request with no params', function (done) {
            var callback = sinon.spy();
            var data = {
                data: 'Test data'
            };
            sinon.stub(client.oauth, 'post', function (u, t, ts, cb) {
                expect(u).to.contain('http://wbsapi.withings.net/notify');
                cb.call(void 0, null, data);
            });
            client.post('notify', 'subscribe', callback);

            expect(callback.calledWith(null, data)).to.be.true;
            expect(callback.calledOn(client)).to.be.true;

            client.oauth.post.restore();
            done();
        });

    });


});