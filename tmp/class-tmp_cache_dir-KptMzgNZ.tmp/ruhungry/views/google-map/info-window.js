define('ruhungry/views/google-map/info-window', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core', 'ruhungry/views/google-map/marker'], function (exports, Ember, helpers, GoogleMapCoreView, MarkerView) {

  'use strict';

  var observer = Ember['default'].observer;
  var on = Ember['default'].on;
  var scheduleOnce = Ember['default'].run.scheduleOnce;
  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  var any = computed.any;

  /**
   * @class GoogleMapInfoWindowView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    classNames: ["google-info-window"],

    googleFQCN: "google.maps.InfoWindow",

    // will be either the marker using us, or the component if this is a detached info-window
    templateName: any("controller.templateName", "parentView.infoWindowTemplateName"),

    googleProperties: {
      zIndex: { event: "zindex_changed", cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      "lat,lng": {
        name: "position",
        event: "position_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    isMarkerInfoWindow: computed("parentView", function () {
      return this.get("parentView") instanceof MarkerView['default'];
    }),

    googleMapComponent: computed("isMarkerInfoWindow", function () {
      return this.get(this.get("isMarkerInfoWindow") ? "parentView.parentView" : "parentView");
    }),

    _coreGoogleEvents: ["closeclick"],

    // aliased from controller so that if they are not defined they use the values from the controller
    zIndex: alias("controller.zIndex"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng"),
    anchor: oneWay("parentView.infoWindowAnchor"),

    visible: computed("parentView.isInfoWindowVisible", "controller.isVisible", function (key, value) {
      var isMarkerIW = this.get("isMarkerInfoWindow");
      if (arguments.length < 2) {
        if (isMarkerIW) {
          value = this.get("parentView.isInfoWindowVisible");
        } else {
          value = this.getWithDefault("controller.isVisible", true);
          this.set("controller.isVisible", value);
        }
      } else {
        if (isMarkerIW) {
          this.set("parentView.isInfoWindowVisible", value);
        } else {
          this.set("controller.isVisible", value);
        }
      }
      return value;
    }),

    initGoogleObject: on("didInsertElement", function () {
      scheduleOnce("afterRender", this, "_initGoogleInfoWindow");
    }),

    handleInfoWindowVisibility: observer("visible", function () {
      if (this._changingVisible) {
        return;
      }
      var iw = this.get("googleObject");
      if (iw) {
        if (this.get("visible")) {
          iw.open(this.get("map"), this.get("anchor") || undefined);
        } else {
          iw.close();
        }
      }
    }),

    _initGoogleInfoWindow: function _initGoogleInfoWindow() {
      // force the creation of the marker
      if (helpers['default'].hasGoogleLib() && !this.get("googleObject")) {
        this.createGoogleObject({ content: this._backupViewElement() });
        this.handleInfoWindowVisibility();
      }
    },

    destroyGoogleObject: on("willDestroyElement", function () {
      var infoWindow = this.get("googleObject");
      if (infoWindow) {
        this._changingVisible = true;
        infoWindow.close();
        // detach from the map
        infoWindow.setMap(null);
        // free the content node
        this._restoreViewElement();
        this.set("googleObject", null);
        this._changingVisible = false;
      }
    }),

    _backupViewElement: function _backupViewElement() {
      var element = this.get("element");
      if (!this._placeholderElement) {
        this._placeholderElement = document.createElement(element.nodeName);
        element.parentNode.replaceChild(this._placeholderElement, element);
      }
      return element;
    },

    _restoreViewElement: function _restoreViewElement() {
      var element = this.get("element");
      if (this._placeholderElement) {
        this._placeholderElement.parentNode.replaceChild(element, this._placeholderElement);
        this._placeholderElement = null;
      }
      return element;
    },

    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === "closeclick") {
        this._changingVisible = true;
        this.set("visible", false);
        this._changingVisible = false;
      }
    }
  });

});