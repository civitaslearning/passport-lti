# passport-lti

[![Build Status](https://travis-ci.org/civitaslearning/passport-lti.svg)](https://travis-ci.org/civitaslearning/passport-lti)
[![npm version](https://badge.fury.io/js/passport-lti.svg)](http://badge.fury.io/js/passport-lti)

Passport-flavored LTI authentication middleware for express.

## LTIStrategy

Options : 
-  `createProvider` :
	`createProvider` is an optional function, which delegate the check of a
	Tool Consumer's identity to an higher level.

	This function is assumed to request a database to retrieve 
	the consumer secret based on the consumer key,
	and call the callback parameter with an LTI provider, 
	or a standard node error in `err` if a system error occured,
	or a string error if the error is handled at an higher level, 
	and the process is just intended to stop.
	Use either this function or the hardcoded key / secret. 
	This one gets priority over the hardcoded key / secret.
	```
	@param {Function} createProvider 
		@param {Object} req
		@param {Function} callback
			@param {Object || String} err
			@param {Object} provider
	```
- `consumerKey` : Hardcoded consumer key.
- `consumerSecret` : Hardcoded consumer secret.

## Usage

### With hardcoded key / secret

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

### With dynamic provider

```javascript
var passport = require('passport');
var lti = require("ims-lti");
var LTIStrategy = require('passport-lti');
var strategy = new LTIStrategy({
	createProvider : function (req, done) {
		// Lookup your LTI customer in your DB with req's params, and get its secret
		// Dummy DB lookup
		DAO.getConsumer(
			req.body.oauth_consumer_key,
			function callback (err, consumer){
				if(err){
					// Standard error, will crash the process
					return done(err);
				}
	
				if(consumer.is_authorized){
					var consumer = new lti.Provider(consumer_db.oauth_consumer_key, consumer_db.oauth_consumer_secret);
					return done(null, consumer);
				}
				else {
					// String error, will fail the strategy (and not crash it)
					return done("not_authorized");
				}
	    	}
		);
	}
);

passport.use(strategy);
```
## Tests

```shell
$ npm test
```
