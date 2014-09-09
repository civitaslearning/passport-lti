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
        req.get = function() {
          return 'test-get';
        };
        req.body.oauth_signature = provider.signer.build_signature(req, CONFIG.lti.consumerSecret);
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
