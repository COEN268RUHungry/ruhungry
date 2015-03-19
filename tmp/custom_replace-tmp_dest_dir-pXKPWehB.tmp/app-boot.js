/* jshint ignore:start */

define('ruhungry/config/environment', ['ember'], function(Ember) {
  var prefix = 'ruhungry';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("ruhungry/tests/test-helper");
} else {
  require("ruhungry/app")["default"].create({"name":"ruhungry","version":"0.0.0."});
}

/* jshint ignore:end */
