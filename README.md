# passport-lti

[![Build Status](https://travis-ci.org/civitaslearning/passport-lti.svg)](https://travis-ci.org/civitaslearning/passport-lti)
[![NPM version](https://badge.fury.io/js/passport-lti.png)](http://badge.fury.io/js/passport-lti)

Passport-flavored LTI authentication middleware for express.

## Usage

```javascript
var passport = require('passport');
var LTIStrategy = require('passport-lti');
var strategy = new LTIStrategy({
  consumerKey: 'testconsumerkey',
  consumerSecret: 'testconsumersecret'
  // pass the req object to callback
  // passReqToCallback: true,
  // https://github.com/omsmith/ims-lti#nonce-stores
  // nonceStore: new RedisNonceStore('testconsumerkey', redisClient)
}, function(lti, done) {
  // LTI launch parameters
  // console.dir(lti);
  // Perform local authentication if necessary
  return done(null, user);
});
passport.use(strategy);
```

## Tests

```shell
$ npm test
```
