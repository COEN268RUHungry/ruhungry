define('ruhungry/components/google-map', ['exports', 'ember', 'ember-google-map/core/helpers', 'ember-google-map/mixins/google-object'], function (exports, Ember, helpers, GoogleObjectMixin) {

  'use strict';

  /* globals google */
  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var on = Ember['default'].on;
  var fmt = Ember['default'].String.fmt;
  var forEach = Ember['default'].EnumerableUtils.forEach;
  var getProperties = Ember['default'].getProperties;
  var $get = Ember['default'].get;
  var dummyCircle;

  var VALID_FIT_BOUND_TYPES = ["markers", "infoWindows", "circles", "polylines", "polygons"];

  function getDummyCircle(center, radius) {
    if (radius == null) {
      radius = $get(center, "radius");
    }
    if (!(center instanceof google.maps.LatLng)) {
      center = helpers['default']._latLngToGoogle(center);
    }
    if (dummyCircle) {
      dummyCircle.setCenter(center);
      dummyCircle.setRadius(radius);
    } else {
      dummyCircle = new google.maps.Circle({ center: center, radius: radius });
    }
    return dummyCircle;
  }

  function collectCoordsOf(type, array, items) {
    if (["markers", "infoWindows"].indexOf(type) !== -1) {
      // handle simple types
      return array.reduce(function (previous, item) {
        var coords = getProperties(item, "lat", "lng");
        if (coords.lat != null && coords.lng != null) {
          previous.push(coords);
        }
        return previous;
      }, items || []);
    } else if (type === "circles") {
      // handle circles
      return array.reduce(function (previous, item) {
        var opt = getProperties(item, "lat", "lng", "radius"),
            bounds;
        if (opt.lat != null && opt.lng != null && opt.radius != null) {
          bounds = getDummyCircle(opt).getBounds();
          previous.push(helpers['default']._latLngFromGoogle(bounds.getNorthEast()));
          previous.push(helpers['default']._latLngFromGoogle(bounds.getSouthWest()));
        }
        return previous;
      }, items || []);
    } else if (["polylines", "polygons"]) {
      // handle complex types
      return array.reduce(function (previous, item) {
        return $get(item, "_path").reduce(function (previous, item) {
          var coords = getProperties(item, "lat", "lng");
          if (coords.lat != null && coords.lng != null) {
            previous.push(coords);
          }
          return previous;
        }, items || []);
      }, items || []);
    }
  }

  function obj(o) {
    return Ember['default'].Object.create(o);
  }

  var MAP_TYPES = Ember['default'].A([obj({ id: "road", label: "road" }), obj({ id: "satellite", label: "satellite" }), obj({ id: "terrain", label: "terrain" }), obj({ id: "hybrid", label: "hybrid" })]);

  var PLACE_TYPES = Ember['default'].A([obj({ id: helpers['default'].PLACE_TYPE_ADDRESS, label: "address" }), obj({ id: helpers['default'].PLACE_TYPE_LOCALITY, label: "locality" }), obj({ id: helpers['default'].PLACE_TYPE_ADMIN_REGION, label: "administrative region" }), obj({ id: helpers['default'].PLACE_TYPE_BUSINESS, label: "business" })]);

  /**
   * @class GoogleMapComponent
   * @extends Ember.Component
   * @uses GoogleObjectMixin
   */
  exports['default'] = Ember['default'].Component.extend(GoogleObjectMixin['default'], {
    googleFQCN: "google.maps.Map",

    classNames: ["google-map"],

    /**
     * Defines all properties bound to the google map object
     * @property googleProperties
     * @type {Object}
     */
    googleProperties: {
      zoom: { event: "zoom_changed", cast: helpers['default'].cast.integer },
      type: {
        name: "mapTypeId",
        event: "maptypeid_changed",
        toGoogle: helpers['default']._typeToGoogle,
        fromGoogle: helpers['default']._typeFromGoogle
      },
      "lat,lng": {
        name: "center",
        event: "center_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
      /**
       * available options (prepend with `gopt_` to use):
       * `backgroundColor`, `disableDefaultUI`, `disableDoubleClickZoom`, `draggable`, `keyboardShortcuts`,
       * `mapTypeControl`, `maxZoom`, `minZoom`, `overviewMapControl`, `panControl`, `rotateControl`, `scaleControl`,
       * `scrollwheel`, `streetViewControl`, `zoomControl`
       */
    },

    /**
     * @inheritDoc
     */
    googleEvents: {},

    /**
     * Our google map object
     * @property googleObject
     * @type {google.maps.Map}
     * @private
     */
    googleObject: null,

    /**
     * Auto fit bounds to type of items
     * @property autoFitBounds
     * @type {boolean|string}
     */
    autoFitBounds: false,

    /**
     * Fit bounds to view all coordinates
     * @property fitBoundsArray
     * @type {Array.<{lat: number, lng: number}>}
     */
    fitBoundsArray: computed("autoFitBounds", "_markers.@each", "_infoWindow.@each", "_polylines.@each._path.@each", "_polygons.@each._path.@each", "_circles.@each", function (key, value, oldValue) {
      var auto;
      if (arguments.length > 1) {
        // it's a set, save that the use defined them
        this._fixedFitBoundsArray = value;
      } else {
        if (this._fixedFitBoundsArray) {
          value = this._fixedFitBoundsArray;
        } else {
          // here comes our computation
          auto = this.get("autoFitBounds");
          if (auto) {
            auto = auto === true ? VALID_FIT_BOUND_TYPES : auto.split(",");
            value = [];
            forEach(auto, function (type) {
              collectCoordsOf(type, this.get("_" + type), value);
            }, this);
          } else {
            value = null;
          }
        }
      }
      return value;
    }),

    /**
     * Initial center's latitude of the map
     * @property lat
     * @type {Number}
     */
    lat: 0,

    /**
     * Initial center's longitude of the map
     * @property lng
     * @type {Number}
     */
    lng: 0,

    /**
     * Initial zoom of the map
     * @property zoom
     * @type {Number}
     * @default 5
     */
    zoom: 5,

    /**
     * Initial type of the map
     * @property type
     * @type {String}
     * @enum ['road', 'hybrid', 'terrain', 'satellite']
     * @default 'road'
     */
    type: "road",

    /**
     * List of markers to handle/show on the map
     * @property markers
     * @type {Array.<{lat: Number, lng: Number, title: String}>}
     */
    markers: null,

    /**
     * The array controller holding the markers
     * @property _markers
     * @type {Ember.ArrayController}
     * @private
     */
    _markers: computed(function () {
      return this.container.lookupFactory("controller:google-map/markers").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each marker
     * @property markerController
     * @type {String}
     * @default 'google-map/marker'
     */
    markerController: "google-map/marker",

    /**
     * View to use for each marker
     * @property markerViewClass
     * @type {String}
     * @default 'google-map/marker'
     */
    markerViewClass: "google-map/marker",

    /**
     * Info-window template name to use for each marker
     * @property markerInfoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    markerInfoWindowTemplateName: "google-map/info-window",

    /**
     * Whether the markers have an info-window by default
     * @property markerHasInfoWindow
     * @type {Boolean}
     * @default true
     */
    markerHasInfoWindow: true,

    /**
     * List of polylines to handle/show on the map
     * @property polylines
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polylines: null,

    /**
     * The array controller holding the polylines
     * @property _polylines
     * @type {Ember.ArrayController}
     * @private
     */
    _polylines: computed(function () {
      return this.container.lookupFactory("controller:google-map/polylines").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polyline
     * @property polylineController
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineController: "google-map/polyline",

    /**
     * Controller to use for each polyline's path
     * @property polylinePathController
     * @type {String}
     * @default 'google-map/polyline-path'
     */
    polylinePathController: "google-map/polyline-path",

    /**
     * View to use for each polyline
     * @property polylineViewClass
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineViewClass: "google-map/polyline",

    /**
     * List of polygons to handle/show on the map
     * @property polygons
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polygons: null,

    /**
     * The array controller holding the polygons
     * @property _polygons
     * @type {Ember.ArrayController}
     * @private
     */
    _polygons: computed(function () {
      return this.container.lookupFactory("controller:google-map/polygons").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polygon
     * @property polygonController
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonController: "google-map/polygon",

    /**
     * Controller to use for each polygon's path
     * @property polygonPathController
     * @type {String}
     * @default 'google-map/polygon-path'
     */
    polygonPathController: "google-map/polygon-path",

    /**
     * View to use for each polygon
     * @property polygonViewClass
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonViewClass: "google-map/polygon",

    /**
     * List of circles to handle/show on the map
     * @property circles
     * @type {Array.<{lat: Number, lng: Number, radius: Number}>}
     */
    circles: null,

    /**
     * The array controller holding the circles
     * @property _circles
     * @type {Ember.ArrayController}
     * @private
     */
    _circles: computed(function () {
      return this.container.lookupFactory("controller:google-map/circles").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each circle
     * @property circleController
     * @type {String}
     * @default 'google-map/circle'
     */
    circleController: "google-map/circle",

    /**
     * View to use for each circle
     * @property circleViewClass
     * @type {String}
     * @default 'google-map/circle'
     */
    circleViewClass: "google-map/circle",

    /**
     * Array of al info-windows to handle/show (independent from the markers' info-windows)
     * @property infoWindows
     * @type {Array.<{lat: Number, lng: Number, title: String, description: String}>}
     */
    infoWindows: null,

    /**
     * The array controller holding the info-windows
     * @property _infoWindows
     * @type {Ember.ArrayController}
     * @private
     */
    _infoWindows: computed(function () {
      return this.container.lookupFactory("controller:google-map/info-windows").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller for each info-window
     * @property infoWindowController
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowController: "google-map/info-window",

    /**
     * View for each info-window
     * @property infoWindowViewClass
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowViewClass: "google-map/info-window",

    /**
     * Template for each info-window
     * @property infoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowTemplateName: "google-map/info-window",

    /**
     * The google map object
     * @property map
     * @type {google.maps.Map}
     */
    map: oneWay("googleObject"),

    /**
     * Schedule an auto-fit of the bounds
     *
     * @method scheduleAutoFitBounds
     * @param {{sw: {lat: number, lng: number}, ne: {lat: number, lng: number}}|Array.<{lat: number, lng: number}>} [coords]
     */
    scheduleAutoFitBounds: function scheduleAutoFitBounds(coords) {
      Ember['default'].run.schedule("afterRender", this, function () {
        Ember['default'].run.debounce(this, "fitBoundsToContain", coords, 200);
      });
    },

    /**
     * Fit the bounds to contain given coordinates
     *
     * @method fitBoundsToContain
     * @param {{sw: {lat: number, lng: number}, ne: {lat: number, lng: number}}|Array.<{lat: number, lng: number}>} [coords]
     */
    fitBoundsToContain: function fitBoundsToContain(coords) {
      var map, bounds;
      if (this.isDestroying || this.isDestroyed || this._state !== "inDOM") {
        return;
      }
      map = this.get("googleObject");
      if (!map) {
        this.scheduleAutoFitBounds(coords);
        return;
      }
      if (coords == null) {
        coords = this.get("fitBoundsArray");
      }
      if (!coords) {
        return;
      }
      if (Ember['default'].isArray(coords)) {
        // it's an array of lat,lng
        coords = Ember['default'].A(coords);
        if (coords.get("length")) {
          bounds = new google.maps.LatLngBounds(helpers['default']._latLngToGoogle(coords.shiftObject()));
          coords.forEach(function (point) {
            bounds.extend(helpers['default']._latLngToGoogle(point));
          });
        }
      } else {
        // it's a bound object
        bounds = helpers['default']._boundsToGoogle(coords);
      }
      if (bounds) {
        // finally make our map to fit
        map.fitBounds(bounds);
      }
    },

    /**
     * Initialize the map
     */
    initGoogleMap: on("didInsertElement", function () {
      var canvas;
      this.destroyGoogleMap();
      if (helpers['default'].hasGoogleLib()) {
        canvas = this.$("div.map-canvas")[0];
        this.createGoogleObject(canvas, null);
        this.scheduleAutoFitBounds();
      }
    }),

    /**
     * Destroy the map
     */
    destroyGoogleMap: on("willDestroyElement", function () {
      if (this.get("googleObject")) {
        Ember['default'].debug(fmt("[google-map] destroying %@", this.get("googleName")));
        this.set("googleObject", null);
      }
    })
  });

  exports.MAP_TYPES = MAP_TYPES;
  exports.PLACE_TYPES = PLACE_TYPES;

});