var CONFIG = require('./config');
var Strategy = require('../lib/strategy');
var chai = require('chai');
var lti = require('ims-lti');

describe('Strategy', function() {
  describe('handling a request with valid LTI credentials', function() {
    var provider = new lti.Provider(CONFIG.lti.consumerKey, CONFIG.lti.consumerSecret);
    var strategy = new Strategy(CONFIG.lti, function(lti, done) {
      return done(null, {
        id: lti.user_id
      }, {
        scope: 'read'
      });
    });

    var user;
    var info;

    before(function(done) {
      chai.passport.use(strategy)
      .success(function(u, i) {
        user = u;
        info = i;
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

    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });

    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info).to.deep.equal({
        scope: 'read'
      });
    });
  });
  describe('handle dynamic oauth secrets', function() {
    // example createProvider, you might end up looking instituion, etc to find the shared secrets
    function createProvider(req, cb) {
      cb(null, new lti.Provider(req.body.consumerKey, req.body.consumerSecret));
    }


    var strategy = new Strategy({createProvider: createProvider}, function(lti, done) {
      return done(null, {
        id: lti.user_id
      }, {
        scope: 'read'
      });
    });

    var user;
    var info;
    before(function(done) {
      chai.passport.use(strategy)
      .success(function(u, i) {
        user = u;
        info = i;
        done();
      })
      .req(function(req) {
        req.body = CONFIG.body();
        req.protocol = 'http'
        req.body.consumerSecret = CONFIG.lti.consumerSecret;
        req.body.consumerKey = CONFIG.lti.consumerKey;
        req.get = function() {
          return 'test-get';
        };
        var provider = new lti.Provider(req.body.consumerKey, req.body.consumerSecret);
        req.body.oauth_signature = provider.signer.build_signature(req, req.body, CONFIG.lti.consumerSecret);
      })
      .authenticate();
    });

    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });

    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info).to.deep.equal({
        scope: 'read'
      });
    });
  });
});
