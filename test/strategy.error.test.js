var CONFIG = require('./config');
var Strategy = require('../lib/strategy');
var chai = require('chai');
var lti = require('ims-lti');

describe('Strategy', function() {

  describe('handling error in provider validation', function() {
    var provider = new lti.Provider(CONFIG.lti.consumerKey, CONFIG.lti.consumerSecret);
    var strategy = new Strategy(CONFIG.lti, function(lti, done) {
      return done(new Error('error in provider validation'));
    });

    var err;

    before(function(done) {
      chai.passport.use(strategy)
      .error(function(e) {
        err = e;
        done();
      })
      .req(function(req) {
        req.body = CONFIG.body();
        req.protocol = 'http';
        req.get = function() {
          return 'test-get';
        };
        req.body.oauth_signature = provider.signer.build_signature(req, req.body, CONFIG.lti.consumerSecret);
      })
      .authenticate();
    });

    it('should return a provider error', function() {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('error in provider validation');
    });
  });

  describe('handling exception in provider validation', function() {
    var provider = new lti.Provider(CONFIG.lti.consumerKey, CONFIG.lti.consumerSecret);
    var strategy = new Strategy(CONFIG.lti, function(lti, done) {
      throw new Error('exception in provider validation');
    });

    var err;

    before(function(done) {
      chai.passport.use(strategy)
      .error(function(e) {
        err = e;
        done();
      })
      .req(function(req) {
        req.body = CONFIG.body();
        req.protocol = 'http';
        req.get = function() {
          return 'test-get';
        };
        req.body.oauth_signature = provider.signer.build_signature(req, req.body, CONFIG.lti.consumerSecret);
      })
      .authenticate();
    });

    it('should return a provider error', function() {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('exception in provider validation');
    });
  });

  describe('handling a request with invalid oauth signature', function() {
    var provider = new lti.Provider(CONFIG.lti.consumerKey, CONFIG.lti.consumerSecret);
    var strategy = new Strategy(CONFIG.lti, function(lti, done) {
      return done(null, false);
    });

    var err;

    before(function(done) {
      chai.passport.use(strategy)
      .error(function(e) {
        err = e;
        done();
      })
      .req(function(req) {
        req.body = CONFIG.body();
        req.protocol = 'http';
        req.get = function() {
          return 'test-get';
        };
        req.body.oauth_signature = 'incorrect sig';
      })
      .authenticate();
    });

    it('should return a SignatureError', function() {
      expect(err).to.be.an.instanceof(lti.Errors.SignatureError);
    });
  });

});
