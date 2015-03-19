define('ruhungry/views/google-map/marker', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  /**
   * @class GoogleMapMarkerView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Marker",

    googleProperties: {
      isClickable: { name: "clickable", event: "clickable_changed" },
      isVisible: { name: "visible", event: "visible_changed" },
      isDraggable: { name: "draggable", event: "draggable_changed" },
      title: { event: "title_changed" },
      opacity: { cast: helpers['default'].cast.number },
      icon: { event: "icon_changed" },
      zIndex: { event: "zindex_changed", cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      "lat,lng": {
        name: "position",
        event: "position_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    _coreGoogleEvents: ["click"],

    // aliased from controller so that if they are not defined they use the values from the controller
    title: alias("controller.title"),
    opacity: alias("controller.opacity"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    icon: alias("controller.icon"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng"),

    // get the info window template name from the component or own controller
    infoWindowTemplateName: computed("controller.infoWindowTemplateName", "parentView.markerInfoWindowTemplateName", function () {
      return this.get("controller.infoWindowTemplateName") || this.get("parentView.markerInfoWindowTemplateName");
    }).readOnly(),

    infoWindowAnchor: oneWay("googleObject"),

    isInfoWindowVisible: alias("controller.isInfoWindowVisible"),

    hasInfoWindow: computed("parentView.markerHasInfoWindow", "controller.hasInfoWindow", function () {
      var fromCtrl = this.get("controller.hasInfoWindow");
      if (fromCtrl === null || fromCtrl === undefined) {
        return !!this.get("parentView.markerHasInfoWindow");
      }
      return fromCtrl;
    }).readOnly(),

    /**
     * @inheritDoc
     */
    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === "click") {
        this.set("isInfoWindowVisible", true);
      }
    }
  });

});