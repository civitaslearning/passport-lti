exports.lti = {
  consumerKey: 'testconsumerkey',
  consumerSecret: 'testconsumersecret'
};

exports.body = function() {
  var body = {
    lti_message_type: 'basic-lti-launch-request',
    lti_version: 'LTI-1p0',
    resource_link_id: 'http://link-to-resource.com/resource',
    oauth_customer_key: exports.lti.consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.round(Date.now() / 1000),
    oauth_nonce: Date.now() + Math.random() * 100,
    user_id: '1234'
  }
  return body;
};
