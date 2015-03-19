define('ruhungry/initializers/ember-google-map', ['exports', 'ember-google-map/utils/load-google-map'], function (exports, loadGoogleMap) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.register("util:load-google-map", loadGoogleMap['default'], { instantiate: false });
    application.inject("route", "loadGoogleMap", "util:load-google-map");
  }

  exports['default'] = {
    name: "ember-google-map",
    initialize: initialize
  };

});