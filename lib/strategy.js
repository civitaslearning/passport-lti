var lti = require('ims-lti');
var passport = require('passport-strategy');
var util = require('util');

/**
  * LTI-based authentication strategy.
  * 
  * Options : 
  *  -  `createProvider` :
  *    `createProvider` is an optional function, which delegate the check of a
  *    Tool Consumer's identity to an higher level.
  *    This function is assumed to request a database to retrieve 
  *    the consumer secret based on the consumer key,
  *    and call the callback parameter with an LTI provider, 
  *    or a standard node error in `err` if a system error occured,
  *    or a string error if the error is handled at an higher level, 
  *    and the process is just intended to stop.
  *
  *    Use either this function or the hardcoded key / secret. 
  *    This one gets priority over the hardcoded key / secret.
  *
  *    @param {Function} createProvider 
  *      @param {Object} req
  *      @param {Function} callback
  *        @param {Object || String} err
  *        @param {Object} provider
  *    
  *  - `consumerKey` : Hardcoded consumer key.
  *  - `consumerSecret` : Hardcoded consumer secret.
*/


function Strategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  passport.Strategy.call(this);
  this.name = 'lti';
  this._passReqToCallback = options.passReqToCallback;

  // If it's intended to check tool consumer's identity from database
  // Dev will pass a function that handle it
  if (typeof options.createProvider === "function") {
    // This will get called when the request authenticates
    // And the LTI Provider will be defined at this time, for each request
    this._createProvider = options.createProvider;
  } 
  // Else, we assume we're in a development environment, 
  // thus there's only one test consumer
  else {
    // Instantiate the provider from there, with hardcoded key & secret
    var provider = new lti.Provider(options.consumerKey,
                                      options.consumerSecret,
                                      options.nonceStore);

    this._createProvider = function(req, cb) { cb(null, provider) }
  }
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

  // Check consumer's identity with strategy's predefined database access function
  self._createProvider(req, function(err, provider) {
    // Handle errors
    if (err) {
      // Non standard string error
      if (typeof err === "string") {
        // Fail the strategy with the error message
        return self.fail(err);
      }
      else{
        // Error the strategy with the error object
        return self.error(err);
      }
    }
    provider.valid_request(req, function(err, valid) {
      if (err) return self.error(err);
      if (!valid) return self.fail();

      try {
        if (self._passReqToCallback) {
          return self._verify(req, provider.body, verified);
        } else {
          return self._verify(provider.body, verified);
        }
      } catch (ex) {
        return self.error(ex);
      }
    });
  });
};

module.exports = Strategy;
