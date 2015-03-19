define('ruhungry/views/google-map/polygon', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/polyline'], function (exports, Ember, helpers, GoogleMapPolylineView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapPolygonView
   * @extends GoogleMapPolylineView
   */
  exports['default'] = GoogleMapPolylineView['default'].extend({
    googleFQCN: "google.maps.Polygon",

    googleProperties: computed(function () {
      return Ember['default'].merge(this._super(), {
        fillColor: { optionOnly: true },
        fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      });
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    fillColor: alias("controller.fillColor"),
    fillOpacity: alias("controller.fillOpacity")
  });

});