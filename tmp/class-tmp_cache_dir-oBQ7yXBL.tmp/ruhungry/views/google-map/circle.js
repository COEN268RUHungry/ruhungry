define('ruhungry/views/google-map/circle', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapCircleView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Circle",

    googleProperties: {
      isClickable: { name: "clickable", optionOnly: true },
      isVisible: { name: "visible", event: "visible_changed" },
      isDraggable: { name: "draggable", event: "draggable_changed" },
      isEditable: { name: "editable", event: "editable_changed" },
      radius: { event: "radius_changed", cast: helpers['default'].cast.number },
      strokeColor: { optionOnly: true },
      strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
      fillColor: { optionOnly: true },
      fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      zIndex: { cast: helpers['default'].cast.integer, optionOnly: true },
      map: { readOnly: true },
      "lat,lng": {
        name: "center",
        event: "center_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    // aliased from controller so that if they are not defined they use the values from the controller
    radius: alias("controller.radius"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    isEditable: alias("controller.isEditable"),
    strokeColor: alias("controller.strokeColor"),
    strokeOpacity: alias("controller.strokeOpacity"),
    strokeWeight: alias("controller.strokeWeight"),
    fillColor: alias("controller.fillColor"),
    fillOpacity: alias("controller.fillOpacity"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng")
  });

});