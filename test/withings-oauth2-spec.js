var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Withings = require('../dist/Withings').Withings;

var options;
var client;
var error = new Error('ERROR');

describe('Withings API Client:', function () {

    describe('OAuth functionality:', function () {

        beforeEach(function (done) {
            options = {
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                callbackUrl: 'http://localhost:3000/oauth_callback'
            };
            client = new Withings(options);
            done();
        });

        it('get an OAuth request token', function (done) {
            var callback = sinon.spy();
            sinon.stub(client.oauth, 'getOAuthRequestToken', function (cb) {
                cb.call(void 0, null, 'token', 'tokenSecret');
            });
            client.getRequestToken(callback);

            expect(callback.calledWith(null, 'token', 'tokenSecret')).to.be.true;

            client.oauth.getOAuthRequestToken.restore();
            done();
        });

        it('generate authorization URL', function (done) {
            var url = client.authorizeUrl('token', 'tokenSecret');
            expect(url).to.exist;
            done();
        });

        it('generate an access token', function (done) {
            var callback = sinon.spy();
            sinon.stub(client.oauth, 'getOAuthAccessToken', function (r, rs, v, cb) {
                expect(r).to.eq('requestToken');
                expect(rs).to.eq('requestTokenSecret');
                expect(v).to.eq('verifier');
                cb.call(void 0, null, 'token', 'tokenSecret');
            });
            client.getAccessToken('requestToken', 'requestTokenSecret', 'verifier', callback);

            expect(callback.calledWith(null, 'token', 'tokenSecret')).to.be.true;

            client.oauth.getOAuthAccessToken.restore();
            done();
        });

        it('error when making an unauthorized API call', function (done) {
            try {
                client.apiCall('https://test.api.endpoint', function () {
                });
            } catch (ex) {
                expect(ex.message).to.eq('Authenticate before making API calls');
                done();
            }
        });

        it('error when making an API call with no user ID', function (done) {
            client.accessToken = 'accessToken';
            client.accessTokenSecret = 'accessTokenSecret';
            try {
                client.apiCall('https://test.api.endpoint', function () {
                });
            } catch (ex) {
                expect(ex.message).to.eq('API calls require a user ID');
                done();
            }
        });

    });

    
    

});