var lti = require('ims-lti');
var passport = require('passport-strategy');
var util = require('util');

function Strategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  passport.Strategy.call(this);
  this.name = 'lti';
  this._passReqToCallback = options.passReqToCallback;
  this._provider = new lti.Provider(options.consumerKey,
                                    options.consumerSecret,
                                    options.nonceStore);
  this._verify = verify;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
  var self = this;

  if (req.body.lti_message_type !== 'basic-lti-launch-request') {
    return self.fail("Request isn't LTI launch");
  }

  function verified(err, user, info) {
    if (err) return self.error(err);
    if (!user) return self.fail(info);
    return self.success(user, info);
  }

  self._provider.valid_request(req, function(err, valid) {
    if (err) return self.error(err);
    if (!valid) return self.fail();

    try {
      if (self._passReqToCallback) {
        return self._verify(req, self._provider.body, verified);
      } else {
        return self._verify(self._provider.body, verified);
      }
    } catch (ex) {
      return self.error(ex);
    }
  });
};

module.exports = Strategy;
