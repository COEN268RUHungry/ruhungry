define('ember-google-map/utils/load-google-map', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var promise;

  /**
   * Loads the google map SDK
   *
   * @return {Ember.RSVP.Promise}
   */
  function loadGoogleMap(resolveWith) {
    var src, $meta = Ember['default'].$('meta[name="ember-google-map-sdk-url"]');
    if ($meta.length) {
      // get the url of the script and remove the meta
      src = $meta.attr('content');
      $meta.remove();
      // promise making sure the script is loaded
      return promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
        window.__emberGoogleMapLoaded__ = Ember['default'].run.bind(function () {
          promise = null;
          window.__emberGoogleMapLoaded__ = null;
          resolve(resolveWith);
        });
        Ember['default'].$.getScript(src + '&callback=__emberGoogleMapLoaded__').fail(function (jqXhr) {
          promise = null;
          window.__emberGoogleMapLoaded__ = null;
          reject(jqXhr);
        });
      });
    }
    else if (promise) {
      // we already have the promise loading the script, use it as the core promise to wait for but
      // resolve to what was given this time
      return promise.then(function () {
        return resolveWith;
      });
    }
    else {
      // no need to do anything, resolve directly
      return Ember['default'].RSVP.resolve(resolveWith);
    }
  }
  exports['default'] = loadGoogleMap;

});