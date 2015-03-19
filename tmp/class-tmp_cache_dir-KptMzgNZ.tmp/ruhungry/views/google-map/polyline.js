define('ruhungry/views/google-map/polyline', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var on = Ember['default'].on;

  /**
   * @class GoogleMapPolylineView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Polyline",

    templateName: "google-map/polyline",

    googleProperties: computed(function () {
      return {
        isClickable: { name: "clickable", optionOnly: true },
        isVisible: { name: "visible", event: "visible_changed" },
        isDraggable: { name: "draggable", event: "draggable_changed" },
        isEditable: { name: "editable", event: "editable_changed" },
        isGeodesic: { name: "geodesic", optionOnly: true },
        icons: { optionOnly: true },
        zIndex: { optionOnly: true, cast: helpers['default'].cast.integer },
        map: { readOnly: true },
        strokeColor: { optionOnly: true },
        strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
        strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      };
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    strokeColor: alias("controller.strokeColor"),
    strokeWeight: alias("controller.strokeWeight"),
    strokeOpacity: alias("controller.strokeOpacity"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    isEditable: alias("controller.isEditable"),
    icons: alias("controller.icons"),

    initGoogleObject: on("didInsertElement", function () {
      // force the creation of the polyline
      if (helpers['default'].hasGoogleLib() && !this.get("googleObject")) {
        this.createGoogleObject({ path: this.get("controller._path.googleArray") });
      }
    })
  });

});