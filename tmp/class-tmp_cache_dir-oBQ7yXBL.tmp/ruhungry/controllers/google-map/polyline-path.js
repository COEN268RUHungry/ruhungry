define('ruhungry/controllers/google-map/polyline-path', ['exports', 'ember', 'ember-google-map/mixins/google-array', 'ember-google-map/core/helpers'], function (exports, Ember, GoogleArrayMixin, helpers) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend(GoogleArrayMixin['default'], {
    model: Ember['default'].computed.alias("parentController.path"),
    googleItemFactory: helpers['default']._latLngToGoogle,
    emberItemFactory: function emberItemFactory(googleLatLng) {
      return Ember['default'].Object.create(helpers['default']._latLngFromGoogle(googleLatLng));
    },
    observeEmberProperties: ["lat", "lng"]
  });

});